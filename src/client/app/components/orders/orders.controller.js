import { ToastsService } from "../toasts/toasts.service";

export class OrdersController {
    constructor(OrdersService) {
        this.OrdersService = OrdersService;
    }

    $onInit() {
        this.orders = this.OrdersService.getOrders();

        this.OrdersService.refresh();
    }

    closeOrder(orderId) {
        this.openCloseOrderModal = true;
        this.closingOrderId = orderId;
    }

    closeOrderDialog(answer) {
        this.openCloseOrderModal = false;

        if (!answer) {
            return;
        }

        this.OrdersService.closeOrder(this.closingOrderId).then(order => {
            let message = `Closed #${order.orderCancelTransaction.orderID}`;

            if (order.errorMessage || order.message) {
                message = `ERROR ${order.errorMessage || order.message}`;
            }

            ToastsService.addToast(message);
        }).catch(err => {
            const message = `ERROR ${err.code} ${err.message}`;

            ToastsService.addToast(message);
        });
    }

}
OrdersController.$inject = ["OrdersService"];
