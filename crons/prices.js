const conn = require('../database/connection');
const MongoClient =   require('mongodb').MongoClient;
const objectId    =   require('mongodb').ObjectId;
const Binance = require('node-binance-api');
const binance = new Binance().options({});
const helper  = require('../helper/helper')
const axios  = require("axios");

module.exports = {
    price: () => {
        conn.then(async (db) => {
            let symbolsArray = await helper.getSymbols();
            console.log(symbolsArray)

            var coins = symbolsArray.map(el => el._id);
            for (let i = 0; i < coins.length; i++) {

                binance.prices(coins[i], (error, ticker) => {
                    if(error){

                        console.log('error ========================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error)
                        return true;
                    }
                    ticker = Object.entries(ticker);
                    ticker.forEach(([key, value]) => {

                        var result = coins.includes(key);

                        if (result == true || result == 'true') {
                            let insertedArray = {
                                symbol: key,
                                price: parseFloat(value),
                                created_date: new Date()
                            }
                            console.log('======================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',insertedArray)

                            let whereCoin = { symbol: key }
                            // console.log('where ================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', whereCoin)

                            db.collection('market_prices').updateOne(whereCoin, { $set: insertedArray }, { upsert: true }, (err, result) => {
                                if (err) {

                                    console.log(err)
                                } else {
                                    // console.log('upserted count: ======================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',result.upsertedCount)
                                    // console.log('modified count: ======================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',result. modifiedCount)
                                }
                            })
                        }//end if
                    });
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    },//End of price crone
}