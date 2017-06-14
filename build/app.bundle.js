(function (hyperHTML,Introspected) {
'use strict';

hyperHTML = hyperHTML && 'default' in hyperHTML ? hyperHTML['default'] : hyperHTML;
Introspected = Introspected && 'default' in Introspected ? Introspected['default'] : Introspected;

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

    static formatDate(date) {
        if (!date) {
            return "";
        }

        if (typeof date === "string") {
            date = new Date(date);
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    static formatNumber(num, decimals = 0) {
        if (!num.toString()) {
            return "";
        }

        return parseFloat(num).toFixed(decimals);
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
        const isExposureTab = state.tabSelectedIndex === 3;
        const isActivityTab = state.tabSelectedIndex === 4;
        const isNewsTab = state.tabSelectedIndex === 5;
        const isPluginsTab = state.tabSelectedIndex === 6;

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
                <a class="${isExposureTab ? selectedTabClasses : tabClasses}"
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
                    <div class="ma2 pa2">
                        <trades style="${Util.show(isTradesTab)}"></trades>
                        <orders style="${Util.show(isOrdersTab)}"></orders>
                        <positions style="${Util.show(isPositionsTab)}"></positions>
                        <exposure style="${Util.show(isExposureTab)}"></exposure>
                        <activity style="${Util.show(isActivityTab)}"></activity>
                        <news style="${Util.show(isNewsTab)}"></news>
                        <plugins style="${Util.show(isPluginsTab)}"></plugins>
                    </div>
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
        const timestamp = Util.formatDate(new Date(state.account.timestamp));
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

class ActivityTemplate {
    static update(render, state) {
        if (state.activities.length) {
            ActivityTemplate.renderActivity(render, state);
        } else {
            ActivityTemplate.renderNoActivity(render);
        }
    }

    static renderActivity(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Ticket</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Price</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Profit</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Balance</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Date/Time</th>
                    </thead>

                    <tbody>${
                        state.activities.map(activity => {
                            const classes = "pv1 pr1 bb b--black-20 tr";
                            const highlight = classes +
                                (activity.pl >= 0 ? " highlight-green" : " highlight-red");

                            return hyperHTML.wire(activity, ":tr")`<tr>
                                <td class="${classes}"> ${activity.id} </td>
                                <td class="${classes}"> ${activity.type} </td>
                                <td class="${classes}"> ${activity.instrument} </td>
                                <td class="${classes}"> ${Util.formatNumber(activity.units)} </td>
                                <td class="${classes}"> ${activity.price} </td>
                                <td class="${highlight}"> ${Util.formatNumber(activity.pl, 4)} </td>
                                <td class="${classes}"> ${Util.formatNumber(activity.accountBalance, 2)} </td>
                                <td class="${classes}"> ${Util.formatDate(activity.time)} </td>
                            </tr>`;
                    })}</tbody>
                </table>
            </div>
        `;
    }

    static renderNoActivity(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No activities.</p>
            </div>
        `;
    }
}

class ActivityService {
    constructor(activities) {
        if (!ActivityService.activities) {
            ActivityService.activities = activities;
        }
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        const account = AccountsService.getAccount(),
            lastTransactionID = account.lastTransactionID;

        Util.fetch("/api/transactions", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                lastTransactionID
            })
        }).then(res => res.json()).then(data => {
            ActivityService.activities.length = 0;
            data.reverse().forEach(activity => {
                ActivityService.activities.push(activity);
            });
        }).catch(err => err.data);
    }

    static addActivity(activity) {
        ActivityService.activities.splice(0, 0, {
            id: activity.id,
            type: activity.type,
            instrument: activity.instrument,
            units: activity.units,
            price: activity.price,
            pl: activity.pl,
            accountBalance: activity.accountBalance,
            time: activity.time
        });
    }
}

ActivityService.activities = null;

class ActivityController {
    constructor(render, template) {

        this.state = Introspected({
            activities: []
        }, state => template.update(render, state));

        this.activityService = new ActivityService(this.state.activities);
    }
}

class ActivityComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("activity"));

        this.activityController = new ActivityController(render, ActivityTemplate);
    }
}

