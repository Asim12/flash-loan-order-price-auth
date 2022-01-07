const cron      =   require('node-cron');
const prices    =   require('../crons/prices');
const orderExpired = require('../crons/orderCron');
const sell_service_run = require('../crons/sellService')
const buy_service_run  = require('../crons/buyService')


cron.schedule('*/1 * * * * *', () => {
        
    prices.price();
});

cron.schedule('*/1 * * * * *', () => {
        
    orderExpired.makeOrderExpired();
});

cron.schedule('*/1 * * * * *', () => {
        
    sell_service_run.sell_service();
});

cron.schedule('*/1 * * * * *', () => {
        
    buy_service_run.buy_service();
});