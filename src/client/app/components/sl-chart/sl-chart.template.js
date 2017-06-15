import * as d3 from "d3";
import hyperHTML from "hyperHTML";

// Inspired by http://bl.ocks.org/vicapow/9904319
export class SlChartTemplate {

    static update(render) {
        /* eslint indent: off */
        return render`${hyperHTML.wire(render, "svg")`
            <svg class="sl"></svg>`
        }`;
    }

    static redraw(state) {

        const instrument = state.instrument,
            quote = state.quotes[instrument],
            svg = d3.select(`[instrument="${instrument}"] > svg`),
            node = svg.node(),
            w = node.clientWidth,
            h = getComputedStyle(node)["font-size"].replace("px", "");

        svg.selectAll("*").remove();

        if (!SlChartTemplate.data[instrument]) {
            SlChartTemplate.data[instrument] = [];
        }

        SlChartTemplate.data[instrument].push(
            (parseFloat(quote.bid) +
                parseFloat(quote.ask)) / 2);

        SlChartTemplate.data[instrument] =
            SlChartTemplate.data[instrument].slice(-state.length);

        if (SlChartTemplate.data[instrument][0] >
                SlChartTemplate.data[instrument].slice(-1)) {
            node.style.stroke = "red";
        } else {
            node.style.stroke = "green";
        }
        node.style.height = `${h}px`;

        const min = d3.min(SlChartTemplate.data[instrument]);
        const max = d3.max(SlChartTemplate.data[instrument]);

        const x = d3.scaleLinear()
            .domain([0, SlChartTemplate.data[instrument].length - 1])
            .range([0, w]);
        const y = d3.scaleLinear()
            .domain([+min, +max]).range([h, 0]);

        const paths = SlChartTemplate.data[instrument]
            .map((d, i) => [x(i), y(d)])
            .join("L");

        svg.append("path").attr("d", `M${paths}`);
    }
}

SlChartTemplate.data = {};
