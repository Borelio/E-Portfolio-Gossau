FROM node:lts-alpine
ENV TZ=Europe/Zurich

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY ./src .

CMD [ "node", "index.js" ]