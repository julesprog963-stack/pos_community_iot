import json

from odoo import api, fields, models
from odoo.exceptions import ValidationError

from .iot_helpers import build_preparation_lines


class PosPrinter(models.Model):
    _inherit = "pos.printer"

    community_iot_enabled = fields.Boolean(
        string="Use Community IoT",
        help="If enabled, preparation jobs will be sent to a Community IoT printer instead of the hardware proxy.",
    )
    community_iot_box_id = fields.Many2one(
        "community_iot_box.iot_box",
        string="Community IoT Box",
    )
    community_iot_device_id = fields.Many2one(
        "community_iot_box.iot_device",
        string="Community IoT Device",
        domain="[('box_id', '=', community_iot_box_id), ('type', 'in', ('ticket_printer', 'standard_printer')), ('active', '=', True)]",
    )
    community_iot_copies = fields.Integer(
        string="Copies",
        default=1,
    )

    @api.onchange("community_iot_box_id")
    def _onchange_community_iot_box_id(self):
        for printer in self:
            if printer.community_iot_device_id and printer.community_iot_device_id.box_id != printer.community_iot_box_id:
                printer.community_iot_device_id = False

    @api.constrains(
        "community_iot_enabled",
        "community_iot_box_id",
        "community_iot_device_id",
        "community_iot_copies",
    )
    def _check_community_iot_printer(self):
        for printer in self:
            if not printer.community_iot_enabled:
                continue
            if not printer.community_iot_box_id or not printer.community_iot_device_id:
                raise ValidationError("Debe seleccionar IoT Box y dispositivo Community IoT para la impresora de preparacion.")
            if printer.community_iot_device_id.box_id != printer.community_iot_box_id:
                raise ValidationError("El dispositivo Community IoT debe pertenecer a la IoT Box seleccionada.")
            if printer.community_iot_copies < 1:
                raise ValidationError("Las copias deben ser al menos 1.")

    def action_print_test_page(self):
        self.ensure_one()
        if not self.community_iot_device_id:
            raise ValidationError("Seleccione primero un dispositivo Community IoT.")
        return self.community_iot_device_id.action_print_test_page()

    def action_pos_community_iot_print_preparation(self, payload):
        self.ensure_one()
        if not self.community_iot_enabled or not self.community_iot_device_id:
            return {"success": False, "message": "No hay dispositivo Community IoT configurado en esta impresora."}

        device = self.community_iot_device_id
        order_ref = payload.get("order_ref") or "POS"
        lines = build_preparation_lines(self, device, payload)
        base_payload = device._build_ticket_payload(lines)
        base_payload.update(
            {
                "source": "pos_preparation",
                "order_ref": order_ref,
                "printer_id": self.id,
            }
        )
        copies = max(1, int(self.community_iot_copies or 1))
        job_vals_list = []
        for index in range(copies):
            copy_suffix = f" ({index + 1}/{copies})" if copies > 1 else ""
            job_vals_list.append(
                {
                    "name": f"POS Preparation - {order_ref}{copy_suffix}",
                    "box_id": device.box_id.id,
                    "device_id": device.id,
                    "device_key": device.device_key,
                    "job_type": "ticket_print",
                    "state": "pending",
                    "payload": json.dumps(base_payload),
                    "origin_model": "pos.order",
                    "origin_id": int(payload.get("order_server_id")) if payload.get("order_server_id") else False,
                }
            )
        jobs = self.env["community_iot_box.iot_job"].sudo().create(job_vals_list)
        return {"success": True, "job_ids": jobs.ids}
