(function (exports,angular,hyperHTML,Introspected,d3,techan) {
'use strict';

angular = 'default' in angular ? angular['default'] : angular;
hyperHTML = 'default' in hyperHTML ? hyperHTML['default'] : hyperHTML;
Introspected = 'default' in Introspected ? Introspected['default'] : Introspected;
techan = 'default' in techan ? techan['default'] : techan;

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

        Util.isLoadingView = true;
        fetchCall.then(() => {
            Util.isLoadingView = false;
        }).catch(() => {
            Util.isLoadingView = false;
        });

        return fetchCall;
    }

    static show(condition) {
        return condition ? "display: block;" : "display: none;";
    }
}

Util.isLoadingView = false;

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

function appConfig($httpProvider, $locationProvider) {
    const interceptors = $httpProvider.interceptors;

    interceptors.push(["$q", "$rootScope", ($q, $rootScope) => {
        let nLoadings = 0;

        return {
            request(request) {
                nLoadings += 1;

                $rootScope.isLoadingView = true;

                return request;
            },

            response(response) {
                nLoadings -= 1;
                if (nLoadings === 0) {
                    $rootScope.isLoadingView = false;
                }

                return response;
            },

            responseError(response) {
                nLoadings -= 1;
                if (!nLoadings) {
                    $rootScope.isLoadingView = false;
                }

                return $q.reject(response);
            }
        };
    }]);

    $locationProvider.html5Mode(true);
}
appConfig.$inject = ["$httpProvider", "$locationProvider"];

const app = angular
    .module("common.app", [])
    .config(appConfig)
    .name;

const common = angular
    .module("common", [
        app
    ])
    .name;

class ActivityController {
    constructor(ActivityService) {
        this.ActivityService = ActivityService;
    }

    $onInit() {
        this.ActivityService.getActivities().then(activities => {
            this.activities = activities;
        });
    }
}
ActivityController.$inject = ["ActivityService"];

const activityComponent = {
    templateUrl: "app/components/activity/activity.html",
    controller: ActivityController
};

class ActivityService {
    constructor($http, SessionService, AccountsService) {
        this.$http = $http;
        this.SessionService = SessionService;
        this.AccountsService = AccountsService;

        this.activities = [];
    }

