/*
This will be used to store custom geography selections
*/
CREATE TABLE IF NOT EXISTS selection (
	geotype text CHECK(geotype IN ('blocks','tracts','ntas','cdtas','boroughs','districts'),
	geoids text[] CHECK(array_length(geoids, 1) BETWEEN 2 AND 12),
	hash text PRIMARY KEY
);