import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {CryptoRepositoryImpl} from "../repository/CryptoRepositoryImpl";
import {PersistCryptoDataServiceImpl} from "../service/impl/PersistCryptoDataServiceImpl";
import { CoinGeckoMapper } from "../utils/mapper/CoinGeckoMapper";

const cryptoRepository = new CryptoRepositoryImpl();
const saveCryptoDataService = new PersistCryptoDataServiceImpl(cryptoRepository);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const coinGeckoData = CoinGeckoMapper.toCoinGecko(event);

        await saveCryptoDataService.saveCryptoData(coinGeckoData);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully" }),
        };
    } catch (error) {
        console.error("Error saving crypto data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Internal server error"}),
        };
    }
};