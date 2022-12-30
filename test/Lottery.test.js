const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());
const {abi, evm} = require('../compile')

let lottery, accounts, acc;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();

    acc = accounts[0];

    lottery = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({from: acc, gas: '1000000'})
})

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    })

    it('has zero players in the initial stage', async() => {
        const initialPlayers = await lottery.methods.getPlayers().call();
        assert.deepEqual(initialPlayers, [])
    })

    it('allows one account to enter', async() => {
        await lottery.methods.enterLottery().send({
            from: accounts[1],
            value: web3.utils.toWei('0.011', 'ether')
        });
        
        const initialPlayers = await lottery.methods.getPlayersLength().call();
        assert.equal(initialPlayers, 1)

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(players[0], accounts[1])
    })

    it('allows multiple accounts to enter', async() => {
        await lottery.methods.enterLottery().send({
            from: accounts[1],
            value: web3.utils.toWei('0.011', 'ether')
        });

        await lottery.methods.enterLottery().send({
            from: accounts[2],
            value: web3.utils.toWei('0.011', 'ether')
        });

        await lottery.methods.enterLottery().send({
            from: accounts[3],
            value: web3.utils.toWei('0.011', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(players[0], accounts[1])
        assert.equal(players[1], accounts[2])
        assert.equal(players[2], accounts[3])

        assert.equal(players.length, 3)
    })

    it('should enter the correct amount of ether', async() => {
        try {
            await lottery.methods.enterLottery().send({
                from: accounts[1],
                value: web3.utils.toWei('0.002', 'ether')
            });
            assert(false)
        } catch (err){
            assert(err)
        }
    })

    it('only manager can call pickWinner', async() => {
        try{
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            })
            assert(false)
        } catch(err){
            assert(err)
        }
    })

    it('sends money to winner and resets the player arr', async() => {
        try{
            await lottery.methods.enterLottery().send({
                from: accounts[1],
                value: web3.utils.toWei('0.011', 'ether')
            });
            await lottery.methods.enterLottery().send({
                from: accounts[2],
                value: web3.utils.toWei('0.011', 'ether')
            });
            const players = await lottery.methods.getPlayers().call({
                from: accounts[1]
            })
            // assert.equal(players.length,2)
            const initialBalance = await web3.eth.getBalance(accounts[1])
            await lottery.methods.pickWinner().send({
                from: accounts[0]
            })
            const finalBalance = await web3.eth.getBalance(accounts[1])
            const diff = finalBalance - initialBalance;
            assert(diff > web3.utils.toWei('0.02', 'ether'))
            const remainingPlayers = await lottery.methods.getPlayers().call({
                from: accounts[0]
            })
            assert.equal(remainingPlayers.length, 0)
        }catch(err) {
            console.log(err)
        }
    })
})