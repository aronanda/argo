import Introspected from "introspected";

import { Util } from "../../util";

import { SessionService } from "../session/session.service";
import { AccountsService } from "../account/accounts.service";

// import { StreamingService } from "../streaming/streaming.service";
import { ToastsService } from "../toasts/toasts.service";

export class TokenDialogController {
    constructor(render, template, bindings) {
        const events = (e, payload) => Util.handleEvent(this, e, payload);

        this.state = Introspected.observe(bindings,
            state => template.update(render, state, events));
    }

    onLoginOkClick() {
        AccountsService.getAccounts({
            environment: this.state.tokenInfo.environment,
            token: this.state.tokenInfo.token
        }).then(accounts => {
            const message = "If your account id contains only digits " +
                "(ie. 2534233), it is a legacy account and you should use " +
                "release 3.x. For v20 accounts use release 4.x or higher. " +
                "Check your token.";

            if (!accounts.length) {
                throw new Error(message);
            }
            accounts.forEach(item => {
                this.state.accounts.push(item);
            });
        }).catch(err => {
            this.state.tokenModalIsOpen = false;
            ToastsService.addToast(err);
        });
    }

    onSelectAccountClick(e, accountSelected) {
        this.state.tokenInfo.accountId = this.state.accounts[accountSelected].id;

        const tokenInfo = {
            environment: this.state.tokenInfo.environment,
            token: this.state.tokenInfo.token,
            accountId: this.state.tokenInfo.accountId,
            instrs: this.state.instrs
        };

        SessionService.setCredentials(tokenInfo);

        AccountsService.getAccounts(tokenInfo).then(() => {
            const instruments = AccountsService
                .setStreamingInstruments(this.state.instrs);

            // this.StreamingService.startStream({
            //     environment: this.environment,
            //     accessToken: this.token,
            //     accountId: this.accountId,
            //     instruments
            // });

            this.state.tokenModalIsOpen = false;
        }).catch(err => {
            ToastsService.addToast(err);
            this.state.tokenModalIsOpen = false;
        });
    }

}
