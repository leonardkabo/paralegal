/**
 * Projet: Paralegal APP
 * Auteur: Léonard KABO
 * Description: Définition des types et interfaces pour l'application des parajuristes.
 * Signé: L. KABO
 */

export type Language = 'fr' | 'fon';

export interface User {
  id?: string;
  fullName: string;
  phone?: string;
  email?: string;
  location: string;
  gender: string;
  birthDate: string;
  educationLevel: string;
  preferredLanguage: Language;
  password?: string;
  isAdmin?: boolean;
  role?: 'student' | 'moderator' | 'admin';
  moderatorPermissions?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // If array, it's multi-choice. Default should be multi-choice.
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'audio' | 'video' | 'image';
}

export interface Module {
  id: number;
  title: string;
  introduction?: string;
  objectives?: string[];
  keyNotions?: string[];
  content?: string; // Markdown for FR
  audioUrl?: string; // For Fon
  videoUrl?: string;
  quiz?: QuizQuestion[];
  isReporting?: boolean;
  attachments?: Attachment[];
  estimatedDuration?: number; // in minutes
  difficultyLevel?: 'Débutant' | 'Intermédiaire' | 'Avancé';
}

export interface AppSettings {
  logoUrl?: string;
  organizationName: string;
  contactEmail: string;
  directorName?: string;
  directorSignatureUrl?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  fonTranslation: string;
  fonDefinition: string;
  category: 'Civil' | 'Général' | 'Procédure' | 'Pénal' | 'Foncier';
}

export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  category: 'Contrat' | 'Procédure' | 'Lettre' | 'Formulaire';
  content: string;
  fileUrl?: string;
  fileName?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  scenario: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  fileUrl?: string;
  fileName?: string;
}

export interface UserProgress {
  phone: string; // User primary phone number
  completedModules: number[]; // IDs of completed modules
  quizScores: Record<number, number>; // Module ID -> Score percentage
  audioListened: Record<number, boolean>; // Module ID -> Is fully listened
  completedCaseStudies: string[]; // IDs of completed case studies
  finalExamScore?: number;
  finalExamDate?: string;
  lastUpdated?: string;
  lastActivity?: string;
  lastModuleId?: number;
}

export interface Report {
  id: string;
  userId: string;
  moduleId: number;
  type: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  date: string;
  anonymous: boolean;
  audioUrl?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'image';
  }[];
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AppState {
  user: User | null;
  users: User[];
  allProgress: Record<string, UserProgress>;
  progress: UserProgress;
  modules: Module[];
  glossary: GlossaryTerm[];
  legalDocuments: LegalDocument[];
  caseStudies: CaseStudy[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  registerUser: (userData: any) => Promise<void>;
  login: (identifier: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  sendPasswordReset: (identifier: string) => Promise<boolean>;
  setLanguage: (lang: Language) => Promise<void>;
  completeModule: (moduleId: number, score?: number) => void;
  markAudioListened: (moduleId: number) => void;
  completeCaseStudy: (caseStudyId: string) => void;
  setFinalExamScore: (score: number) => void;
  updateLastActivity: (activity: string, moduleId: number) => void;
  logout: () => Promise<void>;
  deleteUser: (uid: string) => Promise<boolean>;
  saveUser: (user: User) => Promise<boolean>;
  saveModule: (module: Module) => Promise<boolean>;
  deleteModule: (id: number) => Promise<boolean>;
  saveGlossaryTerm: (term: GlossaryTerm) => Promise<boolean>;
  deleteGlossaryTerm: (id: string) => Promise<boolean>;
  saveLegalDocument: (doc: LegalDocument) => Promise<boolean>;
  deleteLegalDocument: (id: string) => Promise<boolean>;
  saveCaseStudy: (study: CaseStudy) => Promise<boolean>;
  deleteCaseStudy: (id: string) => Promise<boolean>;
  saveSettings: (settings: AppSettings) => Promise<boolean>;
  changePassword: (newPass: string) => Promise<boolean>;
  uploadFile: (file: File) => Promise<any>;
  saveReport: (reportData: any) => Promise<boolean>;
  isSyncing: boolean;
  fetchFiles: () => Promise<any[]>;
  deleteFile: (filename: string) => Promise<boolean>;
  forceSync: () => Promise<void>;
}
