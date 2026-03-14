/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { printReceiptViaCommunityIot, shouldUseCommunityIotReceipt } from "@pos_community_iot/js/receipt_iot_common";

patch(PaymentScreen.prototype, {
    async afterOrderValidation(suggestToSync = true) {
        const config = this.pos?.config;
        const originalPrint = this.printer?.print?.bind(this.printer);

        if (!originalPrint || !shouldUseCommunityIotReceipt(config)) {
            return await super.afterOrderValidation(suggestToSync);
        }

        this.printer.print = async (component, props, options) => {
            const isOrderReceipt = component === OrderReceipt || component?.template === OrderReceipt.template;
            if (isOrderReceipt && props?.data) {
                try {
                    const handled = await printReceiptViaCommunityIot({
                        pos: this.pos,
                        renderer: this.printer?.renderer,
                        component,
                        props,
                    });
                    if (handled) {
                        return true;
                    }
                } catch (error) {
                    console.warn(
                        "Community IoT payment receipt print failed, falling back to default printer.",
                        error
                    );
                }
            }
            return await originalPrint(component, props, options);
        };

        try {
            return await super.afterOrderValidation(suggestToSync);
        } finally {
            this.printer.print = originalPrint;
        }
    },
});
