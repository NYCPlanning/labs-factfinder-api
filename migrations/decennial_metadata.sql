CREATE TEMP TABLE meta ( _json text , release_year text );
\set DECENNIAL_CURR `cat migrations/metadata/DECENNIAL_CURR.json`
\set DECENNIAL_PREV `cat migrations/metadata/DECENNIAL_PREV.json`
INSERT INTO meta VALUES(:'DECENNIAL_CURR', :'YEAR_CURR');
INSERT INTO meta VALUES(:'DECENNIAL_PREV', :'YEAR_PREV');

CREATE SCHEMA IF NOT EXISTS decennial;
DROP TABLE IF EXISTS decennial.metadata;
CREATE TABLE decennial.metadata (
    variablename text,
    release_year text,
    category text,
    base text
);

INSERT INTO decennial.metadata (
    SELECT
        variablename,
        array_to_string(array_agg(release_year), ', '),
        category,
        base
    FROM (
        SELECT
            record ->> 'pff_variable' as variablename,
            release_year,
            record ->> 'category' as category,
            record ->> 'base_variable' as base
        FROM (SELECT json_array_elements(_json::json) AS record, release_year FROM meta) t
        WHERE record ->> 'domain' IN ('census')
    ) a 
    GROUP BY variablename, base, category
    ORDER BY variablename, base, category
);