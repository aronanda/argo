import { Util } from "../../util";

export class TradesTemplate {
    static update(render, state) {
        if (state.trades.length) {
            TradesTemplate.renderTrades(render, state);
        } else {
            TradesTemplate.renderNoTrades(render);
        }
    }

    static renderTrades(render, state) {
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
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Profit (PIPS)</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="trade in $ctrl.trades">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.side }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">
                                <a href ng-click="$ctrl.closeTrade(trade.id)">{{ trade.id }}</a>
                            </td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.instrument }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.currentUnits | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.stopLossOrder.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.takeProfitOrder.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.trailingStopLossOrder.distance }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.current }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr"
                                ng-class="trade.profitPips >= 0 ? 'green' : 'red'">
                                {{ trade.profitPips | number:1}}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <yesno-dialog open-modal="$ctrl.openCloseTradeModal"
                close-modal="$ctrl.closeTradeDialog(answer)"
                text="Are you sure to close the trade?">
            </yesno-dialog>
        `;
    }

    static renderNoTrades(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p ng-hide="$ctrl.trades.length" class="f6 w-100 mw8 tc b">No trades.</p>
            </div>
        `;
    }
}
