import { Util } from "../../util";
import { SessionService } from "../session/session.service";

export class AccountsService {
    static getAccount() {
        return AccountsService.account;
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        AccountsService.getAccounts({
            environment: credentials.environment,
            token: credentials.token,
            accountId: credentials.accountId
        });
    }

    static getAccounts({
        environment = "practice",
        token = "abc",
        accountId = null
    } = {}) {
        const api = accountId ? "/api/account" : "/api/accounts";

        return Util.fetch(api, {
            method: "post",
            body: JSON.stringify({
                environment,
                token,
                accountId
            })
        }).then(res => res.json()).then(data => {
            const accounts = data.accounts || data;

            if (data.message) {
                throw data.message;
            }

            if (!accounts.length) {
                Object.assign(AccountsService.account, data.account);

                AccountsService.account.timestamp = new Date();

                AccountsService.account.unrealizedPLPercent =
                    AccountsService.account.unrealizedPL /
                        AccountsService.account.balance * 100;

                // if (!this.account.instruments) {
                //     this.$http.post("/api/instruments", {
                //         environment,
                //         token,
                //         accountId
                //     }).then(instruments => {
                //         this.account.instruments = instruments.data;
                //         this.account.pips = {};
                //         angular.forEach(this.account.instruments, i => {
                //             this.account.pips[i.name] =
                //                 Math.pow(10, i.pipLocation);
                //         });
                //     });
                // }
            }

            return accounts;
        });
    }

    // setStreamingInstruments(settings) {
    //     this.account.streamingInstruments = Object.keys(settings)
    //         .filter(el => !!settings[el]);

    //     return this.account.streamingInstruments;
    // }
}

AccountsService.account = {};
