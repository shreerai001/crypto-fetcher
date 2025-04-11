import {DynamoDBClient, PutItemCommand, QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {CryptoRepository} from "./CryptoRepository";
import {CoinGecko} from "../model/CoinGecko";
import {DYNAMO_DB_TABLE_NAME} from "../utils/coignGeckoVal";

export class CryptoRepositoryImpl implements CryptoRepository {
    private readonly tableName: string;
    private readonly dynamoDBClient: DynamoDBClient;

    constructor(
        tableName: string = DYNAMO_DB_TABLE_NAME,
        ddbClient: DynamoDBClient = new DynamoDBClient({region: process.env.AWS_REGION}),
    ) {
        this.tableName = tableName;
        this.dynamoDBClient = ddbClient;
    }

    /**
     * Saves a CoinGecko record to the DynamoDB table.
     * @param data The CoinGecko data to save.
     */
    public async saveRecord(data: CoinGecko): Promise<void> {
        const rawItem = {
            ids: data.ids,
            currency: data.currency,
            price: data.price !== undefined ? data.price : null,
            marketCap: data.marketCap !== undefined ? data.marketCap : null,
            volume24h: data.volume24h !== undefined ? data.volume24h : null,
            change24h: data.change24h !== undefined ? data.change24h : null,
            lastUpdatedAt: data.lastUpdatedAt !== undefined ? data.lastUpdatedAt : Date.now(),
        };

        const filteredItem = Object.fromEntries(
            Object.entries(rawItem).filter(([_, value]) => value !== undefined && value !== null)
        );

        const marshalledItem = marshall(filteredItem);

        const params = {
            TableName: this.tableName,
            Item: marshalledItem,
        };

        console.log("Saving item to DynamoDB:", marshalledItem);

        try {
            await this.dynamoDBClient.send(new PutItemCommand(params));
        } catch (e) {
            console.error("Error saving item to DynamoDB:", e);
        }
    }

    /**
     * Retrieves CoinGecko records from the DynamoDB table based on coinId and lastUpdatedAt.
     * @param coinId The coin ID to query.
     * @param lastUpdatedAt The minimum lastUpdatedAt timestamp to filter records.
     * @returns An array of CoinGecko records.
     */
    public async getRecord(coinId: Readonly<string>, lastUpdatedAt: Readonly<number>): Promise<Array<CoinGecko>> {
        const items: Array<CoinGecko> = [];
        let lastEvaluatedKey: any = null;

        do {
            const {Items, LastEvaluatedKey} = await this.dynamoDBClient.send(
                new QueryCommand({
                    TableName: this.tableName,
                    KeyConditionExpression: "coinId = :coinId",
                    FilterExpression: "lastUpdatedAt >= :lastUpdatedAt",
                    ExpressionAttributeValues: marshall({
                        ":coinId": coinId,
                        ":lastUpdatedAt": lastUpdatedAt,
                    }),
                    ExclusiveStartKey: lastEvaluatedKey,
                })
            );

            if (Items) {
                items.push(...Items.map((item) => unmarshall(item) as CoinGecko));
            }

            lastEvaluatedKey = LastEvaluatedKey;
        } while (lastEvaluatedKey);

        return items;
    }
}