import hyperHTML from "hyperhtml";

export class Util {
    static query(selector) {
        return document.querySelector(selector) ||
            console.error(selector, "not found");
    }

    static handleEvent(context, e, payload) {
        const type = e.type;
        const id = e.target.id || console.warn(e.target, "target without id");
        const method = `on${id[0].toUpperCase()}${id.slice(1)}` +
             `${type[0].toUpperCase()}${type.slice(1)}`;

        return method in context ? context[method](e, payload)
            : console.warn(e.type, "not implemented");
    }

    static renderEmpty(render) {
        render`${hyperHTML.wire(render, ":empty")``}`;
    }

}
