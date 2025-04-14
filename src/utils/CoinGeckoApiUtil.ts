import axios, { AxiosResponse } from "axios";
import { CoinGecko } from "../model/CoinGecko";
import { CoinGeckoApiResponse } from "../model/CoinGeckoApiResponse";

export class CoinGeckoApiUtil {
    private static readonly BASE_URL = "https://api.coingecko.com/api/v3";

    private constructor() {
        // enforces non object creation as all the methods are supposed to static
    }


    public static async fetchCryptoData(
        url: Readonly<string>,
        params: Record<string, any>,
        headers: Record<string, string>
    ): Promise<CoinGeckoApiResponse> {
        try {
            const response: AxiosResponse = await axios.get(url, {
                params,
                headers,
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching data from API:", error);
            throw new Error("Failed to fetch data from API");
        }
    }
}