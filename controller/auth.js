var express  =  require('express');
var router   =  express.Router();
const helper =  require('../helper/helper')
const md5    =  require('md5-nodejs');
const { saveData } = require('../helper/helper');

router.post('/register', async(req, res) => {
    if(req.body.email  && req.body.password){
        
        let status = await helper.checkIsThisAlreadyExists(req.body.email)

        if(status == true){   
            let responseArray = {
                status  : 400,
                message : "Email already exists!!!!"
            }
            res.status(400).send(responseArray);    
        }else{
            // let country =  await helper.findLocation()
            insertObject = {
    
                email         :   (req.body.email.toLowerCase()).trim(),
                full_name        :  req.body.fullName,
                role          :   'user',
                password      :   md5(req.body.password),
                profile_image :   req.body.profile_image,
                created_date  :   new Date(),
            }
            helper.saveUser(insertObject);

            let responseArray = {
                status      :  200,
                message     :  'Register Successfully'
            }
            res.status(200).send(responseArray);   
        }
    }else{
        let responseArray = {
            status  : 400,
            message : "payload missing"
        }
        res.status(400).send(responseArray);    
    }
})


router.post('/login', async(req, res) => {
    if(req.body.email && req.body.password){

        let data  =  await helper.makeUserLogin(req.body.email, req.body.password )
        if(data){

            let responseArray = {
                status  : 200,
                message : "Sucessful Login!!!",
                userData : data
            }
            res.status(200).send(responseArray);  
        }else{

            let responseArray = {
                status  : 400,
                message : "Credentials invalid"
            }
            res.status(400).send(responseArray);   
        }
    }else{

        let responseArray = {
            status  : 400,
            message : "payload missing"
        }
        res.status(400).send(responseArray);    
    }
})


router.post('/saveUserProfileData', async(req, res) => {
    if(req.body.user_id){

        helper.saveData(req.body.exchange, req.body.trading_mode, req.body.user_id, req.body.wallet_address);
        let responseArray = {  
            status  : 200,
            message : "data are saved",
        }
        res.status(200).send(responseArray);   
    }else{
        let responseArray = {
            status  : 400,
            message : "Pyaload missing!!!"
        }
        res.status(400).send(responseArray);   
    }
})

router.post('/forgetPassword', async(req, res) => {

})

module.exports = router;