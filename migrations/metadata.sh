#!/bin/bash
# Parse Flags
for i in "$@"
do
case $i in
    -s=*|--datasource=*) datasource="${i#*=}" ;;
    --year_curr=*) year_curr="${i#*=}" ;;
    --year_prev=*) year_prev="${i#*=}" ;;
    *)
        echo
        echo "invalid flag $i"
        echo "e.g. -s={{ acs|decennial }} -year_curr=2019 -year_prev=2010"
        exit
    ;;
esac
done

function get_metadata() {
    local year=$1
    base_url="https://raw.githubusercontent.com/NYCPlanning/db-factfinder/dev/factfinder/data"
    url="$base_url/$datasource/$year/metadata.json"
    mkdir -p $(pwd)/.migration/metadata/$datasource/$year && (
        cd $(pwd)/.migration/metadata/$datasource/$year
        curl -O $url
    )
}

if [ ! -z "$datasource" ] && [ ! -z "$year_curr" ] && [ ! -z "$year_prev" ]; then
    echo "loading metadata for $datasource year_curr: $year_curr year_prev: $year_prev"
    (get_metadata $year_curr & get_metadata $year_prev wait && echo "done")
    path_curr=$(pwd)/.migration/metadata/$datasource/$year_curr/metadata.json
    path_prev=$(pwd)/.migration/metadata/$datasource/$year_prev/metadata.json

    if [ $datasource == "acs" ]; then
        path_sql=$(pwd)/.migration/metadata/acs/metadata.sql
        echo "
            CREATE TEMP TABLE meta ( _json text , release_year text );
            INSERT INTO meta VALUES('$(cat $path_curr)', '$year_curr');
            INSERT INTO meta VALUES('$(cat $path_prev)', '$year_prev');
            $(cat migrations/acs_metadata.sql)
        " > $path_sql
        psql $DATABASE_URL -f $path_sql
        rm $path_sql
    else
        path_sql=$(pwd)/.migration/metadata/decennial/metadata.sql
        echo "
            CREATE TEMP TABLE meta ( _json text , release_year text );
            INSERT INTO meta VALUES('$(cat $path_curr)', '$year_curr');
            INSERT INTO meta VALUES('$(cat $path_prev)', '$year_prev');
            $(cat migrations/decennial_metadata.sql)
        " > $path_sql
        psql $DATABASE_URL -f $path_sql
        rm $path_sql
    fi
else
    echo "incomplete information, please specify source, year_curr and year_prev"
fi