#!/usr/bin/env bash
set -ex
DB_DIR=$(dirname $0)/db
ERR_LOG=$(dirname $0)/stderr.log
LOG=$(dirname $0)/stdout.log
/usr/local/bin/docker run --rm -v $DB_DIR:/app/db philips-airpurifier-alarm >> $LOG 2>> $ERR_LOG
