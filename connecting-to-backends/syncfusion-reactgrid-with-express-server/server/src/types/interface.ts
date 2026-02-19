export interface Patient {
  PatientID: number;
  PatientName: string;
  Age: number;
  Gender: string;
  Email: string;
  Phone: string;
  DoctorName: string;
  Specialty: string;
  HospitalName: string;
  City: string;
  Country: string;
  AdmissionDate: string;
  Diagnosis: string;
  Status: string;
}

export interface DataManagerRequest {
  skip?: number;
  take?: number;
  sorted?: Array<{ name: string; direction: string }>;
  where?: any[];
  search?: Array<{ fields: string[]; key: string; operator: string; ignoreCase: boolean }>;
  requiresCounts?: boolean;
}