    getActivities() {
        const account = this.AccountsService.getAccount(),
            lastTransactionID = account.lastTransactionID;

        return this.SessionService.isLogged().then(
            credentials => this.$http.post("/api/transactions", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                lastTransactionID
            }).then(transactions => {
                this.activities = transactions.data.reverse();

                return this.activities;
            }).catch(err => err.data)
        );
    }

    addActivity(activity) {
        this.activities.splice(0, 0, {
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
ActivityService.$inject = ["$http", "SessionService", "AccountsService"];

const activity = angular
    .module("components.activity", [])
    .component("activity", activityComponent)
    .service("ActivityService", ActivityService)
    .name;

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

class ChartsController {
    constructor(AccountsService, ChartsService,
        QuotesService, TradesService) {

        this.AccountsService = AccountsService;
        this.ChartsService = ChartsService;
        this.QuotesService = QuotesService;
        this.TradesService = TradesService;
    }

    $onInit() {
        this.account = this.AccountsService.getAccount();

        this.selectedInstrument = "EUR_USD";

        this.granularities = [
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
        ];
        this.selectedGranularity = "M5";

        this.feed = this.QuotesService.getQuotes();

        this.trades = this.TradesService.getTrades();

        this.changeChart(this.selectedInstrument, this.selectedGranularity);

        this.orderParams = {
            side: "buy",
            selectedInstrument: this.selectedInstrument,
            instruments: this.account.streamingInstruments
        };
    }

    changeChart(instrument, granularity) {
        this.ChartsService.getHistQuotes({
            instrument,
            granularity
        }).then(candles => {
            this.data = candles;
        }).catch(err => {
            ToastsService.addToast(err);
        });
    }


    openOrderDialog(side) {
        angular.extend(this.orderParams, {
            side,
            selectedInstrument: this.selectedInstrument,
            instruments: this.account.streamingInstruments
        });

        this.openOrderModal = true;
    }
}
ChartsController.$inject = [
    "AccountsService", "ChartsService",
    "QuotesService", "TradesService"
];

const chartsComponent = {
    templateUrl: "app/components/charts/charts.html",
    controller: ChartsController
};

class ChartsService {
    constructor($http, SessionService) {
        this.$http = $http;
        this.SessionService = SessionService;
    }

    getHistQuotes({
        instrument = "EUR_USD",
        granularity = "M5",
        count = 251,
        dailyAlignment = "0"
    } = {}) {
        return this.SessionService.isLogged().then(credentials =>
            this.$http.post("/api/candles", {
                environment: credentials.environment,
                token: credentials.token,
                instrument,
                granularity,
                count,
                dailyAlignment
            }).then(candles => candles.data)
                .catch(err => err.data)
        );
    }
}
ChartsService.$inject = ["$http", "SessionService"];

const charts = angular
    .module("components.charts", [])
    .component("charts", chartsComponent)
    .service("ChartsService", ChartsService)
    .name;

class ExposureController {
    constructor(TradesService) {
        this.TradesService = TradesService;
    }

    $onInit() {
        this.exposures = [];

        const trades = this.TradesService.getTrades(),
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

            this.exposures.push({
                type: type ? "Long" : "Short",
                market: exp,
                units: Math.abs(exps[exp])
            });
        });
    }
}
ExposureController.$inject = ["TradesService"];

const exposureComponent = {
    templateUrl: "app/components/exposure/exposure.html",
    controller: ExposureController
};

const exposure = angular
    .module("components.exposure", [])
    .component("exposure", exposureComponent)
    .name;

function highlighterDirective($timeout) {
    const directive = {
        restrict: "A",
        link
    };

    return directive;

    function link(scope, element, attrs) {
        scope.$watch(attrs.highlighter, (newValue, oldValue) => {
            let newclass;

            if (newValue !== oldValue) {
                newclass = newValue < oldValue
                    ? "highlight-red" : "highlight-green";

                element.addClass(newclass);

                $timeout(() => {
                    element.removeClass(newclass);
                }, 500);
            }
        });
    }
}
highlighterDirective.$inject = ["$timeout"];

const highlighter = angular
    .module("components.highlighter", [])
    .directive("highlighter", highlighterDirective)
    .name;

class NewsController {
    constructor(NewsService) {
        this.NewsService = NewsService;
    }

    $onInit() {
        this.NewsService.getNews().then(news => {
            this.news = news;
        });
    }
}
NewsController.$inject = ["NewsService"];

const newsComponent = {
    templateUrl: "app/components/news/news.html",
    controller: NewsController
};

class NewsService {
    constructor($http, SessionService) {
        this.$http = $http;
        this.SessionService = SessionService;
    }

    getNews() {
        return this.SessionService.isLogged().then(
            credentials => this.$http.post("/api/calendar", {
                environment: credentials.environment,
                token: credentials.token
            }).then(news => news.data.map(item => {
                item.timestamp = item.timestamp * 1000;

                return item;
            })).catch(err => err.data)
        );
    }
}
NewsService.$inject = ["$http", "SessionService"];

const news = angular
    .module("components.news", [])
    .component("news", newsComponent)
    .service("NewsService", NewsService)
    .name;

function ohlcChartDirective() {
    const directive = {
        restrict: "E",
        scope: {
            instrument: "=",
            granularity: "=",
            data: "=",
            feed: "=",
            trades: "="
        },
        link
    };

    return directive;

    function link(scope, element) {
        let myInstrument,
            myGranularity,
            myTrades,
            data,
            refreshChart,
            lastHistUpdate,
            lastData,
            lastClose,
            feedVolume = 0;

        scope.$watch("data", csv => {
            if (csv && csv.length > 0) {
                myInstrument = scope.instrument;
                myGranularity = scope.granularity;

                refreshChart = drawChart(element[0], csv);

                lastData = data && data[data.length - 1];
                lastClose = lastData.close;
                feedVolume = lastData.volume;
                lastHistUpdate = getLastHistUpdate(myGranularity);
            }
        });

        scope.$watch("feed", feed => {
            const tick = feed[myInstrument],
                nextHistUpdate = getLastHistUpdate(myGranularity, tick);

            let midPrice;

            if (tick && data && lastHistUpdate !== nextHistUpdate) {
                data.shift();
                tick.bid = parseFloat(tick.bid);
                tick.ask = parseFloat(tick.ask);
                midPrice = (tick.bid + tick.ask) / 2;
                feedVolume = 0;
                data.push({
                    open: midPrice,
                    close: midPrice,
                    high: midPrice,
                    low: midPrice,
                    date: new Date(nextHistUpdate),
                    volume: feedVolume
                });

                lastHistUpdate = nextHistUpdate;
            }

            if (tick && data) {

                if (lastData.close !== lastClose) {
                    feedVolume += 1;
                }

                tick.bid = parseFloat(tick.bid);
                tick.ask = parseFloat(tick.ask);
                midPrice = (tick.bid + tick.ask) / 2;

                lastData = data && data[data.length - 1];
                lastClose = lastData.close;
                lastData.close = midPrice;
                lastData.volume = feedVolume;

                if (lastData.close > lastData.high) {
                    lastData.high = lastData.close;
                }

                if (lastData.close < lastData.low) {
                    lastData.low = lastData.close;
                }

                refreshChart();
            }

        }, true);

        function getLastHistUpdate(granularity, tick) {
            const time = tick && tick.time,
                now = time ? new Date(time) : new Date();

            let coeff;

            if (granularity === "S5") {
                coeff = 1000 * 5;
            } else if (granularity === "S10") {
                coeff = 1000 * 10;
            } else if (granularity === "S15") {
                coeff = 1000 * 15;
            } else if (granularity === "S30") {
                coeff = 1000 * 30;
            } else if (granularity === "M1") {
                coeff = 1000 * 60;
            } else if (granularity === "M2") {
                coeff = 1000 * 60 * 2;
            } else if (granularity === "M3") {
                coeff = 1000 * 60 * 3;
            } else if (granularity === "M4") {
                coeff = 1000 * 60 * 4;
            } else if (granularity === "M5") {
                coeff = 1000 * 60 * 5;
            } else if (granularity === "M10") {
                coeff = 1000 * 60 * 10;
            } else if (granularity === "M15") {
                coeff = 1000 * 60 * 15;
            } else if (granularity === "M30") {
                coeff = 1000 * 60 * 30;
            } else if (granularity === "H1") {
                coeff = 1000 * 60 * 60;
            } else if (granularity === "H2") {
                coeff = 1000 * 60 * 60 * 2;
            } else if (granularity === "H3") {
                coeff = 1000 * 60 * 60 * 3;
            } else if (granularity === "H4") {
                coeff = 1000 * 60 * 60 * 4;
            } else if (granularity === "H6") {
                coeff = 1000 * 60 * 60 * 6;
            } else if (granularity === "H8") {
                coeff = 1000 * 60 * 60 * 8;
            } else if (granularity === "H12") {
                coeff = 1000 * 60 * 60 * 12;
            } else {

                // for D / W / M
                coeff = 1000 * 60 * 60 * 12;
            }

            return Math.floor(now / (coeff)) * coeff;
        }

        function drawChart(el, csv) {
            const margin = {
                    top: 0,
                    right: 20,
                    bottom: 30,
                    left: 75
                },
                width = 960 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            const x = techan.scale.financetime()
                .range([0, width]);

            const y = d3.scaleLinear()
                .range([height, 0]);

            const yVolume = d3.scaleLinear()
                .range([y(0), y(0.2)]);

            const ohlc = techan.plot.ohlc()
                .xScale(x)
                .yScale(y);

            const tradearrow = techan.plot.tradearrow()
                .xScale(x)
                .yScale(y)
                .orient(d => {
                    const side = d.type.startsWith("buy") ? "up" : "down";

                    return side;
                });

            const sma0 = techan.plot.sma()
                .xScale(x)
                .yScale(y);

            const sma0Calculator = techan.indicator.sma()
                .period(10);

            const sma1 = techan.plot.sma()
                .xScale(x)
                .yScale(y);

            const sma1Calculator = techan.indicator.sma()
                .period(20);

            const volume = techan.plot.volume()
                .accessor(ohlc.accessor())
                .xScale(x)
                .yScale(yVolume);

            const xAxis = d3.axisBottom(x);

            const yAxis = d3.axisLeft(y);

            const volumeAxis = d3.axisRight(yVolume)
                .ticks(3)
                .tickFormat(d3.format(",.3s"));

            const timeAnnotation = techan.plot.axisannotation()
                .axis(xAxis)
                .orient("bottom")
                .format(d3.timeFormat("%Y-%m-%d %H:%M"))
                .width(80)
                .translate([0, height]);

            const ohlcAnnotation = techan.plot.axisannotation()
                .axis(yAxis)
                .orient("left")
                .format(d3.format(",.4f"));

            const volumeAnnotation = techan.plot.axisannotation()
                .axis(volumeAxis)
                .orient("right")
                .width(35);

            const crosshair = techan.plot.crosshair()
                .xScale(x)
                .yScale(y)
                .xAnnotation(timeAnnotation)
                .yAnnotation([ohlcAnnotation, volumeAnnotation]);

            d3.select(el).select("svg").remove();

            const svg = d3.select(el).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    `translate(${margin.left}, ${margin.top})`);

            const defs = svg.append("defs")
                .append("clipPath")
                .attr("id", "ohlcClip");

            defs.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height);

            const ohlcSelection = svg.append("g")
                .attr("class", "ohlc")
                .attr("transform", "translate(0,0)");

            ohlcSelection.append("g")
                .attr("class", "volume")
                .attr("clip-path", "url(#ohlcClip)");

            ohlcSelection.append("g")
                .attr("class", "candlestick")
                .attr("clip-path", "url(#ohlcClip)");

            ohlcSelection.append("g")
                .attr("class", "indicator sma ma-0")
                .attr("clip-path", "url(#ohlcClip)");

            ohlcSelection.append("g")
                .attr("class", "indicator sma ma-1")
                .attr("clip-path", "url(#ohlcClip)");

            ohlcSelection.append("g")
                .attr("class", "tradearrow");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${height})`);

            svg
                .append("g")
                .attr("class", "y axis")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("font-weight", "bold")
                .style("text-anchor", "end")
                .text(`Price (${myInstrument} / ${myGranularity})`);

            svg.append("g")
                .attr("class", "volume axis");

            svg.append("g")
                .attr("class", "crosshair ohlc");

            data = d3.csvParse(csv).map(
                d => {
                    const date = isNaN(Date.parse(d.Date))
                        ? new Date(+d.Date * 1000) : new Date(d.Date);

                    return {
                        date,
                        open: +d.Open,
                        high: +d.High,
                        low: +d.Low,
                        close: +d.Close,
                        volume: +d.Volume
                    };
                });

            svg.select("g.candlestick").datum(data);
            svg.select("g.sma.ma-0").datum(sma0Calculator(data));
            svg.select("g.sma.ma-1").datum(sma1Calculator(data));
            svg.select("g.volume").datum(data);

            redraw();

            function redraw() {
                const accessor = ohlc.accessor();

                x.domain(data.map(accessor.d));
                x.zoomable().domain([data.length - 130, data.length]);

                y.domain(techan.scale.plot.ohlc(
                    data.slice(data.length - 130, data.length)).domain());
                yVolume.domain(techan.scale.plot.volume(
                    data.slice(data.length - 130, data.length)).domain());

                svg.select("g.x.axis").call(xAxis);
                svg.select("g.y.axis").call(yAxis);
                svg.select("g.volume.axis").call(volumeAxis);

                svg.select("g.candlestick").datum(data).call(ohlc);
                svg.select("g.tradearrow").remove();
                svg.append("g").attr("class", "tradearrow");
                myTrades = scope.trades.filter(
                    trade => trade.instrument === myInstrument)
                    .map(
                        trade => ({
                            date: new Date(trade.openTime),
                            type: trade.currentUnits > 0 ? "buy" : "sell",
                            price: trade.price
                        })
                    );
                svg.select("g.tradearrow").datum(myTrades).call(tradearrow);

                svg.select("g.sma.ma-0")
                    .datum(sma0Calculator(data)).call(sma0);
                svg.select("g.sma.ma-1")
                    .datum(sma1Calculator(data)).call(sma1);

                svg.select("g.volume").datum(data).call(volume);

                svg.select("g.crosshair.ohlc").call(crosshair);
            }

            return redraw;
        }

    }
}
ohlcChartDirective.$inject = [];

const ohlcChart = angular
    .module("components.ohlc-chart", [])
    .directive("ohlcChart", ohlcChartDirective)
    .name;

class OrderDialogController {
    constructor(QuotesService, OrdersService, AccountsService) {
        this.QuotesService = QuotesService;
        this.OrdersService = OrdersService;
        this.AccountsService = AccountsService;
    }

    $onInit() {
        const account = this.AccountsService.getAccount();

        this.pips = account.pips;

        this.type = "MARKET";
        this.side = this.params.side;
        this.instruments = this.params.instruments;
        this.selectedInstrument = this.params.selectedInstrument;
        this.changeMarket(this.selectedInstrument);
        this.expires = [
            { label: "1 Hour", value: 60 * 60 * 1000 },
            { label: "2 Hours", value: 2 * 60 * 60 * 1000 },
            { label: "3 Hours", value: 3 * 60 * 60 * 1000 },
            { label: "4 Hours", value: 4 * 60 * 60 * 1000 },
            { label: "5 Hours", value: 5 * 60 * 60 * 1000 },
            { label: "6 Hours", value: 6 * 60 * 60 * 1000 },
            { label: "8 Hours", value: 8 * 60 * 60 * 1000 },
            { label: "12 Hours", value: 12 * 60 * 60 * 1000 },
            { label: "18 Hours", value: 18 * 60 * 60 * 1000 },
            { label: "1 Day", value: 60 * 60 * 24 * 1000 },
            { label: "2 Days", value: 2 * 60 * 60 * 24 * 1000 },
            { label: "1 Week", value: 7 * 60 * 60 * 24 * 1000 },
            { label: "1 Month", value: 30 * 60 * 60 * 24 * 1000 },
            { label: "2 Months", value: 60 * 60 * 60 * 24 * 1000 },
            { label: "3 Months", value: 90 * 60 * 60 * 24 * 1000 }
        ];
        this.selectedExpire = 604800000; // 1 week
        this.measure = "price";
        this.isLowerBound = false;
        this.isUpperBound = false;
        this.isTakeProfit = false;
        this.isStopLoss = false;
        this.isTrailingStop = false;
    }

    changeMarket(instrument) {
        if (!this.pips) {
            return;
        }

        const price = this.QuotesService.getQuotes()[instrument],
            fixed = ((this.pips[this.selectedInstrument].toString())
                .match(/0/g) || []).length;

        this.measure = "price";
        this.step = parseFloat(this.pips[this.selectedInstrument]);
        if (this.side === "buy") {
            this.quote = parseFloat(price && price.ask);
            this.takeProfit = parseFloat((this.quote + this.step * 10)
                .toFixed(fixed));
            this.stopLoss = parseFloat((this.quote - this.step * 10)
                .toFixed(fixed));
        } else {
            this.quote = parseFloat(price && price.bid);
            this.takeProfit = parseFloat((this.quote - this.step * 10)
                .toFixed(fixed));
            this.stopLoss = parseFloat((this.quote + this.step * 10)
                .toFixed(fixed));
        }
        this.lowerBound = parseFloat((this.quote - this.step).toFixed(fixed));
        this.upperBound = parseFloat((this.quote + this.step).toFixed(fixed));
        this.trailingStop = 25;
    }

    changeMeasure(measure) {
        if (measure === "price") {
            this.changeMarket(this.selectedInstrument);
        } else {
            this.lowerBound = 1;
            this.upperBound = 1;
            this.takeProfit = 10;
            this.stopLoss = 10;
            this.trailingStop = 25;
            this.step = 1;
        }
    }

    answer(action) {
        if (action === "close") {
            this.openModal = false;

            return;
        }

        if (!this.pips) {
            ToastsService.addToast(`Pips info for ${this.selectedInstrument} not yet available. Retry.`);
            this.openModal = false;

            return;
        }

        this.openModal = false;

        const order = {},
            isBuy = this.side === "buy",
            isMeasurePips = this.measure === "pips";

        this.step = parseFloat(this.pips[this.selectedInstrument]);

        order.instrument = this.selectedInstrument;
        order.units = this.units;
        if (this.units && !isBuy) {
            order.units = `-${order.units}`;
        }

        order.side = this.side;
        order.type = this.type;

        if (order.type === "LIMIT") {
            order.price = this.quote && this.quote.toString();
            order.gtdTime = new Date(Date.now() + this.selectedExpire);
        }

        if (isMeasurePips) {
            if (this.isLowerBound) {
                order.priceBound =
                    parseFloat(this.quote - this.step * this.lowerBound)
                        .toString();
            }
            if (this.isUpperBound) {
                order.priceBound =
                    parseFloat(this.quote + this.step * this.upperBound)
                        .toString();
            }
            if (isBuy) {
                if (this.isTakeProfit) {
                    order.takeProfitOnFill = {};
                    order.takeProfitOnFill.price =
                        parseFloat(this.quote + this.step * this.takeProfit)
                            .toString();
                }
                if (this.isStopLoss) {
                    order.stopLossOnFill = {};
                    order.order.takeProfitOnFill.price =
                        parseFloat(this.quote - this.step * this.stopLoss)
                            .toString();
                }
            } else {
                if (this.isTakeProfit) {
                    order.takeProfitOnFill = {};
                    order.takeProfitOnFill.price =
                        parseFloat(this.quote - this.step * this.takeProfit)
                            .toString();
                }
                if (this.isStopLoss) {
                    order.stopLossOnFill = {};
                    order.order.takeProfitOnFill.price =
                        parseFloat(this.quote + this.step * this.stopLoss)
                            .toString();
                }
            }
        } else {
            if (this.isLowerBound) {
                order.priceBound = this.lowerBound.toString();
            }
            if (this.isUpperBound) {
                order.priceBound = this.upperBound.toString();
            }
            if (this.isTakeProfit) {
                order.takeProfitOnFill = {};
                order.takeProfitOnFill.price = this.takeProfit.toString();
            }
            if (this.isStopLoss) {
                order.stopLossOnFill = {};
                order.stopLossOnFill.price = this.stopLoss.toString();
            }
        }
        if (this.isTrailingStop) {
            order.trailingStopLossOnFill = {};
            order.trailingStopLossOnFill.distance =
                (this.step * this.trailingStop).toString();
        }

        this.OrdersService.putOrder(order).then(transaction => {
            let opened,
                canceled,
                side,
                message;

            if (transaction.message) {
                message = `ERROR ${transaction.message}`;

                ToastsService.addToast(message);
            } else if (transaction.errorMessage) {
                message = `ERROR ${transaction.errorMessage}`;

                ToastsService.addToast(message);
            } else if (transaction.orderCancelTransaction) {
                canceled = transaction.orderCancelTransaction;

                message = `ERROR ${canceled.reason}`;

                ToastsService.addToast(message);
            } else {
                opened = transaction.orderFillTransaction ||
                    transaction.orderFillTransaction ||
                    transaction.orderCreateTransaction;

                side = opened.units > 0 ? "buy" : "sell";
                message = `${side} ` +
                    `${opened.instrument} ` +
                    `#${opened.id} ` +
                    `@${opened.price} ` +
                    `for ${opened.units}`;

                ToastsService.addToast(message);
            }
        });
    }
}
OrderDialogController.$inject = ["QuotesService", "OrdersService", "AccountsService"];

