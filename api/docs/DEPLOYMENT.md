# Deployment Guide

This document provides comprehensive instructions for deploying the SalsetDatees API in different environments, from development to production.

## Table of Contents

- [Deployment Guide](#deployment-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [System Requirements](#system-requirements)
  - [Environment Configuration](#environment-configuration)
    - [Environment Variables](#environment-variables)
    - [Configuration Files](#configuration-files)
  - [Local Development Setup](#local-development-setup)
    - [Prerequisites](#prerequisites)
    - [Installation Steps](#installation-steps)
    - [Running for Development](#running-for-development)
    - [Development Tools](#development-tools)
  - [Docker Deployment](#docker-deployment)
    - [Docker Compose Setup](#docker-compose-setup)
    - [Building Docker Images](#building-docker-images)
    - [Running with Docker Compose](#running-with-docker-compose)
    - [Docker Health Checks](#docker-health-checks)
  - [Kubernetes Deployment](#kubernetes-deployment)
    - [Kubernetes Manifests](#kubernetes-manifests)
    - [Secrets Management](#secrets-management)
    - [Resource Configuration](#resource-configuration)
    - [Horizontal Pod Autoscaling](#horizontal-pod-autoscaling)
  - [Cloud Deployment](#cloud-deployment)
    - [AWS Deployment](#aws-deployment)
    - [Azure Deployment](#azure-deployment)
    - [Google Cloud Deployment](#google-cloud-deployment)
  - [Database Migration](#database-migration)
    - [Migration Process](#migration-process)
    - [Rollback Procedures](#rollback-procedures)
  - [CI/CD Pipeline](#cicd-pipeline)
    - [Pipeline Stages](#pipeline-stages)
    - [Example Workflows](#example-workflows)
  - [Monitoring and Logging](#monitoring-and-logging)
    - [Logging Configuration](#logging-configuration)
    - [Metrics Collection](#metrics-collection)
    - [Alerting](#alerting)
  - [Backup and Disaster Recovery](#backup-and-disaster-recovery)
    - [Database Backups](#database-backups)
    - [File Storage Backups](#file-storage-backups)
    - [Recovery Procedures](#recovery-procedures)
  - [Scaling Strategies](#scaling-strategies)
    - [Horizontal Scaling](#horizontal-scaling)
    - [Vertical Scaling](#vertical-scaling)
    - [Database Scaling](#database-scaling)
  - [Security Considerations](#security-considerations)
    - [SSL Configuration](#ssl-configuration)
    - [API Security](#api-security)
    - [Infrastructure Security](#infrastructure-security)
  - [Performance Tuning](#performance-tuning)
    - [Node.js Optimization](#nodejs-optimization)
    - [Database Optimization (continued)](#database-optimization-continued)
    - [Cache Optimization](#cache-optimization)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Diagnostics](#diagnostics)
  - [Maintenance](#maintenance)
    - [Routine Tasks](#routine-tasks)
    - [Update Procedures](#update-procedures)

## Overview

The SalsetDatees API can be deployed in various environments, from local development to production cloud environments. This guide covers all aspects of deployment, including setup, configuration, and maintenance.

The application consists of several components that need to be deployed and configured:

1. **NestJS API Server**: The core backend application
2. **PostgreSQL Database**: Persistent data storage
3. **MinIO Object Storage**: File storage system
4. **Redis**: Caching and token storage

## System Requirements

Minimum requirements for running the application in production:

| Component        | Minimum Requirement       | Recommended      |
| ---------------- | ------------------------- | ---------------- |
| CPU              | 2 cores                   | 4+ cores         |
| Memory           | 2 GB RAM                  | 4+ GB RAM        |
| Disk Space       | 20 GB                     | 50+ GB           |
| Network          | 10 Mbps                   | 100+ Mbps        |
| Operating System | Ubuntu 20.04+ / Any Linux | Ubuntu 22.04 LTS |
| Node.js          | v16.x                     | v18.x or v20.x   |
| PostgreSQL       | 14.x                      | 15.x             |
| Redis            | 6.x                       | 7.x              |
| MinIO            | Latest                    | Latest           |

## Environment Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file based on the `.env.example` template. Here are the essential variables:

```dotenv
# Application
NODE_ENV=production
PORT=4000
GLOBAL_PREFIX=api

# JWT Authentication
JWT_SECRET=your-secret-key-here
ACCESS_TOKEN_TTL=900
REFRESH_TOKEN_TTL=86400
COOKIE_SECRET=cookie-secret-key

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=salsetdatees
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_SYNC=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_REGION=us-east-1
MINIO_MAX_FILE_SIZE_MB=100
MINIO_THUMBNAIL_SIZE=300
MINIO_THUMBNAIL_PREFIX=thumb_
MINIO_PRESIGNED_URL_EXPIRY=86400
```

### Configuration Files

Besides environment variables, the application uses the following configuration files:

1. `nest-cli.json`: NestJS CLI configuration
2. `tsconfig.json`: TypeScript compiler options
3. `package.json`: Dependencies and scripts
4. `.eslintrc.js`: ESLint configuration

## Local Development Setup

### Prerequisites

1. Node.js (v16.x or higher)
2. npm or yarn
3. PostgreSQL (v14.x or higher)
4. Redis (v6.x or higher)
5. MinIO (latest version)
6. Git

### Installation Steps

1. Clone the repository:

```bash
git clone https://github.com/your-org/salsetdatees-api.git
cd salsetdatees-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your local configuration
```

4. Set up the database:

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE salsetdatees;"
sudo -u postgres psql -c "CREATE USER salsetuser WITH ENCRYPTED PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE salsetdatees TO salsetuser;"

# Run migrations
npm run migration:run
```

5. Seed initial data:

```bash
npm run seed:run
```

### Running for Development

```bash
# Start in development mode
npm run start:dev

# Start in debug mode
npm run start:debug
```

The API will be available at `http://localhost:4000/api`.

### Development Tools

Useful tools for development:

- **Swagger UI**: Available at `http://localhost:4000/api/swagger`
- **MinIO Console**: Available at `http://localhost:9001`
- **Redis Commander**: For Redis monitoring (install with `npm install -g redis-commander`)
- **pgAdmin**: For PostgreSQL management

## Docker Deployment

### Docker Compose Setup

Use Docker Compose for local or staging deployments. Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '4000:4000'
    depends_on:
      - postgres
      - redis
      - minio
    environment:
      - NODE_ENV=production
      - PORT=4000
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_DB=salsetdatees
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_SYNC=false
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_USE_SSL=false
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4000/api/health']
      interval: 30s
      timeout: 10s
      retries: 5

  postgres:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_DB=salsetdatees
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server --console-address ":9001" /data
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Building Docker Images

Create a `Dockerfile` for the API:

```dockerfile
# Base image
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install Sharp for thumbnail generation
RUN npm install sharp

# Install production dependencies only
RUN npm prune --production

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s CMD curl -f http://localhost:4000/api/health || exit 1

# Start application
CMD ["node", "dist/src/main"]
```

### Running with Docker Compose

To start the services:

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api

# Run migrations in the Docker environment
docker-compose exec api npm run migration:run
```

### Docker Health Checks

The Docker Compose configuration includes health checks for all services:

- **API**: Checks the `/api/health` endpoint
- **PostgreSQL**: Uses `pg_isready` to verify database availability
- **Redis**: Uses `redis-cli ping` to verify Redis availability
- **MinIO**: Checks the MinIO health endpoint

To monitor health status:

```bash
docker-compose ps
```

## Kubernetes Deployment

### Kubernetes Manifests

Store Kubernetes manifests in a `k8s` directory. Here are example manifests:

**api-deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: salsetdatees-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: salsetdatees-api
  template:
    metadata:
      labels:
        app: salsetdatees-api
    spec:
      containers:
        - name: api
          image: your-registry/salsetdatees-api:latest
          ports:
            - containerPort: 4000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: POSTGRES_HOST
              value: 'postgres-service'
          # More environment variables from secrets and config maps
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          readinessProbe:
            httpGet:
              path: /api/health
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /api/health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
```

**api-service.yaml**:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: salsetdatees-api-service
spec:
  selector:
    app: salsetdatees-api
  ports:
    - port: 80
      targetPort: 4000
  type: ClusterIP
```

**api-ingress.yaml**:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: salsetdatees-api-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  rules:
    - host: api.salsetdatees.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: salsetdatees-api-service
                port:
                  number: 80
  tls:
    - hosts:
        - api.salsetdatees.com
      secretName: api-tls-secret
```

### Secrets Management

Store sensitive information in Kubernetes secrets:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: salsetdatees-api-secrets
type: Opaque
data:
  JWT_SECRET: base64-encoded-value
  POSTGRES_PASSWORD: base64-encoded-value
  REDIS_PASSWORD: base64-encoded-value
  MINIO_ROOT_PASSWORD: base64-encoded-value
```

Reference secrets in deployments:

```yaml
env:
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: salsetdatees-api-secrets
        key: JWT_SECRET
```

### Resource Configuration

Configure resources based on workload:

```yaml
resources:
  requests:
    memory: '512Mi'
    cpu: '250m'
  limits:
    memory: '1Gi'
    cpu: '500m'
```

For high-traffic environments:

```yaml
resources:
  requests:
    memory: '1Gi'
    cpu: '500m'
  limits:
    memory: '2Gi'
    cpu: '1000m'
```

### Horizontal Pod Autoscaling

Implement autoscaling for the API:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: salsetdatees-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: salsetdatees-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## Cloud Deployment

### AWS Deployment

To deploy on AWS:

1. **Container Registry**: Use Amazon ECR for Docker images
2. **Kubernetes**: Use Amazon EKS
3. **Database**: Use Amazon RDS for PostgreSQL
4. **Cache**: Use Amazon ElastiCache for Redis
5. **Object Storage**: Use Amazon S3 or self-hosted MinIO on EC2
6. **Load Balancer**: Use AWS Application Load Balancer

Example deployment command with AWS CLI:

```bash
# Push Docker image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-aws-account-id.dkr.ecr.us-east-1.amazonaws.com
docker tag salsetdatees-api:latest your-aws-account-id.dkr.ecr.us-east-1.amazonaws.com/salsetdatees-api:latest
docker push your-aws-account-id.dkr.ecr.us-east-1.amazonaws.com/salsetdatees-api:latest

# Apply Kubernetes manifests to EKS
aws eks update-kubeconfig --name your-cluster-name --region us-east-1
kubectl apply -f k8s/
```

### Azure Deployment

To deploy on Azure:

1. **Container Registry**: Use Azure Container Registry
2. **Kubernetes**: Use Azure Kubernetes Service (AKS)
3. **Database**: Use Azure Database for PostgreSQL
4. **Cache**: Use Azure Cache for Redis
5. **Object Storage**: Use Azure Blob Storage or self-hosted MinIO
6. **Load Balancer**: Use Azure Application Gateway

Example deployment command with Azure CLI:

```bash
# Push Docker image to ACR
az acr login --name yourAcrName
docker tag salsetdatees-api:latest yourAcrName.azurecr.io/salsetdatees-api:latest
docker push yourAcrName.azurecr.io/salsetdatees-api:latest

# Apply Kubernetes manifests to AKS
az aks get-credentials --resource-group yourResourceGroup --name yourAksCluster
kubectl apply -f k8s/
```

### Google Cloud Deployment

To deploy on Google Cloud:

1. **Container Registry**: Use Google Container Registry or Artifact Registry
2. **Kubernetes**: Use Google Kubernetes Engine (GKE)
3. **Database**: Use Cloud SQL for PostgreSQL
4. **Cache**: Use Memorystore for Redis
5. **Object Storage**: Use Google Cloud Storage or self-hosted MinIO
6. **Load Balancer**: Use Google Cloud Load Balancing

Example deployment command with Google Cloud CLI:

```bash
# Push Docker image to GCR
gcloud auth configure-docker
docker tag salsetdatees-api:latest gcr.io/your-project-id/salsetdatees-api:latest
docker push gcr.io/your-project-id/salsetdatees-api:latest

# Apply Kubernetes manifests to GKE
gcloud container clusters get-credentials your-cluster-name --zone your-zone
kubectl apply -f k8s/
```

## Database Migration

### Migration Process

Run migrations during deployment:

```bash
# Local environment
npm run migration:run

# Docker environment
docker-compose exec api npm run migration:run

# Kubernetes environment
kubectl exec -it $(kubectl get pods -l app=salsetdatees-api -o jsonpath="{.items[0].metadata.name}") -- npm run migration:run
```

Steps for a safe migration process:

1. **Backup database** before running migrations
2. **Test migrations** in a staging environment
3. **Run migrations** during a maintenance window
4. **Verify application** functionality after migration
5. **Monitor database performance** after migration

### Rollback Procedures

If migrations fail or cause issues:

1. Run the revert command to undo the latest migration:

```bash
npm run migration:revert
```

2. For multiple migrations, specify the number to revert:

```bash
# Revert the last 3 migrations
npm run migration:revert -- -c 3
```

3. In emergency cases, restore from backup:

```bash
# Example PostgreSQL restore
pg_restore -U postgres -d salsetdatees backup.dump
```

## CI/CD Pipeline

### Pipeline Stages

A complete CI/CD pipeline should include:

1. **Build**: Compile the application and run linting
2. **Test**: Run unit and integration tests
3. **Package**: Build Docker images
4. **Publish**: Push images to container registry
5. **Deploy**: Update Kubernetes deployments

### Example Workflows

**GitHub Actions Workflow** (`.github/workflows/main.yml`):

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Build Docker image
        run: docker build -t salsetdatees-api:${{ github.sha }} .

      - name: Log in to container registry
        if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v2
        with:
          registry: your-registry-url
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Push Docker image
        if: github.ref == 'refs/heads/main'
        run: |
          docker tag salsetdatees-api:${{ github.sha }} your-registry-url/salsetdatees-api:latest
          docker tag salsetdatees-api:${{ github.sha }} your-registry-url/salsetdatees-api:${{ github.sha }}
          docker push your-registry-url/salsetdatees-api:latest
          docker push your-registry-url/salsetdatees-api:${{ github.sha }}

      - name: Deploy to Kubernetes
        if: github.ref == 'refs/heads/main'
        uses: actions-hub/kubectl@master
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
        with:
          args: set image deployment/salsetdatees-api api=your-registry-url/salsetdatees-api:${{ github.sha }}
```

## Monitoring and Logging

### Logging Configuration

Configure logging in NestJS for different environments:

```typescript
// logger.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
  ],
})
export class LoggerModule {}
```

Integrate with centralized logging:

1. **ELK Stack**: For self-hosted logging
2. **Datadog**: For cloud-managed logging
3. **Cloudwatch**: For AWS environments

### Metrics Collection

Implement Prometheus metrics:

```typescript
// metrics.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class MetricsModule {}
```

Key metrics to collect:

1. **Request rate**: Total requests per second
2. **Latency**: Response time percentiles (p50, p95, p99)
3. **Error rate**: Errors per second
4. **System metrics**: CPU, memory, disk usage
5. **Custom metrics**: File uploads, user logins, etc.

### Alerting

Set up alerts for:

1. **High error rates**: More than 1% error rate over 5 minutes
2. **High latency**: p95 latency > 500ms for 5 minutes
3. **High CPU**: CPU usage > 80% for 10 minutes
4. **High memory**: Memory usage > 85% for 10 minutes
5. **Database issues**: Connection failures or slow queries
6. **Storage issues**: Low disk space (< 10% free)

Tools for alerting:

1. **Prometheus Alertmanager**: For Prometheus-based monitoring
2. **Grafana Alerts**: For Grafana dashboards
3. **PagerDuty**: For on-call notification
4. **Slack/Teams**: For team notifications

## Backup and Disaster Recovery

### Database Backups

Configure regular PostgreSQL backups:

```bash
# Create a backup
pg_dump -U postgres -d salsetdatees -f backup.sql

# Schedule daily backups with cron
0 2 * * * pg_dump -U postgres -d salsetdatees -f /backups/salsetdatees_$(date +\%Y\%m\%d).sql
```

For automated backups:

1. **AWS RDS**: Use automated snapshots
2. **Azure Database**: Use geo-redundant backups
3. **Google Cloud SQL**: Use automated backups
4. **Self-hosted**: Use pg_dump with cron and offsite storage

### File Storage Backups

For MinIO backups:

```bash
# Using the mc client
mc mirror minio/bucket backup/bucket

# For AWS S3
aws s3 sync s3://your-bucket backup/bucket
```

### Recovery Procedures

Database recovery:

```bash
# PostgreSQL recovery
psql -U postgres -d salsetdatees < backup.sql

# Partial table recovery example
psql -U postgres -d salsetdatees -c "BEGIN; DELETE FROM users WHERE id = 'target-id'; COMMIT;"
psql -U postgres -c "\\copy users FROM '/path/to/users_backup.csv' WITH CSV HEADER"
```

File storage recovery:

```bash
# Using the mc client
mc mirror backup/bucket minio/bucket

# For AWS S3
aws s3 sync backup/bucket s3://your-bucket
```

## Scaling Strategies

### Horizontal Scaling

Scale the API horizontally by adding more replicas:

```bash
# Manual scaling in Kubernetes
kubectl scale deployment salsetdatees-api --replicas=5

# Configure auto-scaling based on metrics
kubectl autoscale deployment salsetdatees-api --min=3 --max=10 --cpu-percent=70
```

Load balancing considerations:

1. **Session affinity**: Not required (stateless API)
2. **Health checks**: Use the `/api/health` endpoint
3. **Connection draining**: Enable for graceful pod termination

### Vertical Scaling

Increase resources for individual instances:

```yaml
resources:
  requests:
    memory: '1Gi'
    cpu: '500m'
  limits:
    memory: '2Gi'
    cpu: '1000m'
```

Memory optimization:

1. **Node.js heap size**: Set `--max-old-space-size=1536` for 2GB containers
2. **Garbage collection**: Monitor and tune GC patterns

### Database Scaling

For PostgreSQL scaling:

1. **Read replicas**: Add read-only replicas for query-heavy workloads
2. **Connection pooling**: Use pgBouncer for connection management
3. **Sharding**: Consider horizontal sharding for very large datasets
4. **Vertical scaling**: Increase CPU/memory for the database instance

Redis scaling:

1. **Redis Cluster**: For distributed caching
2. **Redis Sentinel**: For high availability
3. **Memory optimization**: Configure maxmemory and eviction policies

## Security Considerations

### SSL Configuration

Enable SSL for the API:

```typescript
// In main.ts for Fastify
import { FastifyAdapter } from '@nestjs/platform-fastify';
import * as fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const app = await NestFactory.create(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);
```

For production, use a reverse proxy like Nginx with Let's Encrypt:

```nginx
server {
    listen 443 ssl;
    server_name api.salsetdatees.com;

    ssl_certificate /etc/letsencrypt/live/api.salsetdatees.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.salsetdatees.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### API Security

Implement security best practices:

1. **Rate limiting**:

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
  ],
})
export class AppModule {}
```

2. **CORS configuration**:

```typescript
// In main.ts
app.enableCors({
  origin: ['https://app.salsetdatees.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});
```

3. **Helmet for HTTP headers**:

```typescript
// For Fastify
app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    },
  },
});
```

### Infrastructure Security

Secure your infrastructure:

1. **Network security**:

   - Use private networks for internal communication
   - Implement network policies in Kubernetes
   - Use security groups in cloud environments

2. **Secret management**:

   - Use Kubernetes secrets or cloud secret managers
   - Rotate credentials regularly
   - Avoid hardcoding secrets in code or Docker images

3. **Access control**:
   - Implement least privilege principle
   - Use separate service accounts
   - Enable audit logging

## Performance Tuning

### Node.js Optimization

Optimize Node.js performance:

1. **Memory settings**:

```bash
NODE_OPTIONS="--max-old-space-size=1536 --max-semi-space-size=64" node dist/src/main
```

2. **Cluster mode** with PM2:

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "salsetdatees-api",
    script: "dist/src/main.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production"
    }
  }]
}
```

3. **Async operations optimization**:
   - Use Promise.all for parallel operations
   - Avoid blocking the event loop
   - Use streams for file operations

### Database Optimization (continued)

1. **Indexing** (continued):

   - Use composite indexes for multi-column queries
   - Consider partial indexes for filtered queries
   - Regularly analyze index usage and remove unused indexes

2. **Query optimization**:

   - Use EXPLAIN ANALYZE to diagnose slow queries
   - Optimize JOINs and complex queries
   - Consider materialized views for complex aggregate queries

3. **Connection pooling**:

   - Implement pgBouncer for connection management
   - Configure appropriate pool sizes based on workload
   - Monitor connection utilization

4. **Database configuration**:
   - Tune `shared_buffers`, `work_mem`, and `effective_cache_size`
   - Configure `max_connections` based on expected load
   - Adjust `wal_buffers` and `checkpoint_segments` for write-heavy workloads

Example PostgreSQL configuration for a medium-sized deployment:

```conf
# Memory settings
shared_buffers = 2GB
work_mem = 16MB
maintenance_work_mem = 256MB
effective_cache_size = 6GB

# Connection settings
max_connections = 200

# Write settings
wal_buffers = 16MB
checkpoint_timeout = 15min
checkpoint_completion_target = 0.9
```

### Cache Optimization

Optimize Redis caching:

1. **Memory management**:

   - Configure `maxmemory` based on available RAM
   - Set appropriate eviction policy (e.g., `allkeys-lru`)
   - Monitor memory usage and hit/miss ratio

2. **Key strategies**:

   - Use specific, structured key names
   - Implement appropriate TTLs for different data types
   - Consider batch operations for related keys

3. **Connection pooling**:
   - Use connection pools with proper sizing
   - Monitor connection count and latency
   - Handle reconnection logic properly

Example Redis configuration:

```conf
maxmemory 1gb
maxmemory-policy allkeys-lru
```

## Troubleshooting

### Common Issues

1. **Connection issues**:

   - **API to Database**: Check network configuration, credentials, and database status
   - **API to Redis**: Verify Redis is running and accessible
   - **API to MinIO**: Check MinIO service availability and credentials

2. **Performance problems**:

   - **High latency**: Check database query performance, Redis cache hit rate, and Node.js CPU usage
   - **Memory leaks**: Monitor Node.js memory usage with tools like clinic.js
   - **Database bottlenecks**: Analyze slow queries and connection pool usage

3. **Authentication failures**:

   - Check JWT secret consistency
   - Verify Redis connection for refresh token storage
   - Check for clock skew between services

4. **File operations issues**:
   - Verify MinIO connectivity and permissions
   - Check disk space for temporary file storage
   - Verify Sharp library is properly installed

### Diagnostics

Tools and commands for diagnosis:

1. **API diagnostics**:

```bash
# Check API health
curl http://localhost:4000/api/health

# View API logs
kubectl logs -l app=salsetdatees-api

# Check Node.js memory usage
node --inspect dist/src/main
```

2. **Database diagnostics**:

```bash
# Check PostgreSQL connection
psql -U postgres -h postgres-service -c "SELECT 1"

# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity"

# Analyze slow queries
psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active'"
```

3. **Redis diagnostics**:

```bash
# Check Redis connectivity
redis-cli -h redis-service ping

# Monitor Redis commands
redis-cli -h redis-service monitor

# Check memory usage
redis-cli -h redis-service info memory
```

4. **MinIO diagnostics**:

```bash
# Check MinIO status
mc admin info minio

# List buckets
mc ls minio

# Check MinIO logs
kubectl logs -l app=minio
```

## Maintenance

### Routine Tasks

Regular maintenance procedures:

1. **Daily tasks**:

   - Monitor logs for errors and warnings
   - Check API health metrics
   - Verify database backups

2. **Weekly tasks**:

   - Apply security patches
   - Analyze database performance
   - Clean up temporary files

3. **Monthly tasks**:
   - Review and rotate credentials
   - Perform capacity planning
   - Test backup restoration

### Update Procedures

Steps for updating the application:

1. **Prepare update**:

   - Review changelog and migration requirements
   - Test update in staging environment
   - Prepare rollback plan

2. **Perform update**:

   - Take backup of database and configuration
   - Deploy new version with blue/green or rolling strategy
   - Run database migrations

3. **Verify update**:

   - Check application health and metrics
   - Verify critical functionality
   - Monitor for unexpected errors

4. **Rollback procedure** (if needed):
   - Revert to previous application version
   - Restore database from backup if necessary
   - Communicate status to stakeholders

Example update script:

```bash
#!/bin/bash
# Application update script

# 1. Backup
echo "Taking database backup..."
pg_dump -U postgres -d salsetdatees -f backup-$(date +%Y%m%d).sql

# 2. Update application
echo "Deploying new version..."
kubectl set image deployment/salsetdatees-api api=your-registry/salsetdatees-api:new-version

# 3. Wait for deployment to complete
echo "Waiting for deployment to complete..."
kubectl rollout status deployment/salsetdatees-api

# 4. Run migrations
echo "Running migrations..."
kubectl exec -it $(kubectl get pods -l app=salsetdatees-api -o jsonpath="{.items[0].metadata.name}") -- npm run migration:run

# 5. Verify health
echo "Verifying API health..."
curl -s http://api.salsetdatees.com/api/health | grep "status"

# Check if health check was successful
if [ $? -ne 0 ]; then
  echo "Health check failed! Rolling back..."
  kubectl rollout undo deployment/salsetdatees-api
  exit 1
fi

echo "Update completed successfully!"
```

With these maintenance procedures in place, the SalsetDatees API will remain secure, performant, and reliable throughout its lifecycle.
