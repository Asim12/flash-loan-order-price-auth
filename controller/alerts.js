var express  =  require('express');
var router   =  express.Router();
const helper =  require('../helper/helper')
// var web3 = require('ethereum.js');
// var solc = require('solc');

let fs   = require("fs");
let Web3 = require("web3");
let solc = require("solc");

router.post('/reciviedAllerts',   async (req, res) => {
    // await helper.saveWallet(req.body, 'alert_test' )
    if(req.body.order_id && req.body.user_id && req.body.symbol && req.body.quantity  &&  req.body.order_type && req.body.exchangeName){
        let validationStatusCheck = await helper.checkthisOrderIsValidAndUpdateStatus(req.body.order_id);
        if(validationStatusCheck > 0){

            let wallet_address = await helper.getOrderWalletAddress(req.body.order_id)
            let orderObject = {
                user_id     :  req.body.user_id,
                order_id    :  req.body.order_id,
                symbol      :  req.body.symbol,
                quantity    :  req.body.quantity,
                order_type  :  req.body.order_type,
                exchange    :  req.body.exchangeName,
                wallet_address :  wallet_address
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


router.post('/testing', async(req, res) => {

    console.log('===================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>     testing router is running     ===================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    let source = fs.readFileSync("contracts.json");



    let contracts = JSON.parse(source)["contracts"];
    let abi = JSON.parse(contracts.SampleContract.abi);
    let code = '0x' + contracts.SampleContract.bin;
    let SampleContract = web3.eth.contract(abi);
    console.log("Unlocking coinbase account");
    var password = "";
    try {
      web3.personal.unlockAccount(web3.eth.coinbase, password);
    } catch(e) {
      console.log(e);
      return;
    }

    console.log("Deploying the contract");
    let contract = SampleContract.new({from: web3.eth.coinbase, gas: 1000000, data: code});
    console.log("Your contract is being deployed in transaction at http://testnet.etherscan.io/tx/" + contract.transactionHash);


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function waitBlock() {
        while (true) {
          let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
          if (receipt && receipt.contractAddress) {
            console.log("Your contract has been deployed at http://testnet.etherscan.io/address/" + receipt.contractAddress);
            console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
            break;
          }
          console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
          await sleep(4000);
        }
    }
      
    waitBlock();
    // console.log('web3 testing ganache ======>>>>>>>>>>>>>>>>>>>>>>>>',  web3);
})


// web3 testing with ganache and https://remix.ethereum.org/
router.post('/testingWork', async(req, res) => {
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));

    // let balance  =  await web3.eth.getBalance("0xabD144b79bfDB3BD880A2daEAC0B5bA9c71528de")
    // console.log('balance of web3 is ====>>>>>>>>>>>>', web3.utils.fromWei(balance, "ether") )
    
    // let balanceSend = await web3.eth.sendTransaction({ from : "0xF8dF24b69F2Cd0798969b2a56dE37b137569a6A3", to: "0xabD144b79bfDB3BD880A2daEAC0B5bA9c71528de", value: web3.utils.toWei("10", "ether")  })
    // console.log('balance send response =======>>>>>>>>>>>>>>>>>>>>', balanceSend)

    // let contract_new = new web3.eth.Contract([
    //     {
    //         "inputs": [
    //             {
    //                 "internalType": "uint256",
    //                 "name": "_x",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "name": "set",
    //         "outputs": [],
    //         "stateMutability": "nonpayable",
    //         "type": "function"
    //     },
    //     {
    //         "inputs": [],
    //         "name": "x",
    //         "outputs": [
    //             {
    //                 "internalType": "uint256",
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "stateMutability": "view",
    //         "type": "function"
    //     }
    // ], "0x0eA8E81a6eE41733a9f5500DCDBFFa28D8441E51")
    // console.log('contract deploy =====>>>>>>>>>>>', contract_new )

    // let valueOfX = await contract_new.methods.x().call()
    // console.log('value of x is =======>>>>>>>>>>>>>>>', valueOfX );

    // let setMethodsCall = await contract_new.methods.set(80).send({from: "0xF8dF24b69F2Cd0798969b2a56dE37b137569a6A3"})
    // console.log('set method is called =========>>>>>>>>>>>>>>>>>>>', setMethodsCall )

    // let valueOfX_new = await contract_new.methods.x().call()
    // console.log('new value of x is =======>>>>>>>>>>>>>>>', valueOfX_new );

    
    let fileContent = fs.readFileSync('demo.sol')
    // console.log('fileContent ========>>>>>>>>>>>>>>>', fileContent);

    // create an input structure for my solidity compiler
    var input = {
        language: "Solidity",
        sources: {
          "demo.sol": {
            content: fileContent,
          },
        },
      
        settings: {
          outputSelection: {
                "*": {
                "*": ["*"],
                },
            },
        },
    };

    var output = JSON.parse(solc.compile(JSON.stringify(input)));
    // console.log("Output: ", output);
    ABI = output.contracts["demo.sol"]["demo"].abi;
    bytecode = output.contracts["demo.sol"]["demo"].evm.bytecode.object;
    console.log("Bytecode: ", bytecode);
    console.log("ABI: ", ABI);
})

module.exports = router;