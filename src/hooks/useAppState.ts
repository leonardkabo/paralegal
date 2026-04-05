import { useState, useEffect, useRef, useCallback } from 'react';
import { User, UserProgress, Language, Module, AppSettings, Attachment, GlossaryTerm, LegalDocument, CaseStudy } from '../types';

export function useAppState() {
  const lastSyncedRef = useRef<string>('');
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
        finalExamDate: parsed.finalExamDate,
        lastUpdated: parsed.lastUpdated
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
  const [isSyncing, setIsSyncing] = useState(false);

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
            lastSyncedRef.current = JSON.stringify({
              completedModules: data.progress.completedModules,
              quizScores: data.progress.quizScores,
              audioListened: data.progress.audioListened,
              completedCaseStudies: data.progress.completedCaseStudies,
              finalExamScore: data.progress.finalExamScore,
              finalExamDate: data.progress.finalExamDate
            });
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
    if (!user) return;

    const pollInterval = setInterval(() => {
      console.log("Vérification de la base de données (sync 10s)...");
      fetch(`/api/progress/${user.phone}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.progress) {
            // Only update if server has newer data
            const serverLastUpdated = data.progress.lastUpdated;
            const localLastUpdated = progress.lastUpdated;

            if (serverLastUpdated && (!localLastUpdated || new Date(serverLastUpdated) > new Date(localLastUpdated))) {
              console.log("Base de données : nouvelles données trouvées, mise à jour...");
              setProgress(data.progress);
              localStorage.setItem('paralegal_progress', JSON.stringify(data.progress));
              
              // Update lastSyncedRef to match the new server data to prevent immediate re-sync
              lastSyncedRef.current = JSON.stringify({
                completedModules: data.progress.completedModules,
                quizScores: data.progress.quizScores,
                audioListened: data.progress.audioListened,
                completedCaseStudies: data.progress.completedCaseStudies,
                finalExamScore: data.progress.finalExamScore,
                finalExamDate: data.progress.finalExamDate
              });
            }
          }
        })
        .catch(err => console.error("Erreur de synchronisation base de données:", err));
    }, 10000); // Poll every 10 seconds as requested

    return () => clearInterval(pollInterval);
  }, [user, progress.lastUpdated]);

  useEffect(() => {
    localStorage.setItem('paralegal_progress', JSON.stringify(progress));
    
    if (user && hasFetchedFromServer) {
      const currentProgressStr = JSON.stringify({
        completedModules: progress.completedModules,
        quizScores: progress.quizScores,
        audioListened: progress.audioListened,
        completedCaseStudies: progress.completedCaseStudies,
        finalExamScore: progress.finalExamScore,
        finalExamDate: progress.finalExamDate
      });

      if (currentProgressStr === lastSyncedRef.current) {
        return; // No real data change
      }

      console.log("Syncing progress with server...", progress);
      setIsSyncing(true);
      // Sync with backend
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, progress })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.lastUpdated) {
          console.log("Sync successful, updating lastUpdated:", data.lastUpdated);
          lastSyncedRef.current = currentProgressStr;
          setProgress(prev => ({ ...prev, lastUpdated: data.lastUpdated }));
        }
      })
      .catch(err => {
        console.error("Échec de la synchronisation avec le serveur:", err);
      })
      .finally(() => {
        setIsSyncing(false);
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
        lastSyncedRef.current = JSON.stringify({
          completedModules: data.progress.completedModules,
          quizScores: data.progress.quizScores,
          audioListened: data.progress.audioListened,
          completedCaseStudies: data.progress.completedCaseStudies,
          finalExamScore: data.progress.finalExamScore,
          finalExamDate: data.progress.finalExamDate
        });
      } else {
        setError(data.error || "Identifiants invalides");
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (phone: string, birthDate: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, birthDate, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        return true;
      } else {
        setError(data.error || "Erreur lors de la réinitialisation");
        return false;
      }
    } catch (err) {
      setError("Erreur réseau");
      return false;
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
    setProgress(prev => {
      return {
        ...prev,
        audioListened: { ...prev.audioListened, [moduleId]: true },
        completedModules: prev.completedModules.includes(moduleId) 
          ? prev.completedModules 
          : [...prev.completedModules, moduleId]
      };
    });
  };

  const completeCaseStudy = (caseId: string) => {
    setProgress(prev => {
      return {
        ...prev,
        completedCaseStudies: prev.completedCaseStudies.includes(caseId)
          ? prev.completedCaseStudies
          : [...prev.completedCaseStudies, caseId]
      };
    });
  };

  const setFinalExamScore = (score: number) => {
    setProgress(prev => {
      return {
        ...prev,
        finalExamScore: score,
        finalExamDate: new Date().toISOString()
      };
    });
  };

  const logout = () => {
    localStorage.removeItem('paralegal_user');
    localStorage.removeItem('paralegal_progress');
    lastSyncedRef.current = '';
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

  const saveUser = async (userData: any) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
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
    resetPassword,
    setLanguage,
    completeModule,
    markAudioListened,
    completeCaseStudy,
    setFinalExamScore,
    logout,
    deleteUser,
    saveUser,
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
    isSyncing,
    fetchFiles: useCallback(async () => {
      const res = await fetch('/api/admin/files');
      return await res.json();
    }, []),
    deleteFile: useCallback(async (filename: string) => {
      const res = await fetch(`/api/admin/files/${filename}`, { method: 'DELETE' });
      return res.ok;
    }, []),
    forceSync: async () => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone, progress })
        });
        const data = await res.json();
        if (data.success && data.lastUpdated) {
          setProgress(prev => ({ ...prev, lastUpdated: data.lastUpdated }));
          lastSyncedRef.current = JSON.stringify({
            completedModules: progress.completedModules,
            quizScores: progress.quizScores,
            audioListened: progress.audioListened,
            completedCaseStudies: progress.completedCaseStudies,
            finalExamScore: progress.finalExamScore,
            finalExamDate: progress.finalExamDate
          });
        }
      } catch (err) {
        console.error("Force sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };
}
