import Introspected from "introspected";

import { TradesService } from "../trades/trades.service";

export class ExposureController {
    constructor(render, template) {

        this.state = Introspected({
            exposure: []
        }, state => template.update(render, state));

        const trades = TradesService.getTrades(),
            exps = {};

        if (!trades) { // create a service with refresh method
            return;
        }

        trades.forEach(trade => {
            const legs = trade.instrument.split("_");

            exps[legs[0]] = exps[legs[0]] || 0;
            exps[legs[1]] = exps[legs[1]] || 0;

            exps[legs[0]] += parseInt(trade.currentUnits, 10);
            exps[legs[1]] -= trade.currentUnits * trade.price;
        });

        Object.keys(exps).forEach(exp => {
            const type = exps[exp] > 0;

            this.state.exposures.push({
                type: type ? "Long" : "Short",
                market: exp,
                units: Math.abs(exps[exp])
            });
        });
    }
}
