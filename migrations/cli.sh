#!/bin/bash
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
fi

BASE_URL=https://nyc3.digitaloceanspaces.com/edm-publishing/db-factfinder
# acs/year=2019/geography=2010_to_2020/acs.csv
shift;
datasource=${1:-acs}
year=${2:-2019}
geography=${3:-2010_to_2020}
fileurl=$BASE_URL/$datasource/year=$year/geography=$geography/$datasource.csv
mode=${4:staging}

function download {

    # local datasource=${1:-acs}
    # local year=${2:-2019}
    # local geography=${3:-2010_to_2020}
    # local fileurl=$BASE_URL/$datasource/year=$year/geography=$geography/$datasource.csv
    mkdir -p .migration && (
        cd .migration
        if [ ! -f .gitignore ]; then
            echo "*" > .gitignore 
        fi
        # curl -O $fileurl
    )
    cat .migration/$datasource.csv | psql $DATABASE_URL_STAGING -v TABLE_NAME=$year -f migrations/acs.sql
}

download
# case $1 in 
#     download) shift; download $@ ;;
#     *) echo "$@" ;;
# esac