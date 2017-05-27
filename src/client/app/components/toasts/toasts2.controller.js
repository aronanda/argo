import Introspected from "introspected";

import { Toasts2Service } from "./toasts2.service";

export class Toasts2Controller {
    constructor(render, template) {

        this.state = Introspected({
            toasts: []
        }, state => template.update(render, state));

        this.ToastsService = new Toasts2Service(this.state.toasts);
    }
}
