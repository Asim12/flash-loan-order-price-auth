const conn = require('../database/connection');
const MongoClient =   require('mongodb').MongoClient;
const objectId    =   require('mongodb').ObjectId;
const { IoTJobsDataPlane } = require("aws-sdk");
const md5    =  require('md5-nodejs');

module.exports = { 
    checkIsThisAlreadyExists : (email) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                let count = await db.collection('users').countDocuments({email : (email.toLowerCase()).trim() });

                if(count > 0){

                    resolve(true)
                }else{
                    resolve(false)
                }
            })
        })
    },//end helper


    makeUserLogin : (email, password ) => {
        return new Promise(resolve => {
            conn.then(async(db) => {
                let loginQuery = [
                    {
                        '$match' : {
                            email      :  (email.toLowerCase()).trim(),   
                            password   :  md5(password), 
                            role       :  "user"
                        }
                    },
                    {
                        '$project' : {
                            _id           :   {'$toString' : '$_id'},
                            email         :   '$email',
                            full_name     :   '$full_name',
                            profile_image :   '$profile_image',
                            created_date  :   '$created_date',
                            exhange       :   '$exchange',
                            trading_mode  :   '$trading_mode'  //manual / auto
                            
                        }
                    },
                    {
                        '$lookup' : {
                            'from' : 'user_wallet',
                            'let' : {
                                'user_id' :  { '$toString' : '$_id'},
                            },
                            'pipeline' : [
                                {
                                '$match' : {
                                    '$expr' : {
                                        '$eq' : [
                                                '$user_id',
                                                '$$user_id'
                                            ]
                                        },
                                    },
                                },
                                
                                {
                                '$project' : {
                                        '_id'                :  {'$toString' : '$_id'},
                                        'wallet_address'     :  '$wallet_address',
                                       
                                    }
                                }
                            ],
                            'as' : 'wallets'
                        }
                    },
                ]
                let userData = await db.collection('users').aggregate(loginQuery).toArray(); 
                resolve(userData);
            })
        })
    },


    findLocation : () =>{
        return new Promise(async(resolve, reject) => {
            let ip = await publicIp.v4();                            
            var options = {method: 'GET', url: 'http://ipinfo.io/'+ip+'/json'};
            axios.request(options).then(function (response) {
                resolve(response.data.country);
            }).catch(function (error) {
                console.error(error);
            });
        })
    },


    saveUser : (insertObject) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                db.collection('users').insertOne(insertObject);
                resolve(true)
            })
        })
    },


    getSymbols: () => {
        return new Promise(resolve => {
            conn.then(async (db) => {
                let lookup = [
                    {
                        '$group' : {
                            _id       : '$symbol',  
                            coin_name : {'$first' : '$coin_name'}
                        }
                    }
                ]
                let coins = await db.collection('coins').aggregate(lookup).toArray()
                resolve(coins)
                
            })
        })
    },//end getSymbols


    saveOrder : (orderObject) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                let id = await db.collection('orders').insertOne(orderObject);
                resolve(id.insertedId  )
            })
        })
    },


    makeTheEndTime : (convertionType, value) => {
        return new Promise(resolve => {

            let created_date  =  new Date();
            if(convertionType == 'm'){

                var endTime1 = created_date.setMinutes(created_date.getMinutes() + value );
                let endTime  = new Date(endTime1);
                resolve(endTime);
            }else if(convertionType == 'h'){

                var endTime1 = created_date.setHours(created_date.getHours() + value)
                let endTime = new Date(endTime1);
                resolve(endTime);
            }else if(convertionType == 'd'){

                var endTime1 = created_date.setDate(created_date.getDate() + value);
                let endTime  = new Date(endTime1);
                resolve(endTime);
            }else if(convertionType == 'w'){ //week
                
                var endTime1 = created_date.setDate(created_date.getDate() + (value * 7))
                let endTime = new Date(endTime1);
                resolve(endTime);
            }else{
                resolve(false);
            }
        })
    },

    saveWallet : (walletObject, collectionName) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                db.collection(collectionName).insertOne(walletObject);
                resolve(true);
            })
        })
    },


    getUserWallets : (user_id) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                let data = await db.collection('user_wallet').find({user_id : user_id}).sort({created_date : -1}).toArray();
                resolve(data);
            })
        })
    },


    getOrderDetails : (order_id) => {
        return new Promise (resolve => {
            conn.then(async(db) => {

                let orderDetails = await db.collection('orders').find({_id : new objectId(order_id), status : "new"}).toArray()
                resolve(orderDetails);
            })
        })
    },


    saveData : (walletObject, collectionName) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                db.collection(collectionName).insertOne(walletObject);
                resolve(true);
            })
        })
    },


    checkthisOrderIsValidAndUpdateStatus : (order_id) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                let count  = await db.collection('orders').countDocuments({_id : new objectId(order_id.toString() ), status : "new" });
                if(count > 0){

                    db.collection('orders').updateOne({_id : new objectId(order_id.toString() ), status : "new" }, {'$set' : {status : "submitted"}});
                }
                resolve(count);
            })
        })
    },


    getBuyOrders : () => {
        return new Promise (resolve => {
            conn.then(async(db) => {

                let orders = await db.collection('ready_for_buy_order').find({action : "buy"}).limit(50).sort({created_date : -1}).toArray();
                var orderIdArray = orders.map(el => el._id);

                console.log('====>>>>>>>>  orderIdArray   ' ,orderIdArray);

                db.collection('ready_for_buy_order').deleteMany({_id : {'$in' : orderIdArray}});
                resolve(orders);
            })
        })
    },


    getSellOrders : () => {
        return new Promise (resolve => {
            conn.then(async(db) => {

                let orders = await db.collection('ready_for_sell_order').find({action : "sell"}).limit(50).sort({created_date : -1}).toArray();
                var orderIdArray = orders.map(el => el._id);

                console.log('====>>>>>>>>  orderIdArray   ' ,orderIdArray);

                db.collection('ready_for_sell_order').deleteMany({_id : {'$in' : orderIdArray}});
                resolve(orders);
            })
        })
    },


    updateTheOrder : (order_id, purchased_price, sold_price) => {
        return new Promise(resolve => {
            conn.then(async(db) => {
                db.collection('orders').updateOne({_id : new objectId(order_id.toString())}, {'$set' : {purchased_price : parseFloat(purchased_price), status : "FILLED", sold_price : parseFloat(sold_price) } })
                resolve(true);
            })
        })
    },


    checkOrderIsInNewStatus : (order_id) => {
        return new Promise(resolve => {
            conn.then(async(db) => {
                let countOrder = await db.collection('orders').countDocuments({ _id : new objectId(order_id.toString()),   status: "new", order_type : "manul" });
                if(countOrder > 0){
                    db.collection('orders').updateOne({ _id : new objectId(order_id.toString()),   status: "new", order_type : "manul"},  {'$set' : {status : "sumbitted"}}, async(error, result) => {
                        if(error){
                            console.log('database have some serious issue!!!')
                            resolve(true)
                        }else{

                            resolve(false)
                        }
                    });
                }else{

                    resolve(true)
                }
            })
        })
    },


    getOrderWalletAddress : (order_id) => {
        return new Promise(resolve => {
            conn.then(async(db) => {
                let order = await db.collection('orders').find({ _id : new objectId(order_id.toString()) }).toArray();
                resolve(order[0]['wallet_address'])
            })
        })
    },


    saveData : (exchange,  trading_mode,  user_id,  wallet_address) => {
        return new Promise(resolve => {
            conn.then(async(db) => {
                let addDataUnderUser = {
                    exchange      :  exchange,
                    trading_mode  :  trading_mode
                }
                let insertWallet = {
                    wallet_address   : wallet_address,
                    user_id          : user_id.toString(),
                    created_date     :  new Date()
                }
                db.collection('users').updateOne({ _id : new objectId(user_id.toString())}, {'$set' : addDataUnderUser });
                db.collection('user_wallet').insertOne(insertWallet)
                resolve(true);
            })
        })
    }
}