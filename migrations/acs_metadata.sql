CREATE TABLE meta ( _json text , _year text );
INSERT INTO meta VALUES(:'CONTENT_CURR', :'YEAR_CURR');
INSERT INTO meta VALUES(:'CONTENT_PREV', :'YEAR_PREV');

CREATE SCHEMA IF NOT EXISTS acs;
DROP TABLE IF EXISTS acs.metadata;
CREATE TABLE acs.metadata (
    variablename text,
    release_year text,
    profile text,
    category text,
    base text
);

INSERT INTO acs.metadata (
    SELECT 
        variablename,
        array_to_string(array_agg(release_year), ', '),
        profile,
        category,
        base
    FROM (
        SELECT
            record ->> 'pff_variable' as variablename,
            'Y'||(_year::int-4)::TEXT||'-'||_year as release_year,
            initcap(record ->> 'domain') as profile,
            record ->> 'category' as category,
            record ->> 'base_variable' as base
        FROM (SELECT json_array_elements(_json::json) AS record, _year FROM meta) t
        WHERE record ->> 'domain' IN ('social', 'economic', 'housing', 'demographic')
    ) a 
    GROUP BY profile, variablename, base, category
    ORDER BY profile, variablename, base, category
);