const orderDialogComponent = {
    templateUrl: "app/components/order-dialog/order-dialog.html",
    controller: OrderDialogController,
    bindings: {
        openModal: "=",
        params: "<"
    }
};

const orderDialog = angular
    .module("components.order-dialog", [])
    .component("orderDialog", orderDialogComponent)
    .name;

class OrdersController {
    constructor(OrdersService) {
        this.OrdersService = OrdersService;
    }

    $onInit() {
        this.orders = this.OrdersService.getOrders();

        this.OrdersService.refresh();
    }

    closeOrder(orderId) {
        this.openCloseOrderModal = true;
        this.closingOrderId = orderId;
    }

    closeOrderDialog(answer) {
        this.openCloseOrderModal = false;

        if (!answer) {
            return;
        }

        this.OrdersService.closeOrder(this.closingOrderId).then(order => {
            let message = `Closed #${order.orderCancelTransaction.orderID}`;

            if (order.errorMessage || order.message) {
                message = `ERROR ${order.errorMessage || order.message}`;
            }

            ToastsService.addToast(message);
        }).catch(err => {
            const message = `ERROR ${err.code} ${err.message}`;

            ToastsService.addToast(message);
        });
    }

}
OrdersController.$inject = ["OrdersService"];

const ordersComponent = {
    templateUrl: "app/components/orders/orders.html",
    controller: OrdersController
};

