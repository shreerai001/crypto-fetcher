export const COIN_GECKO_BASE_URL = "https://api.coingecko.com/api/v3";
export const COIN_GECKO_SIMPLE_PRICE_ENDPOINT = "/simple/price";
export const COIN_GECKO_REQUIRED_HEADERS = {
    ACCEPT: "accept",
    API_KEY_HEADER: "x-cg-demo-api-key",
};

export const DYNAMO_DB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "CryptoPrices";