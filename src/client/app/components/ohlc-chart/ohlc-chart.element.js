import { Hyper } from "../../util";
import { OhlcChartTemplate } from "./ohlc-chart.template";

class OhlcChartElement extends Hyper {
    static get observedAttributes() {
        return ["data-data"];
    }

    constructor() {
        super();

        this.state = {
            instrument: this.dataset.instrument,
            granularity: this.dataset.granularity,
            data: "",
            feed: {},
            trades: []
        };
    }

    render() {
        return OhlcChartTemplate.update(this.hyper);
    }

    attributeChangedCallback() {
        OhlcChartTemplate.redraw(this.state);
    }

}
customElements.define("ohlc-chart", OhlcChartElement);
