FROM node:16.17.0 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clear -f
COPY . .
RUN npm run build

FROM node:16.17.0 as prod-npm-packages-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit dev && npm cache clear -f

FROM node:16.17.0 as run-stage
WORKDIR /app
COPY package*.json ./
COPY --from=prod-npm-packages-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/dist ./dist
CMD [ "node", "./dist/main.js" ]