class OrdersService {
    constructor($http, SessionService, AccountsService) {
        this.$http = $http;
        this.SessionService = SessionService;
        this.AccountsService = AccountsService;

        this.orders = [];
    }

    getOrders() {
        return this.orders;
    }

    refresh() {
        this.SessionService.isLogged().then(credentials => {
            this.$http.post("/api/orders", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            }).then(res => {
                this.orders.length = 0;
                angular.extend(this.orders, res.data);
            });
        });
    }

    putOrder(order) {
        return this.SessionService.isLogged().then(
            credentials => this.$http.post("/api/order", {
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
            }).then(trade => trade.data)
                .catch(err => err.data)
        );
    }

    closeOrder(id) {
        return this.SessionService.isLogged().then(
            credentials => this.$http.post("/api/closeorder", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                id
            }).then(order => order.data)
                .catch(err => err.data)
        );
    }

    updateOrders(tick) {
        const account = this.AccountsService.getAccount(),
            pips = account.pips;

        this.orders.forEach((order, index) => {
            let current;

            if (order.instrument === tick.instrument) {

                if (order.units > 0) {
                    current = tick.ask;
                }
                if (order.units < 0) {
                    current = tick.bid;
                }

                this.orders[index].current = current;
                this.orders[index].distance = (Math.abs(current - order.price) /
                    pips[order.instrument]);
            }
        });
    }
}
OrdersService.$inject = ["$http", "SessionService", "AccountsService"];

