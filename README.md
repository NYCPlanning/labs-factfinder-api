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

`/profile` returns census/acs data for a given profile type and geographic selection.  Queries postgresql using pg-promise.

### Caching
The dokku plugin `nginx-cache` via [https://github.com/koalalorenzo/dokku-nginx-cache](https://github.com/koalalorenzo/dokku-nginx-cache) is enabled for this app, but nginx won't cache if expressjs is not returning a cache-control header.

The `profile` routes contain simple middleware that adds `Cache-control` headers to responses with `max-age=2592000` (30 days).

### Routes

- `/search` - gets results that match a string passed in as query parameter `q`.  Returns various search result types:
  - `geosearch` - autocomplete API results
  - `nta` - neighborhoods that match the input query
  - `puma` - pumas that match the input query
  - `tract` - tracts that match the input query
  - `block` - census blocks that match the input query

- `/selection`
  - `POST /selection`
    - Request payload should be an object with the following properties:
      - `geoids` - an array of geoids
      - `type` - one of 'blocks', 'tracts', 'ntas', 'pumas'
    - Checks if this combination of geoids already exists in the database.  If so, returns the [Factfinder ID*](#factfinder-id) (specifically a [Selection ID*](#factfinder-id-selection-id)) of the selection.  If not, it adds it to the database and returns the Factfinder ID*
  - `GET /selection/:factfinder_id`
    - **Request:**
      - `:factfinder_id` See the [Factfinder ID*](#factfinder-id) section below for details.
    - **Response:** an object with the following properties:
      - `status` - 'success' if found, 'not found' if not found
      - `id` - the [Factfinder ID*](#factfinder-id) of the selection
      - `type` - geoid type of the selection, one of 'blocks', 'tracts', 'ntas', 'pumas'
      - `features` - a geojson FeatureCollection containing a Feature for each selected geometry

  - `/profile`
    - `GET /profile/:factfinder_id`
      - **Request:**
          - `:factfinder_id` See the [Factfinder ID*](#factfinder-id) section below for details.
      - **Response:** An array of objects each representing the data for a different profile variable, for the user's selected geometry. Example:

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

<a name="factfinder-id"></a>
### *Factfinder ID
  - A Factfinder ID takes this format:

  ```
    <geotype abbreviation>_<geoid>
  ```

  The geotype abbreviation allows the API to infer the `geotype` value associated with the geoid.

  For example, given the Factfinder ID `CDTA_BK05`, the API can determine that the geoid `BK05` is the geoid for a Community Districta Tabulation Area (CDTA) geographical area.

  See the table below for valid `<geotype abbreviation>` values and the internal `geotype` values that they translate to.

| Abbrev      | Geotype (Programmatic)    | Geotype (Profile table) | Source (which profile tables) |
| ----------- | ------------------------- | ----------------------- | ----------------------------- |
| SID         | selection*                 | N/A                    | ACS, Census                   |
| NTA         | ntas                      | NTA2020                 | ACS, Census                   |
| TRACT       | tracts                    | CT2020                  | ACS, Census                   |
| CDTA        | cdtas                     | CDTA2020                | ACS                           |
| DIST        |                           | ???                     |      Census                   |
| BLOCK       | blocks                    | CB2020                  |      Census                   |
| BORO        | boroughs                  | Boro2020                | ACS, Census                   |

Each row within the profile tables have a unique geoid, geotype pair of values.

<a name="factfinder-id-selection-id"></a>
#### Selection geotype Factfinder IDs

Factfinder IDs of type `selection` are IDs for a custom, user-defined geographical area held by the Selection table in the Factfinder stack. Each Selection ID points to one row in the Selection table. Each row holds an array of geoids for geographies of other geotypes (ntas, tracts, cdtas, etc)

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
