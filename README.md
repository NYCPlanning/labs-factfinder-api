[![CircleCI](https://circleci.com/gh/NYCPlanning/labs-factfinder-api/tree/develop.svg?style=svg)](https://circleci.com/gh/NYCPlanning/labs-factfinder-api/tree/develop)

# FactFinder API
An express.js api that provides search and selection data for [NYC Population FactFinder](https://github.com/NYCPlanning/labs-nyc-factfinder).

## Requirements

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (with NPM)
- Nodemon

## Local development

- Clone this repo `https://github.com/NYCPlanning/labs-factfinder-api.git`
- Install Dependencies `yarn install`
- Create `.env` file based on `.env-example` with your mongo uri and postgresql connection string
  - A .env file may be found on 1pass
- Start the server `npm run devstart`

## Architecture

### Database/Table Definitions

There are three core set of tables that support the Factfinder API:

1. Profile tables - The set of tables that hold ACS and Census data by geography and variable.
2. Selection table - Holds user-defined selection of geographies. See the section Selection geotype Factfinder IDs
3. Support Geoids table - Holds a mapping of geoid to human-readable label for the geography.


### API Endpoints.

`/search` returns search results for addresses, neighborhoods, etc.  Uses geosearch, and carto tables to return autocomplete suggestions.

`/selection` sets and gets collections of census geometries.  Uses mongodb to store an array of geoids that the user selected.

`/profile` returns decennial/acs data for a given profile type and geographic selection.  Queries postgresql using pg-promise.

### Caching
The dokku plugin `nginx-cache` via [https://github.com/koalalorenzo/dokku-nginx-cache](https://github.com/koalalorenzo/dokku-nginx-cache) is enabled for this app, but nginx won't cache if expressjs is not returning a cache-control header.

The `profile` routes contain simple middleware that adds `Cache-control` headers to responses with `max-age=2592000` (30 days).

### Routes

- `/search` - gets results that match a string passed in as query parameter `q`.  Returns various search result types:
  - `geosearch` - autocomplete API results
  - `nta` - neighborhoods that match the input query
  - `tract` - tracts that match the input query
  - `block` - census blocks that match the input query
  - `borough` -
  - `cdta` - 
  - `cd` - community districts

- `/selection`
  - `POST /selection`
    - Request payload should be an object with the following properties:
      - `:geotype` - (Required) See [geotype section](#geotype) for possible values
      - `:geoid`  - (Required) See [geoids](#geoid)
    - Checks if the incoming combination of geoids already exists in the database.  If so, returns the hash ID of the selection.  If not, it adds it to the database and returns the hash ID.
  - `GET /selection/:geotype/:geoid`
    Retrieves geography data for the given geoid and geotype combination
    - **Request:**
      - `:geotype` - (Required) See [geotype section](#geotype) for possible values
      - `:geoid`  - (Required) See [geoids](#geoid)
    - **Response:** an object with the following properties:
      - `status` - 'success' if found, 'not found' if not found
      - `id` - the  of the selection
      - `type` - geoid type of the selection, one of 'blocks', 'tracts', 'ntas', 'pumas'
      - `features` - a geojson FeatureCollection containing a Feature for each selected geometry

  - `/profile`
    - `GET /profile/:geotype/:geoid?compareTo={:compareTo}`
    Retrieves profile data for the given geoid, geotype, and compareTo combination.
      - **Request:**
        - `:geotype` - (Required) See [geotype section](#geotype) for possible values
        - `:geoid`  - (Required) See [geoids](#geoid)
        - `?compareTo` - (Essential) The geoid of the geography to compare against.
        Although this is a queryParam, this is actually crucial for this endpoint. Not an ideal architecture, probably. If not passed, it will default to NYC. But better to pass in an intended geoid.
        The endpoint will retrieve profile data for the comparison geography specified by this parameter.
      - **Response:** An array of objects each representing the data for a different profile variable, for the user's selected geometry. Each object contains the variable data for current year, previous year and change over time. For each year, it further slices data by selection (geoid), the comparison, and the difference between selection and comparison. "Slicing" is done prefixes. Example:

      ```
        [
          {
            "id": "QUlBTk5I",
            "sum": 0,
            "m": 0,
            "cv": null,
            "percent": 0,
            "variable": "aiannh",
            "variablename": "AIANNH",
            "base": "Pop_2",
            "category": "mutually_exclusive_race_hispanic_origin",
            "profile": "demographic",
            "previous_sum": 0,
            "previous_m": 0,
            ...
            "difference_sum": -15017,
            "percent_significant": false
          },
          {
            "id": "QXNuMVJj",
            "sum": 472,
            "m": 157.429349233235,
            "cv": 20.2757906899742,
            "variable": "asn1rc",
            ....
          },
          ...
        ]
      ```

<a name="geoid"></a>
### *Geoids
A `geoid` in the context of endpoint parameters (see above section) can either be a [Selection table id](#selection) (i.e. of geotype `selection`), or an id that maps to the `geoid` column in the Profile tables (e.g. of geotype `ntas`, `boroughs`, `cdtas`, etc).

<a name="geotype"></a>
### Geotypes

The Frontend and this API has its own programmatic abstraction for the `geotype` variable, different from that in the Postgres database. Primarily, `geotype` in this application can also take on the value of "selection", alongside other geotypes like "ntas", "boroughs", etc. The "selection" value helps indicate to the API whether to look in the Selection Postgres Database table for aggregate geographies.

See the table below for possible programmatic Geotype values, and a mapping of programmatic `geotype` values to Profile table values.

  **The programmatic column values are the acceptable arguments into the endpoints above.**

| Geotype (Programmatic)    | Geotype (Profile table) | Source (which profile tables) |
| ------------------------- | ----------------------- | ----------------------------- |
| selection*                 | N/A                    | ACS, Census                   |
| ntas                      | NTA2020                 | ACS, Census                   |
| tracts                    | CT2020                  | ACS, Census                   |
| cdtas                     | CDTA2020                | ACS                           |
|                           | ???                     |      Census                   |
| blocks                    | CB2020                  |      Census                   |
| boroughs                  | Boro2020                | ACS, Census                   |
| city                      | City2020                | ACS, Census                   |

Each row within the profile tables have a unique geoid, geotype pair of values.

<a name="selection"></a>
#### Selections, Selection geotype and Selection hash Ids

Geoids of geotype `selection` are ids for a custom, user-defined geographical area held by the Selection table in the Factfinder stack. Each Selection geoid points to one row in the Selection table. Each row holds an array of geoids of other geotypes (like ntas, tracts, cdtas, etc).

## Data Updates
Backing data is managed by EDM team. This app sets up foreign data wrappers (FDW) which provide schema-level access to EDM's factfinder tables.
What is an FDW? It allows locals access to remote database tables. Once the FDW is created, we do a one-time insert into a local table, performing
whatever munging needs to happen between EDM and the labs app. In our case, it's unioning the years.

Currently, migration files handle updating the data through these FDWs by inserting data into existing tables.

To perform a basic refresh of the data, re-run the relevant migration. What is that? As of writing, it's 1576792591496_copy-data-2017.js.
Look up pg-migrate instructions on targetting a specific migration.

To update the data with new release data (2018, 2019), generate a new migration for this. This migration should probably clear out the existing data
and do any munging it needs (for example, unioning the correct years). Then, run the migration.

## Backend services

- **Carto** - Carto instance with MapPLUTO and other Zoning-related datasets
- **NYC GeoSearch API** - Autocomplete search results
- **mongolab** - cloud-hosted mongodb service

## Testing and checks

- **ESLint** - We use ESLint with Airbnb's rules for JavaScript projects
  - Add an ESLint plugin to your text editor to highlight broken rules while you code
  - You can also run `eslint` at the command line with the `--fix` flag to automatically fix some errors.

## Deployment

Create dokku remote: `git remote add dokku dokku@{dokkudomain}:factfinder-api`
Deploy: `git push dokku master`

## Contact us

You can find us on Twitter at [@nycplanninglabs](https://twitter.com/nycplanninglabs), or comment on issues and we'll follow up as soon as we can. If you'd like to send an email, use [labs_dl@planning.nyc.gov](mailto:labs_dl@planning.nyc.gov)
