import Introspected from "introspected";

import { Util } from "../../util";

// import { SessionService } from "../session/session.service";
// import { AccountsService } from "../account/accounts.service";
// import { StreamingService } from "../streaming/streaming.service";
// import { ToastsService } from "../toasts/toasts.service";

export class TokenDialogController {
    constructor(render, template, bindings) {
        const events = (e, payload) => Util.handleEvent(this, e, payload);

        this.state = Introspected.observe(bindings,
            state => template.update(render, state, events));
    }

    onLoginOkClick(e, tokenInfo) {

        this.state.tokenModalIsOpen = false;

        this.state.tokenInfo.environment = tokenInfo.environment;
        this.state.tokenInfo.token = tokenInfo.token;

    //     this.AccountsService.getAccounts({
    //         environment: this.environment,
    //         token: this.token
    //     }).then(accounts => {
    //         const message = "If your account id contains only digits " +
    //             "(ie. 2534233), it is a legacy account and you should use " +
    //             "release 3.x. For v20 accounts use release 4.x or higher. " +
    //             "Check your token.";

    //         if (!accounts.length) {
    //             throw new Error(message);
    //         }
    //         angular.extend(this.accounts, accounts);
    //     }).catch(err => {
    //         ToastsService.addToast(err);
    //         this.closeModal();
    //     });
    }

    // selectAccount(accountSelected) {
    //     this.accountId = this.accounts[accountSelected].id;

    //     const tokenInfo = {
    //         environment: this.environment,
    //         token: this.token,
    //         accountId: this.accountId,
    //         instrs: this.instrs
    //     };

    //     this.SessionService.setCredentials(tokenInfo);

    //     this.AccountsService.getAccounts(tokenInfo).then(() => {
    //         const instruments = this.AccountsService
    //             .setStreamingInstruments(this.instrs);

    //         this.StreamingService.startStream({
    //             environment: this.environment,
    //             accessToken: this.token,
    //             accountId: this.accountId,
    //             instruments
    //         });

    //         this.closeModal({ tokenInfo });
    //     }).catch(err => {
    //         ToastsService.addToast(err);
    //         this.closeModal();
    //     });
    // }

}