ActivityComponent.bootstrap();

class ChartsTemplate {
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

class ChartsService {
    constructor(candles) {
        if (!ChartsService.candles) {
            ChartsService.candles = candles;
        }
    }

    static getHistQuotes({
        instrument = "EUR_USD",
        granularity = "M5",
        count = 251,
        dailyAlignment = "0"
    } = {}) {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/candles", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                instrument,
                granularity,
                count,
                dailyAlignment
            })
        }).then(res => res.text()).then(data => {
            ChartsService.candles = data;
        }).catch(err => {
            ToastsService.addToast(err.data);
        });
    }
}

ChartsService.candles = null;

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
            instrument = tick.instrument,
            lenStreamingInstruments = Object.keys(streamingInstruments).length,
            lenQuotesInstruments = Object.keys(QuotesService.quotes).length;

        if (lenStreamingInstruments !== lenQuotesInstruments) {
            streamingInstruments.forEach(instr => {
                QuotesService.quotes[instr].instrument = instr;
            });
        }

        QuotesService.quotes[instrument].time = tick.time;
        QuotesService.quotes[instrument].ask = tick.ask;
        QuotesService.quotes[instrument].bid = tick.bid;
        QuotesService.quotes[instrument].spread =
            ((tick.ask - tick.bid) / pips[instrument]).toFixed(1);
    }

    static reset() {
        for (const instr in QuotesService.quotes) {
            if (QuotesService.quotes[instr].instrument === instr) {
                delete QuotesService.quotes[instr];
            }
        }
    }
}

QuotesService.quotes = null;

class TradesService {
    constructor(trades) {
        if (!TradesService.trades) {
            TradesService.trades = trades;
        }
    }

    static getTrades() {
        return TradesService.trades;
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/trades", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            })
        }).then(res => res.json()).then(data => {
            TradesService.trades.length = 0;
            TradesService.trades.forEach(trade => {
                TradesService.trades.push(data);
                trade.side = trade.currentUnits > 0 ? "buy" : "sell";
            });
        });
    }

    // closeTrade(id) {
    //     return this.SessionService.isLogged().then(
    //         credentials => this.$http.post("/api/closetrade", {
    //             environment: credentials.environment,
    //             token: credentials.token,
    //             accountId: credentials.accountId,
    //             id
    //         }).then(order => order.data)
    //             .catch(err => err.data)
    //     );
    // }

    static updateTrades(tick) {
        const account = AccountsService.getAccount(),
            pips = account.pips;

        TradesService.trades.forEach((trade, index) => {
            let current,
                side;

            if (trade.instrument === tick.instrument) {
                side = trade.currentUnits > 0 ? "buy" : "sell";

                if (side === "buy") {
                    current = tick.bid;
                    TradesService.trades[index].profitPips =
                        ((current - trade.price) / pips[trade.instrument]);
                }
                if (side === "sell") {
                    current = tick.ask;
                    TradesService.trades[index].profitPips =
                        ((trade.price - current) / pips[trade.instrument]);
                }

                TradesService.trades[index].current = current;
            }
        });
    }
}

TradesService.trades = null;

class ChartsController {
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

class ChartsComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("charts"));

        this.chartsController = new ChartsController(render, ChartsTemplate);
    }
}

class ExposureTemplate {
    static update(render, state) {
        if (state.exposure.length) {
            ExposureTemplate.renderExposure(render, state);
        } else {
            ExposureTemplate.renderNoExposure(render);
        }
    }

