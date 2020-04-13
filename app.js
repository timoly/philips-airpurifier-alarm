require('dotenv').config()
const {GMAIL_USER, GMAIL_APP_PASS, TO_EMAIL, PURIFIER_IP} = process.env

const send = require('gmail-send')({
  user: GMAIL_USER,
  pass: GMAIL_APP_PASS,
  to: TO_EMAIL
})

const util = require('util')
const childProcess = require("child_process")
const exec = util.promisify(childProcess.exec)

const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { JsonDB } = require('node-json-db') 
var db = new JsonDB(new Config("./db/index", true, false, '/'))

const WATER_LEVEL_ROW = '[wl]    Water level: '

const log = (...args) => console.log([new Date()].concat(args).join( ))

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

const getStatus = async () => {
  const {stderr, stdout} = await exec(`airctrl ${PURIFIER_IP}`, {timeout: 2000})
  log(`stdout: ${stdout}`)

  if (stderr) {
    log(`stderr: ${stderr}`)
    throw new Error(stderr)
  }
  
  const waterLevelLowRow = stdout.split('\n').find(r => {
    const percentage = r.includes(WATER_LEVEL_ROW) ? parseInt(r.replace(WATER_LEVEL_ROW, ''), 10) : NaN

    return Number.isInteger(percentage) && percentage < 5
  })

  if(typeof waterLevelLowRow !== "undefined"){
    await notify('add water')
  }

  if(stdout.includes('Error: pre-filter must be cleaned')){
    await notify('clean filter')
  }
}

getStatus().catch(async error => {
  log("command failed", error)
  try{
    await notify(error.message)
  }
  catch(err){
    log(err)
  }
  
  process.exit(1)
})