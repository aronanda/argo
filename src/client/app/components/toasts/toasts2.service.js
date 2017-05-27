export class Toasts2Service {
    constructor(toasts) {
        if (!Toasts2Service.toasts) {
            Toasts2Service.toasts = toasts;
        }
    }

    static getToasts() {
        return Toasts2Service.toasts;
    }

    static addToast(message) {
        Toasts2Service.toasts.splice(0, 0, {
            date: (new Date()),
            message
        });

        if (Toasts2Service.timeout) {
            clearTimeout(Toasts2Service.timeout);
        }
        Toasts2Service.timeout = Toasts2Service.reset();
    }

    static reset() {
        return setTimeout(() => {
            while (Toasts2Service.toasts.length) {
                Toasts2Service.toasts.pop();
            }
        }, 10000);
    }
}

Toasts2Service.toasts = null;
Toasts2Service.timeout = null;
