const axios = require('axios');
const WebSocket = require('ws');


class RofexClient {
    /**
     * Initializes jsRofex instance.
     * @param {string} user - User's username.
     * @param {string} password - User's password.
     * @param {boolean} prod - Indicates whether to use production environment.
     */
    constructor(user, password, baseURL) {
        this._user = user;
        this._password = password;
        this._authenticated = false;
        this._accessToken = "";
        this._domain = baseURL ? baseURL : process.env.BASE_URL;
        this._baseURL = `https://${this._domain}`;
        this._wssURL = `wss://${this._domain}`;
        this._wsClient = null;
        this.accounts = {};
    }

    /**
     * Authenticates user and retrieves access token.
     * @returns {Object} - { status: "OK" } on success, { status: "Error", detail: error message } on failure.
     */
    async _login() {
        const url = `${this._baseURL}/auth/getToken`;
        try {
            const response = await axios.post(url, null, {
                headers: {
                    "X-Username": this._user,
                    "X-Password": this._password
                }
            });

            if (response.status === 200) {
                this._accessToken = response.headers['x-auth-token'];
                this._authenticated = true;
                return { status: "OK" };
            } else {
                return { status: "Error", detail: response.statusText };
            }
        } catch (error) {
            return { status: "Error", detail: error.message };
        }
    }

    /**
     * Performs a GET request with access token.
     * @param {string} url - URL for the GET request.
     * @returns {Object|string} - Parsed JSON response or error details.
     */
    async _queryGet(url) {
        try {
            if (!this._authenticated) {
                const auth = await this._login();
                if (auth.status !== "OK") return auth;
            }

            const response = await axios.get(url, {
                headers: {
                    "X-Auth-Token": this._accessToken
                }
            });

            if (response.status === 200) {
                if (typeof response.data === 'string') {
                    if (response.data.indexOf("j_spring_security_check") > 0) {
                        this._authenticated = false;
                        return { status: "Error", detail: "Authentication failed." };
                    }
                    return JSON.parse(response.data);
                }
                return response.data;
            } else {
                return { status: "Error", detail: "The query returned an unexpected result." };
            }
        } catch (error) {
            return { status: "Error", detail: error.message };
        }
    }

    /**
     * Connect and authenticate a the web socket client
     * @returns {WebSocket|null} - A websocket instance authenticated or null if could't connect
     */
    async connectWS(timeout = 5000) {
        const wsURL = this._wssURL;

        if (this._wsClient && this._wsClient.readyState !== this._wsClient.CLOSED) {
            return this._wsClient
        }

        if (!this._authenticated) {
            const auth = await this._login();
            if (auth.status !== "OK") {
                throw auth;
            };
        }

        try {
            this._wsClient = new WebSocket(wsURL, {
                headers: {
                    'x-auth-token': this._accessToken
                },
                handshakeTimeout: timeout
            });

            this._wsClient.on('open', () => {
                console.log('WebSocket connection opened.');
            });

            this._wsClient.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            this._wsClient.on('close', (code, reason) => {
                console.log('WebSocket connection closed:', code, reason.toString());
            });

            return this._wsClient;
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            throw error;
        }
    }

