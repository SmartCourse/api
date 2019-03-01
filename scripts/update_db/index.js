const { PRODUCTION } = require('../../src/models/constants')
const stdio = require('stdio')
const db = require('../../src/models/db')
const { update } = require('./update_sql')

// Wait until a connection is made
db.on('ready', async function () {
    // Safety prompt
    if (PRODUCTION) {
        console.log('WARNING: You are about to make changes to the production database!')
        const proceed = await new Promise((resolve, reject) => {
            stdio.question('continue? Y/n', (err, text) => {
                if (err) {
                    return reject(err)
                }
                if (text.toLowerCase() !== 'y') {
                    return resolve(false)
                }
                stdio.question('Are you really absolutely sure? Y/n', (err, text) => {
                    if (err) {
                        return reject(err)
                    }
                    if (text.toLowerCase() !== 'y') {
                        return resolve(false)
                    }
                    resolve(true)
                })
            })
        })
        if (!proceed) {
            console.log('Phew! That was close!')
            process.exit(0)
        }
    }

    // Database initialisation benchmarking
    const timeList = [Date.now() / 1000]
    // Wait for database to initialize
    await update(db)
    // Log completion time
    timeList.push(Date.now() / 1000)
    console.log(`Done updating database! (${((timeList[1] - timeList[0])).toFixed(3)})`)
    db.close()
})
