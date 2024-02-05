CREATE SCHEMA IF NOT EXISTS acs;
DROP TABLE IF EXISTS acs.:"TABLE_NAME";
DROP INDEX IF EXISTS acs.:INDEX_NAME;

CREATE TEMP TABLE tmp (
    census_geoid text,
    labs_geoid text,
    geotype text,
    labs_geotype text,
    pff_variable text,
    c double precision,
    e double precision,
    m double precision,
    p double precision,
    z double precision,
    domain text
);

\COPY tmp FROM PSTDIN WITH DELIMITER ',' CSV HEADER;

SELECT
    labs_geotype as geotype,
    labs_geoid as geoid,
    pff_variable as variable,
    'Y'||(:TABLE_NAME-4)::TEXT||'-'||:'TABLE_NAME' as dataset,
    domain as profile,
    c as correlation_coefficient,
    e as estimate,
    m as margin_of_error,
    p as percent,
    z as percent_margin_of_error
INTO acs.:"TABLE_NAME" FROM tmp;

CREATE INDEX IF NOT EXISTS :INDEX_NAME ON acs.:"TABLE_NAME" (geoid);