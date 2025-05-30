# Production Dockerfile for NestJS API

FROM node:20-alpine as base

#  install git on container nestjs project
RUN  apk add git

# create folder app and api and copy .git 
RUN mkdir /home/app
RUN mkdir /home/app/api
COPY  .git /home/app/.git

# Set working directory in the container
WORKDIR /home/app/api

# Copy package.json and package-lock.json
COPY ./api/package*.json ./

# Install nestjs command-line tool
RUN npm install -g @nestjs/cli

# Check if node_modules exist and delete it, else just ignore
# RUN rm -rf node_modules || true

# Install dependencies.
RUN npm install --legacy-peer-deps 

# Copy the rest of the application code
COPY ./api/. .

RUN chown -R node:node /home/app

USER node

# Build the app
RUN npm run build

# Set entrypoint to keep the container running
# ENTRYPOINT ["tail", "-f", "/dev/null"]

# Command to run the application in production mode.
CMD ["npm", "run", "start:prod"]


# //TODO fix issue and level up security and write best practice 