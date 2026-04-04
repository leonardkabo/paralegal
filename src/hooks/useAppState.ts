import { useState, useEffect } from 'react';
import { User, UserProgress, Language, Module, AppSettings, Attachment, GlossaryTerm, LegalDocument, CaseStudy } from '../types';

export function useAppState() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('paralegal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('paralegal_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completedModules: parsed.completedModules || [],
        quizScores: parsed.quizScores || {},
        audioListened: parsed.audioListened || {},
        completedCaseStudies: parsed.completedCaseStudies || [],
        finalExamScore: parsed.finalExamScore,
        finalExamDate: parsed.finalExamDate
      };
    }
    return {
      completedModules: [],
      quizScores: {},
      audioListened: {},
      completedCaseStudies: []
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedFromServer, setHasFetchedFromServer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    organizationName: 'Health Access Initiative (HAI)',
    contactEmail: 'contact@hai-benin.org',
    logoUrl: ''
  });

  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => setModules(data))
      .catch(err => console.error("Erreur lors du chargement des modules:", err));

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Erreur lors du chargement des paramètres:", err));

    fetch('/api/glossary')
      .then(res => res.json())
      .then(data => setGlossary(data))
      .catch(err => console.error("Erreur lors du chargement du glossaire:", err));

    fetch('/api/legal-documents')
      .then(res => res.json())
      .then(data => setLegalDocuments(data))
      .catch(err => console.error("Erreur lors du chargement des documents:", err));

    fetch('/api/case-studies')
      .then(res => res.json())
      .then(data => setCaseStudies(data))
      .catch(err => console.error("Erreur lors du chargement des études de cas:", err));

    if (user) {
      fetch(`/api/progress/${user.phone}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProgress(data.progress);
            localStorage.setItem('paralegal_progress', JSON.stringify(data.progress));
          }
          setHasFetchedFromServer(true);
        })
        .catch(err => {
          console.error("Erreur lors de la récupération de la progression:", err);
          setHasFetchedFromServer(true);
        });
    } else {
      setHasFetchedFromServer(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('paralegal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('paralegal_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('paralegal_progress', JSON.stringify(progress));
    if (user && hasFetchedFromServer) {
      // Sync with backend
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, progress })
      }).catch(err => {
        console.error("Échec de la synchronisation avec le serveur:", err);
      });
    }
  }, [progress, user, hasFetchedFromServer]);

  const registerUser = async (userData: Omit<User, 'preferredLanguage'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setProgress(data.progress);
      } else {
        setError(data.error || "Identifiants invalides");
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      await fetch('/api/update-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, language: lang })
      });
    }
  };

  const completeModule = (moduleId: number, score?: number) => {
    setProgress(prev => {
      const newCompleted = prev.completedModules.includes(moduleId)
        ? prev.completedModules
        : [...prev.completedModules, moduleId];
      
      const newScores = score !== undefined 
        ? { ...prev.quizScores, [moduleId]: score }
        : prev.quizScores;

      return {
        ...prev,
        completedModules: newCompleted,
        quizScores: newScores
      };
    });
  };

  const markAudioListened = (moduleId: number) => {
    setProgress(prev => ({
      ...prev,
      audioListened: { ...prev.audioListened, [moduleId]: true },
      completedModules: prev.completedModules.includes(moduleId) 
        ? prev.completedModules 
        : [...prev.completedModules, moduleId]
    }));
  };

  const completeCaseStudy = (caseId: string) => {
    setProgress(prev => ({
      ...prev,
      completedCaseStudies: prev.completedCaseStudies.includes(caseId)
        ? prev.completedCaseStudies
        : [...prev.completedCaseStudies, caseId]
    }));
  };

  const setFinalExamScore = (score: number) => {
    setProgress(prev => ({
      ...prev,
      finalExamScore: score,
      finalExamDate: new Date().toISOString()
    }));
  };

  const logout = () => {
    localStorage.removeItem('paralegal_user');
    localStorage.removeItem('paralegal_progress');
    setUser(null);
    setProgress({ 
      completedModules: [], 
      quizScores: {}, 
      audioListened: {},
      completedCaseStudies: []
    });
  };

  const deleteUser = async (phone: string) => {
    const res = await fetch(`/api/admin/users/${phone}`, { method: 'DELETE' });
    return res.ok;
  };

  const saveModule = async (module: Module) => {
    const res = await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module)
    });
    if (res.ok) {
      const modRes = await fetch('/api/modules');
      const data = await modRes.json();
      setModules(data);
    }
    return res.ok;
  };

  const deleteModule = async (id: number) => {
    const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setModules(modules.filter(m => m.id !== id));
    }
    return res.ok;
  };

  const saveGlossaryTerm = async (term: GlossaryTerm) => {
    const res = await fetch('/api/admin/glossary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(term)
    });
    if (res.ok) {
      const gRes = await fetch('/api/glossary');
      const data = await gRes.json();
      setGlossary(data);
    }
    return res.ok;
  };

  const deleteGlossaryTerm = async (id: string) => {
    const res = await fetch(`/api/admin/glossary/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setGlossary(glossary.filter(g => g.id !== id));
    }
    return res.ok;
  };

  const saveLegalDocument = async (doc: LegalDocument) => {
    const res = await fetch('/api/admin/legal-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (res.ok) {
      const dRes = await fetch('/api/legal-documents');
      const data = await dRes.json();
      setLegalDocuments(data);
    }
    return res.ok;
  };

  const deleteLegalDocument = async (id: string) => {
    const res = await fetch(`/api/admin/legal-documents/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLegalDocuments(legalDocuments.filter(d => d.id !== id));
    }
    return res.ok;
  };

  const saveCaseStudy = async (caseStudy: CaseStudy) => {
    const res = await fetch('/api/admin/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseStudy)
    });
    if (res.ok) {
      const cRes = await fetch('/api/case-studies');
      const data = await cRes.json();
      setCaseStudies(data);
    }
    return res.ok;
  };

  const deleteCaseStudy = async (id: string) => {
    const res = await fetch(`/api/admin/case-studies/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCaseStudies(caseStudies.filter(c => c.id !== id));
    }
    return res.ok;
  };

  const saveSettings = async (newSettings: AppSettings) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (res.ok) {
      setSettings(newSettings);
    }
    return res.ok;
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error("Upload failed");
  };

  return {
    user,
    progress,
    modules,
    glossary,
    legalDocuments,
    caseStudies,
    settings,
    isLoading,
    error,
    registerUser,
    login,
    setLanguage,
    completeModule,
    markAudioListened,
    completeCaseStudy,
    setFinalExamScore,
    logout,
    deleteUser,
    saveModule,
    deleteModule,
    saveGlossaryTerm,
    deleteGlossaryTerm,
    saveLegalDocument,
    deleteLegalDocument,
    saveCaseStudy,
    deleteCaseStudy,
    saveSettings,
    uploadFile,
    fetchFiles: async () => {
      const res = await fetch('/api/admin/files');
      return await res.json();
    },
    deleteFile: async (filename: string) => {
      const res = await fetch(`/api/admin/files/${filename}`, { method: 'DELETE' });
      return res.ok;
    }
  };
}
