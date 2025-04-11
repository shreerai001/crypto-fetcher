import { lambdaHandler } from "../../src/handlers/fetchCryptoData";
import { FetchCryptoDataServiceImpl } from "../../src/service/impl/FetchCryptoDataServiceImpl";
import { APIGatewayProxyEvent } from "aws-lambda";

jest.mock("../../src/service/impl/FetchCryptoDataServiceImpl");

const mockFetchCryptoDataService = FetchCryptoDataServiceImpl as jest.MockedClass<typeof FetchCryptoDataServiceImpl>;

describe.skip("fetchCryptoData Lambda", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if coinId or lastUpdatedAt is missing", async () => {
        const event: APIGatewayProxyEvent = {
            queryStringParameters: null,
        } as any;

        const response = await lambdaHandler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({
            message: "Invalid parameters: coinId and lastUpdatedAt are required",
        });
    });

    it("should return 200 with crypto data", async () => {
        const event: APIGatewayProxyEvent = {
            queryStringParameters: {
                coinId: "bitcoin",
                lastUpdatedAt: "1744355016",
            },
        } as any;

        mockFetchCryptoDataService.prototype.getCryptoData = jest.fn().mockResolvedValue({
            coinId: "bitcoin",
            price: 130763.826875,
            lastUpdatedAt: 1744355016,
        });

        const response = await lambdaHandler(event);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            coinId: "bitcoin",
            price: 130763.826875,
            lastUpdatedAt: 1744355016,
        });
    });

    it("should return 500 if an error occurs", async () => {
        const event: APIGatewayProxyEvent = {
            queryStringParameters: {
                coinId: "bitcoin",
                lastUpdatedAt: "1744355016",
            },
        } as any;

        mockFetchCryptoDataService.prototype.getCryptoData = jest.fn().mockRejectedValue(new Error("Service error"));

        const response = await lambdaHandler(event);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({
            message: "Internal server error",
        });
    });
});