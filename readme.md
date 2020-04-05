quick hack to ping philips airpurifier water level & filter readings and email a notification to a user when action is required.

uses https://github.com/rgerganov/py-air-control for the communication with the purifier.

# Usage
- setup .env
- `npm build`
- `npm start`

schedule cron job, e.g. */5 * * * * cd philips-airpurifier-alarm && npm start
