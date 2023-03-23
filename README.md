[![CircleCI](https://circleci.com/gh/NYCPlanning/labs-factfinder-api/tree/develop.svg?style=svg)](https://circleci.com/gh/NYCPlanning/labs-factfinder-api/tree/develop)

# FactFinder API
An express.js api that provides search and selection data for [NYC Population FactFinder](https://github.com/NYCPlanning/labs-factfinder).

## Requirements

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) **version listed in .nvmrc**  We suggest installing versions of Node via [nvm](https://github.com/nvm-sh/nvm).
- [Yarn v1.x](https://classic.yarnpkg.com/lang/en/)

## Setting Up a Local Development Environment

1. Clone this repo `https://github.com/NYCPlanning/labs-factfinder-api.git`
2. Ensure you're running Node v10.21.0 and have Yarn installed
3. Install Dependencies `yarn`
4. Create a file called `.env` in the root directory of this repository. This file must contain an environment variable called `DATABASE_URL` with a postgresql connection string for your database. Copy of the contents of`sample.env` into you're newly created `.env`. Be sure to name this file correctly, as it may need to contain sensitive information and therefore is included in the `.gitignore` file for this repo. If you add this file and see it show up in your Git diffs, that means you named it incorrectly and should not commit the file you created.
5. This API relies on a Postgresql database for its data. At this point in the set up, you must decide if you want to use a local instance of the database or if you want to connect to the remote database used by our development environment. If you're only making changes to the API code, you will likely be fine using the development environment database. If you're making changes to the scripts in `/migrations` or performing database updates, you should start with a local database so that you can work on your changes without affecting any remote environments shared across the team. If you're unsure which approach you should take, ask someone on the team for help.

  ### Connecting your local environment to the Development environment database.
  > This option is only available to internal DCP developers, as it requires access to sensitive information.
  * Log into our 1PW vault and look for a document called "Factfinder API Development Env"
  * Download that file and replace the contents of your `.env` file with its contents.

  ### Setting up a local database instance with `docker-compose`
  You can set up a local instance of the database that this API relies on using Docker. This is helpful for testing changes to the API locally and for making updates to the "migration" scripts themselves. To set up a local instance of the database:
  * Makes sure you have [docker installed](https://www.docker.com/get-started/). If you don't, consider installing it via [homebrew](https://www.brew.sh).
  * Once you have docker installed, try running `docker-compose up` from the root directory of this repository. The file `docker-compose.yml` should spin up a container running the default Postgresql image. If this step is successful, you should see logs indicating that the database is running and ready to accept connections in your terminal. You will need to keep this container running while running the project.
  * Make sure you have locally installed [jq](https://stedolan.github.io/jq/download/) and [Postgres](https://www.postgresql.org/download/). Tip: `brew install jq` and `brew install postgresql` for Mac users using Homebrew.
  * Double check that you created your `.env` file and copied over the contents of `sample.env`. The contents of `sample.env` are pre-configured to connect to the database created by `docker-compose.yml`
  * Run `yarn migrate`. Running the `migrate` command kicks off `./bin/migrate` node executable, which in turn runs the `.sh` shell scripts under `./migrations`. Running this command will kick off a series of bash scripts that download and datasets and load them into your database. You should see logs in your terminal such as `Running ETL command: ./migrations/cli.sh etl --datasource=acs --year=2019 --geography=2010_to_2020 --download --load`.

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
      
  Note - these scripts appear to occasionally time out and fail "silently". If you get all `Done!` logs but are missing tables in your database, try re-running the script for the missing tables individually.

6. Once you're set up to connect to either the development environment or your own local database, start the server by running `yarn run dev`

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
            "percent_is_reliable": false
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

## Where the data for this app comes from and how to update it
The project has a set of "migration" scripts to set up a Postgres database with required tables and load data. The scripts transfer data from EDM's CSV datasets into the target Postgres database -- whether it be a local database for development or the database for the development, staging, or production environments

###  Data Sources
> The following describes where the raw data loaded into this app is stored. These sources are only accessible by internal DCP developers.

The scripts in the `/migrations` folder of this repo read data from a set of CSVs built by EDM. Those data are stored in the `edm-publishing` Space in Digital Ocean under a folder called `db-factfinder`. Inside that folder, the data are further organized by ACS or Decennial, as well as publication year. Additional metadata is sourced from the [db-factfinder repo](https://github.com/NYCPlanning/db-factfinder/tree/dev/factfinder/data)

### Data Updates

As most of the source data is organized into folders based on whether the data is ACS or Decennial and the year of publication, the migration scripts and the API code rely on a set of constants located in `labs-factfinder-api/special-calculations/data/constants.js`. Performing data updates for new data releases should be as easy as updating the years in those constants and rerunning the migrations against a local database first, then against development and staging environments for testing, and finally for production once the changes are ready to go live. Note that you should only have to make changes to those constants when you are doing the work of updating the _data itself_. If you're just trying to populate a local instance of the database so that you can work on application code, you should be able to leave those constants as-is.

> The following process only applies to internal DCP developers

The process for updating the data in the development, staging, and production environments is similar to that for a local environment. Make sure you have `jq` and `postgresql` installed. Then update your `DATABASE_URL` environment variable to point to the environment you want to update. You can find the host, port, username, and password that you need to update your `DATABASE_URL` connection string by looking in the `labs-db` database cluster in Digital Ocean and looking for the factfinder database for each environment. Once you have that set up, you should be able to run `yarn migrate` against one of those environments. Note that this is currently a manual process so it should usually be executed by experienced members of the team with proper communication beforehand. TODO - finish automating data migrations scripts to run via GitHub Actions. Before updating any remote databases, be sure to submit a PR for review that updates the constants and any necessary code. The updates should only be executed from the corresponding `develop`, `staging`, and `master` branches after a PR has been merged into them.

## Backend services

- **Carto** - Carto instance with MapPLUTO and other Zoning-related datasets
- **NYC GeoSearch API** - Autocomplete search results

## Testing and checks

- **ESLint** - We use ESLint with Airbnb's rules for JavaScript projects
  - Add an ESLint plugin to your text editor to highlight broken rules while you code
  - You can also run `eslint` at the command line with the `--fix` flag to automatically fix some errors.
