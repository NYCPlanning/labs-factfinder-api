#!/bin/bash
# Parse Flags
for i in "$@"
do
case $i in
    -s=*|--datasource=*) datasource="${i#*=}" ;;
    -y=*|--year=*) year="${i#*=}" ;;
    -g=*|--geography=*) geography="${i#*=}";;
    --download) download=1 ;;
    --load) load=1 ;;
    --clean) clean=1 ;;
    *)
        echo
        echo "invalid flag $i"
        echo "e.g. --datasource=acs --year=2019 --geography=2010_to_2020 --download --load"
        echo "e.g. -s=acs -y=2019 -g=2010_to_2020 --download --load"
        echo
        exit
    ;;
esac
done

BASE_URL=https://nyc3.digitaloceanspaces.com/edm-publishing/db-factfinder
fileurl=$BASE_URL/$datasource/year=$year/geography=$geography/$datasource.csv
filepath=.migration/$datasource/year=$year/geography=$geography/$datasource.csv
filedir=$(dirname $filepath)

if [[ $download -eq 1 ]]; then 
    mkdir -p .migration && (
        cd .migration
        if [ ! -f .gitignore ]; then
            echo "*" > .gitignore 
        fi
    )
    mkdir -p $filedir && (
        cd $filedir
        curl -s -O $fileurl
    )
fi

if [[ $load -eq 1 ]]; then 
    cat $filepath | psql $DATABASE_URL -v TABLE_NAME="$year" -f migrations/$datasource.sql
    metadata_url="https://raw.githubusercontent.com/NYCPlanning/db-factfinder/dev/factfinder/data/$datasource/$year/metadata.json"
    psql $DATABASE_URL -v CONTENT="$(curl -s $metadata_url)" -v TABLE_NAME="$year" -f migrations/acs_metadata.sql
fi

if [[ $clean -eq 1 ]]; then 
    rm $filepath
fi