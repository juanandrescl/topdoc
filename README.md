NOTAS DE JUAN ANDRÉS

**¡Me la he pasado muy bien creando este proyecto!**

Aprendizajes y reflexiones:

1. Nunca había usado REDIS. Aprendí os comandos básicos y di de alta la DB.
2. Utilicé la librería BULLMQ, Me pareció muy intuitiva y cumplía con los requerimientos de tracking dead-letter y successful lo que me ahorró bastante tiempo.
3. Me tomó una hora y media terminar todo
4. Mi favorito es plain JS, pero la IA me ayudó con la sintaxis de TS, principalmente para los types estrictos. Me aseguré de revisar todo el code por supuesto y hacer pruebas.
5. Creé una función de random errors, un tercio de las veces generará un error.
6. Creé la condición de que si el campo del payload llamado "badRequest" : true , entocnes siempre deberá rechazarlo. Esto para poder forzar la generación de 3 errores consecutivos. Fue bueno ver que BullMQ tiene dichas funciones built-in , simplifica mucho.
7. Adicional al registro en redis ofrecido por la librería, creé también variables en memoria para mostrar console logs en el server. El server lo creé en express. Dada su simpleza como ruteador me pareció lo más apropiado.
8. Finalmente he dockerizado todo y lo he probado desde docker. Funcionó todo muy sólido.
9. Finalmente a continuación un README con los pasos para replicar y para poder dockerizar.

10. 
<img width="600" alt="image" src="https://github.com/user-attachments/assets/d4654324-51f1-4715-9780-abc9a145a575" />

Acá un screenshot del systema corriendo en mi computador local


MUCHAS GRACIAS POR EL FEEDBACK.
Saludos.


# Lab Results Queue System

Simple queue-based system for processing lab results with retry logic and dead-letter queue.

## What It Does

- Receives lab results via REST API
- Queues jobs for asynchronous processing
- Retries failed jobs up to 3 times
- Moves unrecoverable jobs to dead-letter queue
- Tracks successful and failed jobs
- Provides statistics endpoint.

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

