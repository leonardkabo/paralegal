import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("paralegal.db");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    phone TEXT PRIMARY KEY,
    fullName TEXT,
    location TEXT,
    gender TEXT,
    birthDate TEXT,
    educationLevel TEXT,
    password TEXT,
    preferredLanguage TEXT,
    isAdmin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS progress (
    phone TEXT PRIMARY KEY,
    completedModules TEXT, -- JSON array
    quizScores TEXT, -- JSON object
    audioListened TEXT, -- JSON object
    completedCaseStudies TEXT, -- JSON array
    finalExamScore INTEGER,
    finalExamDate TEXT,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY,
    title TEXT,
    introduction TEXT,
    objectives TEXT, -- JSON array
    keyNotions TEXT, -- JSON array
    content TEXT,
    audioUrl TEXT,
    videoUrl TEXT,
    quiz TEXT, -- JSON array
    attachments TEXT, -- JSON array
    isReporting INTEGER DEFAULT 0,
    estimatedDuration INTEGER,
    difficultyLevel TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS glossary (
    id TEXT PRIMARY KEY,
    term TEXT,
    definition TEXT,
    fonTranslation TEXT,
    fonDefinition TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    content TEXT,
    fileUrl TEXT,
    fileName TEXT
  );

  CREATE TABLE IF NOT EXISTS case_studies (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    scenario TEXT,
    options TEXT, -- JSON array
    fileUrl TEXT,
    fileName TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    userId TEXT,
    moduleId INTEGER,
    type TEXT,
    description TEXT,
    location TEXT, -- JSON object
    date TEXT,
    anonymous INTEGER,
    audioUrl TEXT,
    attachments TEXT, -- JSON array
    status TEXT DEFAULT 'pending',
    createdAt TEXT
  );
`);

// Migration: Add missing columns to progress table if it already existed
try { db.exec("ALTER TABLE progress ADD COLUMN completedCaseStudies TEXT DEFAULT '[]'"); } catch (e) {}
try { db.exec("ALTER TABLE progress ADD COLUMN finalExamScore INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE progress ADD COLUMN finalExamDate TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE legal_documents ADD COLUMN fileUrl TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE legal_documents ADD COLUMN fileName TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE case_studies ADD COLUMN fileUrl TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE case_studies ADD COLUMN fileName TEXT"); } catch (e) {}

// Migration: Add missing columns to modules table if it already existed
try { db.exec("ALTER TABLE modules ADD COLUMN estimatedDuration INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE modules ADD COLUMN difficultyLevel TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE modules ADD COLUMN videoUrl TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE modules ADD COLUMN attachments TEXT DEFAULT '[]'"); } catch (e) {}

// Seed settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as any;
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("logoUrl", "");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("organizationName", "Health Access Initiative (HAI)");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("contactEmail", "info@healthaccess-initiative.org");
}

// Seed modules if empty or reset for 10 modules
const moduleCount = db.prepare("SELECT COUNT(*) as count FROM modules").get() as any;
if (moduleCount.count < 10) {
  db.prepare("DELETE FROM modules").run();
  const initialModules = [
      // MODULE 1: INTRODUCTION AU PARAJURISME ET EMPOWERMENT JURIDIQUE
  {
    id: 1,
    title: "Module 1 : Fondements du Parajurisme et Legal Empowerment",
    introduction: "Ce module établit les bases conceptuelles et éthiques du métier de parajuriste. Il explore la philosophie du Legal Empowerment, les principes déontologiques essentiels, et le rôle stratégique des parajuristes dans la chaîne d'accès à la justice au Bénin.",
    objectives: [
      "Définir le concept de parajurisme et distinguer les différents types de parajuristes",
      "Comprendre la philosophie du Legal Empowerment et son application au Bénin",
      "Maîtriser le code d'éthique et les limites de compétence du parajuriste",
      "Identifier les partenaires institutionnels et les mécanismes de référencement",
      "Appliquer les principes de confidentialité et de protection des données"
    ],
    keyNotions: [
      "Legal Empowerment (Pouvoir Juridique)",
      "Parajuriste communautaire vs institutionnel",
      "Premiers secours juridiques",
      "Déontologie et limites de compétence",
      "Règle de la 'ligne rouge'",
      "Confidentialité professionnelle"
    ],
    content: `# CHAPITRE 1 : QU'EST-CE QU'UN PARAJURISTE ?

## 1.1 Définition et typologie

Un **parajuriste** (paralegal) est une personne formée pour fournir une assistance juridique primaire, éduquer les communautés sur leurs droits, et faciliter l'accès à la justice, sans être titulaire d'un diplôme de droit complet [^7^].

### Types de parajuristes au Bénin :
- **Parajuristes communautaires** : Basés dans les villages/quartiers, proches des populations
- **Parajuristes institutionnels** : Attachés à des ONG, cliniques juridiques ou structures étatiques
- **Parajuristes spécialisés** : Focus sur des domaines spécifiques (VBG, foncier, santé)

## 1.2 Le concept de Legal Empowerment

Le **Legal Empowerment** est un processus par lequel les populations pauvres et marginalisées maîtrisent les outils juridiques pour améliorer leur vie quotidienne et défendre leurs intérêts [^6^].

### Les quatre piliers du Legal Empowerment :
1. **Accès à l'information juridique** : Connaître ses droits
2. **Assistance juridique primaire** : Conseil de base et orientation
3. **Médiation alternative** : Résolution pacifique des conflits
4. **Plaidoyer systémique** : Agir pour changer les politiques

## 1.3 Code d'éthique du parajuriste

### Les principes fondamentaux :

**a) Neutralité et impartialité**
- Ne jamais prendre parti dans un conflit
- Écouter toutes les parties avec la même attention
- Ne pas laisser les relations personnelles influencer le jugement

**b) Confidentialité absolue**
- Tout ce qui est dit dans le cadre professionnel reste secret
- Protection des données personnelles des clients
- Pas de divulgation à la famille ou aux autorités sans consentement

**c) Limites de compétence (La Ligne Rouge)**
- **Ce qu'un parajuriste PEUT faire :**
  - Informer sur les droits et procédures
  - Aider à rédiger des documents simples
  - Médier entre parties
  - Orienter vers des avocats ou institutions compétentes
  - Assister lors des démarches administratives

- **Ce qu'un parajuriste NE DOIT PAS faire :**
  - Représenter quelqu'un devant un tribunal (sauf exceptions légales spécifiques)
  - Donner des avis juridiques complexes sur des matières spécialisées
  - Accepter de l'argent pour des services (sauf remboursement de frais)
  - Prendre des décisions à la place du client

**d) Bénévolat et service communautaire**
- Le parajuriste est un service gratuit pour la communauté
- L'objectif est l'autonomisation, pas la dépendance
- Le client doit toujours comprendre et approuver les démarches

## 1.4 Réseau institutionnel au Bénin

### Partenaires clés à connaître :

**Secteur judiciaire :**
- Tribunaux de première instance (civil, commercial, correctionnel)
- Cours d'appel
- Cour suprême
- CRIET (Cour de Répression des Infractions Économiques et du Terrorisme)
- Tribunaux de conciliation (pour les petits litiges)

**Secteur administratif :**
- Préfectures et mairies (état civil, foncier)
- ANDF (Agence Nationale du Domaine et du Foncier)
- Inspection du Travail
- Direction de la Protection de l'Enfant

**Secteur associatif et ONG :**
- Barreau du Bénin (avocats)
- Clinique juridique de l'Université d'Abomey-Calavi
- Associations de défense des droits humains
- Structures de médiation communautaire

**Secteur santé (spécifique HAI) :**
- Centres de santé et hôpitaux
- Mécanismes de plaintes dans le système de santé
- Comités de veille sanitaire

---

# CHAPITRE 2 : COMPÉTENCES FONDAMENTALES DU PARAJURISTE

## 2.1 Compétences de communication

### L'écoute active :
- Écouter sans interrompre
- Poser des questions ouvertes ("Comment c'est arrivé ?", "Que souhaitez-vous ?")
- Reformuler pour vérifier la compréhension
- Observer le langage non-verbal

### La communication interculturelle :
- Respecter les langues locales (Fon, Yoruba, etc.)
- Adapter le discours au niveau d'éducation de l'interlocuteur
- Utiliser des exemples concrets de la vie quotidienne
- Mobiliser des allégories culturelles pertinentes

## 2.2 Gestion des cas et documentation

### Le dossier client :
Chaque cas doit être documenté avec :
- **Fiche d'identification** : Nom, contact, localisation, date
- **Résumé du problème** : Description factuelle, parties en cause
- **Documents collectés** : Copies des actes, correspondances
- **Actions entreprises** : Conseils donnés, démarches facilitées
- **Résolution** : Issue du cas, leçons apprises

### Système de suivi :
- Registre de consultation quotidien
- Classement par type de problème (famille, foncier, travail, etc.)
- Statistiques mensuelles pour les rapports d'activité

## 2.3 Techniques de médiation de base

### Les 5 étapes de la médiation communautaire :
1. **Accueil et écoute** : Créer un climat de confiance
2. **Analyse du conflit** : Identifier les intérêts réels (pas seulement les positions)
3. **Génération d'options** : Proposer des solutions créatives
4. **Négociation** : Aider les parties à trouver un terrain d'entente
5. **Accord écrit** : Formaliser l'accord avec signatures et témoins

### Principes de la médiation réussie :
- **Volontariat** : Les parties doivent consentir librement
- **Confidentialité** : Ce qui se dit en médiation reste secret
- **Impartialité** : Le médiateur ne juge pas
- **Flexibilité** : Adapter la procédure au contexte culturel

---

# CHAPITRE 3 : INTRODUCTION AU SYSTÈME JURIDIQUE BÉNINOIS

## 3.1 Sources du droit au Bénin

**Droit international :**
- Constitution de 1990 (révisée)
- Traités internationaux ratifiés (CEDAW, PIDCP, PIDESC, CRC)
- Principes généraux du droit reconnu par la communauté internationale

**Droit national :**
- Lois votées par l'Assemblée Nationale
- Décrets et arrêtés réglementaires
- Coutumes non contraires à l'ordre public

## 3.2 Hiérarchie des normes

1. Constitution (suprême)
2. Lois organiques et ordinaires
3. Décrets présidentiels
4. Arrêtés ministériels et interministériels
5. Décisions locales (maires, préfets)

## 3.3 Organigramme judiciaire simplifié

