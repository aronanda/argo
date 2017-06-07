import { AccountsService } from "../account/accounts.service";


export class QuotesService {
    constructor(quotes) {
        if (!QuotesService.quotes) {
            QuotesService.quotes = quotes;
        }
    }

    static getQuotes() {
        return QuotesService.quotes;
    }

    static updateTick(tick) {
        const account = AccountsService.getAccount(),
            streamingInstruments = account.streamingInstruments,
            pips = account.pips,
            instrument = tick.instrument;

        QuotesService.quotes[instrument] = {
            time: tick.time,
            ask: tick.ask,
            bid: tick.bid,
            spread: ((tick.ask - tick.bid) / pips[instrument]).toFixed(1)
        };


        const accountInstruments = JSON.stringify(streamingInstruments);
        const ticksInstruments = JSON.stringify(
            Object.keys(QuotesService.quotes));

        if (accountInstruments !== ticksInstruments) {
            streamingInstruments.forEach(instr => {
                let temp;

                if (JSON.stringify(QuotesService.quotes[instr]) !== "{}") {
                    temp = QuotesService.quotes[instr];
                    delete QuotesService.quotes[instr];
                    QuotesService.quotes[instr] = temp;
                }
            });
        }
    }

    static reset() {
        let key;

        for (key in QuotesService.quotes) {
            if (QuotesService.quotes.hasOwnProperty(key)) {
                delete QuotesService.quotes[key];
            }
        }
    }
}

QuotesService.quotes = null;
