const helper  = require('../helper/helper')
module.exports = {
    sell_service : async() => {
        let buyOrders = await helper.getSellOrders();
        if(buyOrders.length > 0){

            console.log('send the order total length is :::::::::::::: <<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>> ', buyOrders.length );
            helper.sendForSellAll(buyOrders);
        }else{

            console.log('<<<<<<<<<<<<<<<<<<============  Ready For Buy Order Not Exists ===========>>>>>>>>>>>>>>>>>>>>>>>')
        }
    }
}