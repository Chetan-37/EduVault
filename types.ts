export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Paper {
  id: string;
  course: string;
  semester: string;
  subject: string;
  year: number;
  title: string;
  uploadedBy: string;
  uploadedAt: string;
  fileDataUrl?: string; // Base64 string for demo purposes (limited size)
  fileName: string;
}

export interface CourseData {
  id: string;
  name: string;
  subjects: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}