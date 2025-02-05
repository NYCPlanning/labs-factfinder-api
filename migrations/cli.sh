#!/bin/bash
# Setting environmental variables
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
fi

function support_geoids {
    local version=${1:-latest}
    BASE_URL=https://nyc3.digitaloceanspaces.com/edm-publishing/db-factfinder/ar_build
    fileurl=$BASE_URL/support_geoids/$version/support_geoids.csv
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
        echo "e.g. ./migrations/cli.sh etl --datasource=acs --year=2019 --version=2023-03-27 --download --load"
        echo "e.g. ./migrations/cli.sh etl -s={{ acs|decennial }} -y=2010 -v=2023-03-27 --load --clean"
        echo
    ;;
esac