#!/bin/bash
# Setting environmental variables
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
fi

function support_geoids {
    local geography=${1:-2010_to_2020}
    BASE_URL=https://nyc3.digitaloceanspaces.com/edm-publishing/db-factfinder
    fileurl=$BASE_URL/support_geoids/geography=$geography/support_geoids.csv
    curl $fileurl | psql $DATABASE_URL -f migrations/support_geoids.sql
}

function selection {
    psql $DATABASE_URL -f migrations/selection.sql
}

case $1 in 
    etl ) 
        shift; 
        bash migrations/etl.sh $@
    ;;
    support_geoids ) 
        shift;
        support_geoids $1
    ;;
    metadata ) 
        shift;
        bash migrations/metadata.sh $@
    ;;
    selection )
        selection
    ;;
    * ) 
        echo
        echo "$1 command not found"
        echo "e.g. ./migrations/cli.sh etl --datasource=acs --year=2019 --geography=2010_to_2020 --download --load"
        echo "e.g. ./migrations/cli.sh etl -s={{ acs|decennial }} -y=2010 -g=2010_to_2020 --load --clean"
        echo
    ;;
esac