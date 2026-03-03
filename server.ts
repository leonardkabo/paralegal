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
    finalExamDate TEXT
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
    isReporting INTEGER DEFAULT 0
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
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS case_studies (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    scenario TEXT,
    options TEXT -- JSON array
  );
`);

// Migration: Add missing columns to progress table if it already existed
try { db.exec("ALTER TABLE progress ADD COLUMN completedCaseStudies TEXT DEFAULT '[]'"); } catch (e) {}
try { db.exec("ALTER TABLE progress ADD COLUMN finalExamScore INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE progress ADD COLUMN finalExamDate TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE modules ADD COLUMN videoUrl TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE modules ADD COLUMN attachments TEXT DEFAULT '[]'"); } catch (e) {}

// Seed settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as any;
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("logoUrl", "");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("organizationName", "Health Access Initiative (HAI)");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("contactEmail", "contact@hai-benin.org");
}

// Seed modules if empty or reset for 10 modules
const moduleCount = db.prepare("SELECT COUNT(*) as count FROM modules").get() as any;
if (moduleCount.count < 10) {
  db.prepare("DELETE FROM modules").run();
  const initialModules = [
    {
      id: 1,
      title: "Introduction aux parajuristes",
      introduction: "Ce module présente le rôle essentiel des parajuristes dans le renforcement du pouvoir juridique des communautés.",
      objectives: ["Définir le parajurisme", "Comprendre le Legal Empowerment", "Identifier les limites éthiques", "Connaître les missions sociales"],
      keyNotions: ["Legal Empowerment", "Médiation", "Justice de proximité"],
      content: "# Introduction aux parajuristes communautaires\n\nLe parajuriste est un acteur de changement social. Il n'est pas un avocat, mais un guide qui aide les citoyens à naviguer dans le système juridique.\n\n## Qu'est-ce qu'un parajuriste ?\nC'est une personne formée pour fournir une assistance juridique de base, sensibiliser les populations et faciliter la résolution de conflits.\n\n## Le Legal Empowerment\nC'est le processus par lequel les pauvres et les marginalisés utilisent le droit pour améliorer leur vie.",
      quiz: [
        { id: "q1_1", question: "Un parajuriste peut-il plaider au tribunal ?", options: ["Oui", "Non", "Seulement avec un juge"], correctAnswer: 1 },
        { id: "q1_2", question: "Quel est l'objectif du Legal Empowerment ?", options: ["Remplacer les avocats", "Donner du pouvoir aux citoyens", "Changer la constitution"], correctAnswer: 1 },
        { id: "q1_3", question: "Le parajuriste doit être issu de la communauté ?", options: ["Oui, c'est préférable", "Non, il doit venir de la capitale", "Peu importe"], correctAnswer: 0 },
        { id: "q1_4", question: "La médiation fait-elle partie de son rôle ?", options: ["Oui", "Non", "Seulement pour les crimes"], correctAnswer: 0 },
        { id: "q1_5", question: "Peut-il demander de l'argent pour ses services ?", options: ["Oui", "Non, c'est un service communautaire", "Seulement pour le transport"], correctAnswer: 1 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 2,
      title: "Droit à la santé",
      introduction: "Le droit à la santé est un droit fondamental protégé par la Constitution du Bénin.",
      objectives: ["Connaître les textes légaux", "Identifier les violations", "Savoir orienter les victimes", "Comprendre l'éthique médicale"],
      keyNotions: ["Accès universel", "Qualité des soins", "Non-discrimination"],
      content: "# Le Droit à la Santé au Bénin\n\nL'État doit garantir l'accès aux soins pour tous. Cela inclut la disponibilité des médicaments et la qualité des infrastructures.\n\n## Les obligations de l'État\n1. Respecter l'accès aux soins.\n2. Protéger contre les abus.\n3. Réaliser les conditions de santé.",
      quiz: [
        { id: "q2_1", question: "Le droit à la santé est-il dans la Constitution ?", options: ["Oui", "Non", "Seulement pour les enfants"], correctAnswer: 0 },
        { id: "q2_2", question: "Un hôpital peut-il refuser une urgence ?", options: ["Oui", "Non", "Si le patient n'a pas d'argent"], correctAnswer: 1 },
        { id: "q2_3", question: "Que signifie 'Accessibilité économique' ?", options: ["Soins gratuits pour tous", "Coûts abordables", "Paiement après guérison"], correctAnswer: 1 },
        { id: "q2_4", question: "L'eau potable fait-elle partie du droit à la santé ?", options: ["Oui", "Non", "Seulement en ville"], correctAnswer: 0 },
        { id: "q2_5", question: "Le secret médical est-il obligatoire ?", options: ["Oui", "Non", "Sauf pour la famille"], correctAnswer: 0 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 3,
      title: "Droit de la famille",
      introduction: "Comprendre les règles du mariage, du divorce et des successions selon le Code des Personnes et de la Famille.",
      objectives: ["Distinguer les types de mariage", "Comprendre les procédures de divorce", "Connaître les droits des héritiers", "Protéger les conjoints"],
      keyNotions: ["Monogamie", "Succession", "Autorité parentale"],
      content: "# Droit de la Famille\n\nLe Code des Personnes et de la Famille régit la vie privée au Bénin. Le mariage civil est le seul reconnu légalement pour la protection des biens.\n\n## Le Mariage\nIl doit être célébré devant l'officier d'état civil.\n\n## La Succession\nLes enfants, garçons et filles, ont les mêmes droits sur l'héritage de leurs parents.",
      quiz: [
        { id: "q3_1", question: "Quel mariage est reconnu par l'État ?", options: ["Religieux", "Coutumier", "Civil"], correctAnswer: 2 },
        { id: "q3_2", question: "L'âge minimum légal du mariage est de :", options: ["15 ans", "18 ans", "21 ans"], correctAnswer: 1 },
        { id: "q3_3", question: "Une fille peut-elle hériter de son père ?", options: ["Oui, autant qu'un garçon", "Non", "Moitié moins qu'un garçon"], correctAnswer: 0 },
        { id: "q3_4", question: "Le divorce doit-il être prononcé par un juge ?", options: ["Oui", "Non, par le chef de village", "Par les parents"], correctAnswer: 0 },
        { id: "q3_5", question: "Qui exerce l'autorité parentale ?", options: ["Le père seul", "La mère seule", "Les deux parents"], correctAnswer: 2 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 4,
      title: "Droit foncier",
      introduction: "Le foncier est une source majeure de conflits. Apprenez les bases du Code Foncier et Domanial.",
      objectives: ["Comprendre le titre foncier", "Identifier les modes d'acquisition", "Gérer les litiges fonciers", "Connaître le rôle de l'ANDF"],
      keyNotions: ["Titre Foncier", "Attestation de Détention Coutumière", "Expropriation"],
      content: "# Droit Foncier et Domanial\n\nLa terre appartient à l'État ou aux particuliers. La sécurisation foncière passe par l'immatriculation.\n\n## Modes d'acquisition\n- Achat (acte notarié)\n- Succession\n- Donation",
      quiz: [
        { id: "q4_1", question: "Quel document garantit la propriété définitive ?", options: ["Le reçu d'achat", "Le Titre Foncier", "L'ADC"], correctAnswer: 1 },
        { id: "q4_2", question: "Peut-on vendre une terre sans acte notarié ?", options: ["Oui", "Non, c'est obligatoire", "Seulement au village"], correctAnswer: 1 },
        { id: "q4_3", question: "Que signifie l'expropriation ?", options: ["Vendre sa terre", "L'État reprend la terre pour utilité publique", "Donner sa terre"], correctAnswer: 1 },
        { id: "q4_4", question: "L'ANDF s'occupe de quoi ?", options: ["De la santé", "De la gestion des terres", "De la police"], correctAnswer: 1 },
        { id: "q4_5", question: "Un étranger peut-il posséder une terre au Bénin ?", options: ["Oui, sous conditions", "Non jamais", "Seulement à Cotonou"], correctAnswer: 0 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 5,
      title: "Droits de l'enfant",
      introduction: "Protéger les enfants contre les abus, le travail forcé et garantir leur éducation.",
      objectives: ["Connaître le Code de l'Enfant", "Identifier les formes de maltraitance", "Savoir dénoncer les abus", "Promouvoir l'éducation"],
      keyNotions: ["Intérêt supérieur de l'enfant", "Protection", "Éducation"],
      content: "# Protection de l'Enfance\n\nL'enfant a droit à un nom, une nationalité et une protection contre toute forme de violence.\n\n## Le travail des enfants\nIl est interdit d'employer un enfant de moins de 14 ans pour des travaux pénibles.",
      quiz: [
        { id: "q5_1", question: "Quel est l'âge de la majorité au Bénin ?", options: ["16 ans", "18 ans", "21 ans"], correctAnswer: 1 },
        { id: "q5_2", question: "L'école est-elle obligatoire ?", options: ["Oui", "Non", "Seulement pour les garçons"], correctAnswer: 0 },
        { id: "q5_3", question: "Le châtiment corporel est-il autorisé ?", options: ["Oui, c'est l'éducation", "Non, c'est interdit", "Seulement à l'école"], correctAnswer: 1 },
        { id: "q5_4", question: "Un enfant a-t-il droit à un acte de naissance ?", options: ["Oui, c'est un droit", "Non, c'est facultatif", "Seulement s'il va à l'école"], correctAnswer: 0 },
        { id: "q5_5", question: "Le mariage des enfants est-il légal ?", options: ["Oui", "Non, c'est un crime", "Avec l'accord des parents"], correctAnswer: 1 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 6,
      title: "Violences Basées sur le Genre",
      introduction: "Lutter contre les violences faites aux femmes et aux filles dans la société.",
      objectives: ["Définir les VBG", "Connaître la loi sur les violences faites aux femmes", "Accompagner les victimes", "Sensibiliser la communauté"],
      keyNotions: ["Violence physique", "Violence psychologique", "Harcèlement"],
      content: "# Lutte contre les VBG\n\nLes violences basées sur le genre sont des actes nuisibles dirigés contre une personne en raison de son sexe.\n\n## La Loi 2011-26\nElle punit sévèrement les violences faites aux femmes au Bénin.",
      quiz: [
        { id: "q6_1", question: "La violence psychologique est-elle punie ?", options: ["Oui", "Non", "Seulement si elle est publique"], correctAnswer: 0 },
        { id: "q6_2", question: "Le viol conjugal existe-t-il légalement ?", options: ["Oui", "Non", "Seulement en ville"], correctAnswer: 0 },
        { id: "q6_3", question: "Où orienter une victime de VBG ?", options: ["À l'église", "Au commissariat ou centre social", "Chez le chef de village"], correctAnswer: 1 },
        { id: "q6_4", question: "L'excision est-elle autorisée ?", options: ["Oui", "Non, c'est un crime", "Seulement par tradition"], correctAnswer: 1 },
        { id: "q6_5", question: "Le harcèlement sexuel au travail est-il puni ?", options: ["Oui", "Non", "Si l'employeur est d'accord"], correctAnswer: 0 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 7,
      title: "Droit du travail",
      introduction: "Connaître les droits et devoirs des travailleurs et des employeurs.",
      objectives: ["Comprendre le contrat de travail", "Connaître le SMIG", "Gérer les licenciements", "Protection sociale (CNSS)"],
      keyNotions: ["Contrat", "Salaire", "Sécurité sociale"],
      content: "# Droit du Travail au Bénin\n\nLe Code du Travail régit les relations professionnelles. Tout travailleur a droit à un salaire juste et à une protection sociale.",
      quiz: [
        { id: "q7_1", question: "Le contrat de travail doit-il être écrit ?", options: ["Oui, c'est plus sûr", "Non, l'oral suffit parfois", "Seulement pour les cadres"], correctAnswer: 1 },
        { id: "q7_2", question: "Que signifie le SMIG ?", options: ["Salaire Maximum", "Salaire Minimum Interprofessionnel Garanti", "Une taxe"], correctAnswer: 1 },
        { id: "q7_3", question: "La CNSS sert à quoi ?", options: ["À payer les impôts", "À la retraite et aux allocations", "À la police"], correctAnswer: 1 },
        { id: "q7_4", question: "Un travailleur a-t-il droit à des congés ?", options: ["Oui", "Non", "Seulement s'il est gentil"], correctAnswer: 0 },
        { id: "q7_5", question: "Le licenciement abusif est-il puni ?", options: ["Oui", "Non", "Seulement dans le public"], correctAnswer: 0 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 8,
      title: "Médiation et Conflits",
      introduction: "Apprendre les techniques de résolution pacifique des litiges communautaires.",
      objectives: ["Maîtriser les étapes de la médiation", "Gérer les émotions", "Rédiger un procès-verbal", "Neutralité du médiateur"],
      keyNotions: ["Impartialité", "Confidentialité", "Accord"],
      content: "# Médiation Communautaire\n\nLa médiation est un processus volontaire où un tiers aide les parties à trouver une solution à leur conflit.",
      quiz: [
        { id: "q8_1", question: "Le médiateur doit-il prendre parti ?", options: ["Oui", "Non, il doit être neutre", "Pour le plus pauvre"], correctAnswer: 1 },
        { id: "q8_2", question: "La médiation est-elle obligatoire ?", options: ["Oui", "Non, c'est volontaire", "Seulement pour le foncier"], correctAnswer: 1 },
        { id: "q8_3", question: "Le contenu de la médiation est-il secret ?", options: ["Oui, c'est confidentiel", "Non", "Seulement pour le juge"], correctAnswer: 0 },
        { id: "q8_4", question: "Peut-on médiatiser un crime grave (meurtre) ?", options: ["Oui", "Non, c'est pour la justice pénale", "Si les familles sont d'accord"], correctAnswer: 1 },
        { id: "q8_5", question: "L'accord de médiation a-t-il une valeur ?", options: ["Oui, s'il est signé", "Non", "Seulement moralement"], correctAnswer: 0 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 9,
      title: "Institutions Judiciaires",
      introduction: "Connaître l'organisation de la justice au Bénin pour mieux orienter.",
      objectives: ["Distinguer les tribunaux", "Connaître le rôle du procureur", "Accès à l'assistance juridique", "Rôle des huissiers et notaires"],
      keyNotions: ["Tribunal de première instance", "Cour d'Appel", "CRIET"],
      content: "# Organisation Judiciaire au Bénin\n\nLa justice est rendue au nom du peuple béninois. Elle comprend des tribunaux de base et des cours spécialisées.",
      quiz: [
        { id: "q9_1", question: "Où porte-t-on plainte en premier ?", options: ["À la Cour Suprême", "Au commissariat ou Tribunal de 1ère instance", "À la mairie"], correctAnswer: 1 },
        { id: "q9_2", question: "La CRIET s'occupe de quoi ?", options: ["Des divorces", "Des crimes économiques et terrorisme", "Du foncier"], correctAnswer: 1 },
        { id: "q9_3", question: "L'assistance juridique gratuite existe-t-elle ?", options: ["Oui, pour les indigents", "Non", "Seulement pour les mineurs"], correctAnswer: 0 },
        { id: "q9_4", question: "Le procureur représente qui ?", options: ["Le prévenu", "La société (l'État)", "Le juge"], correctAnswer: 1 },
        { id: "q9_5", question: "Un huissier sert à quoi ?", options: ["À juger", "À constater et exécuter les décisions", "À défendre"], correctAnswer: 1 }
      ],
      audioUrl: "", videoUrl: "", attachments: []
    },
    {
      id: 10,
      title: "Signalement et Veille",
      introduction: "Utilisez vos connaissances pour protéger votre communauté.",
      objectives: ["Identifier les alertes", "Remplir un rapport de signalement", "Collaborer avec HAI", "Veille juridique"],
      keyNotions: ["Alerte", "Rapport", "Suivi"],
      content: "# Veille Juridique et Signalement\n\nEn tant que parajuriste, vous êtes les yeux et les oreilles de la justice dans votre communauté. Votre rôle est de détecter les abus et de les signaler.",
      quiz: [
        { id: "q10_1", question: "Que faire face à une violation grave ?", options: ["Ignorer", "Signaler via l'application", "Attendre"], correctAnswer: 1 },
        { id: "q10_2", question: "Le signalement doit-il être précis ?", options: ["Oui", "Non", "Peu importe"], correctAnswer: 0 },
        { id: "q10_3", question: "La veille juridique c'est quoi ?", options: ["Dormir au tribunal", "Suivre l'évolution des lois et des cas", "Surveiller les voisins"], correctAnswer: 1 },
        { id: "q10_4", question: "Peut-on signaler anonymement ?", options: ["Oui", "Non", "Seulement pour le foncier"], correctAnswer: 0 },
        { id: "q10_5", question: "Le parajuriste doit-il faire un suivi ?", options: ["Oui", "Non", "Seulement si on le paie"], correctAnswer: 0 }
      ],
      audioUrl: "", videoUrl: "", attachments: [], isReporting: 1
    }
  ];

  const insert = db.prepare(`
    INSERT INTO modules (id, title, introduction, objectives, keyNotions, content, audioUrl, videoUrl, quiz, attachments, isReporting)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      m.isReporting
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
    const users = db.prepare("SELECT phone, fullName, location, gender, birthDate, educationLevel, preferredLanguage, isAdmin FROM users").all();
    res.json(users);
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
      INSERT OR REPLACE INTO modules (id, title, introduction, objectives, keyNotions, content, audioUrl, videoUrl, quiz, attachments, isReporting)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      module.isReporting ? 1 : 0
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
      INSERT OR REPLACE INTO legal_documents (id, title, description, category, content)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(doc.id, doc.title, doc.description, doc.category, doc.content);
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
      INSERT OR REPLACE INTO case_studies (id, title, description, scenario, options)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(caseStudy.id, caseStudy.title, caseStudy.description, caseStudy.scenario, JSON.stringify(caseStudy.options));
    res.json({ success: true });
  });

  app.delete("/api/admin/case-studies/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM case_studies WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/sync", (req, res) => {
    const { phone, progress } = req.body;
    try {
      const updateProgress = db.prepare(`
        UPDATE progress 
        SET completedModules = ?, quizScores = ?, audioListened = ?, completedCaseStudies = ?, finalExamScore = ?, finalExamDate = ?
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