    static renderExposure(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="exposure in $ctrl.exposures">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ exposure.type }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ exposure.market }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ exposure.units | number:0 }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoExposure(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No exposures.</p>
            </div>
        `;
    }
}

class ExposureService {
    constructor(exposure) {
        if (!ExposureService.exposure) {
            ExposureService.exposure = exposure;
        }
    }

    static getExposure() {
        return ExposureService.exposure;
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        const trades = TradesService.getTrades(),
            exps = {};

        trades.forEach(trade => {
            const legs = trade.instrument.split("_");

            exps[legs[0]] = exps[legs[0]] || 0;
            exps[legs[1]] = exps[legs[1]] || 0;

            exps[legs[0]] += parseInt(trade.currentUnits, 10);
            exps[legs[1]] -= trade.currentUnits * trade.price;
        });

        Object.keys(exps).forEach(exp => {
            const type = exps[exp] > 0;

            ExposureService.exposure.push({
                type: type ? "Long" : "Short",
                market: exp,
                units: Math.abs(exps[exp])
            });
        });

    }

}

ExposureService.exposure = null;

class ExposureController {
    constructor(render, template) {

        this.state = Introspected({
            exposure: []
        }, state => template.update(render, state));

        this.exposureService = new ExposureService(this.state.exposure);
    }
}

class ExposureComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("exposure"));

        this.exposureController = new ExposureController(render, ExposureTemplate);
    }
}

ExposureComponent.bootstrap();

class HeaderTemplate {
    static update(render, state, events) {
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

                        <a id="openSettings" class="pointer f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4"
                            style="${Util.show(state.tokenInfo.accountId)}"
                            onclick="${events}">
                                Settings
                        </a>
                        <a class="pointer f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4"
                            onclick="${() => {
                                state.tokenModalIsOpen = true;
                            }}">
                                Token
                        </a>
                </div>

                <div class="flex flex-row items-center min-w-5">
                    <span class="${Util.spinnerState.isLoadingView ? "spinner" : ""}"></span>
                </div>

            </nav>

            <token-dialog></token-dialog>
            <settings-dialog></settings-dialog>
        `;
    }
}

class SettingsDialogTemplate {
    static update(render, state, events) {
        if (!state.settingsModalIsOpen) {
            Util.renderEmpty(render);
            return;
        }

        SettingsDialogTemplate.renderSettingsModal(render, state, events);
    }

    static renderSettingsModal(render, state, events) {
        /* eslint indent: off */
        render`
            <div class="fixed absolute--fill bg-black-70 z5">
            <div class="fixed absolute-center z999">

            <main class="pa4 black-80 bg-white h5 overflow-y-auto">
                <form class="measure center">
                    <fieldset id="login" class="ba b--transparent ph0 mh0">
                        <legend class="f4 fw6 ph0 mh0 center">Settings Dialog</legend>${
                            Object.keys(state.instrs).map(instrument => {
                                const value = !!state.instrs[instrument];

                                return hyperHTML.wire()`<span class="flex flex-row justify-center justify-around code">
                                        <input id="toggleInstrumentSettings" type="checkbox"
                                            onchange="${e => {
                                                state.instrs[instrument] = e.target.checked;
                                            }}"
                                            checked="${value}"> ${instrument}
                                        </input>
                                    </span>
                                `;
                            })
                    }</fieldset>
                </form>

                <div class="flex flex-row justify-center justify-around">
                    <input class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                        type="submit" value="Cancel"
                        onclick="${() => {
                            state.settingsModalIsOpen = false;
                        }}">

                    <input id="settingsOk" class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                        type="submit" value="Ok"
                        onclick="${events}">
                </div>
            </main>

            </div>
            </div>
        `;
    }

}

class OrdersService {
    constructor(orders) {
        if (!OrdersService.orders) {
            OrdersService.orders = orders;
        }
    }


