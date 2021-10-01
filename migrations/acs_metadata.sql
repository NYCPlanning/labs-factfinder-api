CREATE SCHEMA IF NOT EXISTS acs;
DROP TABLE IF EXISTS acs.metadata;
CREATE TABLE acs.metadata (
    variablename text,
    release_year text,
    category text,
    base text
);

INSERT INTO acs.metadata (
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
        WHERE record ->> 'domain' IN ('social', 'economic', 'housing', 'demographic')
    ) a
    GROUP BY variablename, base, category
    ORDER BY variablename, base, category
);