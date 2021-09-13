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

if [ ! -z "$datasource" ] && [ ! -z "$year_curr" ] && [ ! -z "$year_prev" ]; then
    echo "loading metadata for $datasource year_curr: $year_curr year_prev: $year_prev"
    base_url="https://raw.githubusercontent.com/NYCPlanning/db-factfinder/dev/factfinder/data"
    url_curr="$base_url/$datasource/$year_curr/metadata.json"
    url_prev="$base_url/$datasource/$year_prev/metadata.json"
    CONTENT_CURR="$(curl -s $url_curr)"
    CONTENT_PREV="$(curl -s $url_prev)"
    if [ $datasource == "acs" ]; then
        echo "$datasource"
        psql $DATABASE_URL \
            -v CONTENT_CURR="$CONTENT_CURR" \
            -v CONTENT_PREV="$CONTENT_PREV" \
            -v YEAR_CURR="$year_curr" \
            -v YEAR_PREV="$year_prev" \
            -f migrations/acs_metadata.sql
    else
        psql $DATABASE_URL \
            -v CONTENT_CURR="$CONTENT_CURR" \
            -v CONTENT_PREV="$CONTENT_PREV" \
            -v YEAR_CURR="$year_curr" \
            -v YEAR_PREV="$year_prev" \
            -f migrations/decennial_metadata.sql
    fi
else
    echo "incomplete information, please specify source, year_curr and year_prev"
fi