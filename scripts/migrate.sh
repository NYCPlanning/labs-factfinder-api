#!/bin/bash

# exit script on error
set -e

DB_UUID=$(uuid)
CONTAINER_NAME=factfinder-$(uuid)
# real data should be pulled from /tmp. Skeleton data stored in data/seeds
FF_SOURCE_DIR=data/seeds/factfinder/ && [[ "$1" == "-t" ]] && FF_SOURCE_DIR=tmp/

[[ "$1" != "-d" ]] && { # skip if debug flag is on
  ssh $USER@planninglabs.nyc mkdir /tmp/$CONTAINER_NAME
  scp -rp $FF_SOURCE_DIR/*.csv $USER@nycplanning:/tmp/$CONTAINER_NAME
  ssh dokku@planninglabs.nyc postgres:create $CONTAINER_NAME
  ssh dokku@planninglabs.nyc postgres:connect $CONTAINER_NAME < schema/schema.sql
  ssh $USER@planninglabs.nyc sudo docker cp /tmp/$CONTAINER_NAME dokku.postgres.$CONTAINER_NAME:/tmp
  ssh $USER@planninglabs.nyc dokku postgres:connect $CONTAINER_NAME << EOF
    TRUNCATE TABLE demographic;
    \COPY demographic FROM '/tmp/$CONTAINER_NAME/demographic.csv' CSV HEADER;
    TRUNCATE TABLE social;
    \COPY social FROM '/tmp/$CONTAINER_NAME/social.csv' CSV HEADER;
    TRUNCATE TABLE economic;
    \COPY economic FROM '/tmp/$CONTAINER_NAME/economic.csv' CSV HEADER;
    TRUNCATE TABLE housing;
    \COPY housing FROM '/tmp/$CONTAINER_NAME/housing.csv' CSV HEADER;
    TRUNCATE TABLE decennial;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/POPULATION DENSITY.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/SEX AND AGE.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/MUTUALLY EXCLUSIVE RACE  HISPANIC ORIGIN.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/HISPANIC SUBGROUP.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/ASIAN SUBGROUP.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/RELATIONSHIP TO HEAD OF HOUSEHOLD HOUSEHOLDER.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/HOUSEHOLD TYPE.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/HOUSING OCCUPANCY.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/HOUSING TENURE.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/HOUSEHOLD SIZE.csv' CSV HEADER;
    \COPY decennial FROM '/tmp/$CONTAINER_NAME/TENURE BY AGE OF HOUSEHOLDER.csv' CSV HEADER;
EOF
}

echo "
  Success! Be sure to run 'dokku postgres:link' for the new database and target app. 

  Container name is $CONTAINER_NAME.
"

