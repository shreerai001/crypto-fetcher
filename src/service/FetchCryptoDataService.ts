import {CoinGecko} from "../model/CoinGecko";

export interface FetchCryptoDataService {
    getCryptoData(coinId: Readonly<string>, lastUpdatedAt: Readonly<number>) : Promise<Array<CoinGecko>>;
}