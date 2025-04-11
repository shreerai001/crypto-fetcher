import { CryptoRepositoryImpl } from "../repository/CryptoRepositoryImpl";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {FetchCryptoDataServiceImpl} from "../service/impl/FetchCryptoDataServiceImpl";

const tableName = process.env.DYNAMODB_TABLE_NAME || "CryptoPrices";
const cryptoRepository = new CryptoRepositoryImpl(tableName);
const cryptoService = new FetchCryptoDataServiceImpl(cryptoRepository);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid request body" }),
            };
        }

        const { ids: coinId, lastUpdatedAt } = JSON.parse(event.body);

        if (!coinId || !lastUpdatedAt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid parameters: coinId and lastUpdatedAt are required" }),
            };
        }

        const cryptoData = await cryptoService.getCryptoData(coinId, lastUpdatedAt);

        return {
            statusCode: 200,
            body: JSON.stringify(cryptoData),
        };
    } catch (error) {
        console.error("Error fetching crypto data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};