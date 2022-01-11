
const conn = require('../database/connection');

module.exports = {
    makeOrderExpired: () => {
        conn.then(async (db) => {
            
            db.collection('orders').updateMany({status : "new", expired_time : {'$lt' : new Date(), order_type : "auto" }}, {'$set' : {status : "expired"} });
            console.log('<<<<<<<<<<<<<<<<<<<<========================   Order Expired Crone Is Running   =====================>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        });
    }
}
