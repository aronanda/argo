import hyperHTML from "hyperHTML";

import { Util } from "../../util";

export class QuotesTemplate {
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
