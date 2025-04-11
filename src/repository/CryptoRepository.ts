import { CoinGecko } from "../model/CoinGecko";

export interface CryptoRepository {
    saveRecord(coinGeckoResponseData: Readonly<CoinGecko>): Promise<void>;

    getRecord(coinId: Readonly<string>, lastUpdatedAt: Readonly<number>): Promise<Array<CoinGecko>>
}