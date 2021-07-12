CREATE SCHEMA IF NOT EXISTS acs;
CREATE SCHEMA IF NOT EXISTS acs_demographic;
CREATE SCHEMA IF NOT EXISTS acs_social;
CREATE SCHEMA IF NOT EXISTS acs_economic;
CREATE SCHEMA IF NOT EXISTS acs_housing;
DROP TABLE IF EXISTS acs.:"TABLE_NAME";

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

DROP TABLE IF EXISTS acs.:"TABLE_NAME";
SELECT
    labs_geotype as geotype,
    labs_geoid as geoid,
    pff_variable as variable,
    c, e, m, p, z, 
    domain
INTO acs.:"TABLE_NAME" FROM tmp;

DROP TABLE IF EXISTS acs_demographic.:"TABLE_NAME";
SELECT
    labs_geotype as geotype,
    labs_geoid as geoid,
    pff_variable as variable,
    c, e, m, p, z
INTO acs_demographic.:"TABLE_NAME" FROM tmp
WHERE domain = 'demographic';

DROP TABLE IF EXISTS acs_social.:"TABLE_NAME";
SELECT
    labs_geotype as geotype,
    labs_geoid as geoid,
    pff_variable as variable,
    c, e, m, p, z
INTO acs_social.:"TABLE_NAME" FROM tmp
WHERE domain = 'social';

DROP TABLE IF EXISTS acs_housing.:"TABLE_NAME";
SELECT
    labs_geotype as geotype,   
    labs_geoid as geoid,
    pff_variable as variable,
    c, e, m, p, z
INTO acs_housing.:"TABLE_NAME" FROM tmp 
WHERE domain = 'housing';

DROP TABLE IF EXISTS acs_economic.:"TABLE_NAME";
SELECT
    labs_geotype as geotype,
    labs_geoid as geoid,
    pff_variable as variable,
    c, e, m, p, z
INTO acs_economic.:"TABLE_NAME" FROM tmp
WHERE domain = 'economic';