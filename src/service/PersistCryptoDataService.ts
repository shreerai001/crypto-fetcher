import {CoinGeckoRequest} from "../model/CoinGeckoRequest";
import {CoinGecko} from "../model/CoinGecko";

export interface PersistCryptoDataService {
    saveCryptoData(data: Readonly<CoinGeckoRequest>): Promise<CoinGecko>;
}