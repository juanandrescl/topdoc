import { Worker } from 'bullmq';
import { LabResult, JobRecord } from './types';
import { MAX_RETRIES, REDIS_CONFIG } from './config';
import { deadLetterQueue } from './queue';

const successfulJobs: JobRecord[] = [];
const failedJobs: JobRecord[] = [];

const worker = new Worker<LabResult>(
    'lab-results',
    async (job) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 JOB STARTED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Job ID: ${job.id}`);
        console.log(`Patient ID: ${job.data.patientId}`);
        console.log(`Attempt: ${job.attemptsMade + 1}/${MAX_RETRIES}`);
        console.log(`Started at: ${new Date().toISOString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (Math.random() < 0.3) {
            console.log('⚠️  Random error programmatically generated\n');
            throw new Error('Random error programmatically generated');
        }
        
        if (job.data.badRequest) {
            throw new Error('Bad request');
        }
        
        const processedResult = {
            ...job.data,
            processedStatus: 'success'
        };
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Processed Result:', JSON.stringify(processedResult, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    },
    {
        connection: REDIS_CONFIG
    }
);

worker.on('completed', (job) => {
    successfulJobs.push({
        jobId: job.id!,
        patientId: job.data.patientId,
        processedAt: new Date().toISOString()
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUCCESSFUL JOBS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${successfulJobs.length}`);
    console.log('Jobs:', JSON.stringify(successfulJobs, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

worker.on('failed', async (job, err) => {
    if (job && job.attemptsMade >= MAX_RETRIES) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💀 JOB DEAD-LETTERED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Job ID: ${job.id}`);
        console.log(`Patient ID: ${job.data.patientId}`);
        console.log(`Failed after: ${MAX_RETRIES} attempts`);
        console.log(`Error: ${err.message}`);
        console.log(`Failed at: ${new Date().toISOString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        await deadLetterQueue.add('failed-job', {
            originalJobId: job.id,
            data: job.data,
            error: err.message,
            failedAt: new Date().toISOString()
        });
        
        failedJobs.push({
            jobId: job.id!,
            patientId: job.data.patientId,
            processedAt: new Date().toISOString()
        });
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 FAILED JOBS SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total: ${failedJobs.length}`);
        console.log('Jobs:', JSON.stringify(failedJobs, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔁 RETRY ATTEMPT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Job ID: ${job?.id}`);
        console.log(`Patient ID: ${job?.data.patientId}`);
        console.log(`Attempt: ${job?.attemptsMade}/${MAX_RETRIES}`);
        console.log(`Error: ${err.message}`);
        console.log(`Next retry scheduled`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 WORKER STARTED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Queue: lab-results`);
console.log(`Max Retries: ${MAX_RETRIES}`);
console.log(`Status: Listening for jobs...`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
