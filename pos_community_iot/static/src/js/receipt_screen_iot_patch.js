/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { printReceiptViaCommunityIot, shouldUseCommunityIotReceipt } from "@pos_community_iot/js/receipt_iot_common";

patch(ReceiptScreen.prototype, {
    async printReceipt() {
        const config = this.pos?.config;
        if (!shouldUseCommunityIotReceipt(config)) {
            return await super.printReceipt();
        }

        this.buttonPrintReceipt.el.className = "fa fa-fw fa-spin fa-circle-o-notch";
        let isPrinted = false;
        try {
            isPrinted = await printReceiptViaCommunityIot({
                pos: this.pos,
                renderer: this.printer?.renderer,
                component: OrderReceipt,
                props: {
                    data: {
                        ...this.pos.get_order().export_for_printing(),
                        isBill: this.isBill,
                    },
                    formatCurrency: this.env.utils.formatCurrency,
                },
            });
        } catch (error) {
            console.warn("Community IoT receipt screen print failed, falling back to default printer.", error);
            isPrinted = false;
        }

        if (!isPrinted) {
            return await super.printReceipt();
        }

        this.currentOrder._printed = true;
        if (this.buttonPrintReceipt.el) {
            this.buttonPrintReceipt.el.className = "fa fa-print";
        }
        return true;
    },
});
