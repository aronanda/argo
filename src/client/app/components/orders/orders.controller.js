import Introspected from "introspected";

// import { ToastsService } from "../toasts/toasts.service";
import { OrdersService } from "../orders/orders.service";

export class OrdersController {
    constructor(render, template) {

        this.state = Introspected({
            orders: []
        }, state => template.update(render, state));

        this.ordersService = new OrdersService(this.state.orders);

        OrdersService.refresh();
    }

    // closeOrder(orderId) {
    //     this.openCloseOrderModal = true;
    //     this.closingOrderId = orderId;
    // }

    // closeOrderDialog(answer) {
    //     this.openCloseOrderModal = false;

    //     if (!answer) {
    //         return;
    //     }

    //     this.OrdersService.closeOrder(this.closingOrderId).then(order => {
    //         let message = `Closed #${order.orderCancelTransaction.orderID}`;

    //         if (order.errorMessage || order.message) {
    //             message = `ERROR ${order.errorMessage || order.message}`;
    //         }

    //         ToastsService.addToast(message);
    //     }).catch(err => {
    //         const message = `ERROR ${err.code} ${err.message}`;

    //         ToastsService.addToast(message);
    //     });
    // }
}
