[![CircleCI](https://circleci.com/gh/NYCPlanning/labs-factfinder-api/tree/develop.svg?style=svg)](https://circleci.com/gh/NYCPlanning/labs-factfinder-api/tree/develop)

# FactFinder API
An express.js api that provides search and selection data for [NYC Population FactFinder](https://github.com/NYCPlanning/labs-factfinder).

## Requirements

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (with NPM or Yarn)
- Nodemon

## Local development

- Clone this repo `https://github.com/NYCPlanning/labs-factfinder-api.git`
- Install Dependencies `yarn install`
- Create `.env` file based on `.env-example` with your mongo uri and postgresql connection string
  - A .env file may be found on 1pass
- Start the server `npm run devstart` or `yarn run devstart`

## Architecture

### Database/Table Definitions

There are three core set of tables that support the Factfinder API:

1. Survey tables - The set of tables that hold ACS and Census data by geography and variable.
2. Selection table - Holds user-defined selection of geographies. See the section Selection geotype Factfinder IDs
3. Support Geoids table - Holds a mapping of geoid to human-readable label for the geography.


### API Endpoints.

`/search` returns search results for addresses, neighborhoods, etc.  Uses geosearch, and carto tables to return autocomplete suggestions.

`/selection` sets and gets collections of census geometries. Creates or looks up an array of geoids in the support_geoids table.

`/survey` returns decennial/acs data for a given array of geoids.

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

  - `/survey`
    - `GET /survey/:survey/:geotype/:geoid?compareTo={:compareTo}`
    Retrieves survey data for the given geoid, geotype, and compareTo combination.
      - **Request:**
        - `:survey` - (Required) Either `acs` or `decennial`.
        - `:geotype` - (Required) See [geotype section](#geotype) for possible values
        - `:geoid`  - (Required) See [geoids](#geoid)
        - `?compareTo` - (Essential) The geoid of the geography to compare against.
        Although this is a queryParam, this is actually crucial for this endpoint. Not an ideal architecture, probably. If not passed, it will default to NYC. But better to pass in an intended geoid.
        The endpoint will retrieve survey data for the comparison geography specified by this parameter.
      - **Response:** An array of objects each representing the data for a different survey variable, for the user's selected geometry. Each object contains the variable data for current year, previous year and change over time. For each year, it further slices data by selection (geoid), the comparison, and the difference between selection and comparison. "Slicing" is done prefixes. Example:

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
            "survey": "acs",
            "previous_sum": 0,
            "previous_m": 0,
            ...
            "difference_sum": -15017,
            "percent_reliable": false
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
A `geoid` in the context of endpoint parameters (see above section) can either be a [Selection table id](#selection) (i.e. of geotype `selection`), or an id that maps to the `geoid` column in the Survey tables (e.g. of geotype `ntas`, `boroughs`, `cdtas`, etc).

<a name="geotype"></a>
### Geotypes

The Frontend and this API has its own programmatic abstraction for the `geotype` variable, different from that in the Postgres database. Primarily, `geotype` in this application can also take on the value of "selection", alongside other geotypes like "ntas", "boroughs", etc. The "selection" value helps indicate to the API whether to look in the Selection Postgres Database table for aggregate geographies.

See the table below for possible programmatic Geotype values, and a mapping of programmatic `geotype` values to Survey table values.

  **The programmatic column values are the acceptable arguments into the endpoints above.**

| Geotype (Programmatic)    | Geotype (Survey table) | Source (which survey tables) |
| ------------------------- | ----------------------- | ----------------------------- |
| selection*                 | N/A                    | ACS, Census                   |
| ntas                      | NTA2020                 | ACS, Census                   |
| tracts                    | CT2020                  | ACS, Census                   |
| cdtas                     | CDTA2020                | ACS                           |
|                           | ???                     |      Census                   |
| blocks                    | CB2020                  |      Census                   |
| boroughs                  | Boro2020                | ACS, Census                   |
| city                      | City2020                | ACS, Census                   |

Each row within the survey tables have a unique geoid, geotype pair of values.

<a name="selection"></a>
#### Selections, Selection geotype and Selection hash Ids

Geoids of geotype `selection` are ids for a custom, user-defined geographical area held by the Selection table in the Factfinder stack. Each Selection geoid points to one row in the Selection table. Each row holds an array of geoids of other geotypes (like ntas, tracts, cdtas, etc).

## Data Updates
The project has a set of "migration" scripts to set up a Postgres database with required tables and load data. The scripts transfer read-only data from EDM's databases into the target Postgres database -- whether it be the develop, staging, or production database.

### Quickstart
Make sure you have locally installed the CLI tool [jq](https://stedolan.github.io/jq/download/) and [Postgres](https://www.postgresql.org/download/). Tip: `brew install jq` and `brew install postgresql` for Mac users. Verify you have the `jq` and `psql` command avaible in your command line. Then...

  1. Create a new, target PostgreSql database if one doesn't already exist.
  2. Set the DATABASE_URL environment variable in the `.env` to the target Postgres database (TODO: migrate away from this pattern)
  3. `yarn migrate`

Running the `migrate` command kicks off `./bin/migrate` node executable, which in turn runs the `.sh` shell scripts under `./migrations`.

You should see 8 check marks on completion. By the end of the migration, the target Postgres database should be set up with these schemas/tables:

- support_geoids (table)
- selection (table)
- acs (schema)
    - 2010 (table)
    - 2019 (table)
    - metadata (table)
- decennial (schema)
    - 2010 (table)
    - 2020 (table)
    - metadata (table)

## Note on Reliability


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
