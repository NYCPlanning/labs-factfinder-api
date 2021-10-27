/*
This will be used to store custom geography selections
*/
CREATE TABLE IF NOT EXISTS selection (
	geotype text CHECK(geotype IN ('blocks','tracts','ntas','cdtas','boroughs','districts')),
	geoids text[],
	hash text PRIMARY KEY
);