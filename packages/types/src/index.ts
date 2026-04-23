// User & Auth
export interface Profile {
  id: string;
  email: string;
  displayName: string;
  department?: string;
  jobTitle?: string;
  avatarUrl?: string;
  trustScore: number;
  isVerified: boolean;
  anonymousSeed: string;
  createdAt: Date;
  updatedAt: Date;
}

export * from './study.js';
