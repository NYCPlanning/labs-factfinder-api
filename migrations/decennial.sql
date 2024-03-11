CREATE SCHEMA IF NOT EXISTS decennial;
DROP TABLE IF EXISTS decennial.:"TABLE_NAME";
DROP INDEX IF  EXISTS decennial.:INDEX_NAME;

CREATE TEMP TABLE tmp (
    year text,
    geoid text,
    variable text,
    "value" double precision
);

\COPY tmp FROM PSTDIN WITH DELIMITER ',' CSV HEADER;

DROP TABLE IF EXISTS decennial.:"TABLE_NAME";
SELECT * INTO decennial.:"TABLE_NAME" FROM tmp;

CREATE INDEX IF NOT EXISTS :INDEX_NAME ON decennial.:"TABLE_NAME" (geoid);