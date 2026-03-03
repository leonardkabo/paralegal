
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  fonTranslation: string;
  fonDefinition: string;
  category: 'Civil' | 'Pénal' | 'Foncier' | 'Procédure' | 'Général';
}

export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  category: 'Contrat' | 'Lettre' | 'Formulaire' | 'Procédure';
  content: string; // Simplified content for preview
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: '1',
    term: 'Parajuriste',
    definition: 'Personne formée pour assister les citoyens dans leurs démarches juridiques de base, sans être avocat.',
    fonTranslation: 'Sɛ́n-zɔ́-watɔ́ kpɛví',
    fonDefinition: 'Mɛ e kplɔ́n sɛ́n bo nɔ d’alɔ mɛ ɖo sɛ́n xó mɛ bo ka nyí sɛ́n-zɔ́-watɔ́ ɖaxó (avocat) ǎ é.',
    category: 'Général'
  },
  {
    id: '2',
    term: 'Mise en demeure',
    definition: 'Acte par lequel un créancier demande officiellement à son débiteur d\'exécuter son obligation.',
    fonTranslation: 'Gbe-ɖí-ɖé',
    fonDefinition: 'Wěma e mɛ e ɖó axɔ́ mɛ ɖé é nɔ sɛ́ dó mɛ e ɖu axɔ́ n’i é bo nɔ ɖɔ n’i ɖɔ é ní sú axɔ́ tɔn.',
    category: 'Procédure'
  },
  {
    id: '3',
    term: 'Usufruit',
    definition: 'Droit de jouir d\'un bien dont un autre a la propriété, à charge d\'en assurer la conservation.',
    fonTranslation: 'Akwɛ́-zín-zán-ɖò-mɛ-ɖé-tɔ́n-jí',
    fonDefinition: 'Acɛ e mɛɖé ɖó bo ná zán nǔ mɛ ɖé tɔ́n bo lɛ́ mɔ lè ɖ’emɛ bɔ nǔ ɔ ka nyí étɔ́n ǎ é.',
    category: 'Civil'
  },
  {
    id: '4',
    term: 'Garde à vue',
    definition: 'Mesure de police consistant à maintenir une personne suspectée à la disposition des enquêteurs.',
    fonTranslation: 'Kpɔ́-lí-sì-xwé-mɛ-ní-nɔ',
    fonDefinition: 'Acɛ e kpɔ́lísì lɛ́ ɖó bo ná hɛn mɛ e ɖò nǔ nyanya wa wɛ é ɖó kpɔ́lísì-xwé nú táan ɖé.',
    category: 'Pénal'
  },
  {
    id: '5',
    term: 'Titre foncier',
    definition: 'Document officiel garantissant la propriété d\'un terrain.',
    fonTranslation: 'Ayǐ-kúngban-wěma-ɖaxó',
    fonDefinition: 'Wěma e acɛkpikpa nɔ na mɛ bo nɔ ɖexlɛ́ ɖɔ ayǐkúngban ɖé nyí mɛɖé tɔ́n bǐ mlɛ́mlɛ́ é.',
    category: 'Foncier'
  },
  {
    id: '6',
    term: 'Litige',
    definition: 'Désaccord entre deux ou plusieurs personnes, pouvant donner lieu à un procès.',
    fonTranslation: 'Hwɛ-ɖi-ɖɔ',
    fonDefinition: 'Nǔ-mǎ-mɔ-jɛ-mɛ-ɖé-lɛ́-tɛntin e nɔ dɔn mɛ yì hwɛɖɔtɛn é.',
    category: 'Général'
  }
];

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc1',
    title: 'Contrat de Bail d\'Habitation',
    description: 'Modèle standard pour la location d\'une maison ou d\'un appartement au Bénin.',
    category: 'Contrat',
    content: 'ENTRE LES SOUSSIGNÉS: \nLe Bailleur: [Nom, Prénoms, Adresse] \nLe Preneur: [Nom, Prénoms, Adresse] \n\nOBJET DU CONTRAT: \nLe bailleur donne en location au preneur les locaux suivants... \nDURÉE: Le présent bail est consenti pour une durée de...'
  },
  {
    id: 'doc2',
    title: 'Lettre de Mise en Demeure',
    description: 'Modèle pour réclamer officiellement un paiement ou l\'exécution d\'un travail.',
    category: 'Lettre',
    content: '[Votre Nom] \n[Votre Adresse] \n\nÀ l\'attention de [Nom du destinataire] \n\nOBJET: MISE EN DEMEURE \n\nMonsieur/Madame, \nPar la présente, je vous mets en demeure de [expliquer l\'obligation] dans un délai de [nombre] jours...'
  },
  {
    id: 'doc3',
    title: 'Plainte pour Abus de Confiance',
    description: 'Modèle de lettre à adresser au Procureur de la République.',
    category: 'Procédure',
    content: 'À Monsieur le Procureur de la République près le Tribunal de [Ville] \n\nOBJET: Plainte pour abus de confiance \n\nMonsieur le Procureur, \nJ\'ai l\'honneur de porter à votre connaissance les faits suivants...'
  }
];
