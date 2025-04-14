import {CryptoRepository} from "../../src/repository/CryptoRepository";
import {SecretsManagerUtil} from "../../src/utils/SecretsManagerUtil";
import {CoinGeckoApiUtil} from "../../src/utils/CoinGeckoApiUtil";
import {PersistCryptoDataServiceImpl} from "../../src/service/impl/PersistCryptoDataServiceImpl";
import {CoinGeckoRequest} from "../../src/model/CoinGeckoRequest"; 

jest.mock("../../src/utils/SecretsManagerUtil");
jest.mock("../../src/utils/CoinGeckoApiUtil");
jest.mock("../../src/repository/CryptoRepository", () => {
    return {
        CryptoRepository: jest.fn().mockImplementation(() => ({
            saveRecord: jest.fn(),
            getRecord: jest.fn(),
        })),
    };
});

describe("PersistCryptoDataServiceImpl", () => {
    let mockCryptoRepository: jest.Mocked<CryptoRepository>;
    let service: PersistCryptoDataServiceImpl;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCryptoRepository = {
            saveRecord: jest.fn(),
            getRecord: jest.fn(),
        } as jest.Mocked<CryptoRepository>;

        service = new PersistCryptoDataServiceImpl(mockCryptoRepository);

        SecretsManagerUtil.getSecret = jest.fn();
        CoinGeckoApiUtil.fetchCryptoData = jest.fn();
    });

    it("should fetch the API key from Secrets Manager and save data with all optional fields", async () => {
        const coinGeckoRequest: CoinGeckoRequest = {
            ids: "bitcoin",
            vs_currencies: "usd"
        };

        (SecretsManagerUtil.getSecret as jest.Mock).mockResolvedValue("test-api-key");

        // Mock CoinGeckoApiUtil to return test data
        (CoinGeckoApiUtil.fetchCryptoData as jest.Mock).mockResolvedValue({
            bitcoin: {
                usd: 81051.257062,
                usd_market_cap: 1609032519339.491,
                usd_24h_vol: 37643233809.619064,
                usd_24h_change: -1.4187994008920533,
                last_updated_at: 1744352182,
            },
        });

        // Act
        await service.saveCryptoData(coinGeckoRequest);

        // Assert
        expect(SecretsManagerUtil.getSecret).toHaveBeenCalledWith("coingecko_api");
        expect(CoinGeckoApiUtil.fetchCryptoData).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.objectContaining({
                "x-cg-demo-api-key": "test-api-key",
            })
        );
        expect(mockCryptoRepository.saveRecord).toHaveBeenCalledWith({
            ids: "bitcoin",
            currency: "usd",
            price: 81051.257062,
            marketCap: 1609032519339.491,
            volume24h: 37643233809.619064,
            change24h: -1.4187994008920533,
            lastUpdatedAt: 1744352182,
        });
    });

    it("should throw an error if the API key cannot be retrieved", async () => {
        (SecretsManagerUtil.getSecret as jest.Mock).mockRejectedValue(new Error("Secret not found"));
    
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
        await expect(
            service.saveCryptoData({ ids: "bitcoin", vs_currencies: "usd" })
        ).rejects.toThrow("Failed to fetch and save crypto data");
    
        consoleErrorSpy.mockRestore();
    });

    it("should throw an error if the API key cannot be retrieved", async () => {
        (SecretsManagerUtil.getSecret as jest.Mock).mockRejectedValue(new Error("Secret not found"));

        await expect(
            service.saveCryptoData({ ids: "bitcoin", vs_currencies: "usd" })
        ).rejects.toThrow("Failed to fetch and save crypto data");
    });

    it("should throw an error if the API response is invalid", async () => {
        const coinGeckoRequest: CoinGeckoRequest = {
            ids: "bitcoin",
            vs_currencies: "usd"
        };

        (SecretsManagerUtil.getSecret as jest.Mock).mockResolvedValue("test-api-key");

        (CoinGeckoApiUtil.fetchCryptoData as jest.Mock).mockResolvedValue({});

        await expect(service.saveCryptoData(coinGeckoRequest)).rejects.toThrow(
            "No data found for coinId: bitcoin"
        );
    });
});