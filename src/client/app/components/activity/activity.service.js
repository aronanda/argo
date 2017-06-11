import { Util } from "../../util";
import { SessionService } from "../session/session.service";
import { AccountsService } from "../account/accounts.service";

export class ActivityService {
    constructor(activities) {
        if (!ActivityService.activities) {
            ActivityService.activities = activities;
        }
    }

    static getActivities() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        const account = AccountsService.getAccount(),
            lastTransactionID = account.lastTransactionID;

        Util.fetch("/api/transactions", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                lastTransactionID
            })
        }).then(res => res.json()).then(data => {
            ActivityService.activities = data.reverse();

            return this.activities;
        }).catch(err => err.data);
    }

    static addActivity(activity) {
        ActivityService.activities.splice(0, 0, {
            id: activity.id,
            type: activity.type,
            instrument: activity.instrument,
            units: activity.units,
            price: activity.price,
            pl: activity.pl,
            accountBalance: activity.accountBalance,
            time: activity.time
        });
    }
}

ActivityService.activities = null;
