DROP TABLE IF EXISTS demographic;
DROP TABLE IF EXISTS social;
DROP TABLE IF EXISTS economic;
DROP TABLE IF EXISTS housing;

CREATE TABLE demographic AS (
    SELECT * FROM acs_demographic.:"YEAR1" UNION 
    SELECT * FROM acs_demographic.:"YEAR2"
);

CREATE TABLE social AS (
    SELECT * FROM acs_social.:"YEAR1" UNION 
    SELECT * FROM acs_social.:"YEAR2"
);

CREATE TABLE economic AS (
    SELECT * FROM acs_economic.:"YEAR1" UNION 
    SELECT * FROM acs_economic.:"YEAR2"
);

CREATE TABLE housing AS (
    SELECT * FROM acs_housing.:"YEAR1" UNION 
    SELECT * FROM acs_housing.:"YEAR2"
);