import { useState, useEffect, useRef, useCallback } from 'react';
import { User, UserProgress, Language, Module, AppSettings, Attachment, GlossaryTerm, LegalDocument, CaseStudy } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { MODULES } from '../data/modules';
import { CASE_STUDIES } from '../data/caseStudies';
import { GLOSSARY_TERMS, LEGAL_DOCUMENTS } from '../data/extraContent';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  getDocs,
  where,
  Timestamp,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

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
        lastUpdated: parsed.lastUpdated,
        lastActivity: parsed.lastActivity,
        lastModuleId: parsed.lastModuleId
      };
    }
    return {
      completedModules: [],
      quizScores: {},
      audioListened: {},
      completedCaseStudies: [],
      lastActivity: '',
      lastModuleId: undefined
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
    // Load modules from Firestore with real-time updates
    const unsubscribeModules = onSnapshot(collection(db, 'modules'), (snapshot) => {
      const mods = snapshot.docs.map(doc => doc.data() as Module).sort((a, b) => a.id - b.id);
      setModules(mods);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'modules'));

    // Load settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'general'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/general'));

    // Load glossary
    const unsubscribeGlossary = onSnapshot(collection(db, 'glossary'), (snapshot) => {
      setGlossary(snapshot.docs.map(doc => doc.data() as GlossaryTerm));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'glossary'));

    // Load documents
    const unsubscribeDocs = onSnapshot(collection(db, 'legal_documents'), (snapshot) => {
      setLegalDocuments(snapshot.docs.map(doc => doc.data() as LegalDocument));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'legal_documents'));

    // Load case studies
    const unsubscribeCaseStudies = onSnapshot(collection(db, 'case_studies'), (snapshot) => {
      setCaseStudies(snapshot.docs.map(doc => doc.data() as CaseStudy));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'case_studies'));

    // Auth listener for persistence and real-time progress
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Find user by email (for admins) or custom mapping
        // In this app we used phone as ID. Link them.
        const q = query(collection(db, 'users'), where('email', '==', fbUser.email));
        const userSnap = await getDocs(q);
        
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data() as User;
          setUser(userData);
          
          // Subscribe to real-time progress
          const unsubscribeProgress = onSnapshot(doc(db, 'progress', userData.phone), (progressSnap) => {
            if (progressSnap.exists()) {
              const data = progressSnap.data() as UserProgress;
              setProgress(data);
              localStorage.setItem('paralegal_progress', JSON.stringify(data));
              lastSyncedRef.current = JSON.stringify({
                completedModules: data.completedModules,
                quizScores: data.quizScores,
                audioListened: data.audioListened,
                completedCaseStudies: data.completedCaseStudies,
                finalExamScore: data.finalExamScore,
                finalExamDate: data.finalExamDate
              });
            }
            setHasFetchedFromServer(true);
          }, (err) => handleFirestoreError(err, OperationType.GET, `progress/${userData.phone}`));
          
          return () => unsubscribeProgress();
        } else {
          // If logged in via Google but no user document yet (first time admin?)
          const adminEmails = ["leonardkabo32@gmail.com", "healthaccessinitiativehai@gmail.com"];
          if (fbUser.email && adminEmails.includes(fbUser.email)) {
            const adminData: User = {
              fullName: fbUser.displayName || (fbUser.email === adminEmails[0] ? "Leonard Kabo" : "HAI Admin"),
              phone: fbUser.email, // Use email as unique phone for admins
              location: "Bénin",
              gender: "M",
              birthDate: "1990-01-01",
              educationLevel: "Expert",
              preferredLanguage: "fr",
              isAdmin: true,
              email: fbUser.email
            };
            await setDoc(doc(db, 'users', adminData.phone), adminData);
            setUser(adminData);
          }
          setHasFetchedFromServer(true);
        }
      } else {
        setUser(null);
        setHasFetchedFromServer(true);
      }
    });

    return () => {
      unsubscribeModules();
      unsubscribeSettings();
      unsubscribeGlossary();
      unsubscribeDocs();
      unsubscribeCaseStudies();
      unsubscribeAuth();
    };
  }, []);

  // Seeding effect: Initialise Firestore if empty (Admin only)
  useEffect(() => {
    if (!user?.isAdmin) return;

    const seedData = async () => {
      try {
        // Seed Modules
        const modSnap = await getDocs(collection(db, 'modules'));
        if (modSnap.empty) {
          console.log("Firebase: Initialisation des modules...");
          const batch = writeBatch(db);
          MODULES.forEach(m => batch.set(doc(db, 'modules', m.id.toString()), m));
          await batch.commit();
        }

        // Seed Glossary
        const glossarySnap = await getDocs(collection(db, 'glossary'));
        if (glossarySnap.empty) {
          console.log("Firebase: Initialisation du glossaire...");
          const batch = writeBatch(db);
          GLOSSARY_TERMS.forEach(t => batch.set(doc(db, 'glossary', t.id), t));
          await batch.commit();
        }

        // Seed Documents
        const docSnap = await getDocs(collection(db, 'legal_documents'));
        if (docSnap.empty) {
          console.log("Firebase: Initialisation des documents...");
          const batch = writeBatch(db);
          LEGAL_DOCUMENTS.forEach(d => batch.set(doc(db, 'legal_documents', d.id), d));
          await batch.commit();
        }

        // Seed Case Studies
        const caseSnap = await getDocs(collection(db, 'case_studies'));
        if (caseSnap.empty) {
          console.log("Firebase: Initialisation des études de cas...");
          const batch = writeBatch(db);
          CASE_STUDIES.forEach(cs => batch.set(doc(db, 'case_studies', cs.id), cs));
          await batch.commit();
        }

        // Seed Settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (!settingsSnap.exists()) {
          console.log("Firebase: Initialisation des paramètres...");
          await setDoc(doc(db, 'settings', 'general'), {
            organizationName: 'Health Access Initiative (HAI)',
            contactEmail: 'contact@hai-benin.org',
            logoUrl: ''
          });
        }
      } catch (err) {
        console.error("Erreur lors de l'initialisation des données:", err);
      }
    };

    seedData();
  }, [user?.isAdmin]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('paralegal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('paralegal_user');
    }
  }, [user]);

  // Combined real-time progress and autosave
  useEffect(() => {
    if (!user || !hasFetchedFromServer) return;

    const currentProgressStr = JSON.stringify({
      completedModules: progress.completedModules,
      quizScores: progress.quizScores,
      audioListened: progress.audioListened,
      completedCaseStudies: progress.completedCaseStudies,
      finalExamScore: progress.finalExamScore,
      finalExamDate: progress.finalExamDate,
      lastActivity: progress.lastActivity,
      lastModuleId: progress.lastModuleId
    });

    if (currentProgressStr === lastSyncedRef.current) return;

    const timeoutId = setTimeout(async () => {
      console.log("Firebase: Sauvegarde automatique de la progression...");
      setIsSyncing(true);
      try {
        const progressRef = doc(db, 'progress', user.phone);
        await setDoc(progressRef, {
          ...progress,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
        
        lastSyncedRef.current = currentProgressStr;
      } catch (err) {
        console.error("Erreur de sauvegarde Firebase:", err);
      } finally {
        setIsSyncing(false);
      }
    }, 2000); // Debounce save by 2 seconds

    return () => clearTimeout(timeoutId);
  }, [progress, user, hasFetchedFromServer]);

  const registerUser = async (userData: Omit<User, 'preferredLanguage'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = userData.phone; // Using phone as doc ID for consistency
      const userRef = doc(db, 'users', userId);
      
      const fullUser: User = { 
        ...userData, 
        preferredLanguage: 'fr',
        isAdmin: false
      };
      
      await setDoc(userRef, fullUser);
      
      // Initialize progress
      const progressRef = doc(db, 'progress', userId);
      const initialProgress: UserProgress = {
        completedModules: [],
        quizScores: {},
        audioListened: {},
        completedCaseStudies: [],
        lastActivity: 'Inscription réussie',
        lastUpdated: new Date().toISOString()
      };
      await setDoc(progressRef, initialProgress);
      
      setUser(fullUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Standard user login via Firestore
      const userRef = doc(db, 'users', phone);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        if (userData.password === password) {
          setUser(userData);
          const progressSnap = await getDoc(doc(db, 'progress', phone));
          if (progressSnap.exists()) {
            setProgress(progressSnap.data() as UserProgress);
          }
        } else {
          setError("Mot de passe incorrect");
        }
      } else {
        setError("Utilisateur non trouvé");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Handled by onAuthStateChanged listener
      return result.user;
    } catch (err) {
      setError("Erreur de connexion Google");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (phone: string, birthDate: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', phone);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().birthDate === birthDate) {
        await updateDoc(userRef, { password: newPassword });
        return true;
      }
      setError("Informations incorrectes");
      return false;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${phone}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      try {
        await updateDoc(doc(db, 'users', user.phone), { preferredLanguage: lang });
      } catch (err) {
        console.error("Error updating language:", err);
      }
    }
  };

  const completeModule = (moduleId: number, score?: number) => {
    const module = modules.find(m => m.id === moduleId);
    const activity = module ? `Module complété: ${module.title}` : `Module ${moduleId} complété`;
    
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
        quizScores: newScores,
        lastActivity: activity,
        lastModuleId: moduleId
      };
    });
  };

  const markAudioListened = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    const activity = module ? `Audio écouté: ${module.title}` : `Audio ${moduleId} écouté`;

    setProgress(prev => {
      return {
        ...prev,
        audioListened: { ...prev.audioListened, [moduleId]: true },
        completedModules: prev.completedModules.includes(moduleId) 
          ? prev.completedModules 
          : [...prev.completedModules, moduleId],
        lastActivity: activity,
        lastModuleId: moduleId
      };
    });
  };

  const completeCaseStudy = (caseId: string) => {
    const activity = `Étude de cas complétée: ${caseId}`;
    setProgress(prev => {
      return {
        ...prev,
        completedCaseStudies: prev.completedCaseStudies.includes(caseId)
          ? prev.completedCaseStudies
          : [...prev.completedCaseStudies, caseId],
        lastActivity: activity
      };
    });
  };

  const setFinalExamScore = (score: number) => {
    const activity = `Examen final complété: ${score}%`;
    setProgress(prev => {
      return {
        ...prev,
        finalExamScore: score,
        finalExamDate: new Date().toISOString(),
        lastActivity: activity
      };
    });
  };

  const logout = async () => {
    await signOut(auth);
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
    try {
      await deleteDoc(doc(db, 'users', phone));
      await deleteDoc(doc(db, 'progress', phone));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveUser = async (userData: any) => {
    try {
      const isNew = !(await getDoc(doc(db, 'users', userData.phone))).exists();
      
      await setDoc(doc(db, 'users', userData.phone), userData, { merge: true });

      if (isNew) {
        // Initialize progress for new users created by admin
        const initialProgress: UserProgress = {
          completedModules: [],
          quizScores: {},
          audioListened: {},
          completedCaseStudies: [],
          lastActivity: 'Compte créé par l\'administrateur',
          lastUpdated: new Date().toISOString()
        };
        await setDoc(doc(db, 'progress', userData.phone), initialProgress);
      }
      
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return false;
    try {
      await updateDoc(doc(db, 'users', user.phone), { password: newPassword });
      setUser({ ...user, password: newPassword });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveModule = async (module: Module) => {
    try {
      await setDoc(doc(db, 'modules', module.id.toString()), module);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteModule = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'modules', id.toString()));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveGlossaryTerm = async (term: GlossaryTerm) => {
    try {
      await setDoc(doc(db, 'glossary', term.id), term);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteGlossaryTerm = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'glossary', id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveLegalDocument = async (docObj: LegalDocument) => {
    try {
      await setDoc(doc(db, 'legal_documents', docObj.id), docObj);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteLegalDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'legal_documents', id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveCaseStudy = async (caseStudy: CaseStudy) => {
    try {
      await setDoc(doc(db, 'case_studies', caseStudy.id), caseStudy);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteCaseStudy = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'case_studies', id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'general'), newSettings);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
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

  const [users, setUsers] = useState<User[]>([]);
  const [allProgress, setAllProgress] = useState<Record<string, UserProgress>>({});

  useEffect(() => {
    if (user?.isAdmin) {
      // Real-time users for admin
      const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => doc.data() as User));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

      // Real-time progress for all users (for admin dashboard)
      const unsubscribeAllProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
        const progressMap: Record<string, UserProgress> = {};
        snapshot.docs.forEach(doc => {
          progressMap[doc.id] = doc.data() as UserProgress;
        });
        setAllProgress(progressMap);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'progress'));

      return () => {
        unsubscribeUsers();
        unsubscribeAllProgress();
      };
    } else {
      setUsers([]);
      setAllProgress({});
    }
  }, [user?.isAdmin]);

  return {
    user,
    users,
    allProgress,
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
    loginWithGoogle,
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
    changePassword,
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
      // Automatic real-time sync with Firebase means this is no longer needed but kept for API compatibility
      return;
    }
  };
}
