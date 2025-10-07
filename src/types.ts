export interface LabResult {
  patientId: string;
  labType: string;
  result: string;
  receivedAt: string;
  badRequest?: boolean;
}

export interface JobRecord {
  jobId: string;
  patientId: string;
  processedAt: string;
}
