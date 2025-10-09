import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

let labResultsQueue: Queue | null = null;
let deadLetterQueue: Queue | null = null;

export function getLabResultsQueue(): Queue {
    if (!labResultsQueue) {
        console.log('Creating labResultsQueue with config:', REDIS_CONFIG);
        labResultsQueue = new Queue('lab-results', { connection: REDIS_CONFIG });
    }
    return labResultsQueue;
}

export function getDeadLetterQueue(): Queue {
    if (!deadLetterQueue) {
        console.log('Creating deadLetterQueue with config:', REDIS_CONFIG);
        deadLetterQueue = new Queue('dead-letter', { connection: REDIS_CONFIG });
    }
    return deadLetterQueue;
}

// For backward compatibility
export { getLabResultsQueue as labResultsQueue, getDeadLetterQueue as deadLetterQueue };
