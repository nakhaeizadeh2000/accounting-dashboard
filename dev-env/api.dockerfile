# Use official Node.js image as base
FROM node:20-alpine as development

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

# Copy the rest of the application code
COPY ./api/. .


RUN chown -R node:node /home/app

# Check if node_modules exist and delete it, else just ignore
# RUN rm -rf node_modules || true

USER node

# Install dependencies
RUN npm install

# Build the app
# RUN npm run build

# Command to run the application
# CMD ["npm", "run", "start"]

# Set entrypoint to keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]