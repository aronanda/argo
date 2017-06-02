import Introspected from "introspected";

import { Util } from "../../util";
import { TokenDialogComponent } from "../token-dialog/token-dialog.component";

// import { AccountsService } from "../account/accounts.service";
// import { SessionService } from "../session/session.service";
// import { QuotesService } from "../quotes/quotes.service";
// import { StreamingService } from "../streaming/streaming.service";
// import { ToastsService } from "../toasts/toasts.service";

export class HeaderController {
    constructor(render, template) {
        const events = (e, payload) => Util.handleEvent(this, e, payload);

        const instrsStorage = window.localStorage.getItem("argo.instruments");

        const instrs = JSON.parse(instrsStorage) || {
            EUR_USD: true,
            USD_JPY: true,
            GBP_USD: true,
            EUR_GBP: true,
            USD_CHF: true,
            EUR_JPY: true,
            EUR_CHF: true,
            USD_CAD: true,
            AUD_USD: true,
            GBP_JPY: true
        };

        this.state = Introspected({
            tokenModalIsOpen: false,
            tokenInfo: {
                environment: "",
                token: "",
                accountId: ""
            },
            accounts: [],
            instrs
        }, state => template.update(render, state, events));

        TokenDialogComponent.bootstrap(this.state);
    }

    // openSettingsDialog() {
    //     this.SessionService.isLogged().then(credentials => {
    //         const allInstrs = this.AccountsService.getAccount().instruments;

    //         angular.forEach(allInstrs, instrument => {
    //             if (!this.instrs.hasOwnProperty(instrument.name)) {
    //                 this.instrs[instrument.name] = false;
    //             }
    //         });

    //         this.credentials = credentials;
    //         this.openSettingsModal = true;
    //     }).catch(err => {
    //         if (err) {
    //             ToastsService.addToast(err);
    //         }
    //     });
    // }

    // closeSettingsDialog(settingsInfo) {
    //     let instruments;

    //     this.openSettingsModal = false;

    //     if (settingsInfo) {
    //         this.$window.localStorage.setItem("argo.instruments",
    //             angular.toJson(settingsInfo));
    //         instruments = this.AccountsService
    //             .setStreamingInstruments(settingsInfo);

    //         this.QuotesService.reset();

    //         this.StreamingService.startStream({
    //             environment: this.credentials.environment,
    //             accessToken: this.credentials.token,
    //             accountId: this.credentials.accountId,
    //             instruments
    //         });
    //     }
    // }
}
