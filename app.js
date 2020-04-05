require('dotenv').config()
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { JsonDB } = require('node-json-db') 

var db = new JsonDB(new Config("./db/index", true, false, '/'))

const {GMAIL_USER, GMAIL_APP_PASS, TO_EMAIL, PURIFIER_IP} = process.env

const send = require('gmail-send')({
  user: GMAIL_USER,
  pass: GMAIL_APP_PASS,
  to: TO_EMAIL
})

const log = (message) => console.log(new Date(), message)

const getItemTimestamp = (key) => {
  try {
    return db.getData(`/${key}`)
  } catch(error) {
    console.error(error)
    return 0
  }
}

const notify = (message) => {
  const lastSent = getItemTimestamp(message)
  const sentDiff = Date.now() - lastSent
  if(sentDiff < 12 * 60 * 60 * 1000){
    log(`skipping ${message}`)
    return
  }

  return send({
    subject: `Airpurifier: ${message}`
  })
  .then(({ result }) => {
    log(`mail ${message} ${result}`)
    db.push(`/${message}`, Date.now())
  })
  .catch(error => log(error))
}

const { exec } = require("child_process")

const wlRow = '[wl]    Water level: '

exec(`airctrl ${PURIFIER_IP}`, async (error, stdout, stderr) => {
  if (error) {
    log(`error: ${error.message}`)
    return
  }
  if (stderr) {
    log(`stderr: ${stderr}`)
    return
  }
  log(`stdout: ${stdout}`)

  const waterLevelLow = stdout.split('\n')
    .filter(r => r.includes(wlRow))
    .some(r => {
      const percentage = parseInt(r.replace(wlRow, ''), 10)
      // this seems to be either 0 or 100, at least with philips ac3829/10
      return percentage < 5
  })


  if(waterLevelLow){
    await notify('add water')
  }

  if(stdout.includes('Error: pre-filter must be cleaned')){
    await notify('clean filter')
  }
})