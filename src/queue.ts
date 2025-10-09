import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

export const labResultsQueue = new Queue('lab-results', {
  connection: REDIS_CONFIG
});


export const deadLetterQueue = new Queue('dead-letter', {
  connection: REDIS_CONFIG
});
