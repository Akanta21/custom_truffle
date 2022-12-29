// contract test code will go here
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());
const { abi, evm } = require('../compile');

let acc, inbox;
const initial = 'Hi there'

beforeEach(async() => {
    // Get list of accounts
    const accounts = await web3.eth.getAccounts()
    // Use one to deploy contract
    acc = accounts[0]

    inbox = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object, arguments:[initial]})
        .send({from: acc, gas: '1000000'})
})

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    })

    it('has a default message', async() => {
        const initialMessage = await inbox.methods.message().call();
        assert.equal(initialMessage, initial);
    })

    it('can change message', async() => {
        const changeMessage = 'New Message'
        await inbox.methods.setMessage(changeMessage).send({from: acc});
        const message = await inbox.methods.message().call();
        assert.equal(message, changeMessage);
    })
})