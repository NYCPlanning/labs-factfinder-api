CREATE TEMP TABLE meta ( _json text , release_year text );
INSERT INTO meta VALUES(:'CONTENT_CURR', :'YEAR_CURR');
INSERT INTO meta VALUES(:'CONTENT_PREV', :'YEAR_PREV');

CREATE SCHEMA IF NOT EXISTS decennial;
DROP TABLE IF EXISTS decennial.metadata;
CREATE TABLE decennial.metadata (
    variablename text,
    release_year text,
    category text,
    relation text
);

INSERT INTO decennial.metadata (
    SELECT
        variablename,
        array_to_string(array_agg(release_year), ', '),
        category,
        relation
    FROM (
        SELECT
            record ->> 'pff_variable' as variablename,
            release_year,
            record ->> 'category' as category,
            record ->> 'base_variable' as relation
        FROM (SELECT json_array_elements(_json::json) AS record, _year FROM meta) t
        WHERE record ->> 'domain' IN ('decennial')
    ) a 
    GROUP BY variablename, relation, category
    ORDER BY variablename, relation, category
);