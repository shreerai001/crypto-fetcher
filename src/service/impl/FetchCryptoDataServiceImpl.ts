import {FetchCryptoDataService} from "../FetchCryptoDataService";
import {CryptoRepository} from "../../repository/CryptoRepository";
import {CoinGecko} from "../../model/CoinGecko";

export class FetchCryptoDataServiceImpl implements FetchCryptoDataService {


    private readonly cryptoRepository: CryptoRepository;

    constructor(cryptoRepository: CryptoRepository) {
        this.cryptoRepository = cryptoRepository;
    }

    public async getCryptoData(coinId: Readonly<string>, lastUpdatedAt: Readonly<number>)
        : Promise<Array<CoinGecko>> {
        console.log(`Fetching crypto data for coinId: ${coinId} with lastUpdatedAt >= ${lastUpdatedAt}`);
        return await this.cryptoRepository.getRecord(coinId, lastUpdatedAt);
    }

}