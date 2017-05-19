import Introspected from "introspected";
import { Util } from "../util";

export class AppController {
    constructor(render, template) {
        const events = (e, payload) => Util.handleEvent(this, e, payload);

        this.state = Introspected({
            tabSelectedIndex: 0
        }, state => template.update(render, state, events));
    }
}

