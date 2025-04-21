#!/bin/bash
# Parse Flags
for i in "$@"
do
case $i in
    -s=*|--datasource=*) datasource="${i#*=}" ;;
    -y=*|--year=*) year="${i#*=}" ;;
    -v=*|--version=*) version="${i#*=}";;
    --download) download=1 ;;
    --load) load=1 ;;
    --clean) clean=1 ;;
    *)
        echo
        echo "invalid flag $i"
        echo "e.g. --datasource=acs --year=2019 --version=2023-03-27 --download --load"
        echo "e.g. -s=acs -y=2019 --v=2023-03-27 --download --load"
        echo
        exit
    ;;
esac
done

BASE_URL=https://nyc3.digitaloceanspaces.com/edm-publishing/db-factfinder/ar_build
fileurl=$BASE_URL/$datasource/$year/$version/$datasource.csv
filepath=.migration/$datasource/$year/$datasource.csv
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
    cat $filepath | psql $DATABASE_URL -v TABLE_NAME=$year -v INDEX_NAME="${datasource}_${year}_geoid_idx" -f migrations/$datasource.sql
fi

if [[ $clean -eq 1 ]]; then 
    rm $filepath
fi