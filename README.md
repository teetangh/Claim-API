# Claim Processing API

A RESTful API for processing healthcare claims, built with Node.js, Express.js, and PostgreSQL. This API features comprehensive monitoring, logging, and alerting mechanisms.

## Features

- **Claim Processing**: Submit and retrieve healthcare claims
- **JWT Authentication**: Secure API endpoints
- **Robust Logging**: Structured logs for debugging and auditing
- **Metrics Monitoring**: Prometheus integration for real-time system metrics
- **Visualization**: Grafana dashboards for monitoring system health
- **Docker Support**: Containerized application and database
- **Rate Limiting**: Protection against API abuse
- **Security Headers**: Enhanced API security

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Logging**: Winston
- **Monitoring**: Prometheus, Grafana
- **Containerization**: Docker, Docker Compose

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DB_NAME=claim_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start PostgreSQL database (if not using Docker)

3. Run the application:
   ```
   npm run dev
   ```

### Docker Setup

1. Build and start the containers:
   ```
   docker-compose up -d
   ```

2. The API will be available at `http://localhost:5000`
3. Prometheus will be available at `http://localhost:9090`
4. Grafana will be available at `http://localhost:3000`

## API Documentation

### Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Endpoints

#### Submit a Claim

```
POST /claims
```

Request body:
```json
{
  "payer": "Insurance Company",
  "amount": 500.00,
  "procedure_codes": ["P1", "P2"]
}
```

#### Get Claim Details

```
GET /claims/:id
```

Returns the claim details for the specified ID.

#### Check Claim Status

```
GET /claims/status/:id
```

Returns the current status of the claim.

## Monitoring and Logging

### Logs

Logs are stored in the `logs` directory with the following files:

- `combined.log`: All logs
- `error.log`: Error logs only
- `access.log`: HTTP request logs
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

### Metrics

Metrics are exposed at the `/metrics` endpoint in Prometheus format.

Key metrics include:

- HTTP request duration
- Claim processing duration
- Database query performance
- System metrics (CPU, memory)
- Request counts and error rates

### Alerting

Prometheus can be configured with alerting rules to notify about system issues:

- High error rates
- Slow response times
- System resource constraints

## Log Storage Strategies

Several strategies can be used for log storage:

1. **Local File System**: Simple but not scalable
   - Pros: Easy to set up, good for development
   - Cons: Limited storage, not suitable for distributed systems

2. **Centralized Logging Service**: (ELK Stack or similar)
   - Pros: Searchable, supports high volumes, visualization
   - Cons: Requires additional infrastructure, more complex

3. **Cloud-based Logging**: (AWS CloudWatch, GCP Logging)
   - Pros: Managed service, scalable, integrated with cloud services
   - Cons: Vendor lock-in, potential costs

4. **Log Aggregation Tools**: (Fluentd, Logstash)
   - Pros: Flexible, supports multiple destinations
   - Cons: Requires configuration and maintenance

The recommended approach is to use Elastic Stack (Elasticsearch, Logstash, Kibana) for production environments, which offers powerful search capabilities and visualization tools for log analysis.

## CI/CD Pipeline

The repository includes a GitHub Actions workflow for CI/CD:

- Runs linting and tests
- Builds Docker image
- Publishes image to container registry
- Deploys to target environment

Pipeline stages:
1. **Build**: Compile code and create artifacts
2. **Test**: Run unit and integration tests
3. **Scan**: Security and vulnerability scanning
4. **Package**: Build container images
5. **Deploy**: Push to target environment

## License

[MIT License](LICENSE) 