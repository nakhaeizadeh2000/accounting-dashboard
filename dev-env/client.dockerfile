# Use official Node.js image as base
FROM node:20-alpine as development

#  install git on container nextjs project
RUN  apk add git

# create folder app and client and copy .git 
RUN mkdir /home/app
RUN mkdir /home/app/client
COPY  .git /home/app/.git

# Set working directory in the container
WORKDIR /home/app/client

# Copy package.json and package-lock.json
COPY ./client/package*.json ./

# Install nextjs command-line tool
RUN npm install -g next

# Copy the rest of the application code
COPY ./client/. .

# USER root

RUN chown -R node:node /home/app/client

USER node

# Install dependencies
RUN npm install

# Expose port for development
# EXPOSE 3000

# Command to run the application
# CMD ["npm", "run", "dev"]

# Set entrypoint to keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
