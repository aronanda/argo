import { ToastsService } from "../toasts/toasts.service";

export class TradesController {
    constructor(TradesService) {
        this.TradesService = TradesService;
    }

    $onInit() {
        this.trades = this.TradesService.getTrades();

        this.TradesService.refresh();
    }

    closeTrade(tradeId) {
        this.openCloseTradeModal = true;
        this.closingTradeId = tradeId;
    }

    closeTradeDialog(answer) {
        this.openCloseTradeModal = false;

        if (!answer) {
            return;
        }

        this.TradesService.closeTrade(this.closingTradeId).then(trade => {
            let message = "Closed " +
                    `${(trade.units > 0 ? "sell" : "buy")} ` +
                    `${trade.instrument} ` +
                    `#${trade.id} ` +
                    `@${trade.price} ` +
                    `P&L ${trade.pl}`;

            if (trade.errorMessage || trade.message) {
                message = `ERROR ${trade.errorMessage || trade.message}`;
            }


            ToastsService.addToast(message);
        }).catch(err => {
            const message = `ERROR ${err.code} ${err.message}`;

            ToastsService.addToast(message);
        });
    }

}
TradesController.$inject = ["TradesService"];
