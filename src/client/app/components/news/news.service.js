import { Util } from "../../util";
import { SessionService } from "../session/session.service";

export class NewsService {
    constructor(news) {
        if (!NewsService.news) {
            NewsService.news = news;
        }
    }

    static getNews() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return;
        }

        Util.fetch("/api/calendar", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token
            })
        }).then(res => res.json()).then(data => data.map(item => {
            item.timestamp = item.timestamp * 1000;

            return item;
        })).catch(err => err.data);
    }
}

NewsService.news = null;
