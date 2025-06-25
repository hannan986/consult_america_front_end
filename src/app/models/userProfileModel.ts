// src/app/models/userProfile.model.ts
export interface UserProfileModel {
  id: number;
  email: string;
  name: string;
  clientName1?: string;
  clientName2?: string;
  clientName3?: string;
  firstName?: string;
  lastName?: string;
  primaryAddress?: string;
  primaryPhone?: string;
  secondaryAddress?: string;
  secondaryPhone?: string;
  techStack?: string;
  yearsOfExperience?: number;
}
