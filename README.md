# Lab Results Queue System

Simple queue-based system for processing lab results with retry logic and dead-letter queue.

## What It Does

- Receives lab results via REST API
- Queues jobs for asynchronous processing
- Retries failed jobs up to 3 times
- Moves unrecoverable jobs to dead-letter queue
- Tracks successful and failed jobs
- Provides statistics endpoint

## Installation

### Prerequisites
- Node.js (v16+)
- Redis

### Install Redis
```bash
brew install redis
brew services start redis
```

### Install Dependencies
```bash
npm install
```

## Usage

### Start the Worker
```bash
npm run worker
```

### Start the API
```bash
npm run dev
```

### Send a Lab Result
```bash
curl -X POST http://localhost:3000/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "12345",
    "labType": "blood",
    "result": "positive",
    "receivedAt": "2025-07-08T10:00:00Z"
  }'
```

### Test Failed Job (with retries)
```bash
curl -X POST http://localhost:3000/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "99999",
    "labType": "blood",
    "result": "positive",
    "receivedAt": "2025-07-08T10:00:00Z",
    "badRequest": true
  }'
```

### Get Statistics
```bash
curl http://localhost:3000/stats
```

## Configuration

Edit `src/config.ts` to change retry attempts:
```typescript
export const MAX_RETRIES = 3;
```

## Dockerization

### Create Dockerfile
Docker file present at ./Dockerfile

### Create docker-compose.yml
docker-compose.yml present at ./docker-compose.yml

### Update Connection Config
set MAX_RETRIES variable and check for Redis HOST and PORT (if available or local)

### Build and Run
```bash
brew install --cask docker &&
docker compose up --build
```

