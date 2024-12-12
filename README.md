---
# Documentación jsRofex
---

## Descripción general

jsRofex es un paquete de Javascript que permite interacciones con las API Rest de Matba Rofex.

El paquete está diseñado para facilitar a los desarrolladores la conexión con las API de Matba Rofex y que su objetivo sea la programación de las operaciones a realizar.

Se recomienda leer la documentación oficial de la API para familiarizarse con las respuestas y la funcionalidad de la API.

## Instalación

`npm i https://github.com/matbarofex/jsRofex`

## Credenciales API

Para utilizar el paquete se debe tener credenciales de autenticación correctas para el entorno.

Para obtener nuevas credenciales:

Remarket: alta en [Remarket](https://remarkets.primary.ventures/index.html)

Production: contacte al equipo de MPI (Market and Platform Integration, correo: <mpi@primary.com.ar>)

## Características

Esta sección describe la funcionalidad y los componentes del paquete para realizar solicitudes a la API REST y devolver la respuesta correspondiente.

Nota: Antes de comenzar a usar el paquete se debe inicializar el entorno con el que desea conectarse.

## Métodos disponibles

Todos los métodos retornan un diccionario de la respuesta `JSON`.

- get_accounts:  obtiene las cuentas asociadas a un usuario.
- get_instruments:  obtiene una lista de los Segmentos disponibles o una lista con todos los instrumentos disponibles para negociarse en Matba Rofex.
- get_market_data: obtiene los datos del mercado en tiempo real.
- send_order: envía una nueva orden al mercado.
- cancel_order: cancela una orden.
- get_order_status: obtiene el estado de una orden especifica.
- get_all_orders_status:  obtiene el estado de las ordenes para una cuenta especifica.

## Modo de uso

La inicialización se realizar con usuario, password y ambiente. El cliente authentica automaticamente si es necesario en cada llamada.

Si la autenticación falla, la propiedad status del callback será “ERROR”.

```
```javascript
import jsRofex from "rofexjs";

const fes = new jsRofex("fes2019", "xxyyzz", env.NODE_ENV === 'production');

```
1. Obtiene las cuentas asociadas a mi usuario
```
async function getAccounts() {
    const dataGet = await fes.get_accounts();
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getAccounts();

{"status":"OK","accounts":[{"id":4500,"name":"FAB2019","brokerId":1,"status":true}]}
```

2. Obtiene los segmentos disponibles
```
async function getSegments() {
    const dataGet = await fes.get_segments();
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getSegments();

{“status":"OK","segments":[{"marketSegmentId":"DDA","marketId":"ROFX"},{"marketSegmentId":"DDF","marketId":"ROFX"},{"marketSegmentId":"DUAL","marketId":"ROFX"},{"marketSegmentId":"TEST","marketId":"ROFX"},{"marketSegmentId":"MAE","marketId":"ROFX"},{"marketSegmentId":"MERV","marketId":"ROFX"},{"marketSegmentId":"MVR","marketId":"ROFX"},{"marketSegmentId":"MVC","marketId":"ROFX"},{"marketSegmentId":"MATBA","marketId":"ROFX"},{"marketSegmentId":"PTPExt","marketId":"ROFX"},{"marketSegmentId":"RFXI","marketId":"ROFX"},{"marketSegmentId":"UFEX","marketId":"ROFX"}]}
```

3. Obtiene la lista de instrumentos disponibles
```
async function getInstruments() {
    const dataGet = await fes.get_instruments();
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getInstruments();

{"status":"OK","instruments":[{"instrumentId":{"marketId":"ROFX","symbol":"SOJ.ROSMay20M"},"cficode":"FXXXSX"},{"instrumentId":{"marketId":"ROFX","symbol":"SOJ.ROSMay20 290c"},"cficode":"OCAFXS"},{"instrumentId":{"marketId":"ROFX","symbol":"TRI.ROS 12/01 19"},"cficode":"FXXXXX"},{"instrumentId":{"marketId":"ROFX","symbol":"MAI.ROSDic19 170c"},"cficode":"OCAFXS"},{"instrumentId":{"marketId":"ROFX","symbol":"SOJ.ROSEne20 205p"},"cficode":"OPAFXS"},{"instrumentId":{"marketId":"ROFX","symbol":"TRI.MINJul20"}, "cficode":"FXXXSX"},…]}
```

4. Obtiene la lista detallada de los instrumentos disponibles
```
async function getDetailedInstruments() {
    const dataGet = await fes.get_detailed_instruments();
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getDetailedInstruments();


{"status":"OK", … , "instrumentId":{"marketId":"ROFX","symbol":"MERV - XMEV - A2E2 – 24hs"}},{"symbol":null,"segment":  {"marketSegmentId":"DDA","marketId":"ROFX"}, "lowLimitPrice":0.0, "highLimitPrice":1000000.0,"minPriceIncrement":0.100000, "minTradeVol":1.000000,"maxTradeVol":10.000000,"tickSize":1.000000,"contractMultiplier":100.000000,"roundLot":1.000000,"priceConvertionFactor":1.000000,"maturityDate":"20200323","currency":"USD","orderTypes":null,"timesInForce":null,"securityType":null,"settlType":null,"instrumentPricePrecision":1,"instrumentSizePrecision":0,"cficode":"FXXXSX","instrumentId":{"marketId":"ROFX", "symbol":"SOJ.ROSMar20"}}]}
```

5. Obtiene los datos del mercado en tiempo real
```
async function getMarketData() {
    const dataGet = await fes.get_market_data("ROFX", "RFX20Dic19", ["BI", "OF", "LA"], 1);
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getMarketData();


{"status":"OK","marketData":{"LA":{"price":45465,"size":1,"date":1571491925262},"OF":[{"price":45730,"size":1}],"BI":[{"price":45465,"size":4}]},"depth":1,"aggregated":true}
```

6. Obtiene las operaciones históricas para un instrumento dado
```
async function getTradeHistory() {
    const dataGet = await fes.get_trade_history("ROFX", "RFX20Dic19", "2018-10-04");
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getTradeHistory();

{"status":"OK","symbol":"RFX20Dic19","market":"ROFX","trades":[]}
```

7. Enviar una nueva orden al mercado
```
async function sendOrder() {
    const dataGet = await fes.new_order("RFX20Dic19", "Buy", 1, 47000.0, "Limit", "Day", false, null, null, "FAB2019", false);
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

sendOrder();

{"status":"OK","order":{"clientId":"310059219481980","proprietary":"PBCP"}}
```

8. Obtiene el estado de una orden especifica
```
async function getOrderStatus() {
    const dataGet = await fes.get_order_status("310059219481980", "PBCP");
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getOrderStatus();

{"status":"OK","order":{"orderId":"138874950","clOrdId":"310059219481980","proprietary":"PBCP","execId":"T4890257","accountId":{"id":"FAB2019"}, "instrumentId":{"marketId":"ROFX","symbol":"RFX20Dic19"},"price":47000,"orderQty":1,"ordType":"LIMIT", "side":"BUY", "timeInForce":"DAY","transactTime":"20191019-12:33:39.289-0300","avgPx":45730.000, "lastPx":45730, "lastQty":1,"cumQty":1,"leavesQty":0,"status":"NEW","text":"Aceptada"}}
```

9. Obtiene el estado de las ordenes para una cuenta especifica
```
async function getAllOrdersStatus() {
    const dataGet = await fes.get_all_orders_status("FAB2019");
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

getAllOrdersStatus();

{"status":"OK","orders":[{"orderId":"138874950","clOrdId":"310059219481980","proprietary":"PBCP","execId":"T4890257","accountId":{"id":"FAB2019"}, "instrumentId":{"marketId":"ROFX","symbol":"RFX20Dic19"}, "price":47000,"orderQty":1,"ordType":"LIMIT", "side":"BUY","timeInForce":"DAY","transactTime":"20191019-12:33:39.289-0300","avgPx":0,"lastPx":0,"lastQty":0,"cumQty":0, "leavesQty":1,"status":"NEW","text":"Aceptada"}]}
```

10. Cancelar una orden especifica
```
async function cancelOrder() {
    const dataGet = await fes.cancel_order("310059219481980", "PBCP");
    if (dataGet.status === "OK") {
        console.log(dataGet);
    } else {
        console.log("Error:");
        console.log(dataGet);
    }
}

{"status":"OK","order":{"clientId":"310060290499141","proprietary":"PBCP"}}
```

11. Conectarse por Web Socket
```
async function SubscribeMarketData(){

    const simbolosProd = [
        { symbol: "DOJun21", marketId: "ROFX" },
        { symbol: "DODic21", marketId: "ROFX" }
    ];

    const entries = ["BI", "OF", "LA", "IV", "NV", "OI"]

    const level = 1;
    const depth = 10;

    socketRofex = fes.connectWS();
    socketRofex.on('message', function(data) {
        try {
            const parsedData = JSON.parse(data);
            console.log("socketRofex on message", parsedData);
        } catch (error) {
            console.error(error);
        }
    });

    fes.subcribeMarketData(simbolosProd,entries, level, depth )
}
```

## Agradecimientos

El desarrollo de este software fue impulsado por [Primary](https://www.primary.com.ar/) como parte de una iniciativa de Código Abierto de [Matba Rofex](https://www.rofex.com.ar/).

TypeScript Version for [@pablodgonzalez](https://github.com/pablodgonzalez)

