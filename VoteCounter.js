const cov = require('covalentjs');
const fs = require('fs');
const dotenv = require('dotenv');
const { range } = require('lodash');
const readline = require('readline');

dotenv.config();

const askUser = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

const main = async () => {

    var items;
    const address = JSON.parse(fs.readFileSync("./infinite_dao_labels.json"))
    // const blockchains = JSON.parse(fs.readFileSync("./bkc_enum.json"))
    const blockchains = {
        "MATIC": {
            "chain_id": 137,
            "name": "Polygon"
        }
    }
    
    await cov.classA.getTransactions(blockchains.MATIC.chain_id, "0xefbaf563eda931dd903d89025693b00407c2bdb5").then(res => {

        items = res.data.items

        var maxVoteId = '0'
        res.data.items.forEach(item => {
            item.log_events.forEach(log => {
                let dec = log.decoded
                if (dec == null) { }
                else if (dec.name === "CastVote") {
                    let val = dec.params[0].value
                    
                    val = parseInt(val)

                    maxVoteId = val > maxVoteId ? val : maxVoteId
                    maxVoteId = parseInt(maxVoteId)
                }
            })
        })

        const last10votes = range(maxVoteId - 9, maxVoteId + 1)

        last10votes.forEach(voteId => {

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
        console.log()
    })

    await askUser('Press ENTER to leave.')

}

main()