const orders = angular
    .module("components.orders", [])
    .component("orders", ordersComponent)
    .service("OrdersService", OrdersService)
    .name;

class PluginsController {
    constructor(PluginsService) {
        this.PluginsService = PluginsService;
    }

    $onInit() {
        this.plugins = this.PluginsService.getPlugins();
        this.pluginsInfo = this.PluginsService.getPluginsInfo();

        this.PluginsService.refresh();
    }

    engage() {
        this.PluginsService.engagePlugins(this.plugins);
    }
}
PluginsController.$inject = ["PluginsService"];

const pluginsComponent = {
    templateUrl: "app/components/plugins/plugins.html",
    controller: PluginsController
};

class PluginsService {
    constructor($http, SessionService, AccountsService) {
        this.$http = $http;
        this.SessionService = SessionService;
        this.AccountsService = AccountsService;

        this.plugins = {};
        this.pluginsInfo = {
            count: 0
        };
    }

    getPlugins() {
        return this.plugins;
    }

    getPluginsInfo() {
        return this.pluginsInfo;
    }

    refresh() {
        this.SessionService.isLogged().then(credentials => {
            this.$http.post("/api/plugins", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            }).then(res => {
                let name;

                for (name in this.plugins) {
                    if (this.plugins.hasOwnProperty(name)) {
                        delete this.plugins[name];
                    }
                }
                angular.extend(this.plugins, res.data);
                this.pluginsInfo.count = Object.keys(this.plugins).length;

                Object.keys(this.plugins).forEach(key => {
                    if (this.plugins[key] === "enabled") {
                        this.plugins[key] = true;
                    } else {
                        this.plugins[key] = false;
                    }
                });
            });
        });
    }

    engagePlugins(plugs) {
        this.SessionService.isLogged().then(credentials => {
            const account = this.AccountsService.getAccount();

            this.$http.post("/api/engageplugins", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                plugins: plugs,
                config: {
                    pips: account.pips
                }
            });
        });
    }
}
PluginsService.$inject = ["$http", "SessionService", "AccountsService"];

