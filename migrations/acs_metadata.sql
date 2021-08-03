CREATE TEMP TABLE meta ( j text );
INSERT INTO meta VALUES(:'CONTENT');

CREATE SCHEMA IF NOT EXISTS acs_metadata;
DROP TABLE IF EXISTS acs_metadata.:"TABLE_NAME";
CREATE TABLE acs_metadata.:"TABLE_NAME" (
    variablename text,
    release_year text,
    profile text,
    category text,
    base text
);

INSERT INTO acs_metadata.:"TABLE_NAME" (
    SELECT
        record ->> 'pff_variable' as variablename,
        'Y'||(:TABLE_NAME-4)::TEXT||'-'||:'TABLE_NAME' as release_year,
        initcap(record ->> 'domain') as profile,
        record ->> 'category' as category,
        record ->> 'base_variable' as base
    FROM (SELECT json_array_elements(j::json) AS record FROM meta) t
    WHERE record ->> 'domain' IN ('social', 'economic', 'housing', 'demographic')
    ORDER BY profile, variablename, base
);