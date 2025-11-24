import { Paper, User, UserRole, CourseData } from '../types';

const USERS_KEY = 'eduvault_users';
const PAPERS_KEY = 'eduvault_papers';
const CURRENT_USER_KEY = 'eduvault_current_user';
const COURSES_KEY = 'eduvault_courses';

// Helper for safe ID generation
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Seed mock data if empty
const seedData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const admin: User = { id: 'admin1', email: 'admin@edu.com', name: 'Admin User', role: UserRole.ADMIN };
    const student: User = { id: 'student1', email: 'student@edu.com', name: 'John Student', role: UserRole.STUDENT };
    localStorage.setItem(USERS_KEY, JSON.stringify([admin, student]));
  }

  if (!localStorage.getItem(COURSES_KEY)) {
    const courses: CourseData[] = [
      {
        id: 'c_cs',
        name: 'B.Tech Computer Science',
        subjects: ['Data Structures', 'Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks']
      },
      {
        id: 'c_mech',
        name: 'B.Tech Mechanical',
        subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Heat Transfer', 'Engineering Mechanics']
      },
      {
        id: 'c_mba',
        name: 'MBA',
        subjects: ['Marketing Management', 'Financial Accounting', 'Human Resource Management', 'Business Statistics']
      }
    ];
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  }
};

seedData();

export const storageService = {
  // Auth
  login: (email: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (email: string, name: string, role: UserRole): User => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const newUser: User = { id: generateId(), email, name, role };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Papers
  getPapers: (): Paper[] => {
    return JSON.parse(localStorage.getItem(PAPERS_KEY) || '[]');
  },

  savePaper: (paper: Paper): void => {
    const papers = storageService.getPapers();
    papers.push(paper);
    try {
      localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
    } catch (e) {
      console.error("Storage quota exceeded", e);
      alert("File too large for local browser storage demo. Metadata saved, but file content might be truncated.");
      // Fallback: save without file data to at least keep record
      const paperMetadata = { ...paper, fileDataUrl: undefined };
      papers.pop(); 
      papers.push(paperMetadata);
      localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
    }
  },
  
  updatePaper: (updatedPaper: Paper): void => {
    const papers = storageService.getPapers();
    const index = papers.findIndex(p => p.id === updatedPaper.id);
    if (index !== -1) {
      papers[index] = updatedPaper;
      localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
    }
  },

  deletePaper: (id: string): void => {
      const papers = storageService.getPapers();
      const filtered = papers.filter(p => p.id !== id);
      localStorage.setItem(PAPERS_KEY, JSON.stringify(filtered));
  },

  // Courses
  getCourses: (): CourseData[] => {
    return JSON.parse(localStorage.getItem(COURSES_KEY) || '[]');
  },

  saveCourses: (courses: CourseData[]): void => {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  }
};