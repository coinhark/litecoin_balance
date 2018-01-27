# Litecoin Balance

Litecoin Balance is a react-native app designed for iOS and Android.

## Getting started
This project requires a globals.js file to be in the root.  This file often contains private data so must be added on a per-project basis.  We provide a basic file to get your project building, however endpoints will need to be supplied:  

```javascript
'use strict'
import WAValidator from 'wallet-address-validator';
import { AsyncStorage } from 'react-native';

class GlobalConstants {

    constructor() {
        this.bitcoin = require('bitcoinjs-lib');

        // Edit this for cointype (Ex: ltc, etc)
        this.coin = 'ltc';

        this.donate = 'LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj'

        this.coinInfo = {
            "ltc": {
                "name": "Litecoin",
                "ticker": "LTC"
            }
        };

        this.marketApi = {
            "ltc": {
                "name": "CoinMarketCap-LTC",
                "url": 'https://api.getPriceByCoinTicker.example/'
            }
        };

        this.blockchainApi = {
            "ltc": {
                "name": "Coinhark-LTC",
                "url": 'https://apt.getLTCAddressBalance.example/address/'
            }
        };

        this.bareDb = {
            "balanceInfo": {
                "name": "Coinhark API",
                "date": "1318464000",
                "totalBalance": "0.00000000",
                "addresses": []
            },
            "exchange": {
                "price": 0.00,
                "date": "1318464000",
                "name": "CoinMarketCap API",
            }
        }

        // Until require can handle non-literal strings, we do this. =/
        this.assets = {
          "ltc": {
            "symbol": require("./assets/images/litecoin_symbol.png")
          }
        }

        /*
        Example db:
        {
            "balanceInfo": {
                "name": "chain.so/api",
                "date": "1513701489945",
                "totalBalance": "345.33420002",
                "addresses": [
                    {
                      "address":"LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj",
                      "inputAddress":"LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj",
                      "name":"Donations",
                      "totalBalance":"0.05769462",
                      "valueInDollars":"10.43"
                    },
                    {
                      "address":"LZM4ztEMzk9MY9ikC8jE52nTeBHhcL9viW",
                      "inputAddress":"LZM4ztEMzk9MY9ikC8jE52nTeBHhcL9viW",
                      "name":"Random Address",
                      "totalBalance":"5.9",
                      "valueInDollars":"1,067.02"
                    },
                    {
                      "address":"3CuMqrgosjygLtVA4oF7RTzRiUNKvRznkF",
                      "inputAddress":"MK7W9k6mprq79Pm4AgETF7Eq3AxmwahBCT",
                      "name":"Segwit Address Convert",
                      "totalBalance":0,
                      "valueInDollars":"0.00"
                    }
                ]
            },
            "exchange": {
                "price":"354.402",
                "name":"CoinMarketCap",
                "date":"1513701489945"
            }
        }
        */
    }

    // Edit this for cointype (Ex: Litecoin Balance, Bitcoin Balance, etc)
    static getAppName() {
        return "Litecoin Balance";
    }

    getCoinName() {
        return this.coinInfo[this.coin].name;
    }

    getCoinTicker() {
        return this.coinInfo[this.coin].ticker;
    }

    getMarketApi() {
        return this.marketApi[this.coin];
    }

    getBlockchainApi() {
        return this.blockchainApi[this.coin];
    }

    formatMarketApiResponse(json) {
      if(this.coin == 'ltc') {
        return json;
      } else {
        console.log("error: unknown coin: " + this.coin);
        return {};
      }
    }

    formatBlockchainApiResponse(json) {
      if(this.coin == 'ltc') {
        return json;
      } else {
        console.log("error: unknown coin: " + this.coin);
        return {};
      }
    }

    getAssets() {
        return this.assets[this.coin];
    }

    validateAddress(address, component) {
      if(this.coin == 'ltc') {
        let validationAddress = component.state.address;
        if (validationAddress.startsWith('3')) {
            const decoded = this.bitcoin.address.fromBase58Check(validationAddress);
            let version = decoded.version;
            if (version === 5) {
                version = 50;
            }
            address.inputAddress = this.bitcoin.address.toBase58Check(decoded['hash'], version);
        }
        if (validationAddress.startsWith('M')) {
            const decoded = this.bitcoin.address.fromBase58Check(validationAddress);
            let version = decoded.version;
            if (version === 50) {
                version = 5;
            }
            validationAddress = this.bitcoin.address.toBase58Check(decoded['hash'], version);
        }
        let valid = WAValidator.validate(validationAddress, this.getCoinName().toLowerCase());
        if (valid) {
            let tmpDb = component.state.db;
            tmpDb.balanceInfo.addresses.push(address);
            component.setState({db: tmpDb});
            AsyncStorage.setItem("db", JSON.stringify(component.state.db));
            component.props.navigation.navigate('ManageAddresses');
        } else {
            component.setState({invalidAddress: true});
        }
    } else {
      console.log("error: unknown coin: " + this.coin);
    }
  }
}

export default GlobalConstants;

```

## How to run with Android Studio
Simply open the android project found in litecoin_balance/android

## How to run with Linux (Ubuntu tested)

```bash
npm install
npm run run-android-linux
```
For some reason, I sometimes have to run ```npm run run-android-linux``` twice

Also, on occasion I will get an error of "Error: Watchman error: A non-recoverable condition has triggered.  Watchman needs your help!"

In that case I just run:

```bash
./scripts/reset_watchman.sh
```


## How to run with mac
Coming soon

## Purpose
The app is meant to simply aggregate the balances of LTC addresses, but is designed to be flexible for any cryptocurrency.

## To Do

A list of additions and improvements:

* [x] Add README.md
* [ ] Use BigDecimal library and handle decimal precision issues better
* [ ] Correct bug where app crashes when invalid address is entered
* [ ] display market price on main view
* [ ] add different fiat prices
* [ ] add locale feature for different target languages
* [ ] add option to manually enter balance apart from a specific address
