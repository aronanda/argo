import hyperHTML from "hyperHTML";

import { Util } from "../../util";

export class Toasts2Template {
    static update(render, state) {
        if (!state.toasts.length) {
            Util.renderEmpty(render);
            return;
        }

        /* eslint indent: off */
        render`
            <table class="f6 ba" cellspacing="0">
                <tbody>
                    <tr>${
                        state.toasts.map(toast => hyperHTML.wire(toast, ":tr")`
                            <td class="b--black-20 pr2"> ${Util.getHHMMSSfromDate(toast.date)} </td>
                            <td class="b--black-20 pl2"> ${toast.message} </td>
                    `)}</tr>
                </tbody>
            </table>
        `;
    }
}
