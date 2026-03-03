export type Language = 'fr' | 'fon';

export interface User {
  fullName: string;
  phone: string;
  location: string;
  gender: string;
  birthDate: string;
  educationLevel: string;
  preferredLanguage: Language;
  password?: string;
  isAdmin?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
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
}

export interface AppSettings {
  logoUrl?: string;
  organizationName: string;
  contactEmail: string;
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
}

export interface UserProgress {
  completedModules: number[]; // IDs of completed modules
  quizScores: Record<number, number>; // Module ID -> Score percentage
  audioListened: Record<number, boolean>; // Module ID -> Is fully listened
  completedCaseStudies: string[]; // IDs of completed case studies
  finalExamScore?: number;
  finalExamDate?: string;
}
