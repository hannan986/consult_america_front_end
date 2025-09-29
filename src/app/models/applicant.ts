export interface Applicant {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  visaStatus: string;
  documents?: string[];
}
