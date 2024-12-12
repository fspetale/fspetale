import { WebSocket } from 'ws';

export type Status = "OK" | "Error";

export type Entry =
    "BI" /*BIDS: Mejor oferta de compra en el Book*/ |
    "OF" /*OFFERS: Mejor oferta de venta en el Book*/ |
    "LA" /*LAST: Último precio operado en el mercado*/ |
    "OP" /*OPENING PRICE: Precio de apertura*/ |
    "CL" /*CLOSING PRICE: Precio de cierre de la rueda de negociación anterior*/ |
    "SE" /*SETTLEMENT PRICE: Precio de ajuste (solo para futuros)*/ |
    "HI" /*TRADING SESSION HIGH PRICE: Precio máximo de la rueda*/ |
    "LO" /*TRADING SESSION LOW PRICE: Precio mínimo de la rueda*/ |
    "TV" /*TRADE VOLUME: Volumen operado en contratos/nominales para ese security*/ |
    "OI" /*OPEN INTEREST: Interés abierto (solo para futuros)*/ |
    "IV" /*INDEX VALUE: Valor del índice (solo para índices)*/ |
    "EV" /*TRADE EFFECTIVE VOLUME: Volumen efectivo de negociación para ese security*/ |
    "NV" /*NOMINAL VOLUME: Volumen nominal de negociación para ese security*/ |
    "ACP" /*AUCTION PRICE: Precio de cierre del día corriente*/

export interface Account {
    id: number;
    name: string;
    brokerId: number;
    status: boolean;
}

export interface AccountsResponse extends RofexResponse {
    accounts: Account[];
}

export interface Segment {
    marketSegmentId: string;
    marketId: string;
}

export interface SegmentsResponse extends RofexResponse {
    segments: Segment[];
}

export interface InstrumentId {
    marketId: string;
    symbol: string;
}

export interface Instrument {
    instrumentId: InstrumentId;
    cficode: string;
    symbol?: string | null;
    segment?: Segment;
    lowLimitPrice?: number;
    highLimitPrice?: number;
    minPriceIncrement?: number;
    minTradeVol?: number;
    maxTradeVol?: number;
    tickSize?: number;
    contractMultiplier?: number;
    roundLot?: number;
    priceConvertionFactor?: number;
    maturityDate?: number;
    currency?: string;
    orderTypes?: string | null;
    timesInForce?: number | null;
    securityType?: string | null;
    settlType?: string | null;
    instrumentPricePrecision?: number;
    instrumentSizePrecision?: number;
}

export interface InstrumentsResponse extends RofexResponse {
    instruments: Instrument[];
}

// Define the structure of a single market data entry
interface MarketDataEntry {
    price: number;
    size: number;
    date: number;
}

// Dynamically create the MarketData interface based on Entry
type MarketData = {
    [K in Entry]?: MarketDataEntry | null;
}

interface MarketWSMessage {
    type: string;
    timestamp: number;
    instrumentId: InstrumentId;
    marketData: MarketData;
}

export interface MarketDataResponse extends RofexResponse {
    marketData: MarketData;
    depth: number;
    aggregated: boolean;
}

export interface Trade {
    price: Number;
    size: number;
    datetime: string
    servertime: Number
    symbol: String
}

export interface TradeResponse extends RofexResponse {
    symbol: string;
    market: string;
    trades: Trade[];
}

export interface OrderStatus {
    orderId: string;
    clOrdId: string;
    proprietary: string;
    execId: string;
    accountId: {
        id: string;
    };
    instrumentId: InstrumentId;
    price: number;
    orderQty: number;
    ordType: string;
    side: string;
    timeInForce: number;
    transactTime: Date;
    avgPx: number;
    lastPx: number;
    lastQty: number;
    cumQty: number;
    leavesQty: number;
    status: string;
    tex: string;
}

export interface OrderStatusResponse extends RofexResponse {
    order: OrderStatus;
}

export interface OrderAllStatusResponse extends RofexResponse {
    orders: OrderStatus[];
}

export interface NewOrderResponse extends RofexResponse {
    order: {
        clientId: string;
        proprietary: string;
    };
}

export interface CancelOrderResponse extends RofexResponse {
    order: {
        orderId: string;
        proprietary: string;
    };
}

export interface RofexResponse {
    status: Status;
}

export interface ErrorResponse extends RofexResponse {
    detail: string;
}

export default class RofexClient {
    constructor(user: string, password: string, baseURL: string | null | undefined);

    private _user: string;
    private _password: string;
    private _authenticated: boolean;
    private _accessToken: string;
    private _baseURL: string;
    private _wssURL: string;
    private _ws: WebSocket | null;
    accounts: Account[]; // Define your accounts structure here

    private _login(): Promise<ErrorResponse | { status: "OK" }>;

    private _queryGet(url: string): Promise<any>;

    connectWS(): Promise<WebSocket>;

    private _waitForWebSocketConnect(timeout: number): Promise<void>;

    wsSend(data: BufferLike, timeout: number): Promise<void>;

    getAccounts(): Promise<AccountsResponse>;

    getSegments(): Promise<any>; // Define your segment response structure here

    getInstruments(): Promise<InstrumentsResponse>;

    getDetailedInstruments(): Promise<any>; // Define your detailed instruments response structure here

    getMarketData(marketId: string, symbol: string, entries: Set<Entry>, depth: number): Promise<MarketDataResponse>;

    getTradeHistory(marketId: string, symbol: string, dateQuery: string, dateFrom: string, dateTo: string): Promise<TradeResponse>;

    getOrderStatus(orderId: string, proprietary: string): Promise<OrderStatusResponse>;

    getAllOrdersStatus(accountId: string): Promise<OrderAllStatusResponse>;

    newOrder(symbol: string, side: string, quantity: number, price: number, orderType: string, timeInForce: string, iceberg: boolean, expireDate: string | null, displayQuantity: number | null, account: string, cancelPrev: boolean): Promise<NewOrderResponse>;

    cancelOrder(orderId: string, proprietary: string): Promise<CancelOrderResponse>;

    subscribeMarketdata(instrumentsIds: InstrumentId[], entries: Set<Entry>, level: number, depth: number): Promise<WebSocket>;
}
