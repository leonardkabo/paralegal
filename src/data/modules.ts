import { Module } from '../types';

export const MODULES: Module[] = [
  {
    id: 1,
    title: "Introduction aux parajuristes",
    introduction: "Ce module présente le rôle essentiel des parajuristes dans le renforcement du pouvoir juridique des communautés.",
    objectives: [
      "Comprendre la définition d'un parajuriste communautaire",
      "Identifier les missions principales",
      "Connaître les limites de l'intervention",
      "Comprendre l'approche du Legal Empowerment"
    ],
    keyNotions: ["Legal Empowerment", "Médiation", "Orientation juridique", "Justice sociale"],
    content: `
# Introduction aux parajuristes communautaires

Le parajuriste n'est pas un avocat, mais un pont entre la communauté et le système judiciaire. Il joue un rôle crucial dans l'accès à la justice pour les populations les plus vulnérables.

## Qu'est-ce qu'un parajuriste ?
Un parajuriste communautaire est une personne issue de la communauté, formée pour fournir une assistance juridique de base. Il n'a pas besoin d'être un juriste de formation, mais doit avoir une bonne connaissance des réalités locales et des droits fondamentaux.

## L'approche du Legal Empowerment
Le "Legal Empowerment" ou renforcement du pouvoir juridique consiste à donner aux citoyens les moyens de connaître, d'utiliser et de façonner le droit. Au lieu de simplement résoudre des problèmes pour les gens, le parajuriste les aide à devenir autonomes.

## Rôles principaux :
1. **Éducation juridique** : Organiser des séances de sensibilisation pour informer les citoyens sur leurs droits et devoirs.
2. **Médiation** : Faciliter la résolution pacifique des conflits au sein de la communauté (conflits fonciers, familiaux, etc.).
3. **Orientation** : Guider les personnes vers les institutions compétentes (police, tribunaux, services sociaux) lorsque le cas dépasse ses compétences.
4. **Accompagnement** : Aider les citoyens dans leurs démarches administratives et judiciaires.

## Limites de l'intervention
Le parajuriste ne peut pas :
- Représenter un client devant un tribunal comme un avocat.
- Rendre des jugements comme un juge.
- Utiliser la force ou la contrainte.
    `,
    quiz: [
      {
        id: "q1_1",
        question: "Un parajuriste est-il un avocat ?",
        options: ["Oui", "Non", "Seulement au tribunal"],
        correctAnswer: 1
      },
      {
        id: "q1_2",
        question: "Quel est l'un des rôles principaux du parajuriste ?",
        options: ["Rendre des jugements", "Arrêter les criminels", "Éduquer la communauté sur ses droits"],
        correctAnswer: 2
      },
      {
        id: "q1_3",
        question: "Que signifie le concept de 'Legal Empowerment' ?",
        options: ["Donner le pouvoir aux avocats", "Renforcer le pouvoir juridique des citoyens", "Changer toutes les lois"],
        correctAnswer: 1
      },
      {
        id: "q1_4",
        question: "Le parajuriste peut-il représenter quelqu'un devant un juge ?",
        options: ["Oui, toujours", "Non, c'est le rôle de l'avocat", "Seulement pour les petits vols"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Droit à la santé",
    introduction: "Le droit à la santé est un droit fondamental garanti par la constitution et les traités internationaux.",
    objectives: [
      "Connaître les textes protégeant le droit à la santé",
      "Identifier les obligations de l'État",
      "Savoir orienter en cas de violation",
      "Comprendre les principes de disponibilité et d'accessibilité"
    ],
    keyNotions: ["Accès universel", "Qualité des soins", "Non-discrimination", "Éthique médicale"],
    content: `
# Le Droit à la Santé

Chaque citoyen a le droit de jouir du meilleur état de santé physique et mentale possible. Ce droit ne signifie pas le "droit d'être en bonne santé", mais le droit à un système de protection de la santé.

## Les piliers du droit à la santé (Principes de l'OMS) :
- **Disponibilité** : L'État doit garantir un nombre suffisant d'établissements, de services et de programmes de santé publique.
- **Accessibilité** : Les services de santé doivent être accessibles à tous, sans discrimination. Cela inclut l'accessibilité physique (proximité) et économique (coût abordable).
- **Acceptabilité** : Les services doivent respecter l'éthique médicale et être adaptés à la culture des populations.
- **Qualité** : Les soins doivent être scientifiquement et médicalement appropriés.

## Obligations de l'État
L'État a l'obligation de :
1. **Respecter** : Ne pas entraver l'accès aux soins.
2. **Protéger** : Empêcher les tiers de nuire à la santé des citoyens.
3. **Réaliser** : Adopter des mesures pour assurer la pleine réalisation du droit à la santé.

## Facteurs déterminants de la santé
Le droit à la santé inclut aussi l'accès à :
- L'eau potable et l'assainissement.
- Une alimentation saine.
- Un logement adéquat.
- Des conditions de travail sûres.
    `,
    quiz: [
      {
        id: "q2_1",
        question: "Le droit à la santé inclut-il l'accès à l'eau potable ?",
        options: ["Oui", "Non", "Seulement en ville"],
        correctAnswer: 0
      },
      {
        id: "q2_2",
        question: "Que signifie le principe de 'Disponibilité' ?",
        options: ["Avoir des médicaments gratuits", "Avoir un nombre suffisant de centres de santé", "Avoir des médecins qui parlent toutes les langues"],
        correctAnswer: 1
      },
      {
        id: "q2_3",
        question: "L'accessibilité économique signifie que :",
        options: ["Les soins sont toujours gratuits", "Les soins doivent être abordables pour tous", "Les riches paient pour les pauvres"],
        correctAnswer: 1
      },
      {
        id: "q2_4",
        question: "L'État a-t-il l'obligation de protéger les citoyens contre les faux médicaments ?",
        options: ["Oui, c'est son rôle de protection", "Non, c'est la responsabilité des pharmacies", "Seulement si le citoyen porte plainte"],
        correctAnswer: 0
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Violences basées sur le genre (VBG)",
    introduction: "Comprendre et lutter contre les VBG pour protéger l'intégrité de tous les membres de la communauté.",
    objectives: [
      "Définir les VBG",
      "Identifier les différents types de violences",
      "Connaître le circuit de prise en charge des victimes",
      "Comprendre les causes profondes des VBG"
    ],
    keyNotions: ["Violence physique", "Violence psychologique", "Violence économique", "Consentement"],
    content: `
# Violences Basées sur le Genre (VBG)

Les VBG sont des actes nuisibles perpétrés contre la volonté d'une personne et qui sont fondés sur les différences établies par la société entre les hommes et les femmes.

## Les différents types de violences :
1. **Violence Physique** : Coups, blessures, mutilations.
2. **Violence Sexuelle** : Viol, harcèlement sexuel, mariage forcé.
3. **Violence Psychologique** : Insultes, menaces, humiliation, isolement.
4. **Violence Économique** : Privation de ressources, contrôle total des revenus, interdiction de travailler.

## Le cycle de la violence
La violence domestique suit souvent un cycle :
- Tension (accumulation de stress).
- Explosion (passage à l'acte).
- Lune de miel (regrets, promesses de changement).
Il est important de briser ce cycle.

## Prise en charge des victimes
Une victime de VBG a besoin d'une prise en charge holistique :
- **Médicale** : Soins urgents, kit de prophylaxie (en cas de viol).
- **Psychosociale** : Écoute, conseil, soutien émotionnel.
- **Juridique** : Plainte, protection légale.
- **Sécuritaire** : Hébergement d'urgence si nécessaire.

## Rôle du parajuriste
Le parajuriste doit écouter sans juger, assurer la confidentialité et orienter rapidement la victime vers les services spécialisés.
    `,
    quiz: [
      {
        id: "q3_1",
        question: "La violence psychologique est-elle une VBG ?",
        options: ["Oui", "Non"],
        correctAnswer: 0
      },
      {
        id: "q3_2",
        question: "Empêcher une femme de disposer de son propre argent est une violence :",
        options: ["Physique", "Économique", "Sociale"],
        correctAnswer: 1
      },
      {
        id: "q3_3",
        question: "Quelle est la première chose à faire pour une victime de viol ?",
        options: ["Se laver", "Aller à la police", "Aller au centre de santé pour les soins d'urgence"],
        correctAnswer: 2
      },
      {
        id: "q3_4",
        question: "Le parajuriste doit-il forcer une victime à porter plainte ?",
        options: ["Oui, c'est la loi", "Non, il doit respecter le choix de la victime tout en l'informant", "Seulement si la violence est grave"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "Enregistrement des naissances",
    introduction: "L'acte de naissance est la clé de l'identité juridique et de la citoyenneté.",
    objectives: [
      "Comprendre l'importance de l'état civil",
      "Connaître les délais légaux de déclaration",
      "Identifier les pièces nécessaires",
      "Savoir comment régulariser un enfant sans acte"
    ],
    keyNotions: ["Acte de naissance", "Citoyenneté", "Délais de déclaration", "Jugement supplétif"],
    content: `
# L'Enregistrement des Naissances

L'enregistrement d'une naissance est l'inscription officielle de la naissance d'un enfant auprès de l'autorité administrative. C'est un droit fondamental pour chaque enfant.

## Pourquoi est-ce important ?
Sans acte de naissance, un enfant est "invisible" aux yeux de la loi. Il aura des difficultés pour :
- S'inscrire à l'école et passer des examens.
- Accéder aux services de santé.
- Obtenir une carte d'identité ou un passeport.
- Hériter de ses parents.
- Voter à l'âge adulte.

## Les délais légaux
Au Bénin, la déclaration de naissance doit être faite dans un délai de **21 jours** après l'accouchement. Passé ce délai, la procédure devient plus complexe et coûteuse.

## La procédure
1. **Constat de naissance** : Délivré par la maternité ou le centre de santé.
2. **Déclaration** : Se rendre à la mairie ou à l'arrondissement avec le constat et les pièces d'identité des parents.
3. **Retrait** : L'officier d'état civil établit l'acte de naissance.

## Que faire si le délai est passé ?
Si l'enfant n'a pas été déclaré dans les 21 jours, il faut obtenir un **jugement supplétif** auprès du tribunal. C'est une procédure judiciaire qui confirme la naissance de l'enfant.
    `,
    quiz: [
      {
        id: "q4_1",
        question: "Quel est le délai légal pour déclarer une naissance au Bénin ?",
        options: ["10 jours", "21 jours", "3 mois"],
        correctAnswer: 1
      },
      {
        id: "q4_2",
        question: "Sans acte de naissance, un enfant peut-il facilement passer ses examens nationaux ?",
        options: ["Oui, sans problème", "Non, c'est souvent bloquant", "Seulement s'il est bon élève"],
        correctAnswer: 1
      },
      {
        id: "q4_3",
        question: "Comment appelle-t-on la procédure pour obtenir un acte après le délai légal ?",
        options: ["Une plainte", "Un jugement supplétif", "Une demande de pardon"],
        correctAnswer: 1
      },
      {
        id: "q4_4",
        question: "Qui délivre le constat de naissance ?",
        options: ["Le maire", "Le chef de quartier", "L'agent de santé à la maternité"],
        correctAnswer: 2
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Accès aux soins & mutuelles",
    introduction: "Comment financer sa santé par la solidarité et la prévoyance.",
    objectives: [
      "Comprendre le fonctionnement d'une mutuelle de santé",
      "Identifier les avantages de l'adhésion",
      "Connaître les principes de la solidarité",
      "Savoir expliquer le concept de 'tiers-payant'"
    ],
    keyNotions: ["Solidarité", "Cotisation", "Prévoyance", "Tiers-payant"],
    content: `
# Accès aux Soins et Mutuelles de Santé

La maladie est imprévisible et peut coûter cher. Les mutuelles de santé permettent de faire face aux dépenses de santé grâce à la solidarité entre les membres.

## Qu'est-ce qu'une mutuelle de santé ?
C'est une association à but non lucratif, basée sur la solidarité, où les membres cotisent une petite somme régulièrement pour être pris en charge en cas de maladie.

## Les principes fondamentaux :
- **Adhésion volontaire** : Chacun est libre d'adhérer.
- **Solidarité** : Les biens portants cotisent pour soigner les malades.
- **Gestion démocratique** : Les membres participent aux décisions.
- **But non lucratif** : L'argent sert uniquement à soigner les membres.

## Les avantages :
1. **Réduction des coûts** : La mutuelle prend en charge une grande partie des frais (souvent 70% à 80%).
2. **Accès rapide aux soins** : On n'attend pas d'avoir de l'argent pour aller se faire soigner.
3. **Qualité des soins** : Les mutuelles passent des conventions avec des centres de santé de qualité.

## Le système du Tiers-Payant
C'est le mécanisme par lequel le membre ne paie que sa part (le ticket modérateur) au centre de santé. La mutuelle paie directement le reste au centre de santé plus tard.
    `,
    quiz: [
      {
        id: "q5_1",
        question: "Une mutuelle de santé est-elle basée sur la solidarité ?",
        options: ["Oui", "Non"],
        correctAnswer: 0
      },
      {
        id: "q5_2",
        question: "Dans une mutuelle, qui paie pour les soins des malades ?",
        options: ["L'État", "Les cotisations de tous les membres", "Le président de la mutuelle"],
        correctAnswer: 1
      },
      {
        id: "q5_3",
        question: "Le 'ticket modérateur' est :",
        options: ["Le prix total des soins", "La part que le membre doit payer lui-même", "Une amende pour retard"],
        correctAnswer: 1
      },
      {
        id: "q5_4",
        question: "Peut-on adhérer à une mutuelle seulement quand on tombe malade ?",
        options: ["Oui, c'est fait pour ça", "Non, il faut adhérer et cotiser par prévoyance avant d'être malade", "Seulement si on paie le double"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 6,
    title: "Accès à la justice",
    introduction: "Les mécanismes et institutions pour faire valoir ses droits.",
    objectives: [
      "Identifier les différentes juridictions",
      "Comprendre le rôle de la police et de la gendarmerie",
      "Connaître les droits de la personne gardée à vue",
      "Savoir comment porter plainte"
    ],
    keyNotions: ["Plainte", "Garde à vue", "Tribunal", "Assistance juridique"],
    content: `
# Accès à la Justice

La justice est un service public destiné à protéger les droits des citoyens et à punir les infractions.

## Les institutions de proximité :
- **La Police Républicaine** : Reçoit les plaintes, mène les enquêtes et assure la sécurité.
- **Le Tribunal de Première Instance** : Juge les affaires civiles (famille, contrats) et pénales (délits).

## Comment porter plainte ?
Toute personne victime d'une infraction peut porter plainte :
- Soit oralement ou par écrit auprès d'un commissariat.
- Soit par courrier adressé au Procureur de la République.
La plainte est gratuite.

## Droits en cas de Garde à Vue
Si une personne est retenue par la police :
1. **Droit d'être informée** du motif de son interpellation.
2. **Droit de prévenir un proche**.
3. **Droit d'être assistée par un avocat**.
4. **Droit d'être examinée par un médecin**.
La durée initiale est de 48h, prolongeable sous conditions.

## L'Assistance Juridique
Pour ceux qui n'ont pas les moyens de payer un avocat, l'État peut accorder l'assistance judiciaire pour prendre en charge les frais du procès.
    `,
    quiz: [
      {
        id: "q6_1",
        question: "L'assistance juridique est-elle un droit ?",
        options: ["Oui", "Non"],
        correctAnswer: 0
      },
      {
        id: "q6_2",
        question: "Porter plainte au commissariat est-il payant ?",
        options: ["Oui, il y a des frais de dossier", "Non, c'est un service gratuit", "Seulement si on gagne le procès"],
        correctAnswer: 1
      },
      {
        id: "q6_3",
        question: "Quelle est la durée normale d'une garde à vue initiale ?",
        options: ["12 heures", "24 heures", "48 heures"],
        correctAnswer: 2
      },
      {
        id: "q6_4",
        question: "Une personne arrêtée a-t-elle le droit de prévenir sa famille ?",
        options: ["Oui, c'est un droit fondamental", "Non, pour ne pas gêner l'enquête", "Seulement après 3 jours"],
        correctAnswer: 0
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 7,
    title: "Techniques d'écoute et d'orientation",
    introduction: "L'art de recevoir, d'écouter et de guider les usagers avec empathie et professionnalisme.",
    objectives: [
      "Maîtriser les principes de l'écoute active",
      "Savoir créer un climat de confiance",
      "Identifier les besoins réels de l'usager",
      "Savoir orienter vers la bonne structure"
    ],
    keyNotions: ["Empathie", "Confidentialité", "Écoute active", "Non-jugement"],
    content: `
# Techniques d'Écoute et d'Orientation

Le premier contact entre le parajuriste et l'usager est déterminant. Une bonne écoute permet de bien comprendre le problème et de proposer la meilleure solution.

## L'Écoute Active
Ce n'est pas seulement se taire, c'est montrer qu'on comprend :
- **Le silence attentif** : Laisser l'autre parler sans l'interrompre.
- **La reformulation** : Redire avec ses propres mots ce qu'on a compris pour vérifier.
- **Le questionnement** : Poser des questions ouvertes (Comment ? Pourquoi ?) pour avoir plus de détails.

## Les attitudes à adopter :
- **L'empathie** : Se mettre à la place de l'autre sans se laisser submerger par ses émotions.
- **Le non-jugement** : Ne pas critiquer les choix ou la situation de l'usager.
- **La confidentialité** : Garantir que ce qui est dit restera secret.

## La structure de l'entretien :
1. **Accueil** : Mettre à l'aise, se présenter.
2. **Écoute** : Laisser l'usager exposer son problème.
3. **Clarification** : Poser des questions pour bien cerner les faits.
4. **Analyse** : Identifier les aspects juridiques.
5. **Action/Orientation** : Proposer des pistes ou orienter vers un service spécialisé.
    `,
    quiz: [
      {
        id: "q7_1",
        question: "L'écoute active est-elle importante pour un parajuriste ?",
        options: ["Oui", "Non"],
        correctAnswer: 0
      },
      {
        id: "q7_2",
        question: "Que signifie 'reformuler' ?",
        options: ["Changer la version des faits", "Répéter ce qu'on a compris pour valider", "Dire à l'usager qu'il a tort"],
        correctAnswer: 1
      },
      {
        id: "q7_3",
        question: "Le parajuriste doit-il raconter les problèmes des usagers à ses amis ?",
        options: ["Oui, pour avoir des conseils", "Non, il doit respecter la confidentialité", "Seulement si c'est une histoire drôle"],
        correctAnswer: 1
      },
      {
        id: "q7_4",
        question: "L'empathie consiste à :",
        options: ["Pleurer avec l'usager", "Comprendre les sentiments de l'autre sans juger", "Donner de l'argent à l'usager"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 8,
    title: "Documentation des cas",
    introduction: "Comment garder des traces fiables, organisées et sécurisées des interventions.",
    objectives: [
      "Comprendre l'utilité de la documentation",
      "Savoir remplir une fiche de suivi de cas",
      "Organiser l'archivage des dossiers",
      "Assurer la protection des données personnelles"
    ],
    keyNotions: ["Fiche de cas", "Archivage", "Preuves", "Statistiques"],
    content: `
# Documentation des Cas

Documenter, c'est écrire l'histoire de chaque intervention. C'est essentiel pour le suivi, pour la preuve et pour l'évaluation du travail.

## Pourquoi documenter ?
- **Pour le suivi** : Savoir où on en est si l'usager revient.
- **Pour la preuve** : Garder une trace des démarches effectuées.
- **Pour les statistiques** : Montrer l'ampleur des problèmes dans la communauté aux autorités.
- **Pour la mémoire** : Transmettre le dossier à un autre parajuriste si besoin.

## Les éléments d'une bonne fiche de cas :
1. **Identité de l'usager** (Nom, contact).
2. **Date de l'ouverture du dossier**.
3. **Description des faits** (Qui, quoi, quand, où, comment).
4. **Actions menées** (Conseils donnés, médiation, orientation).
5. **Résultat obtenu** ou état actuel du dossier.

## La protection des données
Les dossiers contiennent des informations sensibles. Ils doivent être :
- Rangés dans un endroit sûr (armoire fermée à clé).
- Accessibles uniquement aux personnes autorisées.
- Détruits de manière sécurisée après le délai légal de conservation.
    `,
    quiz: [
      {
        id: "q8_1",
        question: "Doit-on noter la date de l'intervention ?",
        options: ["Oui", "Non"],
        correctAnswer: 0
      },
      {
        id: "q8_2",
        question: "La documentation sert-elle à faire des statistiques pour la communauté ?",
        options: ["Oui", "Non", "Seulement pour les cas de vol"],
        correctAnswer: 0
      },
      {
        id: "q8_3",
        question: "Où doit-on ranger les fiches de cas ?",
        options: ["Sur la table du bureau", "Dans une armoire fermée à clé", "Dans son sac personnel"],
        correctAnswer: 1
      },
      {
        id: "q8_4",
        question: "Une bonne fiche de cas doit contenir :",
        options: ["Seulement le nom de l'usager", "Les faits, les actions menées et les résultats", "L'opinion personnelle du parajuriste sur l'usager"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: 9,
    title: "Mobilisation communautaire",
    introduction: "Agir ensemble pour le changement social et la défense des droits collectifs.",
    objectives: [
      "Définir la mobilisation communautaire",
      "Identifier les étapes d'une campagne de sensibilisation",
      "Savoir identifier les leaders d'opinion",
      "Comprendre l'importance de l'action collective"
    ],
    keyNotions: ["Sensibilisation", "Plaidoyer", "Action collective", "Changement social"],
    content: `
# Mobilisation Communautaire

Le parajuriste ne travaille pas seul. Pour changer les choses durablement, il doit mobiliser toute la communauté autour des questions de droit.

## Qu'est-ce que la mobilisation ?
C'est un processus par lequel les membres d'une communauté se rassemblent pour identifier leurs problèmes, trouver des solutions et agir ensemble.

## Les étapes d'une sensibilisation réussie :
1. **Identifier le problème** : Quel est le sujet urgent ? (ex: les mariages forcés).
2. **Cibler le public** : À qui s'adresse-t-on ? (parents, chefs religieux, jeunes).
3. **Choisir le message** : Simple, clair et adapté à la langue locale.
4. **Choisir le canal** : Causerie éducative, émission radio, théâtre forum.
5. **Impliquer les leaders** : Obtenir le soutien des chefs de village ou des leaders religieux.

## Le Plaidoyer
C'est une forme de mobilisation qui vise à influencer les décideurs (Maire, Député, Ministre) pour qu'ils changent une loi ou une pratique injuste.

## L'impact de l'action collective
Seul, on va vite, mais ensemble, on va plus loin. Une communauté mobilisée est plus forte pour revendiquer ses droits face aux abus.
    `,
    quiz: [
      {
        id: "q9_1",
        question: "La mobilisation renforce-t-elle l'impact des actions ?",
        options: ["Oui", "Non"],
        correctAnswer: 0
      },
      {
        id: "q9_2",
        question: "Le plaidoyer vise principalement à :",
        options: ["Donner de l'argent aux pauvres", "Influencer les décideurs pour changer les choses", "Organiser des fêtes au village"],
        correctAnswer: 1
      },
      {
        id: "q9_3",
        question: "Pour une sensibilisation efficace, il faut :",
        options: ["Utiliser des mots compliqués", "Impliquer les leaders d'opinion locaux", "Parler seulement aux enfants"],
        correctAnswer: 1
      },
      {
        id: "q9_4",
        question: "La mobilisation communautaire est un processus :",
        options: ["Individuel", "Collectif", "Secret"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 10,
    title: "Signalement communautaire",
    introduction: "Utilisez cet espace pour signaler des situations vécues dans votre communauté et contribuer à la veille juridique.",
    isReporting: true,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  }
];
