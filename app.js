const cov = require('covalentjs');
const fs = require('fs');
const dotenv = require('dotenv');
const { range } = require('lodash');

dotenv.config();

const defineBkc = (bk) => {
    switch (bk) {
        case "MATIC":
            return blockchains.MATIC
        case "BSC":
            return blockchains.BSC
        case "AVAX":
            return blockchains.AVAX
        case "SOLANA":
            return blockchains.SOLANA
        case "ETH":
            return blockchains.ETH
        default:
            return blockchains.ETH
    }
}

const address = JSON.parse(fs.readFileSync("./infinite_dao_labels.json"))
// const blockchains = JSON.parse(fs.readFileSync("./bkc_enum.json"))
const blockchains = {
    "MATIC": {
        "chain_id": 137,
        "name": "Polygon"
    }
}

var last10Tx = []
const lastVoteId = 46
const last10votes = range(lastVoteId - 9, lastVoteId + 1)

cov.classA.getTransactions(blockchains.MATIC.chain_id, "0xefbaf563eda931dd903d89025693b00407c2bdb5").then(res => {

    last10Tx = res.data.items.slice(0, 9)

    last10votes.forEach(voteId => {
        console.log("\n" + voteId + "\n")

        res.data.items.forEach(item => {
            item.log_events.forEach(log => {

                let dec = log.decoded

                if (dec == null) { }
                else if (dec.params[0].value == voteId.toString()) {

                    if (dec.params[1]) {
                        let voteAddr = dec.params[1].value
                        address.map(wallet => {
                            if (wallet.address === voteAddr)
                                if (!wallet.participatedIn.includes(voteId))
                                    wallet.participatedIn.push(voteId)
                        })
                    }
                }
            })
        })
    })
    
}).finally(res => {
    address.map(wallet => {
        wallet.voteCount = wallet.participatedIn.length
    })
    console.log(address)
})

