import express, { Request, Response } from 'express';
import { LabResult, JobRecord } from './types';
import { labResultsQueue, deadLetterQueue } from './queue';
import { MAX_RETRIES, PORT } from './config';

const app = express();
app.use(express.json());

// Validation middleware
const validateLabResult = (req: Request<{}, {}, LabResult>, res: Response, next: any) => {
    const { patientId, labType, result, receivedAt } = req.body;
    
    if (!patientId || !labType || !result || !receivedAt) {
        return res.status(400).json({ 
            error: 'Missing required fields: patientId, labType, result, receivedAt' 
        });
    }
    next();
};

app.post('/lab-results', validateLabResult, async (req: Request<{}, {}, LabResult>, res: Response) => {
    const labResult: LabResult = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 JOB RECEIVED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Patient ID: ${labResult.patientId}`);
    console.log(`Lab Type: ${labResult.labType}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await new Promise(resolve => setTimeout(resolve, 500));

    const job = await labResultsQueue.add('process-lab-result', labResult, {
        attempts: MAX_RETRIES
    });

    res.status(201).json({
        message: 'Lab result queued successfully',
        jobId: job.id,
        data: labResult
    });
});

app.get('/stats', async (req: Request, res: Response) => {
    const completedCount = await labResultsQueue.getCompletedCount();
    const deadLetterWaiting = await deadLetterQueue.getWaitingCount();
    const deadLetterCompleted = await deadLetterQueue.getCompletedCount();
    const deadLetterCount = deadLetterWaiting + deadLetterCompleted;

    res.status(200).json({
        successful: completedCount,
        deadLetter: deadLetterCount,
        total: completedCount + deadLetterCount
    });
});

// Health check endpoint for Cloud Run
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy como una lechuga', timestamp: new Date().toISOString() });
});

// CRITICAL: Listen on the PORT environment variable
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});
