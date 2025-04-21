#!/bin/bash
# Script to clean up and rebuild MinIO configuration

# Stop containers
echo "Stopping Docker containers..."
docker-compose -f docker-compose.dev.yml down

# Clean MinIO data
echo "Cleaning MinIO data directory..."
rm -rf ./minio/data/*

# Create MinIO data directory if it doesn't exist
mkdir -p ./minio/data

# Rebuild and restart containers
echo "Rebuilding and restarting containers..."
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 10

# Create default bucket and set policy using mc (MinIO client)
echo "Creating default bucket and setting public policy..."
docker-compose -f docker-compose.dev.yml exec minio1 mc alias set myminio http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker-compose -f docker-compose.dev.yml exec minio1 mc mb myminio/default
docker-compose -f docker-compose.dev.yml exec minio1 mc policy set public myminio/default

echo "MinIO has been reset and default bucket configured with public access"