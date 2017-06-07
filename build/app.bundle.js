(function (hyperHTML,Introspected) {
'use strict';

hyperHTML = 'default' in hyperHTML ? hyperHTML['default'] : hyperHTML;
Introspected = 'default' in Introspected ? Introspected['default'] : Introspected;

class Util {
    static query(selector) {
        return document.querySelector(selector) ||
            console.error(selector, "not found");
    }

    static handleEvent(context, e, payload) {
        const type = e.type;
        const id = e.target.id || console.warn(e.target, "target without id");
        const method = `on${id[0].toUpperCase()}${id.split("-")[0].slice(1)}` +
            `${type[0].toUpperCase()}${type.slice(1)}`;


        return method in context ? context[method](e, payload)
            : console.warn(method, "not implemented");
    }

    static renderEmpty(render) {
        return render`${hyperHTML.wire(render, ":empty")``}`;
    }

    static getHHMMSSfromDate(date) {
        if (!date) {
            return "";
        }

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    }

    static fetch(url, options) {
        options.headers = options.headers ||
            { "Content-Type": "application/json" };

        options.body = typeof options.body === "string" ? options.body
            : JSON.stringify(options.body);

        const fetchCall = fetch(url, options);

        Util.spinnerState.isLoadingView = true;
        fetchCall.then(() => {
            Util.spinnerState.isLoadingView = false;
        }).catch(() => {
            Util.spinnerState.isLoadingView = false;
        });

        return fetchCall;
    }

    static show(condition) {
        return condition ? "display: block;" : "display: none;";
    }
}

Util.spinnerState = {};

class RootTemplate {
    static update(render) {
        render`<app class="arimo"></app>`;
    }
}

class RootComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("root"));

        RootTemplate.update(render);
    }
}

RootComponent.bootstrap();

class AppTemplate {
    static update(render, state) {
        const tabClasses = "f6 f5-l pointer bg-animate black-80 hover-bg-light-blue dib pa3 ph4-l";
        const selectedTabClasses = `${tabClasses} bg-blue`;
        const isTradesTab = state.tabSelectedIndex === 0;
        const isOrdersTab = state.tabSelectedIndex === 1;
        const isPositionsTab = state.tabSelectedIndex === 2;
        const isExposuresTab = state.tabSelectedIndex === 3;
        const isActivityTab = state.tabSelectedIndex === 4;
        const isNewsTab = state.tabSelectedIndex === 5;
        const isPluginsTab = state.tabSelectedIndex === 6;
        const tabs = [
            hyperHTML.wire(render, ":trades")`<trades></trades>`,
            hyperHTML.wire(render, ":orders")`<orders></orders>`,
            hyperHTML.wire(render, ":positions")`<positions></positions>`,
            hyperHTML.wire(render, ":exposure")`<exposure></exposure>`,
            hyperHTML.wire(render, ":activity")`<activity></activity>`,
            hyperHTML.wire(render, ":news")`<news></news>`,
            hyperHTML.wire(render, ":plugins")`<plugins></plugins>`
        ];
        const selectedTab = tabs[state.tabSelectedIndex];

        /* eslint indent: off */
        render`
            <header></header>

            <nav class="bt bb tc mw9 center shadow-2 tracked">
                <a class="${isTradesTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 0;
                    }}">Trades</a>
                <a class="${isOrdersTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 1;
                    }}">Orders</a>
                <a class="${isPositionsTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 2;
                    }}">Positions</a>
                <a class="${isExposuresTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 3;
                    }}">Exposures</a>
                <a class="${isActivityTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 4;
                    }}">Activity</a>
                <a class="${isNewsTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 5;
                    }}">News</a>
                <a class="${isPluginsTab ? selectedTabClasses : tabClasses}"
                    onclick="${() => {
                        state.tabSelectedIndex = 6;
                    }}">Plugins</a>
            </nav>

            <div class="flex flex-wrap-s flex-wrap-m ma2 pa2">
                <div class="flex flex-wrap flex-column min-w-25">
                    <account class="mb4"></account>
                    <quotes class="mb4"></quotes>
                    <toasts></toasts>
                </div>
                <div class="flex flex-wrap flex-column min-w-75">
                    <div class="ma2 pa2">${selectedTab}</div>
                    <charts></charts>
                </div>
            </div>
        `;
    }
}

