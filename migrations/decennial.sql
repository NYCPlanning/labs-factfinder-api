CREATE SCHEMA IF NOT EXISTS decennial;
DROP TABLE IF EXISTS decennial.:"TABLE_NAME";

CREATE TEMP TABLE tmp (
    year text,
    geoid text,
    variable text,
    "value" double precision
);

\COPY tmp FROM PSTDIN WITH DELIMITER ',' CSV HEADER;

DROP TABLE IF EXISTS decennial.:"TABLE_NAME";
SELECT * INTO decennial.:"TABLE_NAME" FROM tmp;