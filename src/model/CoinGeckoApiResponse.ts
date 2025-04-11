interface CurrencyData {
    [key: string]: number | undefined;
    last_updated_at?: number;
}

export interface CoinGeckoApiResponse {
    [coinId: string]: CurrencyData;
}