const plugins = angular
    .module("components.plugins", [])
    .component("plugins", pluginsComponent)
    .service("PluginsService", PluginsService)
    .name;

class PositionsController {
    constructor(PositionsService) {
        this.PositionsService = PositionsService;
    }

    $onInit() {
        this.PositionsService.getPositions().then(positions => {
            this.positions = positions;
        });
    }
}
PositionsController.$inject = ["PositionsService"];

const positionsComponent = {
    templateUrl: "app/components/positions/positions.html",
    controller: PositionsController
};

class PositionsService {
    constructor($http, SessionService) {
        this.$http = $http;
        this.SessionService = SessionService;
    }

    getPositions() {
        return this.SessionService.isLogged().then(
            credentials => this.$http.post("/api/positions", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            }).then(positions => {
                const data = [];

                positions.data.forEach(position => {
                    const longUnits = position.long &&
                        parseInt(position.long.units, 10);
                    const shortUnits = position.short &&
                        parseInt(position.short.units, 10);
                    const units = longUnits || shortUnits;
                    const side = units > 0 ? "buy" : "sell";
                    const avgPrice = (longUnits && position.long.averagePrice) ||
                        (shortUnits && position.short.averagePrice);

                    data.push({
                        side,
                        instrument: position.instrument,
                        units,
                        avgPrice
                    });
                });

                return data;
            }).catch(err => err.data)
        );
    }
}
PositionsService.$inject = ["$http", "SessionService"];

