/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ReprintReceiptButton } from "@point_of_sale/app/screens/ticket_screen/reprint_receipt_button/reprint_receipt_button";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { printReceiptViaCommunityIot, shouldUseCommunityIotReceipt } from "@pos_community_iot/js/receipt_iot_common";

patch(ReprintReceiptButton.prototype, {
    async click() {
        if (!this.props.order || !shouldUseCommunityIotReceipt(this.pos?.config)) {
            return await super.click();
        }
        try {
            const handled = await printReceiptViaCommunityIot({
                pos: this.pos,
                renderer: this.printer?.renderer,
                component: OrderReceipt,
                props: {
                    data: this.props.order.export_for_printing(),
                    formatCurrency: this.env.utils.formatCurrency,
                },
            });
            if (handled) {
                return true;
            }
        } catch (error) {
            console.warn("Community IoT reprint failed, falling back to default printer.", error);
        }
        return await super.click();
    },
});
