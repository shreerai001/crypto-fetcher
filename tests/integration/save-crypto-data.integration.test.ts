import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {CryptoRepositoryImpl} from "../../src/repository/CryptoRepositoryImpl";
import {PersistCryptoDataServiceImpl} from "../../src/service/impl/PersistCryptoDataServiceImpl";
import {CoinGeckoRequest} from "../../src/model/CoinGeckoRequest";

/**
 * this is integration test which hits coingecko api and gets result, coingecko api-token stored in secrete manager
 * this save data in dynamoDB, needs to change to docker dynamo db local integration
 */
describe("PersistCryptoDataServiceImpl Integration Test", () => {
    const dynamoDBClient = new DynamoDBClient({ region: "ap-southeast-2" });
    const tableName = "CryptoPricesTable";

    let cryptoRepository: CryptoRepositoryImpl;
    let service: PersistCryptoDataServiceImpl;

    beforeAll(() => {
        cryptoRepository = new CryptoRepositoryImpl(tableName, dynamoDBClient);
        service = new PersistCryptoDataServiceImpl(cryptoRepository);
    });

    it("should fetch the API key, call the CoinGecko API, and save data to DynamoDB", async () => {
        const coinGeckoRequest: CoinGeckoRequest = {
            ids: "bitcoin",
            vs_currencies: "aud",
            include_last_updated_at: true,
        };

        const response = await service.saveCryptoData(coinGeckoRequest);

        const getItemCommand = new GetItemCommand({
            TableName: tableName,
            Key: {
                ids: { S: "bitcoin" },
                lastUpdatedAt: { N: `${response.lastUpdatedAt}` },
            },
        });

        const result = await dynamoDBClient.send(getItemCommand);

        expect(result.Item).toBeDefined();
        expect(result.Item?.ids.S).toBe("bitcoin");
        expect(result.Item?.currency.S).toBe("aud");
    });
});