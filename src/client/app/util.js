import hyperHTML from "hyperHTML";

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
            : console.warn(method, "not implemented");
    }

    static renderEmpty(render) {
        return render`${hyperHTML.wire(render, ":empty")``}`;
    }

    static pad(n) {
        return n < 10 ? `0${n}` : n;
    }

    static getHHMMSSfromDate(date) {
        const hours = Util.pad(date.getHours());
        const minutes = Util.pad(date.getMinutes());
        const seconds = Util.pad(date.getSeconds());

        return `${hours}:${minutes}:${seconds}`;
    }

    static fetch() {
        const fetchStart = new Event("fetch:start");
        const fetchEnd = new Event("fetch:end");

        const fetchCall = fetch.apply(this, arguments);

        document.dispatchEvent(fetchStart);

        fetchCall.then(() => {
            document.dispatchEvent(fetchEnd);
        }).catch(() => {
            document.dispatchEvent(fetchEnd);
        });

        return fetchCall;
    }

    static show(condition) {
        return condition ? "display: block;" : "display: none;";
    }
}

Util.isLoadingView = false;

document.addEventListener("fetch:start", () => {
    Util.isLoadingView = true;
});

document.addEventListener("fetch:end", () => {
    Util.isLoadingView = false;
});
