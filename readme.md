# Philips airpurifier alarm

Quick hack to ping philips airpurifier water level & filter readings and email a notification to a user when action is required.

uses https://github.com/rgerganov/py-air-control for the communication with the purifier.

## Usage
- Generate gmail app password: My Account -> Sign-in & security -> Signing in to Google -> App passwords
  - https://security.google.com/settings/security/apppasswords?utm_source=OGB&pli=1
- setup .env
- `npm build`
- `npm start`

schedule cron job, e.g. `*/15 * * * * philips-airpurifier-alarm/start.sh`
