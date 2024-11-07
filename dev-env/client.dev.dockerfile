# Development Dockerfile for Next.js Client

FROM node:20-alpine as development

# Install git on container for Next.js project
RUN apk add --no-cache git

# Create app directory
WORKDIR /home/app/client

# Copy .git to access version control (if needed)
COPY .git /home/app/.git

# Copy package.json and package-lock.json
COPY ./client/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps 

# Copy the rest of the application code
COPY ./client/. .

# Optional: Install Next.js globally (not usually necessary in a dev environment)
# RUN npm install -g next

# Change ownership to non-root user
RUN chown -R node:node /home/app/client

USER node

# Crack MUI premium and pro mode files
COPY ./dev-env/files/mui-crack-files/modern/useLicenseVerifier.js ./node_modules/@mui/x-license/modern/useLicenseVerifier/
COPY ./dev-env/files/mui-crack-files/modern/verifyLicense.js ./node_modules/@mui/x-license/modern/verifyLicense/
COPY ./dev-env/files/mui-crack-files/useLicenseVerifier.js ./node_modules/@mui/x-license/useLicenseVerifier/
COPY ./dev-env/files/mui-crack-files/verifyLicense.js ./node_modules/@mui/x-license/verifyLicense/
COPY ./dev-env/files/mui-crack-files/node/verifyLicense.js ./node_modules/@mui/x-license/node/verifyLicense/
COPY ./dev-env/files/mui-crack-files/node/useLicenseVerifier.js ./node_modules/@mui/x-license/node/useLicenseVerifier/

# Command to run the application in development mode
CMD ["npm", "run", "dev"]