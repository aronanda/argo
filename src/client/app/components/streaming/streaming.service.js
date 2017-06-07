import { Util } from "../../util";
import { ToastsService } from "../toasts/toasts.service";

export class StreamingService {
    static startStream(data) {
        Util.fetch("/api/startstream", {
            method: "post",
            body: JSON.stringify({
                environment: data.environment,
                accessToken: data.accessToken,
                accountId: data.accountId,
                instruments: data.instruments
            })
        }).then(() => {
            StreamingService.getStream();
        }).catch(err => {
            ToastsService.addToast(err);
        });
    }

    static getStream() {
        const ws = new WebSocket("ws://localhost:8000/stream");

        ws.onmessage = event => {
            let data,
                isTick,
                tick,
                isTransaction,
                transaction,
                refreshPlugins;

            try {
                data = JSON.parse(event.data);

                isTick = data.closeoutAsk && data.closeoutBid;
                isTransaction = data.accountID;
                refreshPlugins = data.refreshPlugins;

                if (isTick) {
                    tick = {
                        time: data.time,
                        instrument: data.instrument,
                        ask: data.asks[0] && data.asks[0].price ||
                            data.closeoutAsk,
                        bid: data.bids[0] && data.bids[0].price ||
                            data.closeoutBid
                    };

                    // this.QuotesService.updateTick(tick);
                    // this.TradesService.updateTrades(tick);
                    // this.OrdersService.updateOrders(tick);
                }

                if (isTransaction) {
                    transaction = data;
                    // this.ActivityService.addActivity(transaction);

                    // this.TradesService.refresh();
                    // this.OrdersService.refresh();
                    // this.AccountsService.refresh();
                }

                if (refreshPlugins) {
                    // this.PluginsService.refresh();
                }
            } catch (e) {

                // Discard "incomplete" json
                // console.log(e.name + ": " + e.message);
            }
        };
    }
}