    static getOrders() {
        return OrdersService.orders;
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/orders", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            })
        }).then(res => res.json()).then(data => {
            OrdersService.orders = data;
        });
    }

    static putOrder(order) {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/order", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                instrument: order.instrument,
                units: order.units,
                side: order.side,
                type: order.type,
                expiry: order.expiry,
                price: order.price,
                priceBound: order.lowerBound || order.upperBound,
                stopLossOnFill: order.stopLossOnFill,
                takeProfitOnFill: order.takeProfitOnFill,
                trailingStopLossOnFill: order.trailingStopLossOnFill
            })
        }).then(res => res.json()).then(data => data)
            .catch(err => err.data);
    }

    // closeOrder(id) {
    //     return this.SessionService.isLogged().then(
    //         credentials => this.$http.post("/api/closeorder", {
    //             environment: credentials.environment,
    //             token: credentials.token,
    //             accountId: credentials.accountId,
    //             id
    //         }).then(order => order.data)
    //             .catch(err => err.data)
    //     );
    // }

    static updateOrders(tick) {
        const account = AccountsService.getAccount(),
            pips = account.pips;

        OrdersService.orders.forEach((order, index) => {
            let current;

            if (order.instrument === tick.instrument) {

                if (order.units > 0) {
                    current = tick.ask;
                }
                if (order.units < 0) {
                    current = tick.bid;
                }

                OrdersService.orders[index].current = current;
                OrdersService.orders[index].distance = (Math.abs(current - order.price) /
                    pips[order.instrument]);
            }
        });
    }
}

OrdersService.orders = null;

class PluginsService {
    constructor(pluginsState) {
        if (!PluginsService.plugins) {
            PluginsService.plugins = pluginsState.plugins;
            PluginsService.pluginsInfo = pluginsState.pluginsInfo;
        }
    }

    static getPlugins() {
        return PluginsService.plugins;
    }

    static getPluginsInfo() {
        return PluginsService.pluginsInfo;
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/plugins", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            })
        }).then(res => res.json()).then(data => {
            let name;

            for (name in PluginsService.plugins) {
                if (PluginsService.plugins.hasOwnProperty(name)) {
                    delete PluginsService.plugins[name];
                }
            }
            PluginsService.plugins = data;
            PluginsService.pluginsInfo.count = Object.keys(
                PluginsService.plugins).length;

            Object.keys(PluginsService.plugins).forEach(key => {
                if (PluginsService.plugins[key] === "enabled") {
                    PluginsService.plugins[key] = true;
                } else {
                    PluginsService.plugins[key] = false;
                }
            });
        });
    }

    static engagePlugins(plugs) {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        const account = AccountsService.getAccount();

        Util.fetch("/api/engageplugins", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                plugins: plugs,
                config: {
                    pips: account.pips
                }
            })
        });
    }
}

PluginsService.plugins = null;
PluginsService.pluginsInfo = null;

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

                    TradesService.updateTrades(tick);
                    OrdersService.updateOrders(tick);
                }

                if (isTransaction) {
                    transaction = data;

                    ActivityService.addActivity(transaction);

                    TradesService.refresh();
                    OrdersService.refresh();
                    AccountsService.refresh();
                }

                if (refreshPlugins) {
                    PluginsService.refresh();
                }
            } catch (e) {

                // Discard "incomplete" json
                // console.log(e.name + ": " + e.message);
            }
        };
    }
}

class SettingsDialogController {
    constructor(render, template, bindings) {
        const events = (e, payload) => Util.handleEvent(this, e, payload);

        this.state = Introspected.observe(bindings,
            state => template.update(render, state, events));
    }

    onSettingsOkClick() {
        const credentials = SessionService.isLogged();

        this.state.settingsModalIsOpen = false;

        if (!credentials) {
            return;
        }

        window.localStorage.setItem("argo.instruments", JSON.stringify(this.state.instrs));

        const instruments = AccountsService.setStreamingInstruments(this.state.instrs);

        // QuotesService.reset();

        StreamingService.startStream({
            environment: credentials.environment,
            accessToken: credentials.token,
            accountId: credentials.accountId,
            instruments
        });
    }
}

