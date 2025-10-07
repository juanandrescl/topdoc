import express, { Request, Response } from 'express';
import { LabResult } from './types';
import { labResultsQueue, deadLetterQueue } from './queue';
import { MAX_RETRIES } from './config';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/lab-results', async (req: Request<{}, {}, LabResult>, res: Response) => {
    const { patientId, labType, result, receivedAt }: LabResult = req.body;

    if (!patientId || !labType || !result || !receivedAt) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const labResult: LabResult = {
        patientId,
        labType,
        result,
        receivedAt,
        badRequest: req.body.badRequest
    };

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
