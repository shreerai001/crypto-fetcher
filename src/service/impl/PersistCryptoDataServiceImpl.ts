import {PersistCryptoDataService} from "../PersistCryptoDataService";
import {CryptoRepository} from "../../repository/CryptoRepository";
import {CoinGecko} from "../../model/CoinGecko";
import {CoinGeckoApiUtil} from "../../utils/CoinGeckoApiUtil";
import {
    COIN_GECKO_BASE_URL,
    COIN_GECKO_REQUIRED_HEADERS,
    COIN_GECKO_SIMPLE_PRICE_ENDPOINT,
} from "../../utils/coignGeckoVal";
import {CoinGeckoMapper} from "../../utils/mapper/CoinGeckoMapper";
import {SecretsManagerUtil} from "../../utils/SecretsManagerUtil";
import {CoinGeckoRequest} from "../../model/CoinGeckoRequest";

export class PersistCryptoDataServiceImpl implements PersistCryptoDataService {
    private readonly cryptoRepository: CryptoRepository;

    constructor(cryptoRepository: CryptoRepository) {
        this.cryptoRepository = cryptoRepository;
    }

    /**
     * Saves cryptocurrency data retrieved from CoinGecko API to the database.
     *
     * @param {CoinGeckoRequest} request - The cryptocurrency parameters needed for API query provided by users.
     * @return {Promise<CoinGecko>} A promise that resolves when the data has been successfully saved.
     */
    public async saveCryptoData(request: Readonly<CoinGeckoRequest>): Promise<CoinGecko> {
        try {
            const apiKey = await SecretsManagerUtil.getSecret("coingecko_api");

            const queryParams = CoinGeckoMapper.toQueryParams(request);

            // Fetch data from the CoinGecko API
            const data = await CoinGeckoApiUtil.fetchCryptoData(
                `${COIN_GECKO_BASE_URL}${COIN_GECKO_SIMPLE_PRICE_ENDPOINT}`,
                queryParams,
                {
                    [COIN_GECKO_REQUIRED_HEADERS.ACCEPT]: "application/json",
                    [COIN_GECKO_REQUIRED_HEADERS.API_KEY_HEADER]: apiKey,
                }
            );

            const coinData = data[request.ids];
            if (!coinData) {
                throw new Error(`No data found for coinId: ${request.ids}`);
            }

            const updatedCoinGeckoData: CoinGecko = {
                ids: request.ids,
                currency: request.vs_currencies,
                price: coinData[request.vs_currencies],
                marketCap: coinData[`${request.vs_currencies}_market_cap`],
                volume24h: coinData[`${request.vs_currencies}_24h_vol`],
                change24h: coinData[`${request.vs_currencies}_24h_change`],
                lastUpdatedAt: coinData[`last_updated_at`],
            };

            await this.cryptoRepository.saveRecord(updatedCoinGeckoData);

            return updatedCoinGeckoData;
        } catch (error) {
            console.error("Error fetching data from CoinGecko API or saving to DynamoDB:", error);
            throw new Error(`Failed to fetch and save crypto data: ${error}`);
        }
    }
}