const positions = angular
    .module("components.positions", [])
    .component("positions", positionsComponent)
    .service("PositionsService", PositionsService)
    .name;

class QuotesController {
    constructor(QuotesService) {
        this.QuotesService = QuotesService;
    }

    $onInit() {
        this.quotes = this.QuotesService.getQuotes();
    }
}
QuotesController.$inject = ["QuotesService"];

const quotesComponent = {
    templateUrl: "app/components/quotes/quotes.html",
    controller: QuotesController
};

class QuotesService {
    constructor(AccountsService) {
        this.AccountsService = AccountsService;

        this.quotes = {};
    }

    getQuotes() {
        return this.quotes;
    }

    updateTick(tick) {
        const account = this.AccountsService.getAccount(),
            streamingInstruments = account.streamingInstruments,
            pips = account.pips,
            instrument = tick.instrument;

        this.quotes[instrument] = {
            time: tick.time,
            ask: tick.ask,
            bid: tick.bid,
            spread: ((tick.ask - tick.bid) / pips[instrument]).toFixed(1)
        };


        if (!angular.equals(streamingInstruments, Object.keys(this.quotes))) {
            streamingInstruments.forEach(instr => {
                let temp;

                if (this.quotes.hasOwnProperty(instr)) {
                    temp = this.quotes[instr];
                    delete this.quotes[instr];
                    this.quotes[instr] = temp;
                }
            });
        }
    }

    reset() {
        let key;

        for (key in this.quotes) {
            if (this.quotes.hasOwnProperty(key)) {
                delete this.quotes[key];
            }
        }
    }
}
QuotesService.$inject = ["AccountsService"];

const quotes = angular
    .module("components.quotes", [])
    .component("quotes", quotesComponent)
    .service("QuotesService", QuotesService)
    .name;

class SettingsDialogController {
    answer(settingsInfo) {
        this.closeModal({ settingsInfo });
    }
}
SettingsDialogController.$inject = [];

const settingsDialogComponent = {
    templateUrl: "app/components/settings-dialog/settings-dialog.html",
    controller: SettingsDialogController,
    bindings: {
        openModal: "=",
        closeModal: "&",
        instruments: "<"
    }
};

const settingsDialog = angular
    .module("components.settings-dialog", [])
    .component("settingsDialog", settingsDialogComponent)
    .name;

// Inspired by http://bl.ocks.org/vicapow/9904319
function slChartDirective() {
    const data = {},
        directive = {
            restrict: "E",
            link,
            scope: {
                instrument: "=",
                data: "=",
                length: "="
            },
            replace: true,
            template: "<svg class='sl'></svg>",
            transclude: true
        };

    return directive;

    function link(scope, element) {

        scope.$watch("data", quote => {
            redraw(quote);
        });

        function redraw(quote) {
            const svg = d3.select(element[0]),
                node = svg.node(),
                instrument = scope.instrument,
                w = node.clientWidth,
                h = getComputedStyle(node)["font-size"].replace("px", "");

            svg.selectAll("*").remove();

            if (!data[instrument]) {
                data[instrument] = [];
            }

            data[instrument].push(
                (parseFloat(quote.bid) +
                    parseFloat(quote.ask)) / 2);

            data[instrument] = data[instrument].slice(-scope.length);

            if (data[instrument][0] > data[instrument].slice(-1)) {
                node.style.stroke = "red";
            } else {
                node.style.stroke = "green";
            }
            node.style.height = `${h}px`;

            const min$$1 = d3.min(data[instrument]);
            const max$$1 = d3.max(data[instrument]);

            const x = d3.scaleLinear()
                .domain([0, data[instrument].length - 1]).range([0, w]);
            const y = d3.scaleLinear()
                .domain([min$$1, max$$1]).range([h, 0]);

            const paths = data[instrument]
                .map((d, i) => [x(i), y(d)])
                .join("L");

            svg.append("path").attr("d", `M${paths}`);
        }
    }
}
slChartDirective.$inject = [];

const slChart = angular
    .module("components.sl-chart", [])
    .directive("slChart", slChartDirective)
    .name;

class StreamingService {
    constructor($timeout, $http,
        QuotesService, ActivityService, TradesService,
        OrdersService, AccountsService, PluginsService) {

        this.$timeout = $timeout;
        this.$http = $http;
        this.QuotesService = QuotesService;
        this.ActivityService = ActivityService;
        this.TradesService = TradesService;
        this.OrdersService = OrdersService;
        this.AccountsService = AccountsService;
        this.PluginsService = PluginsService;
    }

