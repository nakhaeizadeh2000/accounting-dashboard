# Test Dockerfile for NestJS API

FROM node:20-alpine

# Install PostgreSQL client for database setup scripts
RUN apk add --no-cache postgresql-client git

# Create app directory
WORKDIR /home/app/api

# Copy package# Copy package files
COPY ./api/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY ./api/. .

# Set environment variables
ENV NODE_ENV=test
ENV POSTGRES_DB=test_db

# Create a dedicated user for running tests
RUN addgroup -S testuser && adduser -S testuser -G testuser
RUN chown -R testuser:testuser /home/app

# Switch to non-root user
USER testuser

# Run tests
CMD ["npm", "run", "test:e2e"]