    async _waitForWebSocketConnect(timeout) {
        // If the WebSocket is already open, resolve immediately
        if (this._wsClient.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        // If the WebSocket is already closed or closing, reject immediately
        if (this._wsClient.readyState === WebSocket.CLOSED || this._wsClient.readyState === WebSocket.CLOSING) {
            return Promise.reject(new Error('WebSocket is closed or closing.'));
        }

        return new Promise((resolve, reject) => {
            // Create a timeout promise that rejects after the specified time
            const timeoutId = setTimeout(() => {
                reject(new Error('WebSocket connection timed out'));
            }, timeout);

            this._wsClient.once('open', () => {
                clearTimeout(timeoutId); // Clear the timeout if the connection is successful
                resolve();
            });

            this._wsClient.once('error', (err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
        });
    }

    async wsSend(message, timeout = 5000) {
        await this.connectWS(timeout);
        await this._waitForWebSocketConnect(timeout);
        await this._wsClient.send(message);
    }

    /**
     * Retrieves accounts associated with the authenticated user.
     * @returns {Object} - Response object containing accounts or error details.
     */
    async getAccounts() {
        const url = `${this._baseURL}/rest/accounts`;
        const data = await this._queryGet(url);
        if (data.status === "OK") {
            this.accounts = data.accounts
        }
        return data;
    }

    /**
     * Retrieves available segments.
     * @returns {Object} - Response object containing segments or error details.
     */
    async getSegments() {
        const url = `${this._baseURL}/rest/segment/all`;
        return await this._queryGet(url);
    }

    /**
     * Retrieves all available instruments.
     * @returns {Object} - Response object containing instruments or error details.
     */
    async getInstruments() {
        const url = `${this._baseURL}/rest/instruments/all`;
        return await this._queryGet(url);
    }

    /**
     * Retrieves detailed information about available instruments.
     * @returns {Object} - Response object containing detailed instruments or error details.
     */
    async getDetailedInstruments() {
        const url = `${this._baseURL}/rest/instruments/details`;
        return await this._queryGet(url);
    }

    /**
     * Retrieves market data for a specific symbol.
     * @param {string} marketId - Market ID.
     * @param {string} symbol - Symbol to retrieve market data for.
     * @param {Array} entries - Array of entries to retrieve (e.g., ["BI", "OF", "LA"]).
     * @param {number} depth - Depth of market data to retrieve.
     * @returns {Object} - Response object containing market data or error details.
     */
    async getMarketData(marketId = "ROFX", symbol, entries = [], depth = 1) {
        const url = `${this._baseURL}/rest/marketdata/get?marketId=${marketId}&symbol=${symbol}&entries=${Array.from(entries).join()}&depth=${depth}`;
        return await this._queryGet(url);
    }

    /**
     * Retrieves trade history for a specific symbol.
     * @param {string} marketId - Market ID.
     * @param {string} symbol - Symbol to retrieve trade history for.
     * @param {string} dateQuery - Specific date to query (YYYY-MM-DD format).
     * @param {string} dateFrom - Start date for range query (YYYY-MM-DD format).
     * @param {string} dateTo - End date for range query (YYYY-MM-DD format).
     * @returns {Object} - Response object containing trade history or error details.
     */
    async getTradeHistory(marketId = "ROFX", symbol, dateQuery = "", dateFrom = "", dateTo = "") {
        let url = `${this._baseURL}/rest/data/getTrades?marketId=${marketId}&symbol=${symbol}`;

        if (dateQuery === "") {
            url += `&dateFrom=${dateFrom}&dateTo=${dateTo}`;
        } else {
            url += `&date=${dateQuery}`;
        }

        return await this._queryGet(url);
    }

    /**
     * Retrieves status of a specific order.
     * @param {string} orderId - Order ID (clOrdId).
     * @param {string} proprietary - Proprietary ID.
     * @returns {Object} - Response object containing order status or error details.
     */
    async getOrderStatus(orderId = "", proprietary = "") {
        const url = `${this._baseURL}/rest/order/id?clOrdId=${orderId}&proprietary=${proprietary}`;
        return await this._queryGet(url);
    }

    /**
     * Retrieves status of all orders for a specific account.
     * @param {string} accountId - Account ID.
     * @returns {Object} - Response object containing orders status or error details.
     */
    async getAllOrdersStatus(accountId = "") {
        const url = `${this._baseURL}/rest/order/actives?accountId=${accountId}`;
        return await this._queryGet(url);
    }

    /**
     * Places a new order.
     * @param {string} symbol - Symbol to place order for.
     * @param {string} side - Order side ("Buy" or "Sell").
     * @param {number} quantity - Order quantity.
     * @param {number} price - Order price.
     * @param {string} orderType - Type of order ("Limit", "Market", etc.).
     * @param {string} timeInForce - Time in force for order ("Day", "GTC", etc.).
     * @param {boolean} iceberg - Indicates if order is iceberg.
     * @param {string|null} expireDate - Expiration date for order.
     * @param {number|null} displayQuantity - Display quantity for iceberg order.
     * @param {string} account - Account ID for order.
     * @param {boolean} cancelPrev - Indicates if previous orders should be canceled.
     * @returns {Object} - Response object containing order details or error details.
     */
    async newOrder(symbol = "", side = "", quantity = 0, price = 0.0, orderType = "Limit", timeInForce = "Day", iceberg = false, expireDate = null, displayQuantity = null, account = "", cancelPrev = false) {
        const marketId = "ROFX";
        let url = `${this._baseURL}/rest/order/newSingleOrder?marketId=${marketId}&symbol=${symbol}&side=${side}&orderQty=${quantity}&price=${price}&ordType=${orderType}&timeInForce=${timeInForce}&expireDate=${expireDate}&account=${account}`;

        if (iceberg) url += `&iceberg=true&displayQty=${displayQuantity}`;
        if (cancelPrev) url += "&cancelPrevious=true";

        return await this._queryGet(url);
    }

    /**
     * Cancels a specific order.
     * @param {string} orderId - Order ID (clOrdId).
     * @param {string} proprietary - Proprietary ID.
     * @returns {Object} - Response object confirming order cancellation or error details.
     */
    async cancelOrder(orderId = "", proprietary = "") {
        const url = `${this._baseURL}/rest/order/cancelById?clOrdId=${orderId}&proprietary=${proprietary}`;
        return await this._queryGet(url);
    }

    async subscribeMarketdata(instrumentIds = [], entries = [], level = 1, depth = 1) {

        const maxBlockSize = 1000;
        for (let i = 0; i < instrumentIds.length; i += maxBlockSize) {
            const block = instrumentIds.slice(i, i + maxBlockSize);
            const subscription = {
                type: "smd",
                level, // level 1 de info para el libro de ordenes
                entries: Array.from(entries),
                products: block.map((instrumentId) => ({
                    symbol: instrumentId.symbol,
                    marketId: instrumentId.marketId
                })),
                depth //el mejor precio de compra y venta, a diferencia de los primeros 10
            };

            this.wsSend(JSON.stringify(subscription))
        }
    }
}

module.exports = RofexClient;
