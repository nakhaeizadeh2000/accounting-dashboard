# version docker file : 1.1 (optimized for production)

# ---------------------- FrontEnd ----------------------
FROM node:20-alpine AS frontend-production

# Install git and other dependencies
RUN apk add --no-cache git

# Create app directory and set ownership
WORKDIR /home/app/client
COPY ./client/package*.json ./

# Install Next.js globally
RUN npm install -g next

# Install frontend dependencies
RUN npm install 

# Copy the rest of the frontend code
COPY ./client/. .

# Build the frontend (Next.js)
RUN npm run build

# ---------------------- BackEnd ----------------------
FROM node:20-alpine AS backend-production

# Install git
RUN apk add --no-cache git

# Create backend app directory
WORKDIR /home/app/api

# Copy package files first for caching
COPY ./api/package*.json ./

# Install Nest.js globally
RUN npm install -g @nestjs/cli

# Install backend dependencies
RUN npm install

# Copy the rest of the backend source code
COPY ./api/. .

# Build the backend (Nest.js)
RUN npm run build

# ---------------------- NGINX ----------------------
FROM nginx:alpine

# Disable Nginx version disclosure
RUN sed -i 's/.server_tokens./server_tokens off;/g' /etc/nginx/nginx.conf

# Set working directory
WORKDIR /var/www

# Create directories for frontend and backend
RUN mkdir -p /var/www/client /var/www/api

# Copy the built frontend from the frontend stage
COPY --from=frontend-production /home/app/client/.next ./client/

# Copy the built backend from the backend stage
COPY --from=backend-production /home/app/api ./api/

# Add custom Nginx configuration
ADD ./nginx/default.prod.conf /etc/nginx/conf.d/default.conf

# Expose Nginx port
EXPOSE 80

# Health check to ensure Nginx is running
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