class SettingsDialogComponent {
    static bootstrap(state) {
        const render = hyperHTML.bind(Util.query("settings-dialog"));

        this.settingsDialogController = new SettingsDialogController(render, SettingsDialogTemplate, state);
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

            ActivityService.refresh();

            ChartsComponent.bootstrap();

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
            settingsModalIsOpen: false,
            accounts: [],
            instrs
        }, state => template.update(render, state, events));

        Util.spinnerState = this.state.spinner;

        TokenDialogComponent.bootstrap(this.state);
        SettingsDialogComponent.bootstrap(this.state);
    }

    onOpenSettingsClick() {
        const allInstrs = AccountsService.getAccount().instruments;

        allInstrs.forEach(instrument => {
            if (!this.state.instrs[instrument.name].toString()) {
                this.state.instrs[instrument.name] = false;
            }
        });

        this.state.settingsModalIsOpen = true;
    }
}

class HeaderComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("header"));

        this.HeaderController = new HeaderController(render, HeaderTemplate);
    }
}

HeaderComponent.bootstrap();

class NewsTemplate {
    static update(render, state) {
        if (state.news.length) {
            NewsTemplate.renderNews(render, state);
        } else {
            NewsTemplate.renderNoNews(render);
        }
    }

    static renderNews(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No news.</p>

                <table ng-show="$ctrl.news.length" class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Date/Time</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Event</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Previous</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Forecast</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Actual</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Unit</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="news in $ctrl.news">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.timestamp | date:"MMM d, HH:mm" }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.currency }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.title }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.previous | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.forecast | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.actual | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ news.unit }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoNews(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No news.</p>
            </div>
        `;
    }
}

class NewsService {
    constructor(news) {
        if (!NewsService.news) {
            NewsService.news = news;
        }
    }

    static getNews() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/calendar", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token
            })
        }).then(res => res.json()).then(data => data.map(item => {
            item.timestamp = item.timestamp * 1000;

            return item;
        })).catch(err => err.data);
    }
}

NewsService.news = null;

class NewsController {
    constructor(render, template) {

        this.state = Introspected({
            news: []
        }, state => template.update(render, state));

        this.newsService = new NewsService(this.state.news);
    }
}

class NewsComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("news"));

        this.newsController = new NewsController(render, NewsTemplate);
    }
}

NewsComponent.bootstrap();

class OrdersTemplate {
    static update(render, state) {
        if (state.orders.length) {
            OrdersTemplate.renderOrders(render, state);
        } else {
            OrdersTemplate.renderNoOrders(render);
        }
    }

    static renderOrders(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Ticket</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">S/L</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">T/P</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">T/S</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Price</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Current</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Distance</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Expiry</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="order in $ctrl.orders">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.side || order.type }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">
                                <a href ng-click="$ctrl.closeOrder(order.id)">{{ order.id }}</a>
                            </td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.instrument }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.units | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.stopLossOnFill.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.takeProfitOnFill.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.trailingStopLossOnFill.distance || order.trailingStopValue }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.price | number:4 }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.current | number:4 }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.distance | number:1 }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ order.expiry | date:"MMM d, HH:mm" }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <yesno-dialog open-modal="$ctrl.openCloseOrderModal"
                close-modal="$ctrl.closeOrderDialog(answer)"
                text="Are you sure to close the order?">
            </yesno-dialog>

        `;
    }

    static renderNoOrders(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No orders.</p>
            </div>
        `;
    }
}

// import { ToastsService } from "../toasts/toasts.service";
class OrdersController {
    constructor(render, template) {

        this.state = Introspected({
            orders: []
        }, state => template.update(render, state));

        this.ordersService = new OrdersService(this.state.orders);

        OrdersService.refresh();
    }

    // closeOrder(orderId) {
    //     this.openCloseOrderModal = true;
    //     this.closingOrderId = orderId;
    // }

    // closeOrderDialog(answer) {
    //     this.openCloseOrderModal = false;

    //     if (!answer) {
    //         return;
    //     }

    //     this.OrdersService.closeOrder(this.closingOrderId).then(order => {
    //         let message = `Closed #${order.orderCancelTransaction.orderID}`;

    //         if (order.errorMessage || order.message) {
    //             message = `ERROR ${order.errorMessage || order.message}`;
    //         }

    //         ToastsService.addToast(message);
    //     }).catch(err => {
    //         const message = `ERROR ${err.code} ${err.message}`;

    //         ToastsService.addToast(message);
    //     });
    // }
}

class OrdersComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("orders"));

        this.ordersController = new OrdersController(render, OrdersTemplate);
    }
}

OrdersComponent.bootstrap();

class PluginsTemplate {
    static update(render, state) {
        if (state.plugins.length) {
            PluginsTemplate.renderPlugins(render, state);
        } else {
            PluginsTemplate.renderNoPlugins(render);
        }
    }

    static renderPlugins(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Enabled</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white">Plugin</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="(plugin, value) in $ctrl.plugins">
                            <td class="pv1 pr1 bb b--black-20 tr">
                                <input type="checkbox" ng-model="$ctrl.plugins[plugin]" ng-change="$ctrl.engage()">
                            </td>
                            <td class="pv1 pr1 bb b--black-20">{{ plugin }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoPlugins(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No plugins.</p>
            </div>
        `;
    }
}

class PluginsController {
    constructor(render, template) {

        this.state = Introspected({
            plugins: [],
            pluginsInfo: {
                count: 0
            }
        }, state => template.update(render, state));

        this.pluginService = new PluginsService(this.state);

        PluginsService.refresh();
    }

    engage() {
        PluginsService.engagePlugins(this.state.plugins);
    }
}
PluginsController.$inject = ["PluginsService"];

class PluginsComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("plugins"));

        this.pluginsController = new PluginsController(render, PluginsTemplate);
    }
}

PluginsComponent.bootstrap();

class PositionsTemplate {
    static update(render, state) {
        if (state.positions.length) {
            PositionsTemplate.renderPositions(render, state);
        } else {
            PositionsTemplate.renderNoPositions(render);
        }
    }

    static renderPositions(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Avg. Price</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="position in $ctrl.positions">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.side }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.instrument }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.units | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.avgPrice }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoPositions(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No positions.</p>
            </div>
        `;
    }
}

class PositionsService {
    constructor(positions) {
        if (!PositionsService.positions) {
            PositionsService.positions = positions;
        }
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/positions", {
            methhod: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            })
        }).then(res => res.json()).then(positions => {
            PositionsService.positions.length = 0;

            positions.forEach(position => {
                const longUnits = position.long &&
                    parseInt(position.long.units, 10);
                const shortUnits = position.short &&
                    parseInt(position.short.units, 10);
                const units = longUnits || shortUnits;
                const side = units > 0 ? "buy" : "sell";
                const avgPrice = (longUnits && position.long.averagePrice) ||
                    (shortUnits && position.short.averagePrice);

                PositionsService.positions.push({
                    side,
                    instrument: position.instrument,
                    units,
                    avgPrice
                });
            });
        }).catch(err => err.data);
    }
}

PositionsService.positions = null;

class PositionsController {
    constructor(render, template) {

        this.state = Introspected({
            positions: []
        }, state => template.update(render, state));

        this.positionsService = new PositionsService(this.state.orders);
    }
}

class PositionsComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("positions"));

        this.positionsController = new PositionsController(render, PositionsTemplate);
    }
}

