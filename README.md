# zola-search-api
An express.js api that delivers typeahead results 

## Development Environment

1. Clone this repo & install dependencies
  ```
  git clone https://github.com/NYCPlanning/labs-zola-search-api.git
  npm install
  ```

2. Copy .env example
  ```
  cp .env-example .env
  ```
  Open the new `.env` file and add your mapzen search api key.

3. Start the server
  ```
  npm run evstart
  ```
  
## Routes

- `/search` - gets results that match a string passed in as query parameter `q`

## Types of results

Results in will be JSON objects and will be one of the following types:

`address` - Mapzen Search geocoder results that matched the 

`lot` - A PLUTO tax lot that matched either on `bbl` or `address`

`zma` - A zoning amendment that matched either on `ulurpno` or `project_na`
