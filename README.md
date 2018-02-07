# factfinder-api
An express.js api that provides search and selection data for [NYC Population Factfinder](https://github.com/NYCPlanning/labs-nyc-factfinder).  

## Requirements

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (with NPM)

## Local development

- Clone this repo `https://github.com/NYCPlanning/labs-factfinder-api.git`
- Install Dependencies `npm install`
- Create `.env` file based on `.env-example` with your mapzen api key and mongo uri
- Start the server `npm run devstart`

## Architecture

### Caching
The dokku plugin `nginx-cache` via [https://github.com/koalalorenzo/dokku-nginx-cache](https://github.com/koalalorenzo/dokku-nginx-cache) is enabled for this app, but nginx won't cache if expressjs is not returning a cache-control header.

The `profile` routes contain simple middleware that adds `Cache-control` headers to responses with `max-age=2592000` (30 days).

### Routes

- `/search` - gets results that match a string passed in as query parameter `q`.  Returns various search result types:
  - `mapzen` - mapzen autocomplete api results
  - `nta` - neighborhoods that match the input query
  - `puma` - pumas that match the input query
  - `tract` - tracts that match the input query
  - `block` - census blocks that match the input query


- `/selection`
  - `POST /selection`
    - Request payload should be an object with the following properties:
      - `geoids` - an array of geoids
      - `type` - one of 'blocks', 'tracts', 'ntas', 'pumas'
    - Checks if this combination of geoids already exists in the database.  If so, returns the `id` of the selection.  If not, it adds it to the database and returns the `id`
  - `GET /selection/:id`
    - Returns an object with the following properties:
      - `status` - 'success' if found, 'not found' if not found
      - `id` - the `id` of the selection
      - `type` - geoid type of the selection, one of 'blocks', 'tracts', 'ntas', 'pumas'
      - `features` - a geojson FeatureCollection containing a Feature for each selected geometry

## Backend services

- **Carto** - Carto instance with MapPLUTO and other Zoning-related datasets
- **mapzen search api** - Mapzen autocomplete search results
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
