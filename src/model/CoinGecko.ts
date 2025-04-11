export interface CoinGecko {
    ids: string;
    currency: string; 
    price?: number; 
    marketCap?: number; 
    volume24h?: number; 
    change24h?: number; 
    lastUpdatedAt?: number; 
    ttl?: number; 
}