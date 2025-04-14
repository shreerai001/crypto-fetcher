import {APIGatewayProxyEvent} from "aws-lambda";
import {CoinGeckoRequest} from "../../model/CoinGeckoRequest";

export class CoinGeckoMapper {

    private constructor() {
        // enforces non object creation as all the methods are supposed to static
    }

    public static toCoinGecko(event: Readonly<APIGatewayProxyEvent>): CoinGeckoRequest {
        const body = event.body ? JSON.parse(event.body) : null;
    
        if (!body || !body.ids || !body.vs_currencies) {
            throw new Error(
                "Invalid request body. Required fields: ids, vs_currencies"
            );
        }
    
        return {
            ids: body.ids,
            vs_currencies: body.vs_currencies,
            include_market_cap: body.include_market_cap || false,
            include_24hr_vol: body.include_24hr_vol || false,
            include_24hr_change: body.include_24hr_change || false,
            include_last_updated_at: body.include_last_updated_at || false,
            precision: body.precision || undefined,
        };
    }

    public static toQueryParams(request: Readonly<CoinGeckoRequest>): Record<string, any> {
        const queryParams: Record<string, any> = {
            ids: request.ids,
            vs_currencies: request.vs_currencies,
        };

        if (request.include_market_cap) {
            queryParams.include_market_cap = request.include_market_cap;
        }
        if (request.include_24hr_vol) {
            queryParams.include_24hr_vol = request.include_24hr_vol;
        }
        if (request.include_24hr_change) {
            queryParams.include_24hr_change = request.include_24hr_change;
        }
        if (request.include_last_updated_at) {
            queryParams.include_last_updated_at = request.include_last_updated_at;
        }
        if (request.precision) {
            queryParams.precision = request.precision;
        }

        return queryParams;
    }
}
