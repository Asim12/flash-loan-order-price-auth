var express  =  require('express');
var router   =  express.Router();
const helper =  require('../helper/helper')

router.post('/reciviedAllerts',   async (req, res) => {
    // await helper.saveWallet(req.body, 'alert_test' )
    if(req.body.order_id && req.body.user_id && req.body.symbol && req.body.quantity  &&  req.body.order_type && req.body.exchangeName){
        let validationStatusCheck = await helper.checkthisOrderIsValid(req.body.order_id);
        if(validationStatusCheck > 0){

            let orderObject = {
                user_id     :  req.body.user_id,
                order_id    :  req.body.order_id,
                symbol      :  req.body.symbol,
                quantity    :  req.body.quantity,
                order_type  :  req.body.order_type,
                exchange    :  req.body.exchangeName
            }

            if(req.body.action == 'buy'){
               
                orderObject["action"]  =  "buy";                 
                helper.saveData(orderObject, 'ready_for_buy_order')
            }else{

                orderObject["action"]  =  "sell" ;
                helper.saveData(orderObject, 'ready_for_sell_order')
            } 
        }else{ //order is expired and we are rejecting this order

            helper.saveData(orderObject, 'rejected_alerts')
        }
    }else{
        console.log('<<<<<<<<<<<<<<<<<======   Order_id is missing and we  are rejecting this order ======>>>>>>>>>>>>>>>>>>>>>>>>>>')
    }
})


router.post('/updateOrderAfterBuySell', async(req, res) => {

    helper.updateTheOrder(req.body.order_id, req.body.purchased_price);

    let responseArray = {
        status  : 200,
        message : "Sucessful update!!!",
    }
    res.status(200).send(responseArray);  
})



// router.post('/saveAlert', async(req, res) => {

//     helper.saveData(req.body, 'temp_data');
// })

module.exports = router;