class AppController {
    constructor(render, template) {
        this.state = Introspected({
            tabSelectedIndex: 0
        }, state => template.update(render, state));
    }
}

class AppComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("app"));

        this.appController = new AppController(render, AppTemplate);
    }
}

AppComponent.bootstrap();

class AccountTemplate {
    static update(render, state) {
        if (state.account.id.toString()) {
            AccountTemplate.renderAccount(render, state);
        } else {
            AccountTemplate.renderNoAccount(render);
        }
    }

    static renderAccount(render, state) {
        const timestamp = Util.getHHMMSSfromDate(new Date(state.account.timestamp));
        const balance = parseFloat(state.account.balance).toFixed(2);
        const unrealizedPL = parseFloat(state.account.unrealizedPL).toFixed(2);
        const unrealizedPLPercent = parseFloat(state.account.unrealizedPLPercent).toFixed(2);
        const NAV = parseFloat(state.account.NAV).toFixed(2);
        const pl = parseFloat(state.account.pl).toFixed(2);
        const marginCallMarginUsed = parseFloat(state.account.marginCallMarginUsed).toFixed(2);
        const marginAvailable = parseFloat(state.account.marginAvailable).toFixed(2);
        const marginCloseoutPositionValue = parseFloat(state.account.marginCloseoutPositionValue).toFixed(2);
        const marginCloseoutPercent = parseFloat(state.account.marginCloseoutPercent).toFixed(2);
        const positionValue = parseFloat(state.account.positionValue).toFixed(2);

        /* eslint indent: off */
        render`
            <div class="h6 overflow-auto">
                <table class="collapse f6 w-100 mw8 center">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1">Account Summary</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1">
                            ${timestamp} (${state.account.currency})
                        </th>
                    </thead>

                    <tbody>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Balance</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${balance}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Unrealized P&amp;L</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${unrealizedPL}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Unrealized P&amp;L (%)</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${unrealizedPLPercent}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Net Asset Value</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${NAV}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Realized P&amp;L</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${pl}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Margin Used</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${marginCallMarginUsed}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Margin Available</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${marginAvailable}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Margin Closeout Value</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${marginCloseoutPositionValue}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Margin Closeout Value (%)</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${marginCloseoutPercent}</td>
                        </tr>
                        <tr>
                            <td class="fw6 bb b--black-20 tl pb1 pr1">Position Value</td>
                            <td class="pv1 pr1 bb b--black-20 tr">${positionValue}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoAccount(render) {
        /* eslint indent: off */
        render`
            <div class="h6 overflow-auto">
                <p class="f6 w-100 mw8 center b">No account.</p>
            </div>
        `;
    }
}

class SessionService {
    static setCredentials(session) {
        SessionService.credentials.environment = session.environment;
        SessionService.credentials.token = session.token;
        SessionService.credentials.accountId = session.accountId;
    }

    static isLogged() {
        if (SessionService.credentials.token) {
            return SessionService.credentials;
        }

        return null;
    }
}

SessionService.credentials = {
    environment: null,
    token: null,
    accountId: null
};

class AccountsService {
    constructor(account) {
        if (!AccountsService.account) {
            AccountsService.account = account;
        }
    }

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

                if (JSON.stringify(AccountsService.account.instruments) === "{}") {
                    Util.fetch("/api/instruments", {
                        method: "post",
                        body: JSON.stringify({
                            environment,
                            token,
                            accountId
                        })
                    }).then(res => res.json()).then(instruments => {
                        AccountsService.account.instruments = instruments;
                        AccountsService.account.pips = {};
                        AccountsService.account.instruments.forEach(i => {
                            AccountsService.account.pips[i.name] =
                                Math.pow(10, i.pipLocation);
                        });
                    });
                }
            }

            return accounts;
        });
    }

    static setStreamingInstruments(settings) {
        AccountsService.account.streamingInstruments = Object.keys(settings)
            .filter(el => !!settings[el]);

        return AccountsService.account.streamingInstruments;
    }
}

AccountsService.account = null;

class AccountController {
    constructor(render, template) {

        this.state = Introspected({
            account: {}
        }, state => template.update(render, state));

        this.accountsService = new AccountsService(this.state.account);
    }
}

class AccountComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("account"));

        this.accountController = new AccountController(render, AccountTemplate);
    }
}

AccountComponent.bootstrap();

class HeaderTemplate {
    static update(render, state) {
        /* eslint indent: off */
        render`
            <nav class="flex flex-row bt bb tc mw9 center shadow-2">

                <div class="flex flex-wrap flex-row justify-around items-center min-w-95">
                        <a class="logo" href="http://argo.js.org/">
                            <img alt="Argo" src="img/logo.png">
                        </a>

                        <span class="b">Argo Interface for OANDA Trading Platform</span>

                        <div style="${Util.show(state.tokenInfo.token)}">
                            Active environment: <span class="b">${state.tokenInfo.environment}</span>
                        </div>

                        <div style="${Util.show(state.tokenInfo.accountId)}">
                            Account Id: <span class="b">${state.tokenInfo.accountId}</span>
                        </div>

                        <div style="${Util.show(!state.tokenInfo.token)}">
                            Please, insert the access token.
                        </div>

                        <a class="pointer f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4"
                            style="${Util.show(state.tokenInfo.accountId)}"
                            ng-click="$ctrl.openSettingsDialog()">
                        <span class="pl1">Settings</span>
                        </a>
                        <a class="pointer f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4"
                            onclick="${() => {
                                state.tokenModalIsOpen = true;
                            }}">
                        <span class="pl1">Token</span>
                        </a>
                </div>

                <div class="flex flex-row items-center min-w-5">
                    <span class="${Util.spinnerState.isLoadingView ? "spinner" : ""}"></span>
                </div>

            </nav>

            <token-dialog></token-dialog>
            <settings-dialog open-modal="$ctrl.openSettingsModal"
                close-modal="$ctrl.closeSettingsDialog(settingsInfo)" instruments="$ctrl.instrs">
            </settings-dialog>
        `;
    }
}

class TokenDialogTemplate {
    static update(render, state, events) {
        if (!state.tokenModalIsOpen) {
            Util.renderEmpty(render);
            return;
        }

        if (!state.accounts.length) {
            TokenDialogTemplate.renderTokenModal(render, state, events);
        } else {
            TokenDialogTemplate.renderAccountsListModal(render, state, events);
        }
    }

    static renderTokenModal(render, state, events) {
        /* eslint indent: off */
        render`
            <div class="fixed absolute--fill bg-black-70 z5">
            <div class="fixed absolute-center z999">

            <main class="pa4 black-80 bg-white">
                <form class="measure center">
                    <fieldset id="login" class="ba b--transparent ph0 mh0">
                        <legend class="f4 fw6 ph0 mh0 center">Token Dialog</legend>

                        <div class="flex flex-row items-center mb2 justify-between">
                            <label for="practice" class="lh-copy">Practice</label>
                            <input class="mr2" type="radio" name="environment" value="practice"
                                checked="${state.tokenInfo.environment === "practice"}"
                                onchange="${e => {
                                    state.tokenInfo.environment = e.target.value.trim();
                                }}">

                        </div>
                        <div class="flex flex-row items-center justify-between mb2">
                            <label for="live" class="lh-copy">Live</label>
                            <input class="mr2" type="radio" name="environment" value="live"
                                checked="${state.tokenInfo.environment === "live"}"
                                onchange="${e => {
                                    state.tokenInfo.environment = e.target.value.trim();
                                }}">
                        </div>

                        <div class="mv3">
                            <input class="b pa2 ba bg-transparent w-100"
                                placeholder="Token" name="token" id="token"
                                oninput="${e => {
                                    state.tokenInfo.token = e.target.value.trim();
                                }}">
                        </div>
                    </fieldset>

                    <div class="flex flex-row items-center justify-around">
                        <input id="loginCancel" class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="button" value="Cancel"
                            onclick="${() => {
                                state.tokenModalIsOpen = false;
                            }}">

                        <input id="loginOk" class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="button" value="Ok"
                            onclick="${events}">
                    </div>
                </form>
            </main>

            </div>
            </div>
        `;
    }

    static renderAccountsListModal(render, state, events) {
        /* eslint indent: off */
        render`
            <div class="fixed absolute--fill bg-black-70 z5">
            <div class="fixed absolute-center z999">

            <main class="pa4 black-80 bg-white">
                <form class="measure center">
                    <fieldset id="login" class="ba b--transparent ph0 mh0">
                        <legend class="f4 fw6 ph0 mh0 center">Accounts List</legend>
                    </fieldset>

                    <div class="flex flex-row items-center justify-around">${
                        state.accounts.map((account, index) => hyperHTML.wire(account, ":li")`
                            <input id="${`selectAccount-${index}`}"
                                class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                                type="button" value="${account.id}"
                                onclick="${e => events(e, index)}">
                    `)}</div>
                </form>
            </main>

            </div>
            </div>
        `;
    }
}

class ToastsService {
    constructor(toasts) {
        if (!ToastsService.toasts) {
            ToastsService.toasts = toasts;
        }
    }

    static getToasts() {
        return ToastsService.toasts;
    }

    static addToast(message) {
        ToastsService.toasts.splice(0, 0, {
            date: (new Date()),
            message
        });

        if (ToastsService.timeout) {
            clearTimeout(ToastsService.timeout);
        }
        ToastsService.timeout = ToastsService.reset();
    }

    static reset() {
        return setTimeout(() => {
            while (ToastsService.toasts.length) {
                ToastsService.toasts.pop();
            }
        }, 10000);
    }
}

ToastsService.toasts = null;
ToastsService.timeout = null;

class QuotesService {
    constructor(quotes) {
        if (!QuotesService.quotes) {
            QuotesService.quotes = quotes;
        }
    }

    static getQuotes() {
        return QuotesService.quotes;
    }

    static updateTick(tick) {
        const account = AccountsService.getAccount(),
            streamingInstruments = account.streamingInstruments,
            pips = account.pips,
            instrument = tick.instrument;

        QuotesService.quotes[instrument] = {
            time: tick.time,
            ask: tick.ask,
            bid: tick.bid,
            spread: ((tick.ask - tick.bid) / pips[instrument]).toFixed(1)
        };


        const accountInstruments = JSON.stringify(streamingInstruments);
        const ticksInstruments = JSON.stringify(
            Object.keys(QuotesService.quotes));

        if (accountInstruments !== ticksInstruments) {
            streamingInstruments.forEach(instr => {
                let temp;

                if (JSON.stringify(QuotesService.quotes[instr]) !== "{}") {
                    temp = QuotesService.quotes[instr];
                    QuotesService.quotes[instr] = {};
                    QuotesService.quotes[instr] = temp;
                }
            });
        }
    }

    static reset() {
        let key;

        for (key in QuotesService.quotes) {
            if (QuotesService.quotes.hasOwnProperty(key)) {
                delete QuotesService.quotes[key];
            }
        }
    }
}

QuotesService.quotes = null;

class StreamingService {
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

                    QuotesService.updateTick(tick);

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

class TokenDialogController {
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

            StreamingService.startStream({
                environment: tokenInfo.environment,
                accessToken: tokenInfo.token,
                accountId: tokenInfo.accountId,
                instruments
            });

            this.state.tokenModalIsOpen = false;
        }).catch(err => {
            ToastsService.addToast(err);
            this.state.tokenModalIsOpen = false;
        });
    }

}

class TokenDialogComponent {
    static bootstrap(state) {
        const render = hyperHTML.bind(Util.query("token-dialog"));

        this.tokenDialogController = new TokenDialogController(render, TokenDialogTemplate, state);
    }
}

// import { AccountsService } from "../account/accounts.service";
// import { SessionService } from "../session/session.service";
// import { QuotesService } from "../quotes/quotes.service";
// import { StreamingService } from "../streaming/streaming.service";
// import { ToastsService } from "../toasts/toasts.service";

class HeaderController {
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
            spinner: {
                isLoadingView: false
            },
            tokenModalIsOpen: false,
            tokenInfo: {
                environment: "practice",
                token: "",
                accountId: ""
            },
            accounts: [],
            instrs
        }, state => template.update(render, state, events));

        Util.spinnerState = this.state.spinner;

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

class HeaderComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("header"));

        this.HeaderController = new HeaderController(render, HeaderTemplate);
    }
}

HeaderComponent.bootstrap();

class QuotesTemplate {
    static update(render, state) {
        if (!Object.keys(state.quotes).length) {
            Util.renderEmpty(render);
            return;
        }

        /* eslint indent: off */
        render`
            <div class="h5 overflow-auto">

                <table class="collapse f6 w-100 mw8 center">
                    <tbody>${
                        Object.keys(state.quotes).map(instrument => {
                            const quote = state.quotes[instrument];

                            return hyperHTML.wire(quote, ":tr")`<tr>
                                <td class="pv1 pr1 bb b--black-20"> ${instrument} </td>
                                <td class="pv1 pr1 bb b--black-20 tr"> ${quote.bid} </td>
                                <td class="pv1 pr1 bb b--black-20 tr"> ${quote.ask} </td>
                                <td class="pv1 pr1 bb b--black-20 tr"> ${quote.spread} </td>
                            </tr>`;
                    })}</tbody>
                </table>
            </div>
        `;
    }
}

// <td class="pv1 pr1 bb b--black-20">
//     <sl-chart class="mw3" instrument="instrument" data="quote" length="100"></sl-chart>
// </td>

class QuotesController {
    constructor(render, template) {

        this.state = Introspected({
            quotes: {}
        }, state => template.update(render, state));

        this.quotesService = new QuotesService(this.state.quotes);
    }
}

class QuotesComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("quotes"));

        this.quotesController = new QuotesController(render, QuotesTemplate);
    }
}

QuotesComponent.bootstrap();

class ToastsTemplate {
    static update(render, state) {
        if (!state.toasts.length) {
            Util.renderEmpty(render);
            return;
        }

        /* eslint indent: off */
        render`
            <table class="f6 ba" cellspacing="0">
                <tbody>${
                    state.toasts.map(toast => `<tr>
                        <td class="b--black-20 pr2"> ${Util.getHHMMSSfromDate(toast.date)} </td>
                        <td class="b--black-20 pl2"> ${toast.message} </td>
                    </tr>`
                )}</tbody>
            </table>
        `;
    }
}

class ToastsController {
    constructor(render, template) {

        this.state = Introspected({
            toasts: []
        }, state => template.update(render, state));

        this.ToastsService = new ToastsService(this.state.toasts);
    }
}

class ToastsComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("toasts"));

        this.toastsController = new ToastsController(render, ToastsTemplate);
    }
}

ToastsComponent.bootstrap();

// import { activity } from "./activity/activity.module";
// import { charts } from "./charts/charts.module";
// import { exposure } from "./exposure/exposure.module";
// import { highlighter } from "./highlighter/highlighter.module";
// import { news } from "./news/news.module";
// import { ohlcChart } from "./ohlc-chart/ohlc-chart.module";
// import { orderDialog } from "./order-dialog/order-dialog.module";
// import { orders } from "./orders/orders.module";
// import { plugins } from "./plugins/plugins.module";
// import { positions } from "./positions/positions.module";
// import { settingsDialog } from "./settings-dialog/settings-dialog.module";
// import { slChart } from "./sl-chart/sl-chart.module";
// import { trades } from "./trades/trades.module";
// import { yesnoDialog } from "./yesno-dialog/yesno-dialog.module";

}(hyperHTML,Introspected));
