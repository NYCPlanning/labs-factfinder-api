#!/bin/bash
# Setting environmental variables
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
fi

case $1 in 
    etl ) 
        shift; 
        bash migrations/etl.sh $@
    ;;
    combine )
        shift;
        echo
        echo "Combining data from $1 and $2"
        psql $DATABASE_URL \
            -v YEAR1=$1\
            -v YEAR2=$2\
            -f migrations/acs_combine.sql
    ;;
    * ) 
        echo
        echo "$1 command not found"
        echo "e.g. ./migrations/cli.sh combine {{ YEAR1 }} {{ YEAR2 }}" 
        echo "e.g. ./migrations/cli.sh etl --datasource=acs --year=2019 --geography=2010_to_2020 --download --load"
        echo "e.g. ./migrations/cli.sh etl -s={{ acs|decennial }} -y=2019 -g=2010_to_2020 --load --clean"
        echo
    ;;
esac
