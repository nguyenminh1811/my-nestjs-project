###################
# BUILD FOR LOCAL DEVELOPMENT
###################

ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:${NODE_VERSION}-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production --ignore-scripts && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]