PositionsComponent.bootstrap();

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
                                <td class="${QuotesTemplate.highlighter(quote.bid, instrument, "bid")}"> ${quote.bid} </td>
                                <td class="${QuotesTemplate.highlighter(quote.ask, instrument, "ask")}"> ${quote.ask} </td>
                                <td class="${QuotesTemplate.highlighter(quote.spread, instrument, "spread")}"> ${quote.spread} </td>
                            </tr>`;
                    })}</tbody>
                </table>
           </div>
        `;
    }

    static highlighter(value, instrument, type) {
        const classes = "pv1 pr1 bb b--black-20 tr";
        const quoteClasses = `${instrument}-${type} ${classes}`;
        const greenClass = "highlight-green";
        const redClass = "highlight-red";

        if (!QuotesTemplate.cache[instrument]) {
            QuotesTemplate.cache[instrument] = {};
        }

        if (!QuotesTemplate.cache[instrument][type]) {
            QuotesTemplate.cache[instrument][type] = {};
        }

        const cache = QuotesTemplate.cache[instrument][type];
        const oldValue = cache.value;

        const highlight = value >= oldValue
            ? `${quoteClasses} ${greenClass}`
            : `${quoteClasses} ${redClass}`;

        cache.value = value;

        clearTimeout(cache.timeout);
        cache.timeout = setTimeout(() => {
            const el = document.querySelector(`.${instrument}-${type}`);

            el.classList.remove(greenClass);
            el.classList.remove(redClass);
        }, 500);

        return highlight;
    }
}

QuotesTemplate.cache = {};

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

class TradesTemplate {
    static update(render, state) {
        if (state.trades.length) {
            TradesTemplate.renderTrades(render, state);
        } else {
            TradesTemplate.renderNoTrades(render);
        }
    }

    static renderTrades(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Ticket</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">S/L</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">T/P</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">T/S</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Price</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Current</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Profit (PIPS)</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="trade in $ctrl.trades">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.side }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">
                                <a href ng-click="$ctrl.closeTrade(trade.id)">{{ trade.id }}</a>
                            </td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.instrument }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.currentUnits | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.stopLossOrder.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.takeProfitOrder.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.trailingStopLossOrder.distance }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.price }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ trade.current }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr"
                                ng-class="trade.profitPips >= 0 ? 'green' : 'red'">
                                {{ trade.profitPips | number:1}}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <yesno-dialog open-modal="$ctrl.openCloseTradeModal"
                close-modal="$ctrl.closeTradeDialog(answer)"
                text="Are you sure to close the trade?">
            </yesno-dialog>
        `;
    }

    static renderNoTrades(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p ng-hide="$ctrl.trades.length" class="f6 w-100 mw8 tc b">No trades.</p>
            </div>
        `;
    }
}

// import { ToastsService } from "../toasts/toasts.service";
class TradesController {
    constructor(render, template) {

        this.state = Introspected({
            trades: []
        }, state => template.update(render, state));

        this.tradesService = new TradesService(this.state.trades);

        TradesService.refresh();
    }

    // closeTrade(tradeId) {
    //     this.openCloseTradeModal = true;
    //     this.closingTradeId = tradeId;
    // }

    // closeTradeDialog(answer) {
    //     this.openCloseTradeModal = false;

    //     if (!answer) {
    //         return;
    //     }

    //     this.TradesService.closeTrade(this.closingTradeId).then(trade => {
    //         let message = "Closed " +
    //                 `${(trade.units > 0 ? "sell" : "buy")} ` +
    //                 `${trade.instrument} ` +
    //                 `#${trade.id} ` +
    //                 `@${trade.price} ` +
    //                 `P&L ${trade.pl}`;

    //         if (trade.errorMessage || trade.message) {
    //             message = `ERROR ${trade.errorMessage || trade.message}`;
    //         }


    //         ToastsService.addToast(message);
    //     }).catch(err => {
    //         const message = `ERROR ${err.code} ${err.message}`;

    //         ToastsService.addToast(message);
    //     });
    // }
}

class TradesComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("trades"));

        this.tradesController = new TradesController(render, TradesTemplate);
    }
}

TradesComponent.bootstrap();

// import { ohlcChart } from "./ohlc-chart/ohlc-chart.module";
// import { orderDialog } from "./order-dialog/order-dialog.module";
// import { slChart } from "./sl-chart/sl-chart.module";
// import { yesnoDialog } from "./yesno-dialog/yesno-dialog.module";

}(hyperHTML,Introspected));
