import hyperHTML from "hyperHTML";

import { Util } from "../../util";

export class ChartsTemplate {
    static update(render, state, events) {
        if (!Object.keys(state.account.streamingInstruments).length) {
            Util.renderEmpty(render);
            return;
        }

        /* eslint indent: off */
        render`
            <div class="flex flex-wrap flex-row justify-center justify-around mb2">
                <select id="changeInstrument" onchange="${e => events(e, {
                        selectedInstrument: state.selectedInstrument,
                        selectedGranularity: state.selectedGranularity
                    })}">${

                    state.account.streamingInstruments.map(instrument => hyperHTML.wire()`
                    <option value="${instrument}" selected="${state.selectedItem === instrument}">
                        ${instrument}
                    </option>
                `)}</select>

                <select id="changeGranularity" onchange="${e => events(e, {
                        selectedInstrument: state.selectedInstrument,
                        selectedGranularity: state.selectedGranularity
                    })}">${

                    state.granularities.map(granularity => hyperHTML.wire()`
                    <option value="${granularity}" selected="${state.selectedGranularity === granularity}">
                        ${granularity}
                    </option>
                `)}</select>

                <a class="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4">
                    <span id="openBuyOrderDialog" class="pointer pl1"
                        onclick="${e => events(e, "buy")}">Buy</span>
                </a>
                <a class="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4">
                    <span id="openSellOrderDialog" class="pointer pl1"
                        onclick="${e => events(e, "sell")}">Sell</span>
                </a>
            </div>

            <ohlc-chart class="dn-s"
                instrument="$ctrl.selectedInstrument"
                granularity="$ctrl.selectedGranularity"
                data="$ctrl.data"
                feed="$ctrl.feed",
                trades="$ctrl.trades">
            </ohlc-chart>

            <order-dialog ng-if="$ctrl.openOrderModal" open-modal="$ctrl.openOrderModal"
                params="$ctrl.orderParams">
            </order-dialog>
        `;
    }
}