\`\`\`
COUR SUPRÊME (Cotonou)
    │
    ├── Cour Constitutionnelle
    │
    ├── Cour d'Appel (Cotonou, Parakou, Abomey, Bohicon)
    │       │
    │       ├── Tribunal de Première Instance (Civil/Commercial)
    │       │       └── Tribunal de Conciliation (litiges < 100 000 FCFA)
    │       │
    │       └── Tribunal de Première Instance (Correctionnel)
    │
    └── CRIET (Crimes économiques et terrorisme)
\`\`\`

---

# EXERCICE PRATIQUE : IDENTIFICATION DES RÔLES

**Scénario :** Une femme vient vous consulter parce que son mari refuse de reconnaître leur enfant né hors mariage et ne donne pas les moyens de subsistance.

**Questions à discuter :**
1. Quelles sont les limites de votre intervention en tant que parajuriste ?
2. Vers quelles institutions pouvez-vous l'orienter ?
3. Quels documents devez-vous préparer avec elle ?
4. Comment gérez-vous la confidentialité si elle demande que sa famille ne soit pas informée ?`,
    quiz: [
      { id: "q1_1", question: "Un parajuriste peut-il représenter un client devant le Tribunal de Première Instance ?", options: ["Oui, dans tous les cas", "Non, sauf exception légale spécifique", "Oui, si le client est pauvre"], correctAnswer: 1, explanation: "La représentation devant les tribunaux est généralement réservée aux avocats, sauf exceptions spécifiques prévues par la loi." },
      { id: "q1_2", question: "Quelle est la première règle éthique du parajuriste ?", options: ["Gagner de l'argent", "Confidentialité et protection du client", "Plaire aux autorités"], correctAnswer: 1, explanation: "La confidentialité est fondamentale pour établir la confiance nécessaire à l'exercice du métier." },
      { id: "q1_3", question: "Le Legal Empowerment vise principalement à :", options: ["Remplacer les avocats", "Donner aux pauvres les moyens d'utiliser le droit", "Créer de nouvelles lois"], correctAnswer: 1, explanation: "L'objectif est l'autonomisation des populations marginalisées par la maîtrise des outils juridiques." },
      { id: "q1_4", question: "Dans une médiation, le parajuriste doit :", options: ["Prendre parti pour le plus faible", "Rester neutre et impartial", "Décider à la place des parties"], correctAnswer: 1, explanation: "La neutralité est essentielle pour que les parties acceptent le processus de médiation." },
      { id: "q1_5", question: "Quel document garantit la propriété foncière au Bénin ?", options: ["Le Titre Foncier", "L'acte de vente sous seing privé", "La déclaration au chef de village"], correctAnswer: 0, explanation: "Seul le Titre Foncier délivré par l'ANDF garantit une propriété inattaquable." },
      { id: "q1_6", question: "Un parajuriste peut-il accepter de l'argent pour ses services ?", options: ["Oui, c'est son droit", "Non, sauf remboursement des frais de déplacement", "Oui, si le client est riche"], correctAnswer: 1, explanation: "Le parajuriste bénévole ne doit pas facturer ses services, mais peut être remboursé de frais engagés." },
      { id: "q1_7", question: "La CRIET est compétente pour :", options: ["Les divorces", "Les crimes économiques et le terrorisme", "Les litiges fonciers ruraux"], correctAnswer: 1, explanation: "La Cour de Répression des Infractions Économiques et du Terrorisme traite des crimes financiers complexes." },
      { id: "q1_8", question: "Quelle est la durée idéale d'une formation initiale de parajuristes selon les standards internationaux ?", options: ["1 jour", "1 à 4 semaines", "1 an"], correctAnswer: 1, explanation: "Les programmes de formation de base varient généralement de 1 à 4 semaines selon le niveau de spécialisation [^2^]." }
    ],
    audioUrl: "", videoUrl: "", attachments: [], isReporting: 0, estimatedDuration: 240, difficultyLevel: "Débutant"
  },

  // MODULE 2 : DROIT À LA SANTÉ ET ÉTHIQUE MÉDICALE
  {
    id: 2,
    title: "Module 2 : Droit à la Santé et Bioéthique",
    introduction: "Ce module approfondit le droit à la santé comme droit fondamental, les obligations de l'État, la responsabilité médicale, et les mécanismes de défense des patients dans le contexte spécifique de la mission de HAI.",
    objectives: [
      "Maîtriser les textes constitutionnels et conventionnels sur le droit à la santé",
      "Identifier les violations du droit à la santé et les recours disponibles",
      "Comprendre la responsabilité médicale et le secret professionnel",
      "Connaître les droits spécifiques des femmes et des enfants en santé reproductive",
      "Maîtriser les procédures de plainte dans le système de santé béninois"
    ],
    keyNotions: [
      "Droit à la santé (Constitution art. 29)",
      "Accès universel et équité",
      "Consentement éclairé",
      "Secret médical et confidentialité",
      "Responsabilité médicale",
      "Santé reproductive et droits"
    ],
    content: `# CHAPITRE 1 : FONDEMENTS DU DROIT À LA SANTÉ

## 1.1 Base constitutionnelle et internationale

### Constitution du Bénin (1990) :
**Article 29** : *"L'État reconnaît et garantit à tout individu le droit à la santé. Il a le devoir de veiller à la santé de la population et de prendre les mesures nécessaires pour assurer à tous la protection sanitaire."*

### Instruments internationaux ratifiés par le Bénin :
- **PIDESC** (Pacte International des Droits Économiques, Sociaux et Culturels) : Article 12
- **CEDAW** : Article 12 (élimination de la discrimination dans le domaine des soins de santé)
- **Convention des Droits de l'Enfant** : Article 24 (droit de l'enfant à la santé)
- **Charte Africaine des Droits de l'Homme et des Peuples** : Article 16

## 1.2 Les trois niveaux d'obligation de l'État

**1. Respecter** : Ne pas entraver l'accès aux soins (pas de fermeture arbitraire de centres de santé)

**2. Protéger** : Empêcher des tiers de nuire (régulation des pratiques médicales charlatanesques)

**3. Réaliser** : Prendre des mesures positives pour garantir l'accès :
- Construction d'infrastructures sanitaires
- Formation du personnel médical
- Subvention des médicaments essentiels
- Couverture maladie universelle (AMU)

---

# CHAPITRE 2 : ACCÈS AUX SOINS ET ÉQUITÉ

## 2.1 Les composantes de l'accès

**Accessibilité physique** : Proximité géographique, transport, infrastructures adaptées aux personnes handicapées

**Accessibilité financière** : Coûts abordables, gratuité pour les indigents, AMU

**Accessibilité informationnelle** : Information compréhensible sur les services disponibles

**Accessibilité culturelle** : Respect des langues, coutumes, et croyances

## 2.2 La gratuité des soins au Bénin

### Politique de gratuité :
- **Soins obstétricaux et néonataux d'urgence (SONU)** : Gratuits depuis 2009
- **Césarienne** : Gratuite
- **Soins de paludisme** : Gratuits pour les U5 et les femmes enceintes
- **VIH/SIDA** : ARV gratuits
- **Vaccination** : Programme élargi de vaccination (PEV) gratuit

### Défis persistants :
- **Frais indirects** : Transport, nourriture pendant l'hospitalisation
- **Pénuries de médicaments** : Obligation d'achat en pharmacie privée
- **Corruption** : Paiements informels exigés par certains agents de santé

---

# CHAPITRE 3 : DROITS DU PATIENT ET ÉTHIQUE MÉDICALE

## 3.1 Charte des droits du patient

Tout patient a droit à :

**a) L'information**
- Connaître son état de santé
- Comprendre les traitements proposés et leurs risques
- Être informé des alternatives disponibles

**b) Le consentement éclairé**
- Aucun traitement sans consentement (sauf urgence vitale)
- Droit de refuser un traitement
- Droit de choisir son praticien

**c) La dignité et le respect**
- Accueil digne sans discrimination
- Confidentialité absolue des informations médicales
- Intimité préservée lors des examens

**d) La qualité des soins**
- Soins conformes aux normes professionnelles
- Présence de personnel qualifié
- Hygiène et sécurité garanties

## 3.2 Le secret médical

### Portée du secret :
- **Absolu** : Ne peut être levé que par le patient lui-même ou une autorisation judiciaire
- **Étendu** : Couvre tout le personnel soignant, pas seulement le médecin
- **Perpétuel** : Survit au décès du patient et à la fin de la relation soignant-soigné

### Exceptions légales :
- Obligations de déclaration (maladies contagieuses, blessures par arme à feu)
- Protection de l'intérêt supérieur de l'enfant
- Défense du praticien en cas de procès

## 3.3 Responsabilité médicale

### Types de responsabilité :

**Civile** : Réparation du préjudice subi (dommages-intérêts)
- Exemple : Erreur de diagnostic entraînant un traitement inadapté

**Pénale** : Sanctions pénales (prison, amende)
- Exemple : Blessures involontaires, homicide involontaire, exercice illégal de la médecine

**Disciplinaire** : Sanctions professionnelles (blâme, suspension, radiation)
- Incompétence, faute contre l'honneur, manquement à la déontologie

### La faute médicale :
- **Définition** : Manquement à l'obligation de moyens (pas de résultat)
- **Preuve** : Expertise médicale contradictoire
- **Délai** : Action en responsabilité prescrite par 3 ans (10 ans en cas de dommage corporel)

---

# CHAPITRE 4 : SANTÉ REPRODUCTIVE ET DROITS DES FEMMES

## 4.1 Planification familiale

### Droit à la contraception :
- Accès gratuit aux méthodes contraceptives modernes
- Information sur les différentes méthodes
- Confidentialité pour les mineurs (service adapté)

### Interruption volontaire de grossesse (IVG) :
- **Cadre légal** : Loi 2003-04 (IVG légale en cas de danger pour la vie de la mère ou grossesse résultant d'un viol)
- **Conditions** : Avis de deux médecins, délai de réflexion
- **Rôle du parajuriste** : Accompagnement pour l'accès à la procédure légale, pas d'encadrement d'IVG illégale

## 4.2 Violences basées sur le genre (VBG) en milieu sanitaire

### Obligations des établissements de santé :
- Accueil sans jugement des victimes
- Soins d'urgence gratuits (décret 2012-480)
- Certification des blessures
- Orientation vers les services psychosociaux et judiciaires

### Protocole de prise en charge :
1. **Accueil** : Espace privé, écoute empathique
2. **Examens** : Documentation des blessures, collecte de preuves
3. **Soins** : Prévention IST/VIH, contraception d'urgence si demandée
4. **Certification** : Rédaction du constat médico-légal
5. **Orientation** : Parajuriste, assistante sociale, justice

---

# CHAPITRE 5 : MÉCANISMES DE PLAINTE ET RECOURS

## 5.1 Voies de recours administratives

**Au niveau de l'établissement :**
- Livre de plaintes disponible dans chaque centre de santé
- Commission de recours des usagers (dans les hôpitaux)
- Médecin-chef ou directeur de l'hôpital

**Au niveau central :**
- Direction de la Santé Publique (Ministère)
- Inspection du Service de Santé
- Mécanismes de la Couverture Maladie Universelle (AMU)

## 5.2 Voies judiciaires

**Action civile** : Demande de réparation devant le tribunal civil
**Action pénale** : Plainte pour blessures involontaires ou homicide involontaire
**Action disciplinaire** : Plainte au Conseil de l'Ordre des Médecins

## 5.3 Rôle du parajuriste dans les litiges de santé

### Accompagnement des patients :
- Aider à comprendre les droits violés
- Documenter les faits (dates, témoignages, documents médicaux)
- Rédiger des lettres de réclamation
- Orienter vers un avocat pour les actions complexes
- Accompagner lors des audiences médicales

### Précautions :
- Ne pas donner d'avis médical (hors compétence)
- Ne pas promettre de résultats financiers spécifiques
- Respecter la décision finale du patient (même si on n'est pas d'accord)

---

# EXERCICE PRATIQUE : CAS CLINIQUE

**Scénario :** Une jeune femme de 16 ans, mineure, vient vous voir. Elle est enceinte et son petit ami de 25 ans refuse de reconnaître la paternité. Ses parents veulent la marier de force au petit ami. Elle veut avorter mais a entendu dire que c'est interdit.

**Questions d'analyse :**
1. Quels sont les droits de cette jeune fille concernant sa grossesse ?
2. Quelle est la procédure légale d'IVG au Bénin et s'applique-t-elle ici ?
3. Comment gérez-vous la confidentialité vis-à-vis des parents ?
4. Quelles sont les implications pénales pour le petit ami (relation avec une mineure) ?
5. Quel accompagnement proposez-vous étape par étape ?`,
    quiz: [
      { id: "q2_1", question: "Quel article de la Constitution garantit le droit à la santé ?", options: ["Article 15", "Article 29", "Article 35"], correctAnswer: 1, explanation: "L'article 29 de la Constitution du Bénin consacre explicitement le droit à la santé." },
      { id: "q2_2", question: "Un hôpital peut-il refuser une prise en charge d'urgence faute de paiement ?", options: ["Oui, c'est son droit", "Non, c'est une violation grave", "Seulement la nuit"], correctAnswer: 1, explanation: "Le refus de soins d'urgence est une violation du droit à la santé et peut entraîner des poursuites." },
      { id: "q2_3", question: "Le secret médical peut être levé :", options: ["Jamais", "Par le patient ou une décision judiciaire", "Par la famille du patient"], correctAnswer: 1, explanation: "Le secret médical est absolu mais peut être levé par le patient lui-même ou une autorisation de justice." },
      { id: "q2_4", question: "La SONU (Soins Obstétricaux et Néonataux d'Urgence) est :", options: ["Payante", "Gratuite pour toutes", "Gratuite seulement pour les pauvres"], correctAnswer: 1, explanation: "La gratuité de la SONU s'applique à toutes les femmes, sans condition de ressources." },
      { id: "q2_5", question: "L'IVG est légale au Bénin en cas de :", options: ["Demande de la mère", "Danger pour la vie de la mère ou viol", "Jamais légale"], correctAnswer: 1, explanation: "Seuls ces deux cas permettent l'IVG légale selon la loi 2003-04." },
      { id: "q2_6", question: "Un patient a-t-il le droit de refuser un traitement ?", options: ["Oui, c'est son droit au consentement éclairé", "Non, le médecin décide", "Seulement s'il est majeur"], correctAnswer: 0, explanation: "Le consentement éclairé implique le droit d'accepter ou de refuser." },
      { id: "q2_7", question: "Quel délai pour agir en responsabilité médicale civile ?", options: ["1 an", "3 ans (10 ans pour dommage corporel)", "5 ans"], correctAnswer: 1, explanation: "La prescription est de 3 ans, portée à 10 ans pour les dommages corporels." },
      { id: "q2_8", question: "La certification des blessures suite à une VBG doit être faite par :", options: ["Le parajuriste", "Un officier de police", "Un médecin (constat médico-légal)"], correctAnswer: 2, explanation: "Seul un médecin peut établir un constat médico-légal faisant foi." }
    ],
    audioUrl: "", videoUrl: "", attachments: [], isReporting: 0, estimatedDuration: 300, difficultyLevel: "Intermédiaire"
  },

  // MODULE 3 : DROIT DE LA FAMILLE APPROFONDI
  {
    id: 3,
    title: "Module 3 : Droit de la Famille et des Personnes",
    introduction: "Ce module couvre en profondeur le Code des Personnes et de la Famille du Bénin : mariage, divorce, filiation, autorité parentale, successions et régimes matrimoniaux. Il intègre les spécificités des droits coutumiers et leur harmonisation avec le droit positif.",
    objectives: [
      "Maîtriser les différents types de mariage et leurs effets juridiques",
      "Connaître les procédures de divorce et leurs conséquences",
      "Comprendre la filiation (légitime, naturelle, adoptive) et la reconnaissance d'enfant",
      "Maîtriser les règles de succession et d'héritage (légal et testamentaire)",
      "Connaître l'autorité parentale et ses limites"
    ],
    keyNotions: [
      "Mariage civil vs coutumier vs religieux",
      "Divorce pour faute vs divorce par consentement mutuel",
      "Filiation et reconnaissance",
      "Succession ab intestat vs testamentaire",
      "Autorité parentale",
      "Régime matrimonial (séparation de biens, communauté)"
    ],
    content: `# CHAPITRE 1 : LE MARIAGE AU BÉNIN

## 1.1 Types de mariage et valeur juridique

### Mariage civil (seul reconnu par l'État) :
- **Condition de forme** : Célébration devant l'officier d'état civil
- **Conditions de fond** :
  - Consentement libre et éclairé des deux parties
  - Âge minimum : 18 ans (16 ans avec dérogation pour cause grave)
  - Absence d'empêchements (lien de parenté, bigamie)
- **Effets** : Obligations alimentaires, devoir de secours, communauté de vie

### Mariage coutumier :
- **Valeur** : Reconnu socialement mais pas juridiquement pour l'état civil
- **Risque** : Non protection des époux en cas de conflit (pas d'acte de mariage)
- **Conseil du parajuriste** : Toujours conseiller la régularisation par le mariage civil

### Mariage religieux :
- **Valeur** : Purement spirituelle, aucune valeur juridique
- **Pratique** : Souvent célébré après le mariage civil

## 1.2 Régimes matrimoniaux

**Communauté de biens réduite aux acquêts (régime légal) :**
- Biens propres (avant mariage + donations/héritages) restent personnels
- Biens acquis pendant le mariage sont communs (50/50 en cas de divorce)

**Séparation de biens (régime conventionnel) :**
- Chaque époux conserve la propriété de ses biens
- Nécessite un contrat de mariage devant notaire

**Participation aux acquêts :**
- Biens gérés séparément pendant le mariage
- Partage des acquêts à la dissolution

---

# CHAPITRE 2 : LE DIVORCE

## 2.1 Causes de divorce

### Divorce pour faute (article 229 et suivants du CPDF) :
- Adultère
- Condamnation pour crime/infamie
- Violences graves ou injures graves
- Abandon de domicile conjugal (>2 ans)
- Non-respect des devoirs conjugaux

### Divorce par consentement mutuel :
- Accord des deux époux sur le principe et les conséquences
- Procédure simplifiée devant le juge
- Plan de parentalité pour les enfants

### Divorce pour altération définitive du lien conjugal :
- Séparation de fait depuis plus de 3 ans
- Impossibilité de vivre ensemble

## 2.2 Procédure de divorce

**Étapes :**
1. **Tentative de conciliation** : Obligatoire devant le juge (sauf divorce par consentement mutuel)
2. **Assignation** : Le demandeur assigne l'autre époux devant le tribunal
3. **Audience** : Débats, preuves des fautes alléguées
4. **Jugement** : Divorce prononcé ou rejet de la demande
5. **Appel** : Possible dans les 30 jours

## 2.3 Effets du divorce

**Sur les personnes :**
- Cessation de la communauté de vie
- Possibilité de reprendre le nom de jeune fille (pour la femme)
- Déchéance des avantages matrimoniaux (si divorce pour faute)

**Sur les biens :**
- Liquidation du régime matrimonial
- Partage des biens communs
- Attribution du logement familial (souvent à la femme avec enfants)

**Sur les enfants :**
- **Garde** : Principe de l'intérêt supérieur de l'enfant
- **Pension alimentaire** : Obligation du parent non gardien (fixée par le juge)
- **Droit de visite et d'hébergement** : Organisé par le juge

---

# CHAPITRE 3 : LA FILIATION

## 3.1 Filiation légitime (mariage)

**Présomption de paternité :**
- L'enfant né pendant le mariage est présumé être celui du mari
- Possibilité de contestation par le mari (dans les 6 mois de la naissance ou découverte de la trahison)

## 3.2 Filiation naturelle (hors mariage)

**Reconnaissance volontaire :**
- Acte de reconnaissance devant l'officier d'état civil
- Possibilité de reconnaissance avant la naissance (acte sous seing privé)
- Effets : Établissement de la filiation, droits successorels, obligations alimentaires

**Recherche de paternité :**
- Action en justice pour établir la filiation si le père refuse de reconnaître
- Preuves : Présomption fondée sur des indices (cohabitation, correspondance, etc.)
- Action impossible si la mère était mariée à un autre (présomption du mari)

## 3.3 Filiation adoptive

**Adoption plénière :**
- Rupture de la filiation d'origine
- L'adopté devient membre à part entière de la famille adoptive
- Conditions : Consentement des parents biologiques (sauf abandon), différence d'âge (minimum 15 ans entre adoptant et adopté)

**Adoption simple :**
- Maintien de la filiation d'origine + ajout de la filiation adoptive
- Plus souple que l'adoption plénière

---

# CHAPITRE 4 : L'AUTORITÉ PARENTALE

## 4.1 Contenu et exercice

**Droits des parents :**
- Droit de garde et de surveillance
- Droit d'éducation et de direction
- Droit de représentation de l'enfant
- Gestion des biens de l'enfant

**Devoirs des parents :**
- Entretien, éducation, sécurité de l'enfant
- Respect de l'intégrité physique et morale
- Obligation de scolarisation (âge 6-16 ans)

## 4.2 Limites et abus

**Châtiment corporel :**
- **Interdit** : Loi 2015-08 du 16 juin 2015 interdit toute forme de violence éducative
- **Sanctions** : Pénale (violences) et administrative (retrait de l'autorité parentale)

**Mariage d'enfants :**
- **Interdit** : Âge minimum 18 ans (16 avec dérogation exceptionnelle)
- **Sanction** : Emprisonnement et amende pour les auteurs

**Travail des enfants :**
- Interdit avant 14 ans
- Travail léger autorisé 14-16 ans (hors heures scolaires, non dangereux)

## 4.3 Retrait de l'autorité parentale

**Cas :**
- Abandon de famille
- Mauvais traitements
- Incapacité manifeste
- Atteinte aux mœurs sur l'enfant

**Procédure :**
- Action du procureur ou des proches
- Jugement du tribunal de la famille
- Placement de l'enfant ( famille d'accueil ou institution)

---

# CHAPITRE 5 : LES SUCCESSIONS

## 5.1 Succession ab intestat (sans testament)

**Ordre des héritiers (article 731 CPDF) :**
1. **Descendants** (enfants, petits-enfants) + conjoint survivant
2. **Ascendants** (parents, grands-parents) + conjoint survivant
3. **Collatéraux** (frères, sœurs, oncles, tantes) + conjoint survivant
4. **État** (déshérence)

**Partage :**
- **Principe d'égalité** : Garçons et filles héritent de parts égales (réforme de 2004)
- **Réserve héréditaire** : 2/3 des biens réservés aux enfants (impossible de priver totalement un enfant)
- **Quotité disponible** : 1/3 des biens que le défunt peut librement disposer

## 5.2 Succession testamentaire

**Formes de testament :**
- **Testament olographe** : Écrit, daté, signé de la main du testateur
- **Testament authentique** : Devant deux notaires ou un notaire et deux témoins
- **Testament mystique** : Écrit par un tiers, scellé, remis à un notaire

**Limites :**
- Respect de la réserve héréditaire
- Incessibilité des biens (on ne peut léguer ce qu'on n'a pas)

## 5.3 Spécificités des successions en milieu rural

**Conflits fréquents :**
- Droit coutumier vs droit positif (exclusion des filles selon certaines coutumes)
- Terres collectives vs terres individuelles
- Conflits entre coépouses (polygamie)

**Rôle du parajuriste :**
- Expliquer la primauté du droit positif sur les coutumes contraires
- Accompagner les femmes et filles dans la revendication de leurs droits
- Médier entre les parties pour éviter les conflits prolongés
- Orienter vers la justice en cas de spoliation

---

# EXERCICE PRATIQUE : CAS DE SUCCESSION COMPLEXE

**Scénario :** M. Koffi décède sans testament. Il était polygame avec deux épouses (Awa et Fatou). Avec Awa, il a 3 enfants (2 garçons, 1 fille). Avec Fatou, il a 2 filles. Il possède une maison à Cotonou et des terres au village. Ses frères prétendent que selon la coutume, les filles n'héritent pas des terres et que la maison doit revenir aux garçons uniquement.

**Questions :**
1. Quelle est la répartition légale de la succession ?
2. Comment gérez-vous la pression des frères et l'application du droit coutumier ?
3. Quelle médiation proposez-vous ?
4. Quels recours si les frères s'approprient les biens ?`,
    quiz: [
      { id: "q3_1", question: "Quel mariage est reconnu par l'État béninois ?", options: ["Le mariage religieux", "Le mariage coutumier", "Le mariage civil"], correctAnswer: 2, explanation: "Seul le mariage célébré devant l'officier d'état civil a une valeur juridique." },
      { id: "q3_2", question: "L'âge minimum légal du mariage est de :", options: ["15 ans", "18 ans (16 avec dérogation)", "21 ans"], correctAnswer: 1, explanation: "18 ans est la règle, 16 ans possible avec autorisation du juge pour cause grave." },
      { id: "q3_3", question: "Depuis la réforme de 2004, les filles héritent-elles autant que les garçons ?", options: ["Oui, parts égales", "Non, moitié seulement", "Seulement si elles sont célibataires"], correctAnswer: 0, explanation: "La réforme du CPDF a instauré l'égalité successorale entre hommes et femmes." },
      { id: "q3_4", question: "Le divorce pour altération définitive du lien conjugal nécessite :", options: ["Une faute grave", "Un consentement mutuel", "Une séparation de fait de 3 ans"], correctAnswer: 2, explanation: "C'est le divorce 'sans faute' basé sur l'impossibilité de vivre ensemble." },
      { id: "q3_5", question: "L'autorité parentale peut être retirée en cas de :", options: ["Mauvais résultats scolaires", "Abandon ou mauvais traitements", "Différence d'opinion avec l'enfant"], correctAnswer: 1, explanation: "L'intérêt supérieur de l'enfant justifie le retrait en cas de danger." },
      { id: "q3_6", question: "La réserve héréditaire représente :", options: ["La totalité des biens", "Les 2/3 des biens réservés aux enfants", "Les 1/3 disponibles pour les legs"], correctAnswer: 1, explanation: "Les enfants sont protégés par la réserve de 2/3, seul 1/3 est libre." },
      { id: "q3_7", question: "Un enfant né hors mariage peut-il être reconnu par son père ?", options: ["Oui, par acte de reconnaissance", "Non, jamais", "Seulement par décision judiciaire"], correctAnswer: 0, explanation: "La reconnaissance volontaire est possible devant l'officier d'état civil." },
      { id: "q3_8", question: "Le châtiment corporel des enfants est :", options: ["Autorisé pour l'éducation", "Interdit par la loi 2015-08", "Laissé à l'appréciation des parents"], correctAnswer: 1, explanation: "Toute violence éducative, y compris le châtiment corporel, est interdite." }
    ],
    audioUrl: "", videoUrl: "", attachments: [], isReporting: 0, estimatedDuration: 360, difficultyLevel: "Avancé"
  },

  // MODULE 4 : DROIT FONCIER ET DOMANIAL
  {
    id: 4,
    title: "Module 4 : Droit Foncier, Domanial et Environnemental",
    introduction: "Ce module traite de la sécurisation foncière, des modes d'acquisition de la propriété, des conflits fonciers et de la protection environnementale. Il couvre le Code Foncier et Domanial du Bénin et les mécanismes de résolution des litiges fonciers.",
    objectives: [
      "Comprendre le Code Foncier et Domanial et la distinction domaine public/privé",
      "Maîtriser les procédures d'immatriculation et d'obtention du Titre Foncier",
      "Connaître les modes d'acquisition des terres (achat, héritage, prescription)",
      "Identifier les conflits fonciers et les mécanismes de résolution",
      "Comprendre les droits environnementaux et la protection foncière des femmes"
    ],
    keyNotions: [
      "Domaine public vs domaine privé de l'État",
      "Titre Foncier (TF) vs Attestation de Détention Coutumière (ADC)",
      "Immatriculation foncière",
      "Expropriation pour cause d'utilité publique",
      "Prescription acquisitive",
      "Gestion durable des ressources"
    ],
    content: `# CHAPITRE 1 : PRINCIPES GÉNÉRAUX DU DROIT FONCIER

## 1.1 Régime foncier au Bénin

### Dualisme foncier :
Le Bénin connaît un système dual :
- **Droit foncier moderne** : Titre Foncier, registres publics
- **Droit foncier coutumier** : Terres relevant des chefferies traditionnelles

### Domaine de l'État :

**Domaine public :**
- Inaliénable (ne peut être vendu)
- Imprescriptible (ne peut être acquis par prescription)
- Inclut : routes, cours d'eau, places publiques, forêts classées, sites archéologiques

**Domaine privé de l'État :**
- Biens appartenant à l'État mais alienables
- Terres non immatriculées occupées par l'État
- Peut faire l'objet de cession (vente, bail)

## 1.2 Le Titre Foncier (TF)

### Définition :
Document juridique officiel attestant la propriété d'un terrain, délivré par l'ANDF (Agence Nationale du Domaine et du Foncier).

### Procédure d'obtention :
1. **Demande d'immatriculation** : Dépôt au service des Domaines
2. **Instruction** : Enquête, bornage, publication d'avis (2 mois)
3. **Décision** : Arrêté d'attribution du TF
4. **Inscription** : Au livre foncier du tribunal

### Valeur juridique :
- **Sécurité juridique** : Propriété inattaquable (sauf erreur manifeste)
- **Opposabilité** : Fait foi contre tiers et administration
- **Transmissibilité** : Facilite les successions et ventes

## 1.3 L'Attestation de Détention Coutumière (ADC)

### Fonction :
- Reconnaissance administrative d'une occupation coutumière
- **Ne confère pas la propriété** mais atteste de la détention
- Étape préalable vers l'immatriculation

### Limites :
- Ne protège pas contre l'expropriation sans indemnité
- Ne permet pas de vendre librement (sauf dans la communauté)
- Ne sécurise pas contre les conflits successoraux

---

# CHAPITRE 2 : MODES D'ACQUISITION DE LA PROPRIÉTÉ

## 2.1 Acquisition par acte entre vifs (achat/vente)

### Conditions de validité :
- **Écriture obligatoire** : Acte notarié ou sous seing privé avec signature légalisée
- **Consentement** : Pas de vice du consentement (erreur, dol, violence)
- **Capacité** : Capacité juridique du vendeur (propriétaire, pas mineur sous tutelle)
- **Objet licite** : Terrain non domanial public, non indisponible

### Formalités :
- **Enregistrement** : Dans les 3 mois au service des Domaines
- **Paiement des droits** : Enregistrement (4%), TOM (1%), frais divers
- **Mutation** : Changement de propriétaire au livre foncier (si TF existant)

## 2.2 Acquisition par succession (décès)

### Transmission :
- **Délai** : Acceptation pure et simple ou sous bénéfice d'inventaire dans les 3 mois
- **Partage** : Acte notarié ou judiciaire
- **Mutation** : Inscription des héritiers au TF

### Spécificités foncières :
- Terres collectives : Impartageables sans consentement de la collectivité
- Terres individuelles : Partageables selon règles successorales

## 2.3 Prescription acquisitive (usucapion)

### Définition :
Acquisition de la propriété par possession prolongée et non interrompue.

### Conditions :
- **Possession** : 10 ans si bonne foi et juste titre, 20 ans sinon
- **Continue** : Sans interruption (pas d'absence prolongée)
- **Paisible** : Sans contestation ni procès
- **Non interrompue** : Pas de reconnaissance de la propriété d'autrui

### Procédure judiciaire :
- Action en justice pour faire constater la prescription
- Jugement substitué au titre (titre judiciaire)

---

# CHAPITRE 3 : CONFLITS FONCIERS ET RÉSOLUTION

## 3.1 Types de conflits fonciers

**Conflits de limite :**
- Bornes déplacées
- Empiètement sur voisin
- Occupation de bande de terre contestée

**Conflits de propriété :**
- Vente à deux acheteurs différents
- Spoliation par un tiers
- Contestation successorale

**Conflits avec l'administration :**
- Expropriation sans indemnisation
- Occupation domaniale contestée
- Refus d'immatriculation

**Conflits coutumiers :**
- Terres collectives vs individuelles
- Droits des femmes à la terre
- Conflits inter-communautaires (autochtones/allogènes)

## 3.2 Mécanismes de résolution

### Voie amiable :
- **Médiation traditionnelle** : Chef de village, notables
- **Médiation moderne** : Centre de médiation, parajuristes
- **Conciliation** : Tentative obligatoire avant procès (sauf urgence)

### Voie judiciaire :
- **Tribunal de Première Instance** : Compétent pour les litiges fonciers
- **Juridictions coutumières** : Conciliation seulement (pas de décision exécutoire)
- **Cour d'Appel** : Appel des décisions du TPI

### Voie administrative :
- **ANDF** : Contentieux d'immatriculation
- **Préfecture** : Conflits liés au domaine public
- **Cour administrative** : Recours contre décisions administratives

## 3.3 Rôle du parajuriste dans les conflits fonciers

### Conseil préventif :
- Vérifier l'existence du TF avant tout achat
- Exiger l'acte de propriété du vendeur
- Vérifier l'identité du vendeur (pas usurpateur)
- Conseiller l'acte notarié (pas vente verbale)

### Accompagnement contentieux :
- Rédaction des mémoires et conclusions simples
- Assistance lors des audiences
- Collecte des preuves (témoignages, documents)
- Médiation entre parties

### Limites :
- Ne pas représenter en justice (sauf si habilité spécialement)
- Ne pas donner d'avis sur la valeur des terres (expertise spécialisée)
- Ne pas négocier à la place du client

---

# CHAPITRE 4 : EXPROPRIATION ET SERVITUDES

## 4.1 Expropriation pour cause d'utilité publique

### Conditions :
- **Utilité publique** : Projet d'intérêt général (route, école, barrage)
- **Juste et préalable indemnisation** : Prix du marché + préjudices annexes
- **Procédure régulière** : Déclaration d'utilité publique, enquête publique

### Indemnisation :
- **Valeur vénale** : Prix réel du terrain
- **Trouble de jouissance** : Préjudice subi pendant les travaux
- **Dommages** : Pertes de récoltes, constructions détruites

### Recours :
- **Contentieux de l'expropriation** : Tribunal administratif
- **Excès de pouvoir** : Recours contre DUP irrégulière
- **Indemnisation insuffisante** : Expertise judiciaire

## 4.2 Servitudes foncières

### Définition :
Charges imposées à un fonds (servant) pour l'avantage d'un autre fonds (dominant).

### Types :
- **Servitudes légales** : Distance des plantations, écoulement des eaux
- **Servitudes conventionnelles** : Accord entre voisins (passage, vue)
- **Servitudes apparentes** : Visibles (chemin, caniveau)

### Constitution :
- **Par acte** : Écrit devant notaire ou sous seing privé
- **Par destination du père de famille** : Aménagements durables
- **Par prescription** : 20 ans de jouissance non interrompue

---

# CHAPITRE 5 : DROITS FONCIERS DES FEMMES ET PROTECTION ENVIRONNEMENTALE

## 5.1 Accès des femmes à la terre

### Obstacles juridiques et coutumiers :
- **Inégalité successorale coutumière** : Exclusion des filles selon certaines coutumes
- **Désavantage matrimonial** : Perte des terres en cas de divorce ou veuvage
- **Accès au crédit** : Difficulté d'obtenir des prêts fonciers

### Protection légale :
- **Constitution** : Égalité des sexes (art. 26)
- **CPDF** : Égalité successorale (réforme 2004)
- **Charte des droits des femmes** : Reconnaissance du droit foncier des femmes

### Action du parajuriste :
- Sensibilisation des communautés sur les droits des femmes
- Accompagnement des femmes dans les démarches d'immatriculation
- Défense des veuves et orphelines spoliées
- Médiation dans les conflits successoraux

## 5.2 Droit environnemental et terres

### Protection des ressources naturelles :
- **Forêts classées** : Interdiction de défrichement sans autorisation
- **Zones humides** : Protection du littoral et mangroves
- **Eau** : Ressource commune, gestion concertée

### Responsabilité environnementale :
- **Principe pollueur-payeur** : Réparation des dégradations
- **Évaluation environnementale** : Obligatoire pour grands projets
- **Accès à l'information** : Droit de connaître les risques environnementaux

---

# EXERCICE PRATIQUE : CAS FONCIER COMPLEXE

**Scénario :** Une famille veut acheter un terrain à Abomey-Calavi pour construire une maison. Le vendeur propose deux options :
- Terrain A : 15 millions FCFA avec Titre Foncier datant de 1995
- Terrain B : 8 millions FCFA avec Attestation de Détention Coutumière seulement

Le vendeur du terrain B insiste pour une vente rapide "car d'autres personnes sont intéressées" et demande un paiement en espèces sans acte notarié.

**Questions :**
1. Quelle est la différence juridique entre les deux terrains ?
2. Quels risques court l'acheteur avec l'option B ?
3. Quelles vérifications le parajuriste doit-il conseiller ?
4. Quelle rédaction proposez-vous pour sécuriser l'achat du terrain A ?`,
    quiz: [
      { id: "q4_1", question: "Quel document garantit la propriété foncière définitive ?", options: ["L'Attestation de Détention Coutumière", "Le Titre Foncier", "Le reçu d'achat"], correctAnswer: 1, explanation: "Seul le Titre Foncier inscrit au livre foncier garantit la propriété." },
      { id: "q4_2", question: "L'ANDF est l'agence chargée de :", options: ["La santé publique", "La gestion du domaine et du foncier", "L'éducation"], correctAnswer: 1, explanation: "ANDF = Agence Nationale du Domaine et du Foncier." },
      { id: "q4_3", question: "Une terre du domaine public peut-elle être vendue ?", options: ["Oui", "Non, elle est inaliénable", "Seulement avec autorisation du Président"], correctAnswer: 1, explanation: "Le domaine public est inaliénable et imprescriptible." },
      { id: "q4_4", question: "La prescription acquisitive nécessite :", options: ["5 ans de possession", "10 ou 20 ans selon les conditions", "1 an suffit"], correctAnswer: 1, explanation: "10 ans avec bonne foi et juste titre, 20 ans sinon." },
      { id: "q4_5", question: "L'expropriation doit être :", options: ["Gratuite pour l'État", "Juste et préalablement indemnisée", "Sans formalité"], correctAnswer: 1, explanation: "La Constitution impose une juste et préalable indemnisation." },
      { id: "q4_6", question: "Une vente de terrain doit être constatée par :", options: ["Acte notarié ou sous seing privé légalisé", "Verbal devant témoins", "SMS entre parties"], correctAnswer: 0, explanation: "L'écrit est obligatoire pour les biens immobiliers." },
      { id: "q4_7", question: "Les femmes peuvent-elles hériter des terres au Bénin ?", options: ["Oui, égale aux hommes depuis 2004", "Non, selon la coutume", "Seulement si elles sont célibataires"], correctAnswer: 0, explanation: "La réforme de 2004 a instauré l'égalité successorale." },
      { id: "q4_8", question: "Un parajuriste peut-il représenter un client dans un litige foncier ?", options: ["Oui, devant tous les tribunaux", "Non, sauf habilitation spéciale", "Oui, si le litige est inférieur à 1 million"], correctAnswer: 1, explanation: "La représentation en justice est réservée aux avocats." }
    ],
    audioUrl: "", videoUrl: "", attachments: [], isReporting: 0, estimatedDuration: 360, difficultyLevel: "Avancé"
  },
  {
    id: 5,
      title: "Module 5 : Protection de l'Enfance et Droits de l'Enfant",
      introduction: "Ce module explore le cadre juridique de la protection de l'enfant au Bénin. Il détaille les droits fondamentaux, les formes de maltraitance, le travail des enfants, et les mécanismes de signalement et de prise en charge des mineurs en danger.",
      objectives: [
        "Maîtriser les dispositions du Code de l'Enfant au Bénin",
        "Identifier les différentes formes de maltraitance et d'exploitation",
        "Comprendre les règles sur le travail des enfants et l'âge minimum",
        "Connaître les procédures de signalement et de placement",
        "Promouvoir l'intérêt supérieur de l'enfant dans la communauté"
      ],
      keyNotions: [
        "Intérêt supérieur de l'enfant",
        "Code de l'Enfant (Loi 2015-08)",
        "Maltraitance physique et psychologique",
        "Exploitation économique et sexuelle",
        "Droit à l'éducation et à la santé",
        "Mineur en conflit avec la loi"
      ],
      content: `# CHAPITRE 1 : LE CADRE JURIDIQUE DE PROTECTION
      
## 1.1 Définition de l'enfant
Au Bénin, est considéré comme enfant tout être humain âgé de moins de 18 ans accomplis (Article 2 du Code de l'Enfant).

## 1.2 L'intérêt supérieur de l'enfant
C'est le principe cardinal : dans toute décision concernant un enfant, son intérêt doit être la considération primordiale. Cela inclut son bien-être physique, affectif et moral.

## 1.3 Droits fondamentaux
- **Droit à l'identité** : Nom, prénom et nationalité dès la naissance.
- **Droit à la santé** : Accès aux soins et à la vaccination.
- **Droit à l'éducation** : L'école est obligatoire et gratuite jusqu'à 16 ans.
- **Droit à la protection** : Contre toute forme de violence, d'abus ou de négligence.

---

# CHAPITRE 2 : LES FORMES DE MALTRAITANCE ET D'EXPLOITATION

## 2.1 Maltraitances physiques et psychologiques
- **Châtiments corporels** : Interdits dans tous les milieux (famille, école, centres d'apprentissage).
- **Négligence** : Privation de nourriture, de soins ou d'affection.
- **Violences morales** : Insultes, humiliations, menaces.

## 2.2 Exploitation économique (Travail des enfants)
- **Âge minimum** : 14 ans pour les travaux légers, 16 ans pour le travail régulier.
- **Pires formes de travail** : Esclavage, traite, prostitution, travaux dangereux (mines, carrières).
- **Vidomégon** : Pratique de placement d'enfants détournée en exploitation domestique.

## 2.3 Exploitation sexuelle et mariage forcé
- **Mariage d'enfants** : Interdit avant 18 ans. Les auteurs et complices encourent des peines de prison.
- **Pédocriminalité** : Tout acte sexuel sur un mineur est un crime sévèrement puni.

---

# CHAPITRE 3 : MÉCANISMES DE PROTECTION ET SIGNALEMENT

## 3.1 Acteurs de la protection
- **Direction de la Protection de l'Enfant (DPE)** : Coordination nationale.
- **Centres de Promotion Sociale (CPS)** : Prise en charge de proximité.
- **Brigade de Protection des Mineurs (BPM)** : Police spécialisée.
- **Tribunal pour enfants** : Justice adaptée aux mineurs.

## 3.2 Procédure de signalement
Tout citoyen (et particulièrement le parajuriste) a l'obligation de signaler un enfant en danger.
- **Où ?** CPS, Commissariat, Gendarmerie ou via le numéro vert (138).
- **Confidentialité** : L'identité de l'informateur est protégée.

## 3.3 Mesures de protection
- **Placement d'urgence** : En famille d'accueil ou centre de transit.
- **Assistance éducative** : Suivi de la famille par un travailleur social.
- **Ordonnance de garde** : Décision du juge pour protéger l'enfant de ses agresseurs.

---

# RÔLE DU PARAJURISTE
- Sensibiliser les parents sur l'importance de l'acte de naissance et de la scolarisation.
- Détecter les signes de maltraitance dans la communauté.
- Accompagner les familles vers les Centres de Promotion Sociale.
- Dénoncer les mariages forcés et l'exploitation économique.`,
      quiz: [
        { id: "q5_1", question: "Quel est l'âge de la majorité légale au Bénin ?", options: ["16 ans", "18 ans", "21 ans"], correctAnswer: 1, explanation: "Le Code de l'Enfant fixe la majorité à 18 ans." },
        { id: "q5_2", question: "L'école est obligatoire au Bénin jusqu'à quel âge ?", options: ["12 ans", "14 ans", "16 ans"], correctAnswer: 2, explanation: "La loi rend l'éducation obligatoire jusqu'à 16 ans." },
        { id: "q5_3", question: "Le châtiment corporel est-il autorisé pour l'éducation ?", options: ["Oui, avec modération", "Non, c'est strictement interdit", "Seulement par les parents"], correctAnswer: 1, explanation: "La Loi 2015-08 interdit toute forme de violence éducative." },
        { id: "q5_4", question: "Quel est l'âge minimum pour travailler au Bénin ?", options: ["12 ans", "14 ans", "18 ans"], correctAnswer: 1, explanation: "L'âge minimum légal est de 14 ans pour les travaux légers." },
        { id: "q5_5", question: "Le mariage d'un enfant de 15 ans est-il possible avec l'accord des parents ?", options: ["Oui", "Non, c'est interdit avant 18 ans", "Seulement pour les filles"], correctAnswer: 1, explanation: "Le mariage est interdit avant 18 ans, même avec l'accord parental." },
        { id: "q5_6", question: "Le numéro vert pour signaler un abus sur enfant est le :", options: ["117", "138", "160"], correctAnswer: 1, explanation: "Le 138 est la ligne dédiée à la protection de l'enfant." }
      ],
      audioUrl: "", videoUrl: "", attachments: [], isReporting: 0, estimatedDuration: 300, difficultyLevel: "Intermédiaire"
    },
    {
      id: 6,
      title: "Module 6 : Violences Basées sur le Genre (VBG)",
      introduction: "Ce module traite des violences spécifiques liées au genre, principalement envers les femmes et les filles. Il analyse le cadre légal béninois, les types de violences, et les parcours de prise en charge des victimes.",
      objectives: [
        "Définir et identifier les différentes formes de VBG",
        "Maîtriser la Loi 2011-26 sur les violences faites aux femmes",
        "Comprendre le cycle de la violence et les obstacles au signalement",
        "Connaître le circuit de prise en charge (médical, social, juridique)",
        "Savoir mener une sensibilisation communautaire efficace"
      ],
      keyNotions: [
        "Violence physique, sexuelle, psychologique",
        "Violence économique",
        "Harcèlement sexuel",
        "Mutilations Génitales Féminines (Excision)",
        "Loi 2011-26",
        "Prise en charge holistique"
      ],
      content: `# CHAPITRE 1 : COMPRENDRE LES VBG
      
## 1.1 Définition
Les VBG sont des actes nuisibles dirigés contre une personne en raison de son sexe. Elles découlent de rapports de force inégaux entre hommes et femmes.

## 1.2 Les types de violences
- **Physiques** : Coups, blessures, séquestration.
- **Sexuelles** : Viol, attouchements, harcèlement, mariage forcé.
- **Psychologiques** : Menaces, insultes, isolement, contrôle excessif.
- **Économiques** : Privation de ressources, interdiction de travailler, spoliation.
- **Traditionnelles** : Excision, lévirat (mariage forcé avec le frère du défunt).

---

# CHAPITRE 2 : LE CADRE LÉGAL BÉNINOIS

## 2.1 La Loi 2011-26
Cette loi spécifique punit les violences faites aux femmes. Elle définit le viol, le harcèlement sexuel, et les violences domestiques comme des délits ou crimes graves.

## 2.2 Les Mutilations Génitales Féminines (MGF)
L'excision est un crime au Bénin. La loi punit non seulement l'auteur de l'acte, mais aussi les parents et complices.

## 2.3 Le Harcèlement Sexuel
La loi protège les femmes contre le harcèlement en milieu scolaire et professionnel. Le chantage sexuel pour obtenir une note ou un emploi est sévèrement puni.

---

# CHAPITRE 3 : PRISE EN CHARGE ET RÉFÉRENCEMENT

## 3.1 Le parcours de la victime
1. **Médical** : Soins d'urgence, prévention IST/VIH, certificat médical (gratuit dans certains cas).
2. **Psychosocial** : Écoute, conseil, hébergement d'urgence (CPS).
3. **Juridique** : Plainte, assistance judiciaire, procès.

## 3.2 Rôle du parajuriste
- **Accueil** : Créer un espace sécurisé et confidentiel.
- **Écoute** : Ne jamais blâmer la victime ("Pourquoi es-tu sortie tard ?").
- **Information** : Expliquer les droits et les options de recours.
- **Accompagnement** : Orienter vers le CPS ou le commissariat.

---

# SENSIBILISATION COMMUNAUTAIRE
Le parajuriste doit déconstruire les mythes :
- "La femme appartient à son mari" -> Faux, elle a des droits propres.
- "C'est une affaire de famille" -> Faux, la violence est un crime public.
- "L'excision est nécessaire pour la pureté" -> Faux, c'est une mutilation dangereuse.`,
      quiz: [
        { id: "q6_1", question: "La violence psychologique est-elle punie par la loi au Bénin ?", options: ["Oui", "Non", "Seulement si elle laisse des traces"], correctAnswer: 0, explanation: "La Loi 2011-26 reconnaît et punit la violence morale et psychologique." },
        { id: "q6_2", question: "Le viol entre époux est-il reconnu par la loi ?", options: ["Oui", "Non, le devoir conjugal l'emporte", "Seulement en cas de divorce"], correctAnswer: 0, explanation: "La loi punit tout acte sexuel imposé sans consentement, même dans le mariage." },
        { id: "q6_3", question: "L'excision est considérée au Bénin comme :", options: ["Une tradition respectable", "Un crime puni de prison", "Un acte médical"], correctAnswer: 1, explanation: "Les MGF sont strictement interdites et pénalisées." },
        { id: "q6_4", question: "Où orienter prioritairement une victime de viol ?", options: ["Chez le chef de village", "À l'hôpital ou centre de santé", "À l'église"], correctAnswer: 1, explanation: "L'urgence est médicale (prévention IST/VIH et constat)." },
        { id: "q6_5", question: "Le harcèlement sexuel en milieu scolaire est puni par :", options: ["Le règlement intérieur", "Le Code Pénal et la Loi 2011-26", "Une simple amende"], correctAnswer: 1, explanation: "C'est une infraction pénale grave." }
      ],
      audioUrl: "", videoUrl: "", attachments: [], isReporting: 0, estimatedDuration: 300, difficultyLevel: "Intermédiaire"
    },
    {
      id: 7,
      title: "Module 7 : Droit du Travail et Protection Sociale",
      introduction: "Ce module présente les bases du droit du travail au Bénin. Il couvre les types de contrats, les droits et obligations des parties, les conditions de travail, et le rôle de la CNSS dans la protection sociale des travailleurs.",
      objectives: [
        "Distinguer les différents types de contrats de travail (CDI, CDD)",
        "Connaître les droits fondamentaux du travailleur (SMIG, congés, horaires)",
        "Comprendre les procédures de rupture de contrat et de licenciement",
        "Maîtriser le rôle de l'Inspection du Travail",
        "Connaître les obligations sociales (CNSS)"
      ],
      keyNotions: [
        "Contrat de travail",
        "SMIG (Salaire Minimum Interprofessionnel Garanti)",
        "Licenciement vs Démission",
        "CNSS",
        "Inspection du Travail",
        "Période d'essai"
      ],
      content: `# CHAPITRE 1 : LE CONTRAT DE TRAVAIL
      
## 1.1 Définition
Le contrat de travail est une convention par laquelle une personne s'engage à mettre son activité professionnelle sous la direction d'une autre personne, moyennant rémunération.

## 1.2 Types de contrats
- **CDI (Contrat à Durée Indéterminée)** : La forme normale de travail, sans date de fin prévue.
- **CDD (Contrat à Durée Déterminée)** : Pour une tâche précise et limitée dans le temps.
- **Contrat d'apprentissage** : Pour la formation professionnelle des jeunes.

## 1.3 La période d'essai
Elle permet à l'employeur d'évaluer les compétences et au travailleur de vérifier si le poste lui convient. Sa durée est fixée par la loi selon la catégorie professionnelle.

---

# CHAPITRE 2 : CONDITIONS DE TRAVAIL ET RÉMUNÉRATION

## 2.1 Le Salaire et le SMIG
Le salaire est librement fixé mais ne peut être inférieur au **SMIG**. Le SMIG est le plancher légal pour protéger le pouvoir d'achat des travailleurs les plus modestes.

## 2.2 Durée du travail et congés
- **Durée légale** : 40 heures par semaine.
- **Heures supplémentaires** : Donnent lieu à une majoration de salaire.
- **Congés payés** : Tout travailleur a droit à des congés (généralement 2 jours par mois de travail effectif).

## 2.3 Hygiène et Sécurité
L'employeur a l'obligation de garantir un environnement de travail sain et sécurisé pour prévenir les accidents et maladies professionnelles.

---

# CHAPITRE 3 : RUPTURE DU CONTRAT ET PROTECTION SOCIALE

## 3.1 Licenciement et Démission
- **Licenciement** : Doit être fondé sur un motif réel et sérieux (faute, motif économique).
- **Préavis** : Délai à respecter avant la fin effective du contrat.
- **Indemnités** : Sommes versées au travailleur en cas de licenciement non fautif.

## 3.2 La CNSS (Caisse Nationale de Sécurité Sociale)
L'employeur doit obligatoirement déclarer ses employés à la CNSS.
- **Prestations** : Allocations familiales, pensions de retraite, prise en charge des accidents de travail.

## 3.3 L'Inspection du Travail
C'est l'organe de contrôle et de médiation. En cas de conflit, le parajuriste doit orienter le travailleur vers l'inspecteur du travail pour une tentative de conciliation.`,
      quiz: [
        { id: "q7_1", question: "Le contrat de travail doit-il obligatoirement être écrit ?", options: ["Oui, toujours", "Non, l'oral est admis pour certains contrats", "Seulement pour les étrangers"], correctAnswer: 1, explanation: "Le Code du Travail admet le contrat verbal pour certains types d'emplois, bien que l'écrit soit recommandé." },
        { id: "q7_2", question: "Que signifie l'acronyme SMIG ?", options: ["Salaire Maximum d'Intérêt Général", "Salaire Minimum Interprofessionnel Garanti", "Service Médical Inter-Garantie"], correctAnswer: 1, explanation: "C'est le salaire minimum légal en vigueur." },
        { id: "q7_3", question: "Quelle est la durée légale hebdomadaire de travail au Bénin ?", options: ["35 heures", "40 heures", "48 heures"], correctAnswer: 1, explanation: "La durée légale est de 40 heures par semaine." },
        { id: "q7_4", question: "L'inscription à la CNSS est-elle facultative pour l'employeur ?", options: ["Oui, si l'employé est d'accord", "Non, c'est une obligation légale", "Seulement pour les grandes entreprises"], correctAnswer: 1, explanation: "Tout employeur doit déclarer ses salariés dès l'embauche." },
        { id: "q7_5", question: "En cas de conflit au travail, quelle institution assure la médiation ?", options: ["Le tribunal civil", "L'Inspection du Travail", "La Mairie"], correctAnswer: 1, explanation: "L'Inspection du Travail est l'étape de conciliation obligatoire." }
      ],
      audioUrl: "", videoUrl: "", attachments: [], estimatedDuration: 240, difficultyLevel: "Intermédiaire"
    },
    {
      id: 8,
      title: "Module 8 : Techniques de Médiation et Résolution des Conflits",
      introduction: "La médiation est un outil essentiel du parajuriste. Ce module enseigne les principes, les étapes et les techniques de communication nécessaires pour aider les parties à résoudre leurs litiges de manière pacifique et durable.",
      objectives: [
        "Comprendre les principes fondamentaux de la médiation (neutralité, volontariat)",
        "Maîtriser les étapes d'un processus de médiation réussi",
        "Développer des compétences d'écoute active et de reformulation",
        "Savoir rédiger un procès-verbal d'accord de médiation",
        "Identifier les limites de la médiation (cas non médiatisables)"
      ],
      keyNotions: [
        "Impartialité",
        "Confidentialité",
        "Écoute active",
        "Accord à l'amiable",
        "Neutralité",
        "Gagnant-Gagnant"
      ],
      content: `# CHAPITRE 1 : LES FONDEMENTS DE LA MÉDIATION
      
## 1.1 Définition
La médiation est un processus par lequel un tiers neutre (le médiateur/parajuriste) aide les parties en conflit à trouver elles-mêmes une solution mutuellement acceptable.

## 1.2 Les principes d'or
- **Volontariat** : On ne force personne à venir en médiation.
- **Neutralité** : Le médiateur ne prend pas parti.
- **Impartialité** : Le médiateur n'a pas d'intérêt personnel dans le conflit.
- **Confidentialité** : Tout ce qui se dit reste dans la salle.

---

# CHAPITRE 2 : LES ÉTAPES DE LA MÉDIATION

## 2.1 Préparation et Introduction
- Installer les parties confortablement.
- Expliquer les règles (pas d'insultes, temps de parole respecté).
- Définir le rôle du médiateur.

## 2.2 Exposé des faits
- Chaque partie donne sa version sans être interrompue.
- Le médiateur écoute et prend des notes.

## 2.3 Identification des besoins
- Le médiateur aide les parties à passer de leurs "positions" ("Je veux cet argent") à leurs "besoins" ("J'ai besoin de cet argent pour soigner mon enfant").

## 2.4 Recherche de solutions
- Brainstorming d'options.
- Évaluation de la faisabilité des solutions proposées.

## 2.5 Conclusion et Accord
- Formalisation de la solution choisie.
- Rédaction et signature du procès-verbal.

---

# CHAPITRE 3 : LES TECHNIQUES DE COMMUNICATION

## 3.1 L'écoute active
Montrer qu'on écoute par le regard, les hochements de tête et des petits encouragements verbaux.

## 3.2 La reformulation
"Si j'ai bien compris, ce qui vous blesse le plus c'est que..." Cela permet de valider les émotions et de clarifier les faits.

## 3.3 La gestion des émotions
Savoir faire une pause si la tension monte trop. Valider la colère ou la tristesse sans prendre parti.

---

# LIMITES DE LA MÉDIATION
Le parajuriste ne doit JAMAIS médiatiser :
- Les crimes graves (meurtre, viol).
- Les cas de violences physiques graves en cours.
- Les litiges où l'une des parties est sous l'emprise de la peur ou de la menace.`,
      quiz: [
        { id: "q8_1", question: "Un médiateur peut-il imposer une solution aux parties ?", options: ["Oui, s'il connaît bien la loi", "Non, les parties doivent trouver leur propre solution", "Seulement si les parties sont d'accord"], correctAnswer: 1, explanation: "Le médiateur facilite, il ne décide pas." },
        { id: "q8_2", question: "La confidentialité en médiation signifie que :", options: ["On peut raconter au juge", "Rien de ce qui est dit ne doit être divulgué", "On peut en parler à sa famille"], correctAnswer: 1, explanation: "C'est un principe absolu pour garantir la liberté de parole." },
        { id: "q8_3", question: "Quelle est la première étape d'une médiation ?", options: ["Signer l'accord", "L'exposé des faits par les parties", "L'introduction et la pose des règles"], correctAnswer: 2, explanation: "Il faut d'abord établir le cadre sécurisant." },
        { id: "q8_4", question: "Peut-on médiatiser un cas de viol ?", options: ["Oui, pour éviter le scandale", "Non, c'est un crime qui doit aller en justice", "Si les familles sont d'accord"], correctAnswer: 1, explanation: "Les crimes graves sont exclus du champ de la médiation." },
        { id: "q8_5", question: "La reformulation sert à :", options: ["Répéter bêtement", "Vérifier la compréhension et calmer les esprits", "Gagner du temps"], correctAnswer: 1, explanation: "C'est un outil puissant de clarification et d'empathie." }
      ],
      audioUrl: "", videoUrl: "", attachments: [], estimatedDuration: 180, difficultyLevel: "Débutant"
    },
    {
      id: 9,
      title: "Module 9 : Organisation Judiciaire et Accès à la Justice",
      introduction: "Ce module détaille l'organisation des tribunaux au Bénin. Il explique le rôle de chaque acteur de la justice et comment orienter efficacement un citoyen vers la bonne juridiction.",
      objectives: [
        "Connaître la hiérarchie des tribunaux au Bénin",
        "Distinguer le rôle du juge, du procureur, de l'avocat et de l'huissier",
        "Comprendre la différence entre le civil et le pénal",
        "Connaître les procédures d'assistance juridique pour les démunis",
        "Identifier les juridictions spécialisées (CRIET, Cour Constitutionnelle)"
      ],
      keyNotions: [
        "Tribunal de Première Instance",
        "Cour d'Appel",
        "Procureur de la République",
        "Huissier de Justice",
        "Notaire",
        "Assistance Juridique"
      ],
      content: `# CHAPITRE 1 : LES TRIBUNAUX AU BÉNIN
      
## 1.1 Les Tribunaux de Première Instance (TPI)
C'est la porte d'entrée de la justice. Ils traitent la majorité des affaires quotidiennes (divorce, foncier, petits délits).

## 1.2 Les Cours d'Appel
Si une personne n'est pas d'accord avec le jugement du TPI, elle peut faire "appel" devant cette cour pour un second examen de l'affaire.

## 1.3 La Cour Suprême
C'est la plus haute juridiction en matière administrative et judiciaire. Elle vérifie que la loi a été correctement appliquée.

## 1.4 Les juridictions spécialisées
- **CRIET** : Pour les crimes économiques et le terrorisme.
- **Cour Constitutionnelle** : Pour la conformité des lois à la Constitution et les droits de l'homme.

---

# CHAPITRE 2 : LES ACTEURS DE LA JUSTICE

## 2.1 Les Magistrats
- **Magistrats du siège (Juges)** : Ils tranchent les litiges et rendent les décisions.
- **Magistrats du parquet (Procureurs)** : Ils représentent la société, dirigent les enquêtes de police et poursuivent les auteurs d'infractions.

## 2.2 Les Auxiliaires de Justice
- **L'Avocat** : Conseille et défend ses clients devant les tribunaux.
- **L'Huissier** : Signifie les actes (convocations) et fait exécuter les décisions de justice (saisies, expulsions).
- **Le Notaire** : Rédige les actes officiels (ventes de terrains, contrats de mariage).
- **Le Greffier** : Assiste le juge et conserve les dossiers.

---

# CHAPITRE 3 : ACCÈS À LA JUSTICE

## 3.1 Civil vs Pénal
- **Civil** : Conflit entre deux personnes (ex: loyer impayé). L'objectif est la réparation.
- **Pénal** : Infraction à la loi (ex: vol, coups et blessures). L'objectif est la sanction.

## 3.2 L'Assistance Juridique
L'État béninois prévoit des mécanismes pour aider les personnes démunies à se défendre (avocat commis d'office, exonération de frais).

## 3.3 Rôle d'orientation du parajuriste
Le parajuriste doit savoir :
- Si l'affaire est civile ou pénale.
- Quel tribunal est compétent (lieu de l'affaire ou domicile).
- Quels documents sont nécessaires pour constituer le dossier.`,
      quiz: [
        { id: "q9_1", question: "Qui dirige l'enquête de police et décide des poursuites ?", options: ["Le Juge", "Le Procureur", "L'Avocat"], correctAnswer: 1, explanation: "Le Procureur est le chef de l'action publique." },
        { id: "q9_2", question: "Un huissier de justice sert à :", options: ["Défendre le prévenu", "Signifier les actes et exécuter les jugements", "Rédiger les lois"], correctAnswer: 1, explanation: "C'est un auxiliaire d'exécution indispensable." },
        { id: "q9_3", question: "Où va-t-on si on n'est pas d'accord avec un premier jugement ?", options: ["À la Mairie", "En Cour d'Appel", "Au Commissariat"], correctAnswer: 1, explanation: "L'appel permet un second degré de juridiction." },
        { id: "q9_4", question: "La CRIET est compétente pour :", options: ["Les divorces", "Le terrorisme et les crimes économiques", "Le vol de poules"], correctAnswer: 1, explanation: "C'est une cour spéciale pour les infractions graves et complexes." },
        { id: "q9_5", question: "L'assistance juridique est réservée :", options: ["Aux riches", "Aux personnes démunies (indigents)", "Aux avocats"], correctAnswer: 1, explanation: "C'est un mécanisme d'équité sociale." }
      ],
      audioUrl: "", videoUrl: "", attachments: [], estimatedDuration: 240, difficultyLevel: "Intermédiaire"
    },
    {
      id: 10,
      title: "Module 10 : Signalement, Veille et Éthique du Parajuriste",
      introduction: "Ce dernier module synthétise le rôle pratique du parajuriste. Il traite des techniques de veille juridique, des procédures de signalement via l'application, et rappelle les principes éthiques fondamentaux.",
      objectives: [
        "Maîtriser l'outil de signalement de l'application",
        "Savoir rédiger un rapport d'alerte précis et factuel",
        "Comprendre l'importance de la veille juridique communautaire",
        "Réaffirmer les principes de confidentialité et de non-substitution",
        "Collaborer efficacement avec HAI et les autorités"
      ],
      keyNotions: [
        "Alerte",
        "Rapport factuel",
        "Veille communautaire",
        "Déontologie",
        "Référencement",
        "Protection des sources"
      ],
      content: `# CHAPITRE 1 : LA VEILLE JURIDIQUE COMMUNAUTAIRE
      
## 1.1 Qu'est-ce que la veille ?
C'est une attitude d'observation active. Le parajuriste reste attentif aux rumeurs, aux changements de comportement et aux situations d'injustice dans son quartier ou village.

## 1.2 Domaines de vigilance
- **Foncier** : Tentatives de spoliation de veuves, ventes multiples.
- **Enfance** : Enfants non scolarisés, signes de maltraitance.
- **Santé** : Refus de soins, corruption dans les centres de santé.
- **VBG** : Femmes battues, mariages forcés précoces.

---

# CHAPITRE 2 : L'ART DU SIGNALEMENT

## 2.1 Utilisation de l'application
L'application Paralegal permet d'envoyer des alertes en temps réel.
- **Précision** : Qui ? Quoi ? Où ? Quand ?
- **Preuves** : Si possible, joindre des photos ou témoignages (avec consentement).

## 2.2 Rédaction d'un rapport factuel
Évitez les jugements de valeur ("Il est méchant"). Préférez les faits ("Il a frappé son épouse avec un bâton le 12 mars à 10h").

## 2.3 L'urgence et la priorité
Savoir distinguer ce qui nécessite une intervention immédiate (danger de mort, viol récent) de ce qui peut attendre une médiation programmée.

---

# CHAPITRE 3 : ÉTHIQUE ET SÉCURITÉ DU PARAJURISTE

## 3.1 La règle de non-substitution
Le parajuriste n'est ni avocat, ni juge, ni policier. Il aide, oriente et facilite, mais ne remplace jamais les institutions.

## 3.2 Sécurité personnelle
- Ne jamais se mettre en danger.
- Travailler en réseau avec les autorités locales.
- Savoir quand passer le relais à des professionnels (HAI, Police).

## 3.3 Confidentialité et Confiance
La réputation du parajuriste repose sur sa capacité à garder les secrets. Une seule fuite peut détruire la confiance de toute une communauté.

---

# CONCLUSION DE LA FORMATION
Félicitations ! Vous êtes désormais armés pour être des agents de changement. Votre rôle est noble : apporter la lumière du droit là où règne l'obscurité de l'ignorance.`,
      quiz: [
        { id: "q10_1", question: "Que signifie être factuel dans un rapport ?", options: ["Donner son opinion", "Rapporter uniquement les faits observables", "Raconter ce qu'on a entendu dire"], correctAnswer: 1, explanation: "La crédibilité dépend de l'objectivité des faits." },
        { id: "q10_2", question: "Le parajuriste doit-il intervenir physiquement pour arrêter une bagarre ?", options: ["Oui, il est la loi", "Non, il doit appeler les autorités et assurer sa sécurité", "Seulement s'il est plus fort"], correctAnswer: 1, explanation: "La sécurité du parajuriste est prioritaire." },
        { id: "q10_3", question: "La veille juridique sert à :", options: ["Surveiller la vie privée des gens", "Anticiper et prévenir les violations de droits", "Devenir chef de village"], correctAnswer: 1, explanation: "C'est un outil de prévention communautaire." },
        { id: "q10_4", question: "Peut-on partager les informations d'un cas sur les réseaux sociaux ?", options: ["Oui, pour dénoncer", "Non, c'est une violation grave de la confidentialité", "Seulement si on cache le nom"], correctAnswer: 1, explanation: "Le secret professionnel est absolu." },
        { id: "q10_5", question: "Quelle est la mission finale du parajuriste ?", options: ["Gagner des procès", "L'autonomisation juridique (Legal Empowerment) des citoyens", "Devenir avocat"], correctAnswer: 1, explanation: "L'objectif est que les citoyens sachent utiliser le droit eux-mêmes." }
      ],
      audioUrl: "", videoUrl: "", attachments: [], isReporting: 1, estimatedDuration: 120, difficultyLevel: "Débutant"
    }
  ];

  const insert = db.prepare(`
    INSERT INTO modules (id, title, introduction, objectives, keyNotions, content, audioUrl, videoUrl, quiz, attachments, isReporting, estimatedDuration, difficultyLevel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const m of initialModules) {
    insert.run(
      m.id,
      m.title,
      m.introduction,
      JSON.stringify(m.objectives),
      JSON.stringify(m.keyNotions),
      m.content,
      m.audioUrl,
      m.videoUrl,
      JSON.stringify(m.quiz),
      JSON.stringify(m.attachments),
      m.isReporting,
      m.estimatedDuration || null,
      m.difficultyLevel || null
    );
  }
}

// Seed Glossary if empty
const glossaryCount = db.prepare("SELECT COUNT(*) as count FROM glossary").get() as any;
if (glossaryCount.count === 0) {
  const initialGlossary = [
    { id: '1', term: 'Parajuriste', definition: 'Personne formée pour assister les citoyens dans leurs démarches juridiques de base, sans être avocat.', fonTranslation: 'Sɛ́n-zɔ́-watɔ́ kpɛví', fonDefinition: 'Mɛ e kplɔ́n sɛ́n bo nɔ d’alɔ mɛ ɖo sɛ́n xó mɛ bo ka nyí sɛ́n-zɔ́-watɔ́ ɖaxó (avocat) ǎ é.', category: 'Général' },
    { id: '2', term: 'Mise en demeure', definition: 'Acte par lequel un créancier demande officiellement à son débiteur d\'exécuter son obligation.', fonTranslation: 'Gbe-ɖí-ɖé', fonDefinition: 'Wěma e mɛ e ɖó axɔ́ mɛ ɖé é nɔ sɛ́ dó mɛ e ɖu axɔ́ n’i é bo nɔ ɖɔ n’i ɖɔ é ní sú axɔ́ tɔn.', category: 'Procédure' },
    { id: '3', term: 'Usufruit', definition: 'Droit de jouir d\'un bien dont un autre a la propriété, à charge d\'en assurer la conservation.', fonTranslation: 'Akwɛ́-zín-zán-ɖò-mɛ-ɖé-tɔ́n-jí', fonDefinition: 'Acɛ e mɛɖé ɖó bo ná zán nǔ mɛ ɖé tɔ́n bo lɛ́ mɔ lè ɖ’emɛ bɔ nǔ ɔ ka nyí étɔ́n ǎ é.', category: 'Civil' },
    { id: '4', term: 'Garde à vue', definition: 'Mesure de police consistant à maintenir une person suspectée à la disposition des enquêteurs.', fonTranslation: 'Kpɔ́-lí-sì-xwé-mɛ-ní-nɔ', fonDefinition: 'Acɛ e kpɔ́lísì lɛ́ ɖó bo ná hɛn mɛ e ɖò nǔ nyanya wa wɛ é ɖó kpɔ́lísì-xwé nú táan ɖé.', category: 'Pénal' },
    { id: '5', term: 'Titre foncier', definition: 'Document officiel garantissant la propriété d\'un terrain.', fonTranslation: 'Ayǐ-kúngban-wěma-ɖaxó', fonDefinition: 'Wěma e acɛkpikpa nɔ na mɛ bo nɔ ɖexlɛ́ ɖɔ ayǐkúngban ɖé nyí mɛɖé tɔ́n bǐ mlɛ́mlɛ́ é.', category: 'Foncier' },
    { id: '6', term: 'Litige', definition: 'Désaccord entre deux ou plusieurs personnes, pouvant donner lieu à un procès.', fonTranslation: 'Hwɛ-ɖi-ɖɔ', fonDefinition: 'Nǔ-mǎ-mɔ-jɛ-mɛ-ɖé-lɛ́-tɛntin e nɔ dɔn mɛ yì hwɛɖɔtɛn é.', category: 'Général' }
  ];
  const insert = db.prepare("INSERT INTO glossary (id, term, definition, fonTranslation, fonDefinition, category) VALUES (?, ?, ?, ?, ?, ?)");
  initialGlossary.forEach(g => insert.run(g.id, g.term, g.definition, g.fonTranslation, g.fonDefinition, g.category));
}

// Seed Legal Documents if empty
const docCount = db.prepare("SELECT COUNT(*) as count FROM legal_documents").get() as any;
if (docCount.count === 0) {
  const initialDocs = [
    { id: 'doc1', title: 'Contrat de Bail d\'Habitation', description: 'Modèle standard pour la location d\'une maison ou d\'un appartement au Bénin.', category: 'Contrat', content: 'ENTRE LES SOUSSIGNÉS: \nLe Bailleur: [Nom, Prénoms, Adresse] \nLe Preneur: [Nom, Prénoms, Adresse] \n\nOBJET DU CONTRAT: \nLe bailleur donne en location au preneur les locaux suivants... \nDURÉE: Le présent bail est consenti pour une durée de...' },
    { id: 'doc2', title: 'Lettre de Mise en Demeure', description: 'Modèle pour réclamer officiellement un paiement ou l\'exécution d\'un travail.', category: 'Lettre', content: '[Votre Nom] \n[Votre Adresse] \n\nÀ l\'attention de [Nom du destinataire] \n\nOBJET: MISE EN DEMEURE \n\nMonsieur/Madame, \nPar la présente, je vous mets en demeure de [expliquer l\'obligation] dans un délai de [nombre] jours...' },
    { id: 'doc3', title: 'Plainte pour Abus de Confiance', description: 'Modèle de lettre à adresser au Procureur de la République.', category: 'Procédure', content: 'À Monsieur le Procureur de la République près le Tribunal de [Ville] \n\nOBJET: Plainte pour abus de confiance \n\nMonsieur le Procureur, \nJ\'ai l\'honneur de porter à votre connaissance les faits suivants...' }
  ];
  const insert = db.prepare("INSERT INTO legal_documents (id, title, description, category, content) VALUES (?, ?, ?, ?, ?)");
  initialDocs.forEach(d => insert.run(d.id, d.title, d.description, d.category, d.content));
}

// Seed Case Studies if empty
const caseCount = db.prepare("SELECT COUNT(*) as count FROM case_studies").get() as any;
if (caseCount.count === 0) {
  const initialCases = [
    {
      id: 'case1',
      title: 'Litige Foncier : L\'héritage contesté',
      description: 'Aidez M. Soglo à protéger son terrain hérité.',
      scenario: 'M. Soglo a hérité d\'un terrain de son père à Abomey-Calavi. Il possède un acte de donation sous seing privé, mais son cousin conteste la propriété en prétendant que le terrain appartient à la collectivité familiale. Que conseillez-vous à M. Soglo pour sécuriser son droit de propriété ?',
      options: [
        { id: 'a', text: 'Ignorer le cousin car l\'acte de donation suffit.', isCorrect: false, feedback: 'Mauvais choix. Un acte sous seing privé est fragile face à une contestation collective.' },
        { id: 'b', text: 'Entamer une procédure de confirmation de droits fonciers pour obtenir un Titre Foncier.', isCorrect: true, feedback: 'Excellent ! Le Titre Foncier est le seul document qui garantit une propriété inattaquable au Bénin.' },
        { id: 'c', text: 'Vendre le terrain rapidement avant que le litige ne s\'aggrave.', isCorrect: false, feedback: 'Risqué et potentiellement illégal si la propriété est contestée.' }
      ]
    },
    {
      id: 'case2',
      title: 'Droit du Travail : Licenciement abusif',
      description: 'Analysez la situation de Mme Azon qui a été renvoyée sans préavis.',
      scenario: 'Mme Azon travaille comme secrétaire dans une entreprise depuis 3 ans. Un matin, son employeur lui demande de ne plus revenir car il a trouvé "quelqu\'un de plus jeune", sans lui verser d\'indemnités. Quelle est la première démarche que Mme Azon doit entreprendre ?',
      options: [
        { id: 'a', text: 'Saisir directement le tribunal du travail.', isCorrect: false, feedback: 'Pas tout à fait. Au Bénin, une tentative de conciliation à l\'Inspection du Travail est généralement obligatoire avant le tribunal.' },
        { id: 'b', text: 'Saisir l\'Inspection du Travail pour une tentative de conciliation.', isCorrect: true, feedback: 'Correct ! L\'inspecteur du travail tentera de régler le litige à l\'amiable avant toute action judiciaire.' },
        { id: 'c', text: 'Bloquer l\'entrée de l\'entreprise pour protester.', isCorrect: false, feedback: 'Inapproprié et peut se retourner contre elle juridiquement.' }
      ]
    }
  ];
  const insert = db.prepare("INSERT INTO case_studies (id, title, description, scenario, options) VALUES (?, ?, ?, ?, ?)");
  initialCases.forEach(c => insert.run(c.id, c.title, c.description, c.scenario, JSON.stringify(c.options)));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(uploadDir));

  // API Routes
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as any[];
    const formatted = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(formatted);
  });

  app.post("/api/admin/settings", (req, res) => {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    }
    res.json({ success: true });
  });

  app.post("/api/admin/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, name: req.file.originalname });
  });

  app.get("/api/admin/files", (req, res) => {
    try {
      console.log("Listing files in:", uploadDir);
      if (!fs.existsSync(uploadDir)) {
        console.log("Upload directory does not exist!");
        return res.json([]);
      }
      const files = fs.readdirSync(uploadDir);
      console.log("Files found:", files);
      const fileDetails = files.map(filename => {
        const stats = fs.statSync(path.join(uploadDir, filename));
        return {
          name: filename,
          size: stats.size,
          createdAt: stats.birthtime,
          url: `/uploads/${filename}`
        };
      });
      res.json(fileDetails);
    } catch (err) {
      console.error("Error listing files:", err);
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  app.delete("/api/admin/files/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  app.get("/api/modules", (req, res) => {
    const modules = db.prepare("SELECT * FROM modules").all() as any[];
    res.json(modules.map(m => ({
      ...m,
      objectives: JSON.parse(m.objectives || '[]'),
      keyNotions: JSON.parse(m.keyNotions || '[]'),
      quiz: JSON.parse(m.quiz || '[]'),
      attachments: JSON.parse(m.attachments || '[]'),
      isReporting: !!m.isReporting
    })));
  });

  app.get("/api/glossary", (req, res) => {
    const terms = db.prepare("SELECT * FROM glossary").all();
    res.json(terms);
  });

  app.get("/api/legal-documents", (req, res) => {
    const docs = db.prepare("SELECT * FROM legal_documents").all();
    res.json(docs);
  });

  app.get("/api/case-studies", (req, res) => {
    const cases = db.prepare("SELECT * FROM case_studies").all() as any[];
    res.json(cases.map(c => ({
      ...c,
      options: JSON.parse(c.options || '[]')
    })));
  });

  app.post("/api/register", (req, res) => {
    const { fullName, phone, location, gender, birthDate, educationLevel, password } = req.body;
    try {
      const insertUser = db.prepare(`
        INSERT INTO users (phone, fullName, location, gender, birthDate, educationLevel, password, preferredLanguage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertUser.run(phone, fullName, location, gender, birthDate, educationLevel, password, 'fr');

      const insertProgress = db.prepare(`
        INSERT INTO progress (phone, completedModules, quizScores, audioListened, completedCaseStudies)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertProgress.run(phone, JSON.stringify([]), JSON.stringify({}), JSON.stringify({}), JSON.stringify([]));

      res.json({ success: true, user: { phone, fullName, location, gender, birthDate, educationLevel, preferredLanguage: 'fr', isAdmin: false } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", (req, res) => {
    const { phone, password } = req.body;
    
    // Check for hardcoded admin credentials
    const adminEmails = ["leonardkabo32@gmail.com", "healthaccessinitiativehai@gmail.com"];
    const adminPasswords = ["Kabotologue@20", "Hai@2025!"];
    
    const adminIndex = adminEmails.indexOf(phone);
    if (adminIndex !== -1 && password === adminPasswords[adminIndex]) {
      const adminUser = {
        phone: adminEmails[adminIndex],
        fullName: adminIndex === 0 ? "Leonard Kabo" : "HAI Admin",
        location: "Bénin",
        gender: "M",
        birthDate: "1990-01-01",
        educationLevel: "Expert",
        preferredLanguage: "fr",
        isAdmin: true
      };
      
      // Ensure admin has a progress entry
      const existingProgress = db.prepare("SELECT * FROM progress WHERE phone = ?").get(adminUser.phone);
      if (!existingProgress) {
        db.prepare(`
          INSERT INTO progress (phone, completedModules, quizScores, audioListened, completedCaseStudies)
          VALUES (?, ?, ?, ?, ?)
        `).run(adminUser.phone, JSON.stringify([]), JSON.stringify({}), JSON.stringify({}), JSON.stringify([]));
      }

      const progress = db.prepare("SELECT * FROM progress WHERE phone = ?").get(adminUser.phone) as any;
      
      return res.json({ 
        success: true, 
        user: adminUser,
        progress: {
          completedModules: JSON.parse(progress.completedModules || '[]'),
          quizScores: JSON.parse(progress.quizScores || '{}'),
          audioListened: JSON.parse(progress.audioListened || '{}'),
          completedCaseStudies: JSON.parse(progress.completedCaseStudies || '[]'),
          finalExamScore: progress.finalExamScore,
          finalExamDate: progress.finalExamDate
        }
      });
    }

    const user = db.prepare("SELECT * FROM users WHERE phone = ? AND password = ?").get(phone, password) as any;
    
    if (user) {
      const progress = db.prepare("SELECT * FROM progress WHERE phone = ?").get(phone) as any;
      res.json({ 
        success: true, 
        user: { 
          phone: user.phone, 
          fullName: user.fullName, 
          location: user.location, 
          gender: user.gender, 
          birthDate: user.birthDate, 
          educationLevel: user.educationLevel, 
          preferredLanguage: user.preferredLanguage,
          isAdmin: !!user.isAdmin
        },
        progress: {
          completedModules: JSON.parse(progress.completedModules || '[]'),
          quizScores: JSON.parse(progress.quizScores || '{}'),
          audioListened: JSON.parse(progress.audioListened || '{}'),
          completedCaseStudies: JSON.parse(progress.completedCaseStudies || '[]'),
          finalExamScore: progress.finalExamScore,
          finalExamDate: progress.finalExamDate
        }
      });
    } else {
      res.status(401).json({ error: "Identifiants invalides" });
    }
  });

  // Admin Routes
  app.get("/api/admin/users", (req, res) => {
    try {
      const users = db.prepare(`
        SELECT 
          u.phone, u.fullName, u.location, u.gender, u.birthDate, u.educationLevel, u.preferredLanguage, u.isAdmin,
          p.completedModules, p.quizScores, p.audioListened, p.completedCaseStudies, p.finalExamScore
        FROM users u
        LEFT JOIN progress p ON u.phone = p.phone
      `).all();
      
      const parsedUsers = users.map((u: any) => ({
        ...u,
        completedModules: JSON.parse(u.completedModules || '[]'),
        quizScores: JSON.parse(u.quizScores || '{}'),
        audioListened: JSON.parse(u.audioListened || '{}'),
        completedCaseStudies: JSON.parse(u.completedCaseStudies || '[]'),
        isAdmin: Boolean(u.isAdmin)
      }));
      
      res.json(parsedUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users", (req, res) => {
    const { fullName, phone, location, gender, birthDate, educationLevel, password, isAdmin } = req.body;
    try {
      db.prepare(`
        INSERT INTO users (phone, fullName, location, gender, birthDate, educationLevel, password, preferredLanguage, isAdmin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(phone, fullName, location, gender, birthDate, educationLevel, password, 'fr', isAdmin ? 1 : 0);

      db.prepare(`
        INSERT INTO progress (phone, completedModules, quizScores, audioListened, completedCaseStudies)
        VALUES (?, ?, ?, ?, ?)
      `).run(phone, JSON.stringify([]), JSON.stringify({}), JSON.stringify({}), JSON.stringify([]));

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/progress/:phone", (req, res) => {
    const { phone } = req.params;
    try {
      const progress = db.prepare("SELECT * FROM progress WHERE phone = ?").get(phone) as any;
      if (progress) {
        res.json({ 
          success: true, 
          progress: {
            completedModules: JSON.parse(progress.completedModules || '[]'),
            quizScores: JSON.parse(progress.quizScores || '{}'),
            audioListened: JSON.parse(progress.audioListened || '{}'),
            completedCaseStudies: JSON.parse(progress.completedCaseStudies || '[]'),
            finalExamScore: progress.finalExamScore,
            finalExamDate: progress.finalExamDate
          }
        });
      } else {
        res.status(404).json({ error: "Progression non trouvée" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:phone", (req, res) => {
    const { phone } = req.params;
    db.prepare("DELETE FROM users WHERE phone = ?").run(phone);
    db.prepare("DELETE FROM progress WHERE phone = ?").run(phone);
    res.json({ success: true });
  });

  app.post("/api/admin/modules", (req, res) => {
    const module = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO modules (id, title, introduction, objectives, keyNotions, content, audioUrl, videoUrl, quiz, attachments, isReporting, estimatedDuration, difficultyLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      module.id,
      module.title,
      module.introduction,
      JSON.stringify(module.objectives),
      JSON.stringify(module.keyNotions),
      module.content,
      module.audioUrl,
      module.videoUrl,
      JSON.stringify(module.quiz),
      JSON.stringify(module.attachments),
      module.isReporting ? 1 : 0,
      module.estimatedDuration || null,
      module.difficultyLevel || null
    );
    res.json({ success: true });
  });

  app.delete("/api/admin/modules/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM modules WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Glossary Admin
  app.post("/api/admin/glossary", (req, res) => {
    const term = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO glossary (id, term, definition, fonTranslation, fonDefinition, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(term.id, term.term, term.definition, term.fonTranslation, term.fonDefinition, term.category);
    res.json({ success: true });
  });

  app.delete("/api/admin/glossary/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM glossary WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Legal Documents Admin
  app.post("/api/admin/legal-documents", (req, res) => {
    const doc = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO legal_documents (id, title, description, category, content, fileUrl, fileName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(doc.id, doc.title, doc.description, doc.category, doc.content, doc.fileUrl || null, doc.fileName || null);
    res.json({ success: true });
  });

  app.delete("/api/admin/legal-documents/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM legal_documents WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Case Studies Admin
  app.post("/api/admin/case-studies", (req, res) => {
    const caseStudy = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO case_studies (id, title, description, scenario, options, fileUrl, fileName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(caseStudy.id, caseStudy.title, caseStudy.description, caseStudy.scenario, JSON.stringify(caseStudy.options), caseStudy.fileUrl || null, caseStudy.fileName || null);
    res.json({ success: true });
  });

  app.delete("/api/admin/case-studies/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM case_studies WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/reset-password", (req, res) => {
    const { phone, birthDate, newPassword } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE phone = ? AND birthDate = ?").get(phone, birthDate) as any;
      if (user) {
        db.prepare("UPDATE users SET password = ? WHERE phone = ?").run(newPassword, phone);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Informations de vérification incorrectes (Téléphone ou Date de naissance)" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sync", (req, res) => {
    const { phone, progress } = req.body;
    try {
      const updateProgress = db.prepare(`
        UPDATE progress 
        SET completedModules = ?, quizScores = ?, audioListened = ?, completedCaseStudies = ?, finalExamScore = ?, finalExamDate = ?, lastUpdated = CURRENT_TIMESTAMP
        WHERE phone = ?
      `);
      updateProgress.run(
        JSON.stringify(progress.completedModules),
        JSON.stringify(progress.quizScores),
        JSON.stringify(progress.audioListened),
        JSON.stringify(progress.completedCaseStudies || []),
        progress.finalExamScore || null,
        progress.finalExamDate || null,
        phone
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/update-language", (req, res) => {
    const { phone, language } = req.body;
    try {
      db.prepare("UPDATE users SET preferredLanguage = ? WHERE phone = ?").run(language, phone);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reports", upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]), (req, res) => {
    const { id, userId, moduleId, type, description, location, date, anonymous } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    let audioUrl = '';
    if (files['audio'] && files['audio'][0]) {
      audioUrl = `/uploads/${files['audio'][0].filename}`;
    }

    const attachments = (files['attachments'] || []).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype.includes('pdf') ? 'pdf' : 'image'
    }));

    try {
      db.prepare(`
        INSERT INTO reports (id, userId, moduleId, type, description, location, date, anonymous, audioUrl, attachments, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        userId,
        parseInt(moduleId),
        type,
        description,
        location, // already stringified from client
        date,
        anonymous === 'true' ? 1 : 0,
        audioUrl,
        JSON.stringify(attachments),
        new Date().toISOString()
      );
      console.log("Report inserted successfully:", id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error inserting report:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports", (req, res) => {
    try {
      const reports = db.prepare("SELECT * FROM reports ORDER BY createdAt DESC").all();
      console.log(`Found ${reports.length} reports in database`);
      res.json(reports.map((r: any) => ({
        ...r,
        location: JSON.parse(r.location || '{}'),
        attachments: JSON.parse(r.attachments || '[]'),
        anonymous: r.anonymous === 1
      })));
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
