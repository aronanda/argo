import { Util } from "../../util";

export class OrdersTemplate {
    static update(render, state) {
        if (state.orders.length) {
            OrdersTemplate.renderOrders(render, state);
        } else {
            OrdersTemplate.renderNoOrders(render);
        }
    }

    static renderOrders(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Ticket</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">S/L</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">T/P</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">T/S</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Price</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Current</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Distance</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Expiry</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="order in $ctrl.orders">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.side || order.type }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">
                                <a href ng-click="$ctrl.closeOrder(order.id)">{{ order.id }}</a>
                            </td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.instrument }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.units | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.stopLossOnFill.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.takeProfitOnFill.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.trailingStopLossOnFill.distance || order.trailingStopValue }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.price | number:4 }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.current | number:4 }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.distance | number:1 }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.expiry | date:"MMM d, HH:mm" }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <yesno-dialog open-modal="$ctrl.openCloseOrderModal"
                close-modal="$ctrl.closeOrderDialog(answer)"
                text="Are you sure to close the order?">
            </yesno-dialog>

        `;
    }

    static renderNoOrders(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No orders.</p>
            </div>
        `;
    }
}





