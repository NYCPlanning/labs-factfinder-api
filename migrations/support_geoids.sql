DROP TABLE IF EXISTS support_geoids;
CREATE TEMP TABLE tmp (
    geoid text,
    geotype text,
    geogname text
);

\COPY tmp FROM PSTDIN WITH DELIMITER ',' CSV HEADER;

CREATE TABLE support_geoids AS (
    (
        SELECT 
            geoid, 
            geotype, 
            geogname AS label, 
            'City & Boroughs' AS typelabel
        FROM tmp
        WHERE geotype LIKE 'Boro%' 
            OR geotype LIKE 'City%'
        ORDER BY CASE
        WHEN geogname = 'New York City' THEN '1'
        WHEN geogname = 'Bronx' THEN '2'
        WHEN geogname = 'Brooklyn' THEN '3'
        WHEN geogname = 'Manhattan' THEN '4'
        WHEN geogname = 'Queens' THEN '5'
        WHEN geogname = 'Staten Island' THEN '6'
        ELSE geogname END ASC
    ) UNION ALL 
    (
        SELECT
        geoid, geotype, geogname || ' (' || geoid || ')' AS label,
        'Neighborhood Tabulation Areas (NTAs)' AS typelabel
        FROM tmp
        WHERE geotype LIKE 'NTA%'
        AND geogname NOT ILIKE 'park-cemetery-etc%25'
        ORDER BY geogname ASC
    ) UNION ALL 
    (
        SELECT 
            geoid, 
            geotype, 
            geogname as label, 
            'Community District Tabulation Areas (CDTAs)' AS typelabel
        FROM tmp
        WHERE geotype LIKE 'CDTA%'
        ORDER BY geogname ASC
    ) UNION ALL 
    (
        SELECT 
            geoid, 
            geotype, 
            geogname as label, 
            'City Council Districts (CCDs)' AS typelabel
        FROM tmp
        WHERE geotype LIKE 'CCD%'
        ORDER BY geogname ASC
    )
);