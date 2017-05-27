import hyperHTML from "hyperHTML";

import { Util } from "../../util";
import { Toasts2Template } from "./toasts2.template";
import { Toasts2Controller } from "./toasts2.controller";

export class Toasts2Component {
    static bootstrap() {
        const render = hyperHTML.bind(Util.query("toasts2"));

        this.toasts2Controller = new Toasts2Controller(render, Toasts2Template);
    }
}
