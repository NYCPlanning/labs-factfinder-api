FROM node:lts-hydrogen

WORKDIR /usr/app
COPY package.json .
COPY yarn.lock .
RUN yarn

COPY . .
CMD ["yarn", "run", "dev"]
