// deploy code will go here
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const {abi, evm} = require('./compile');

const {MNEMONIC, NETWORK} = process.env;

const provider = new HDWalletProvider(
    MNEMONIC,
    NETWORK
)

const web3 = new Web3(provider);

// list account
const deploy = async() => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account:', accounts[0])

    const contractAddress = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({gas:'1000000', from: accounts[0]})

    console.log('contractAddress', contractAddress.options.address)
    provider.engine.stop()
}


// deploy
deploy()