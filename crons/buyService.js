const helper  =  require('../helper/helper')

module.exports = {
    buy_service : async() => {
        let buyOrders = await helper.getBuyOrders();
        if(buyOrders.length > 0){

            console.log('send the order total length is :::::::::::::: <<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>> ', buyOrders.length );
            helper.sendForBuyAll(buyOrders);
        }else{
            console.log('<<<<<<<<<<<<<<<<<<============  Ready For Buy Order Not Exists ===========>>>>>>>>>>>>>>>>>>>>>>>')
        }
    }
}
