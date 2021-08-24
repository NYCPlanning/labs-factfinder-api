/*
This will be used to store custom geography selections
*/
CREATE TABLE IF NOT EXISTS selection (
	geoid SERIAL PRIMARY KEY,
	geotype text CHECK(_type IN ('blocks','tracts','ntas','cdtas')),
	geoids text[] CHECK(array_length(geoids, 1) BETWEEN 2 AND 12),
	hash text
);