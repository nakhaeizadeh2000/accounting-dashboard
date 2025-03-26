# Production Dockerfile for Next.js Client

FROM node:20-alpine as base

# Install git on container for Next.js project (if needed)
RUN apk add --no-cache git 

# Create app directory
WORKDIR /home/app/client 

# Optional: Install Next.js globally (not usually necessary in a dev environment)
RUN npm install -g next

# Copy package.json and package-lock.json
COPY ./client/package*.json ./

# Install dependencies
# RUN npm install --legacy-peer-deps 
RUN npm install

# Copy the rest of the application code
COPY ./client/. .

# Crack MUI premium and pro mode files before building
COPY ./dev-env/files/mui-crack-files/modern/useLicenseVerifier.js ./node_modules/@mui/x-license/modern/useLicenseVerifier/
COPY ./dev-env/files/mui-crack-files/modern/verifyLicense.js ./node_modules/@mui/x-license/modern/verifyLicense/
COPY ./dev-env/files/mui-crack-files/useLicenseVerifier.js ./node_modules/@mui/x-license/useLicenseVerifier/
COPY ./dev-env/files/mui-crack-files/verifyLicense.js ./node_modules/@mui/x-license/verifyLicense/
COPY ./dev-env/files/mui-crack-files/node/verifyLicense.js ./node_modules/@mui/x-license/node/verifyLicense/
COPY ./dev-env/files/mui-crack-files/node/useLicenseVerifier.js ./node_modules/@mui/x-license/node/useLicenseVerifier/

# Change ownership to non-root user
RUN chown -R node:node /home/app/client

USER node 

# Build the Next.js application for production
RUN npm run build 

# Command to run the application in production mode
CMD ["npm", "start"]

# //TODO fix issue and level up security and write best practice 