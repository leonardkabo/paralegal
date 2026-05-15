/**
 * HOOK PRINCIPAL DE L'APPLICATION
 * Créé par Léonard KABO pour la gestion des parajuristes au Bénin.
 * Ce fichier gère tout ce qui est Firebase, l'utilisateur et les données.
 * @author Léonard KABO
 * Signature numérique : "Code 17 puits dans 10 villages en 1995"
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { User, UserProgress, Language, Module, AppSettings, Attachment, GlossaryTerm, LegalDocument, CaseStudy, AppState } from '../types';
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
  GoogleAuthProvider,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';

// Ma fonction principale pour l'état de l'application
export function useAppState(): AppState {
  // Références pour éviter les problèmes de synchronisation
  const lastSyncedRef = useRef<string>('');
  const progressUnsubscribeRef = useRef<(() => void) | null>(null);

  // L'état de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(() => {
    // Je récupère l'utilisateur que j'ai mis de côté dans le navigateur
    const cache_utilisateur = localStorage.getItem('paralegal_user');
    if (!cache_utilisateur) return null;
    try {
      const u = JSON.parse(cache_utilisateur);
      if (u && !u.id) u.id = u.phone || u.email;
      return u;
    } catch (e) {
      console.log("Erreur bizarre dans le JSON local utilisateur");
      return null;
    }
  });

  // La progression (ce que l'élève a fini ou pas)
  const [progress, setProgress] = useState<UserProgress>(() => {
    const cache_progres = localStorage.getItem('paralegal_progress');
    // Si j'ai déjà un truc enregistré localement, je l'utilise direct pour pas que ça clignote
    if (cache_progres) {
      try {
        const p = JSON.parse(cache_progres);
        return {
          completedModules: p.completedModules || [],
          quizScores: p.quizScores || {},
          audioListened: p.audioListened || {},
          completedCaseStudies: p.completedCaseStudies || [],
          finalExamScore: p.finalExamScore,
          finalExamDate: p.finalExamDate,
          lastUpdated: p.lastUpdated,
          lastActivity: p.lastActivity,
          lastModuleId: p.lastModuleId
        };
      } catch (err) {
        console.log("Oups, impossible de lire le progrès local");
      }
    }
    
    // Valeurs par défaut si c'est la toute première fois
    return {
      completedModules: [],
      quizScores: {},
      audioListened: {},
      completedCaseStudies: [],
      lastActivity: 'Nouveau départ',
      lastModuleId: 0
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
    logoUrl: '',
    directorName: 'Leonard Kabo',
    directorSignatureUrl: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const normalizePhone = (p: string) => p.replace(/[+\s]/g, '').trim();

  // Helper to get reliable user ID
  const getUserId = (u: User | null): string | null => {
    if (!u) return null;
    const rawId = (u as any).id || u.phone || u.email;
    if (!rawId) return null;
    // If it's a phone-like string, normalize it
    if (typeof rawId === 'string' && /^[+0-9\s-]+$/.test(rawId)) {
      return normalizePhone(rawId);
    }
    return rawId;
  };

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
        let phone = '';
        if (fbUser.email?.endsWith('@paralegal.bj')) {
          phone = fbUser.email.split('@')[0];
        }

        let userData: User | null = null;
        const identifier = phone || fbUser.email;
        
        if (identifier) {
          const userSnap = await getDoc(doc(db, 'users', identifier));
          if (userSnap.exists()) {
            userData = userSnap.data() as User;
          } else if (fbUser.email) {
            const q = query(collection(db, 'users'), where('email', '==', fbUser.email));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
              userData = qSnap.docs[0].data() as User;
            }
          }
        }

        if (!userData && fbUser.email) {
          // First time admin login
          const adminEmails = ["leonardkabo32@gmail.com", "healthaccessinitiativehai@gmail.com"];
          if (adminEmails.includes(fbUser.email)) {
            userData = {
              fullName: fbUser.displayName || "Admin",
              phone: fbUser.email,
              location: "Bénin",
              gender: "M",
              birthDate: "1990-01-01",
              educationLevel: "Expert",
              preferredLanguage: "fr",
              isAdmin: true,
              email: fbUser.email
            };
            await setDoc(doc(db, 'users', fbUser.email), userData);
          }
        }

        if (userData && fbUser.email) {
          const adminEmails = ["leonardkabo32@gmail.com", "healthaccessinitiativehai@gmail.com"];
          if (adminEmails.includes(fbUser.email) && !userData.isAdmin) {
            userData.isAdmin = true;
            await updateDoc(doc(db, 'users', identifier!), { isAdmin: true });
          }
        }

        if (userData) {
          const userId = identifier!;
          const finalUserData = { ...userData, id: userId };
          setUser(finalUserData);
          localStorage.setItem('paralegal_user', JSON.stringify(finalUserData));

          // Cleanup previous progress subscription if exists
          if (progressUnsubscribeRef.current) {
            progressUnsubscribeRef.current();
          }

          // Je surveille le progrès sur Firebase en temps réel
          progressUnsubscribeRef.current = onSnapshot(doc(db, 'progress', userId), (progressSnap) => {
            if (progressSnap.exists()) {
              const data = progressSnap.data() as UserProgress;
              
              setProgress(prev => {
                // ASTUCE LÉONARD : Je compare pour voir si le serveur a vraiment des infos plus fraîches
                // Si le serveur est vide (pas de modules) mais que moi j'en ai localement, je garde mes infos locales
                if (prev.completedModules.length > data.completedModules.length && !data.lastUpdated) {
                  return prev;
                }
                
                // Sinon on prend ce qu'il y a sur le serveur, c'est la loi !
                return data;
              });

              // Je garde une trace de ce qui est déjà synchronisé pour pas boucler
              lastSyncedRef.current = JSON.stringify({
                completedModules: data.completedModules,
                quizScores: data.quizScores,
                audioListened: data.audioListened,
                completedCaseStudies: data.completedCaseStudies,
                finalExamScore: data.finalExamScore,
                finalExamDate: data.finalExamDate,
                lastActivity: data.lastActivity,
                lastModuleId: data.lastModuleId
              });
            }
            setHasFetchedFromServer(true);
          }, (err) => {
             console.log("Erreur de récup de progression, mais je laisse tomber pour pas bloquer");
             setHasFetchedFromServer(true); // Au moins ça bloque pas l'app
          });
        }
      } else {
        // Personne n'est connecté
        if (progressUnsubscribeRef.current) {
          progressUnsubscribeRef.current();
          progressUnsubscribeRef.current = null;
        }
        // NOTE LÉONARD : Je ne vide plus localStorage ici direct au cas où Firebase Auth 
        // fait des siennes au rafraîchissement. Je laisse l'utilisateur gérer ça.
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
      if (progressUnsubscribeRef.current) progressUnsubscribeRef.current();
    };
  }, []);

  // Seeding effect: Initialise Firestore if empty (Admin only)
  useEffect(() => {
    if (!user?.isAdmin) return;

    const seedData = async () => {
      try {
        // Seed Modules
        const modSnap = await getDocs(collection(db, 'modules'));
        const currentModules = modSnap.docs.map(doc => doc.data() as Module);
        
        // Check if we need to seed or update
        const needsUpdate = modSnap.empty || currentModules.some(cm => {
          const matchingCodeMod = MODULES.find(m => m.id === cm.id);
          if (!matchingCodeMod) return false;
          
          // Update if question count differs
          const matchingQuiz = matchingCodeMod.quiz || [];
          const cmQuiz = cm.quiz || [];
          if (matchingQuiz.length !== cmQuiz.length) return true;
          
          // Update if labels are missing (check first option of first question as proxy)
          const firstOpt = cmQuiz[0]?.options?.[0];
          const codeFirstOpt = matchingQuiz[0]?.options?.[0];
          if (firstOpt && codeFirstOpt && firstOpt !== codeFirstOpt) return true;
          
          return false;
        });

        if (needsUpdate) {
          console.log("Firebase: Initialisation ou mise à jour des modules...");
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
            logoUrl: '',
            directorName: 'Leonard Kabo',
            directorSignatureUrl: ''
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

  // Auto-sync progress to localStorage to prevent loss on refresh
  useEffect(() => {
    if (progress && hasFetchedFromServer) {
      localStorage.setItem('paralegal_progress', JSON.stringify(progress));
    }
  }, [progress, hasFetchedFromServer]);

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
        const userId = getUserId(user);
        if (!userId) {
          console.error("Impossible de trouver un identifiant pour l'utilisateur");
          return;
        }
        const progressRef = doc(db, 'progress', userId);
        
        // Sanitize data to avoid Firestore "undefined" error
        const sanitizedProgress = {
          completedModules: progress.completedModules || [],
          quizScores: progress.quizScores || {},
          audioListened: progress.audioListened || {},
          completedCaseStudies: progress.completedCaseStudies || [],
          finalExamScore: progress.finalExamScore ?? null,
          finalExamDate: progress.finalExamDate ?? null,
          lastActivity: progress.lastActivity || '',
          lastModuleId: progress.lastModuleId ?? 0,
          lastUpdated: new Date().toISOString()
        };

        await setDoc(progressRef, sanitizedProgress, { merge: true });
        
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
      if (!userData.phone && !userData.email) {
        setError("Veuillez renseigner au moins un numéro de téléphone ou un email.");
        setIsLoading(false);
        return;
      }

      // Bloquer les emails admin à l'inscription
      const adminEmails = ["leonardkabo32@gmail.com", "healthaccessinitiativehai@gmail.com"];
      if (userData.email && adminEmails.includes(userData.email.toLowerCase())) {
        setError("Cet email est réservé aux administrateurs. Veuillez utiliser la connexion Google.");
        setIsLoading(false);
        return;
      }

      // Determine Auth Email
      let authEmail = userData.email || "";
      if (userData.phone && !authEmail) {
        const normalizedPhone = userData.phone.replace(/[+\s]/g, '');
        authEmail = `${normalizedPhone}@paralegal.bj`;
      }

      const password = userData.password || "password123";
      
      // Use phone as ID if available, otherwise email
      const userId = userData.phone || userData.email!;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setError("Cet identifiant est déjà utilisé.");
        setIsLoading(false);
        return;
      }

      // Create Firebase Auth account
      try {
        await createUserWithEmailAndPassword(auth, authEmail, password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/operation-not-allowed') {
          setError("ERREUR CONFIGURATION : Veuillez activer la méthode de connexion 'E-mail/Mot de passe' dans votre console Firebase.");
          setIsLoading(false);
          return;
        }
        if (authErr.code === 'auth/email-already-in-use') {
          setError("Cet email ou document est déjà utilisé.");
          setIsLoading(false);
          return;
        }
        throw authErr;
      }

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
        lastUpdated: new Date().toISOString(),
        lastModuleId: 0
      };
      await setDoc(progressRef, initialProgress);
      
      setUser({ ...fullUser, id: userId });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Bloquer les emails admin dans ce formulaire (doivent utiliser Google)
      const adminEmails = ["leonardkabo32@gmail.com", "healthaccessinitiativehai@gmail.com"];
      if (adminEmails.includes(identifier.toLowerCase())) {
        setError("Les administrateurs doivent utiliser le bouton 'Se connecter via Google'.");
        setIsLoading(false);
        return;
      }

      let authEmail = identifier;
      let targetUserDoc: User | null = null;

      // 1. Try to find user in Firestore to see if they have a real email
      const userRef = doc(db, 'users', identifier);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        targetUserDoc = userSnap.data() as User;
        if (targetUserDoc.email && !identifier.includes('@')) {
          authEmail = targetUserDoc.email;
        }
      }

      // 2. If no doc found or no email, and it's a phone, use virtual email
      if (!identifier.includes('@') && authEmail === identifier) {
        const normalizedPhone = identifier.replace(/[+\s]/g, '');
        authEmail = `${normalizedPhone}@paralegal.bj`;
      }
      
      try {
        await signInWithEmailAndPassword(auth, authEmail, password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/operation-not-allowed') {
          setError("ERREUR CONFIGURATION : Veuillez activer la méthode de connexion 'E-mail/Mot de passe' dans votre console Firebase.");
          setIsLoading(false);
          return;
        }
        
        // Migration/Fallback check (if not found in Auth, check if we need to migrate)
        if (targetUserDoc && targetUserDoc.password === password) {
          try {
            await createUserWithEmailAndPassword(auth, authEmail, password);
            return;
          } catch (createErr: any) {
            if (createErr.code === 'auth/operation-not-allowed') {
              setError("ERREUR CONFIGURATION.");
              setIsLoading(false);
              return;
            }
            throw createErr;
          }
        }
        throw authErr;
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Identifiants incorrects");
      } else {
        handleFirestoreError(err, OperationType.GET, 'users');
      }
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
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError("La fenêtre de connexion Google a été bloquée par votre navigateur. Veuillez autoriser les fenêtres surgissantes (popups) pour ce site.");
      } else {
        setError("Erreur de connexion Google");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (emailOrPhone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let email = emailOrPhone;
      if (!emailOrPhone.includes('@')) {
        const normalizedPhone = emailOrPhone.replace(/[+\s]/g, '');
        email = `${normalizedPhone}@paralegal.bj`;
      }
      
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("Utilisateur non trouvé.");
      } else {
        setError("Erreur lors de l'envoi du code de réinitialisation.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      try {
        const userId = getUserId(user);
        if (userId) {
          await updateDoc(doc(db, 'users', userId), { preferredLanguage: lang });
        }
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

  const updateLastActivity = (activity: string, moduleId: number) => {
    setProgress(prev => ({
      ...prev,
      lastActivity: activity,
      lastModuleId: moduleId
    }));
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

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      await deleteDoc(doc(db, 'progress', userId));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveUser = async (userData: any) => {
    try {
      const userId = userData.id || userData.phone || userData.email;
      if (!userId) throw new Error("ID utilisateur manquant");
      
      const isNew = !(await getDoc(doc(db, 'users', userId))).exists();
      
      await setDoc(doc(db, 'users', userId), userData, { merge: true });

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
        await setDoc(doc(db, 'progress', userId), initialProgress);
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
      const userId = getUserId(user);
      if (!userId) return false;

      // Update Firestore
      await updateDoc(doc(db, 'users', userId), { password: newPassword });
      
      // Update Firebase Auth if supported
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }

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
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Upload failed");
    } catch (err) {
      console.error("File upload error:", err);
      throw err;
    }
  };

  const saveReport = async (reportData: any) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const reportRef = doc(db, 'reports', id);
      const fullReport = {
        ...reportData,
        id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(reportRef, fullReport);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
      return false;
    }
  };

  const [users, setUsers] = useState<User[]>([]);
  const [allProgress, setAllProgress] = useState<Record<string, UserProgress>>({});

  useEffect(() => {
    if (user?.isAdmin) {
      // Real-time users for admin
      const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User & { id: string })));
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
    sendPasswordReset,
    setLanguage,
    completeModule,
    markAudioListened,
    completeCaseStudy,
    setFinalExamScore,
    updateLastActivity,
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
    saveReport,
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

/**
 * FIN DU FICHIER useAppState.ts
 * Code par Léonard KABO
 */