    startStream(data) {
        this.$http.post("/api/startstream", {
            environment: data.environment,
            accessToken: data.accessToken,
            accountId: data.accountId,
            instruments: data.instruments
        }).then(() => {
            this.getStream();
        }).catch(err => {
            ToastsService.addToast(err);
        });
    }

    getStream() {
        const ws = new WebSocket("ws://localhost:8000/stream");

        ws.onmessage = event => {
            let data,
                isTick,
                tick,
                isTransaction,
                transaction,
                refreshPlugins;

            this.$timeout(() => {
                try {
                    data = angular.fromJson(event.data);

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

                        this.QuotesService.updateTick(tick);
                        this.TradesService.updateTrades(tick);
                        this.OrdersService.updateOrders(tick);
                    }

                    if (isTransaction) {
                        transaction = data;
                        this.ActivityService.addActivity(transaction);

                        this.TradesService.refresh();
                        this.OrdersService.refresh();
                        this.AccountsService.refresh();
                    }

                    if (refreshPlugins) {
                        this.PluginsService.refresh();
                    }
                } catch (e) {

                    // Discard "incomplete" json
                    // console.log(e.name + ": " + e.message);
                }
            });
        };
    }
}
StreamingService.$inject = [
    "$timeout", "$http",
    "QuotesService", "ActivityService", "TradesService",
    "OrdersService", "AccountsService", "PluginsService"
];

const streaming = angular
    .module("components.streaming", [])
    .service("StreamingService", StreamingService)
    .name;

class TradesController {
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

const tradesComponent = {
    templateUrl: "app/components/trades/trades.html",
    controller: TradesController
};

class TradesService {
    constructor($http, SessionService, AccountsService) {
        this.$http = $http;
        this.SessionService = SessionService;
        this.AccountsService = AccountsService;

        this.trades = [];
    }

    getTrades() {
        return this.trades;
    }

    refresh() {
        this.SessionService.isLogged().then(credentials => {
            this.$http.post("/api/trades", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            }).then(res => {
                this.trades.length = 0;
                angular.extend(this.trades, res.data);
                this.trades.forEach(trade => {
                    trade.side = trade.currentUnits > 0 ? "buy" : "sell";
                });
            });
        });
    }

    closeTrade(id) {
        return this.SessionService.isLogged().then(
            credentials => this.$http.post("/api/closetrade", {
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                id
            }).then(order => order.data)
                .catch(err => err.data)
        );
    }

    updateTrades(tick) {
        const account = this.AccountsService.getAccount(),
            pips = account.pips;

        this.trades.forEach((trade, index) => {
            let current,
                side;

            if (trade.instrument === tick.instrument) {
                side = trade.currentUnits > 0 ? "buy" : "sell";

                if (side === "buy") {
                    current = tick.bid;
                    this.trades[index].profitPips =
                        ((current - trade.price) / pips[trade.instrument]);
                }
                if (side === "sell") {
                    current = tick.ask;
                    this.trades[index].profitPips =
                        ((trade.price - current) / pips[trade.instrument]);
                }

                this.trades[index].current = current;
            }
        });
    }
}
TradesService.$inject = ["$http", "SessionService", "AccountsService"];

const trades = angular
    .module("components.trades", [])
    .component("trades", tradesComponent)
    .service("TradesService", TradesService)
    .name;

class YesNoDialogController {
}
YesNoDialogController.$inject = [];

const yesnoDialogComponent = {
    templateUrl: "app/components/yesno-dialog/yesno-dialog.html",
    controller: YesNoDialogController,
    bindings: {
        openModal: "=",
        closeModal: "&",
        text: "@"
    }
};

const yesnoDialog = angular
    .module("components.yesno-dialog", [])
    .component("yesnoDialog", yesnoDialogComponent)
    .name;

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
                    <span class="${Util.isLoadingView ? "spinner" : ""}"></span>
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

// import { SessionService } from "../session/session.service";

// import { StreamingService } from "../streaming/streaming.service";
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
        this.state.tokenModalIsOpen = false;

        this.state.tokenInfo.accountId = this.state.accounts[accountSelected].id;

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
            tokenModalIsOpen: false,
            tokenInfo: {
                environment: "practice",
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

class HeaderComponent {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("header"));

        this.HeaderController = new HeaderController(render, HeaderTemplate);
    }
}

HeaderComponent.bootstrap();

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

const components = angular
    .module("components", [
        activity,
        charts,
        exposure,
        highlighter,
        news,
        ohlcChart,
        orderDialog,
        orders,
        plugins,
        positions,
        quotes,
        settingsDialog,
        slChart,
        streaming,
        trades,
        yesnoDialog
    ])
    .name;

const root = angular
    .module("root", [
        common,
        components
    ])
    .name;

exports.root = root;

}((this.app = this.app || {}),angular,hyperHTML,Introspected,d3,techan));
