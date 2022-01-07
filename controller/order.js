var express  =  require('express');
var router   =  express.Router();
const helper =  require('../helper/helper')
const md5    =  require('md5-nodejs');

router.post('/placeOrder',  async(req, res) => {
    if(req.body.user_id){

        // let makeTheExpiredTime = await helper.makeTheEndTime(req.body.time_duration_type, parseFloat(req.body.time_duration) );

        let insertObject = {
            user_id         :   req.body.user_id.toString(),
            symbol          :   req.body.symbol,
            action          :   req.body.action,
            buy_exchange    :   req.body.buy_exchange,
            sell_exchange   :   req.body.sell_exchange,
            quantity        :   parseFloat(req.body.quantity),
            buy_sell_price  :   parseFloat(req.body.buy_sell_price),
            order_type      :   'manul',
            status          :   'new',
            expired_time    :   new Date(req.body.expire_time),
            wallet_address  :   req.body.wallet_address, 
            buy_sell_order_type : req.body.buy_sell_order_type, //limit , stop loss order or market order
            created_date   :  new Date()
        }
        let order_id_inserted  = await helper.saveOrder(insertObject);
        
        let returnObject = {
            user_id     :   req.body.user_id.toString(),
            order_id    :   order_id_inserted.toString(),
            symbol      :   req.body.symbol,
            quantity    :   parseFloat(req.body.quantity),
            order_type  :   req.body.order_type,
            wallet_address  :   req.body.wallet_address,
            action      :   req.body.action,
            url         :  'https://alerttesting.herokuapp.com/alerts/reciviedAllerts'
        }
        returnObject['exchange'] = ( req.body.action == 'buy')? req.body.buy_exchange : req.body.sell_exchange;

        let responseArray = {
            status  : 200,
            message : "Order is successfully placed!!",
            data    : returnObject
        }
        res.status(200).send(responseArray);    
    }else{

        let responseArray = {
            status  : 400,
            message : "payload missing"
        }
        res.status(400).send(responseArray);    
    }
})

router.post('/addWallet', async(req, res) => {
    if(req.body.user_id && req.body.wallet_address){

        let walletObject = {

            created_date    :  new Date(),
            wallet_address  :  req.body.wallet_address,
            user_id         :  req.body.user_id.toString()
        }
        helper.saveWallet(walletObject, 'user_wallet');
        let responseArray = {
            status  : 200,
            message : "added successfully!!!!"
        }
        res.status(200).send(responseArray);  
    }else{

        let responseArray = {
            status  : 400,
            message : "payload missing"
        }
        res.status(400).send(responseArray);   
    }
})



router.post('/getWalletAddress', async(req, res) => {

    if(req.body.user_id){
        let wallets = await helper.getUserWallets(req.body.user_id)

        let responseArray = {
            status  : 200,
            data    : wallets
        }
        res.status(200).send(responseArray); 
    }else{

        let responseArray = {
            status  : 400,
            message : "payload missing"
        }
        res.status(400).send(responseArray); 
    }
})
module.exports = router;