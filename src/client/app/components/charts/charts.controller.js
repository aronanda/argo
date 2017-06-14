import Introspected from "introspected";

import { AccountsService } from "../account/accounts.service";
import { ChartsService } from "./charts.service";
import { QuotesService } from "../quotes/quotes.service";
import { TradesService } from "../trades/trades.service";
import { Util } from "../../util";

export class ChartsController {
    constructor(render, template) {
        const events = (e, payload) => Util.handleEvent(this, e, payload);

        this.state = Introspected({
            candles: [],
            account: AccountsService.getAccount(),
            selectedGranularity: "M5",
            selectedInstrument: "EUR_USD",
            granularities: [
                "S5",
                "S10",
                "S15",
                "S30",
                "M1",
                "M2",
                "M3",
                "M4",
                "M5",
                "M10",
                "M15",
                "M30",
                "H1",
                "H2",
                "H3",
                "H4",
                "H6",
                "H8",
                "H12",
                "D",
                "W",
                "M"
            ]
        }, state => template.update(render, state, events));

        this.chartsService = new ChartsService(this.state.candles);

        this.feed = QuotesService.getQuotes();

        this.trades = TradesService.getTrades();

        ChartsController.changeChart(this.state.selectedInstrument, this.state.selectedGranularity);

        this.orderParams = {
            side: "buy",
            selectedInstrument: this.state.selectedInstrument,
            instruments: this.state.account.streamingInstruments
        };
    }

    static changeChart(instrument, granularity) {
        ChartsService.getHistQuotes({
            instrument,
            granularity
        });
    }

    openOrderDialog(side) {
        Object.assign(this.orderParams, {
            side,
            selectedInstrument: this.state.selectedInstrument,
            instruments: this.state.account.streamingInstruments
        });

        this.openOrderModal = true;
    }
}
