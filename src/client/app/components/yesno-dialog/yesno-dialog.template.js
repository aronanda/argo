import hyperHTML from "hyperHTML";

import { Util } from "../../util";

export class YesNoDialogTemplate {
    static update(render, state, events) {
        if (!state.yesnoModalIsOpen) {
            Util.renderEmpty(render);
            return;
        }

        /* eslint indent: off */
        render`
            <div class="fixed absolute--fill bg-black-70 z5">
            <div class="fixed absolute-center z999">

            <main class="pa4 black-80 bg-white">
                <form class="measure center">
                    <fieldset id="login" class="ba b--transparent ph0 mh0">
                        <legend class="f4 fw6 ph0 mh0 center">${state.text}</legend>
                    </fieldset>
                </form>
                <div class="flex flex-row items-center justify-around">
                    <input class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                        type="button" value="Cancel"
                        onclick="${() => {
                            state.yesnoModalIsOpen = false;
                        }}">

                    <input id="ok" class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                        type="button" value="Ok"
                        onclick="${events}">
                </div>
                </form>
            </main>

            </div>
            </div>
        `;
    }
}
