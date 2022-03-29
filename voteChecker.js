const cov = require('covalentjs');
const fs = require('fs');
const dotenv = require('dotenv');
const { range } = require('lodash');

dotenv.config();

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

    // last10votes.forEach(voteId => {
    let voteId = 45
    console.log("\n" + voteId + "\n")

    res.data.items.forEach(item => {
        item.log_events.forEach(log => {

            let dec = log.decoded
            console.log(dec)

            if (dec == null) { }
            else if (dec.params[0].value == voteId.toString()) {

                if (dec.params[1]) {
                    let voteAddr = dec.params[1].value
                    address.map(wallet => {
                        if (wallet.address === voteAddr)
                            wallet.voteCount++
                    })
                    if(voteAddr === "0x80fb2a440319b85054ab6047ba2f437053100b4e") {
                        console.log(item)
                    }

                }
            }
        })
    })

    // })


}).finally(res => {
    console.log(address)
})

