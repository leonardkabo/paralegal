import { Module } from '../types';

export const MODULES: Module[] = [
  {
    id: 1,
    title: "Introduction au parajuridisme communautaire",
    introduction: "Ce module pose les fondations du métier de parajuriste, ses frontières légales et son importance cruciale dans le contexte ouest-africain et béninois.",
    objectives: [
      "Maîtriser l'approche du Legal Empowerment (Renforcement du pouvoir juridique)",
      "Identifier avec précision les limites légales de l'intervention pour éviter l'exercice illégal de la profession d'avocat",
      "Intégrer les principes déontologiques stricts : gratuité, confidentialité, impartialité",
      "Cartographier les acteurs de la chaîne judiciaire au Bénin"
    ],
    keyNotions: ["Legal Empowerment", "Médiation para-légale", "Déontologie", "Exercice illégal du droit"],
    content: `
# Module 1 : Fondements et Déontologie du Parajuriste

## 1. Contexte et nécessité au Bénin
Au Bénin, l'accès à la justice formelle se heurte à plusieurs obstacles : la barrière linguistique (la justice est rendue en français), l'éloignement géographique des tribunaux, la complexité des procédures et surtout le coût des services d'un avocat. C'est ici qu'intervient le parajuriste communautaire. Il n'est pas un substitut à l'avocat, mais le **premier maillon de la chaîne d'accès au droit**.

Le concept central est le **Legal Empowerment** : il ne s'agit pas d'assister passivement les populations, mais de leur transférer les connaissances nécessaires pour qu'elles puissent revendiquer et défendre leurs droits elles-mêmes face aux administrations et aux juridictions.

## 2. Le mandat du parajuriste : Ce qu'il fait et ne fait pas
Pour protéger l'usager et se protéger lui-même, le parajuriste doit connaître ses limites. Le Bénin réprime l'exercice illégal de la profession d'avocat.

**Ce que le parajuriste DOIT faire :**
* **Vulgarisation juridique** : Traduire les lois (Code Pénal, Code des Personnes et de la Famille) en langues locales (Fon, Bariba, Dendi, Yoruba, etc.) lors de séances communautaires ou universitaires.
* **Orientation (Référencement)** : Diriger les victimes vers les structures compétentes (Centres de Promotion Sociale - CPS, Commissariats, Cliniques juridiques).
* **Médiation de base** : Aider à la résolution de petits litiges civils (conflits de voisinage, petits conflits fonciers) par le dialogue, avant que cela ne devienne une affaire judiciaire.
* **Accompagnement administratif** : Aider à remplir un formulaire, rédiger une simple demande manuscrite.

**Ce que le parajuriste NE PEUT PAS faire :**
* Représenter un client ou plaider devant un juge au Tribunal de Première Instance ou à la Cour d'Appel.
* Rédiger des actes juridiques complexes (contrats de vente de domaine, testaments).
* Percevoir des honoraires. Son action est fondamentalement bénévole ou prise en charge par une ONG/structure d'appui.

## 3. Les piliers déontologiques
Le parajuriste est un confident de la communauté. Il est tenu par :
1.  **Le secret professionnel** : Tout ce qui est dit lors d'un entretien ne doit jamais être divulgué, même aux chefs de quartier, sauf en cas de danger de mort imminent ou d'abus sur mineur (obligation de signalement).
2.  **L'impartialité** : Dans une médiation, il n'est ni juge ni arbitre. Il ne prend pas parti, même si l'une des parties est un proche.
3.  **La probité** : Le refus absolu de toute corruption ou trafic d'influence auprès des agents de police ou de mairie.
    `,
    quiz: [
      {
        id: "q1_1",
        question: "Selon la loi, un parajuriste peut-il défendre un accusé à la barre du tribunal ?",
        options: ["Oui, s'il a suivi cette formation", "Non, c'est l'exercice exclusif de la profession d'avocat", "Seulement devant le chef de village"],
        correctAnswer: 1
      },
      {
        id: "q1_2",
        question: "Face à un conflit foncier complexe, quelle est la meilleure attitude du parajuriste ?",
        options: ["Trancher le litige et déclarer un gagnant", "Orienter les parties vers un avocat, un notaire ou les autorités domaniales", "Rédiger un acte de vente définitif"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Le Droit à la Santé : Cadre légal et déterminants",
    introduction: "Analyse approfondie du droit à la santé au Bénin, incluant la responsabilité médicale et les facteurs environnementaux.",
    objectives: [
      "Maîtriser la Loi n° 2020-37 portant protection de la santé au Bénin",
      "Comprendre les obligations des formations sanitaires (publiques et privées)",
      "Identifier les voies de recours en cas de négligence médicale",
      "Intégrer l'impact de l'environnement (gestion des déchets, hygiène) sur la santé publique"
    ],
    keyNotions: ["Loi 2020-37", "Responsabilité médicale", "Non-assistance à personne en danger", "Déterminants environnementaux"],
    content: `
# Module 2 : Le Droit à la Santé et ses dimensions

## 1. Le cadre normatif au Bénin
Le droit à la santé est garanti par la Constitution béninoise. Récemment, la **Loi n° 2020-37 portant protection de la santé en République du Bénin** est venue renforcer les obligations de l'État et des prestataires de soins. 
Le droit à la santé ne signifie pas que l'État garantit une santé parfaite, mais qu'il met en place un système de prévention, de traitement et de contrôle accessible à tous (le standard "AAAQ" de l'OMS : Accessibilité, Acceptabilité, Disponibilité, Qualité).

## 2. Les Droits du Patient et les Obligations Médicales
Dans les centres de santé ou CHUD (Centres Hospitaliers Universitaires Départementaux), le patient possède des droits inaliénables :
* **Le droit à l'information et au consentement** : Le médecin doit expliquer le traitement en termes simples. Aucun soin (sauf urgence vitale) ne peut être imposé sans consentement.
* **Le droit aux soins d'urgence** : Le refus de prise en charge pour une urgence vitale sous prétexte de manque de moyens financiers (défaut de paiement de la caution) expose le personnel médical à des poursuites pénales pour **non-assistance à personne en danger** (Article 325 du Code Pénal).
* **La séquestration illégale** : Il est strictement illégal pour un hôpital de retenir un patient (ou un nouveau-né et sa mère) contre son gré parce qu'il n'a pas payé sa facture. C'est une infraction pénale (atteinte à la liberté d'aller et venir) que le parajuriste doit savoir signaler au Procureur.

## 3. Santé Environnementale et Responsabilité Communautaire
Le droit à la santé s'étend aux conditions de vie. Les maladies hydriques, le paludisme, ou les infections respiratoires sont souvent liés à la mauvaise gestion des déchets, à l'absence de tri et au manque d'assainissement.
L'État et les communes ont l'obligation d'assurer la salubrité publique. Le parajuriste peut utiliser les lois sur l'hygiène publique pour interpeller les élus locaux (maires, chefs d'arrondissement) sur l'insalubrité, soutenant ainsi des initiatives locales d'économie circulaire et de gestion des déchets.
    `,
    quiz: [
      {
        id: "q2_1",
        question: "Un centre de santé peut-il retenir une femme qui vient d'accoucher parce qu'elle n'a pas payé sa facture ?",
        options: ["Oui, c'est la procédure normale de recouvrement", "Non, c'est une privation illégale de liberté (séquestration)", "Seulement avec l'accord du chef de village"],
        correctAnswer: 1
      },
      {
        id: "q2_2",
        question: "L'accès à l'eau potable et la gestion correcte des déchets font-ils partie du droit à la santé ?",
        options: ["Oui, ce sont des déterminants essentiels de la santé", "Non, cela relève uniquement du ministère de l'environnement"],
        correctAnswer: 0
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "VBG et Protection de la Femme et de l'Enfant",
    introduction: "Les infractions, les peines et le circuit de référencement pour la protection des victimes de Violences Basées sur le Genre.",
    objectives: [
      "Appliquer les dispositions de la Loi n° 2011-26 et du Code Pénal de 2018",
      "Maîtriser les procédures de saisine de l'Institut National de la Femme (INF)",
      "Connaître le circuit de prise en charge : médical, psychosocial et judiciaire",
      "Appréhender la notion de harcèlement en milieu universitaire et professionnel"
    ],
    keyNotions: ["Loi 2011-26", "Institut National de la Femme (INF)", "Viol", "Harcèlement", "Centres de Promotion Sociale (CPS)"],
    content: `
# Module 3 : Lutte contre les VBG (Violences Basées sur le Genre)

## 1. L'arsenal juridique : Loi 2011-26 et Code Pénal
Le Bénin s'est doté de lois extrêmement sévères contre les VBG. La **Loi n° 2011-26 du 09 janvier 2012** portant prévention et répression des violences faites aux femmes, couplée au **Code Pénal (Loi n° 2018-16)**, criminalise de nombreuses pratiques :
* **Le Viol** : C'est un crime (et non un simple délit), passible de la réclusion criminelle (jusqu'à 20 ans, voire la perpétuité si la victime est mineure). La loi ne reconnaît *aucune justification* (ni tenue vestimentaire, ni mariage). Le viol conjugal est reconnu et puni.
* **Le Harcèlement sexuel** : Notamment en milieu scolaire, universitaire (abus d'autorité d'un professeur sur une étudiante) ou professionnel.
* **Mutilations Génitales Féminines (MGF) et Mariage Forcé** : Pratiques sévèrement réprimées. Quiconque facilite ou participe à ces actes est complice.
* **Violences économiques et psychologiques** : Priver son épouse de ressources essentielles, confisquer ses documents ou la soumettre à des violences verbales répétées sont des délits pénaux.

## 2. L'Institut National de la Femme (INF)
Une révolution récente au Bénin est la création de l'INF. Cet institut, en plus de sensibiliser, dispose de la **capacité d'ester en justice**. L'INF peut se constituer partie civile et poursuivre les auteurs de VBG même si la victime (sous pression familiale) décide de retirer sa plainte. Le parajuriste doit avoir les contacts des démembrements de l'INF dans sa région (ex: Borgou).

## 3. Le Parcours de la Victime et le Rôle du Parajuriste
Le temps est le plus grand ennemi dans les cas de violences (surtout sexuelles).
1.  **L'Urgence Médicale (Les 72h critiques)** : Orientations immédiates vers un centre de santé pour les soins (Prévention VIH/IST, contraception d'urgence) et l'établissement du **certificat médical**. Sans certificat, la procédure judiciaire est très difficile.
2.  **Le Signalement** : Utilisation du numéro vert national (le **132** au Bénin) ou saisine immédiate de la Police Républicaine.
3.  **L'Accompagnement Psychosocial** : Orienter vers les Centres de Promotion Sociale (CPS) ou des ONG spécialisées pour un soutien psychologique et un hébergement d'urgence si la victime est en danger chez elle.
    `,
    quiz: [
      {
        id: "q3_1",
        question: "Une étudiante est harcelée par un professeur qui exige des faveurs sexuelles contre des notes. Que doit faire le parajuriste ?",
        options: ["Lui conseiller de céder pour avoir son diplôme", "Organiser une médiation secrète avec le professeur", "L'orienter vers l'Institut National de la Femme (INF) et la police pour un dépôt de plainte"],
        correctAnswer: 2
      },
      {
        id: "q3_2",
        question: "Si une victime de viol souhaite retirer sa plainte sous la pression de sa famille, l'INF peut-il poursuivre la procédure ?",
        options: ["Non, la volonté de la victime prime toujours", "Oui, l'INF a le pouvoir de se constituer partie civile et de poursuivre l'auteur"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "État civil, ANIP et Identité Juridique",
    introduction: "Maitriser les nouvelles procédures d'identification au Bénin et les solutions aux cas de non-déclaration.",
    objectives: [
      "Maîtriser la Loi n° 2020-34 portant dispositions spéciales de simplification des actes d'état civil",
      "Comprendre le rôle de l'ANIP (NPI, Actes sécurisés)",
      "Connaître les étapes exactes d'une procédure de jugement supplétif d'acte de naissance",
      "Savoir monter un dossier de régularisation pour un usager"
    ],
    keyNotions: ["ANIP", "NPI", "RAVIP", "Loi 2020-34", "Jugement Supplétif"],
    content: `
# Module 4 : Sécurisation de l'État Civil au Bénin

## 1. L'importance vitale de l'état civil
L'acte de naissance n'est pas qu'un bout de papier, c'est la preuve juridique de l'existence. Au Bénin, sans cela, il est impossible de passer les examens nationaux (CEP, BEPC, BAC), d'obtenir une bourse universitaire, de se faire établir un passeport, ou de s'inscrire sur la liste électorale.

## 2. La Réforme de l'ANIP et le NPI
Le Bénin a profondément numérisé son état civil via l'**Agence Nationale d'Identification des Personnes (ANIP)**.
* Le **RAVIP** (Recensement Administratif à Vocation d'Identification de la Population) est devenu la base de données centrale.
* Chaque citoyen obtient un **Numéro Personnel d'Identification (NPI)**, unique à vie.
* Le parajuriste doit maîtriser les portails numériques de l'ANIP (services en ligne) pour aider les usagers non-alphabétisés à demander leurs actes de naissance sécurisés ou leurs certificats d'identification personnelle (CIP).

## 3. Le problème des naissances non déclarées (Loi 2020-34)
La loi béninoise impose la déclaration de naissance dans les **21 jours** suivant l'accouchement. Passé ce délai, la déclaration à la mairie n'est plus possible.
Avant, il fallait systématiquement une procédure longue au tribunal. Aujourd'hui, grâce à la Loi 2020-34 et ses décrets d'application, il existe des mesures dérogatoires (souvent annoncées par le gouvernement) permettant de régulariser les enfants recensés au RAVIP sans acte de naissance formel.

## 4. La procédure de Jugement Supplétif
Quand la régularisation administrative n'est pas possible, il faut recourir au juge. Le parajuriste accompagne l'usager dans cette démarche :
1.  **Requête** adressée au Président du Tribunal de Première Instance (ou tribunal de conciliation selon les réformes en cours).
2.  **Preuves** : Réunir un certificat de non-inscription au registre d'état civil (délivré par la mairie).
3.  **Témoins** : Présenter deux témoins majeurs (souvent des parents ou le chef de quartier) pouvant attester sous serment de la date et du lieu de naissance devant le juge.
    `,
    quiz: [
      {
        id: "q4_1",
        question: "Quel est l'identifiant unique attribué à chaque Béninois par l'ANIP ?",
        options: ["Le numéro de sécurité sociale", "Le NPI (Numéro Personnel d'Identification)", "Le numéro IFU"],
        correctAnswer: 1
      },
      {
        id: "q4_2",
        question: "Quelle pièce est indispensable pour initier un jugement supplétif au tribunal ?",
        options: ["Un acte de propriété", "Un certificat de non-inscription au registre d'état civil délivré par la mairie", "Une carte d'étudiant"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Mécanismes de Protection Sociale (Mutuelles et ARCH)",
    introduction: "Comprendre comment la solidarité et les politiques publiques béninoises financent l'accès aux soins.",
    objectives: [
      "Expliquer le fonctionnement financier d'une Mutuelle de Santé communautaire",
      "Comprendre la règlementation UEMOA sur la mutualité",
      "Maîtriser les volets du programme gouvernemental ARCH",
      "Identifier les populations cibles pour la gratuité des soins"
    ],
    keyNotions: ["Projet ARCH", "Mutualité de l'UEMOA", "Tiers-payant", "Ticket modérateur"],
    content: `
# Module 5 : Protection Sociale et Assurances Maladie

## 1. La Mutualité Sociale (Règlementation UEMOA)
La maladie est le premier facteur de basculement dans l'extrême pauvreté. Les Mutuelles de Santé sont régies par le **Règlement n°07/2009/CM/UEMOA**. 
Ce sont des sociétés de personnes à but non lucratif.
* **La cotisation prévoyante** : L'usager cotise pendant qu'il est en bonne santé (souvent de petites sommes mensuelles ou annuelles).
* **Le Tiers-Payant** : En cas de maladie, le membre se rend dans un centre de santé conventionné. Il ne paie que le **ticket modérateur** (ex: 20% ou 30% de la facture). La mutuelle règle les 70% ou 80% restants directement à l'hôpital.

## 2. Le Projet ARCH au Bénin
C'est le programme phare du gouvernement béninois : **Assurance pour le Renforcement du Capital Humain (ARCH)**. Il vise à universaliser l'accès aux soins, la formation, le microcrédit et la retraite.
Le volet "Assurance Maladie" de l'ARCH cible prioritairement les **"pauvres extrêmes et pauvres non extrêmes"**. 
* **Comment ça marche ?** Les bénéficiaires sont identifiés via la base de données de l'ANIP. L'État prend en charge 100% de la prime d'assurance pour les personnes extrêmement pauvres.
* **Rôle du parajuriste** : Informer les populations démunies de leurs droits liés au projet ARCH, vérifier s'ils sont enregistrés au RAVIP (condition préalable), et les orienter vers les centres sociaux (CPS) pour les processus de ciblage et d'obtention de la carte biométrique ARCH.
    `,
    quiz: [
      {
        id: "q5_1",
        question: "Que signifie le sigle ARCH au Bénin ?",
        options: ["Association pour la Restructuration des Centres Hospitaliers", "Assurance pour le Renforcement du Capital Humain", "Alliance pour le Retour à la Croissance Harmonique"],
        correctAnswer: 1
      },
      {
        id: "q5_2",
        question: "Qui paie la prime d'assurance maladie pour les populations identifiées comme extrêmement pauvres dans le cadre du projet ARCH ?",
        options: ["Les mutuelles privées", "L'État béninois à 100%", "La mairie de leur commune"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 6,
    title: "Organisation judiciaire et Procédures",
    introduction: "Naviguer dans les arcanes de la justice béninoise, de l'infraction pénale jusqu'au jugement.",
    objectives: [
      "Cartographier les juridictions béninoises (Tribunal, Cour d'Appel, CRIET)",
      "Maîtriser les dispositions du Code de Procédure Pénale concernant la garde à vue",
      "Comprendre la procédure de constitution de partie civile",
      "Savoir comment rédiger une demande d'aide juridictionnelle"
    ],
    keyNotions: ["Code de Procédure Pénale", "CRIET", "Garde à vue", "Aide Juridictionnelle", "Plainte"],
    content: `
# Module 6 : Accès à la Justice et Organisation des Tribunaux

## 1. L'Organisation Judiciaire au Bénin
Le parajuriste doit savoir orienter selon le type et la gravité de l'affaire.
* **Les Tribunaux de Conciliation** (niveau arrondissement) : Pour les conflits de voisinage, petites créances, conflits familiaux légers.
* **Le Tribunal de Première Instance (TPI)** : Juge la majorité des affaires civiles (divorce, héritage) et pénales (vols, coups et blessures, escroquerie).
* **La Cour d'Appel** : Si une partie n'est pas satisfaite de la décision du TPI.
* **La Cour de Répression des Infractions Économiques et du Terrorisme (CRIET)** : Juridiction spéciale siégeant à Porto-Novo, compétente pour le trafic de drogue, le terrorisme, la cybercriminalité (gaymans) et les crimes économiques graves.

## 2. La Garde à Vue : Droits fondamentaux
C'est le moment le plus vulnérable pour un citoyen. Le **Code de Procédure Pénale** béninois encadre strictement la privation de liberté par les Officiers de Police Judiciaire (OPJ).
* **Durée** : La garde à vue est de **48 heures maximum**. Elle peut être prolongée une seule fois de 48h, **exclusivement sur autorisation écrite du Procureur de la République**.
* **Droits du gardé à vue** : Il a le droit d'être informé des charges retenues contre lui, de faire prévenir sa famille, de garder le silence, et surtout d'être **assisté par son avocat dès la première heure**. La torture ou les mauvais traitements pour extorquer des aveux sont des crimes sévèrement punis.

## 3. L'Action en Justice et l'Aide Juridictionnelle
* **La Plainte** : L'usager peut déposer plainte à la Police Républicaine (commissariat) ou adresser une plainte écrite directement au **Procureur de la République** (soit plainte simple, soit avec constitution de partie civile).
* **L'Indigence** : Si un usager n'a pas les moyens de payer les frais de justice (consignation) ou un avocat, l'État béninois prévoit une **Aide Juridictionnelle**. Le parajuriste aide l'usager à fournir un certificat d'indigence (délivré par le CPS et la mairie) pour déposer la demande au tribunal.
    `,
    quiz: [
      {
        id: "q6_1",
        question: "Quelle est la durée légale initiale d'une garde à vue au Bénin avant toute prolongation ?",
        options: ["24 heures", "48 heures", "72 heures"],
        correctAnswer: 1
      },
      {
        id: "q6_2",
        question: "Quelle juridiction spéciale béninoise est compétente pour juger les affaires de cybercriminalité grave ?",
        options: ["Le Tribunal de Conciliation", "La Haute Cour de Justice", "La CRIET"],
        correctAnswer: 2
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 7,
    title: "Techniques d'Écoute et de Conduite d'Entretien",
    introduction: "Acquérir les compétences psychosociales pour recevoir des victimes et mener un entretien juridique.",
    objectives: [
      "Pratiquer l'écoute active et la reformulation",
      "Éviter les biais cognitifs et les jugements moraux",
      "Gérer un entretien avec une victime de traumatisme aigu",
      "Savoir canaliser un usager agressif ou confus"
    ],
    keyNotions: ["Écoute active", "Non-directivité", "Reformulation", "Empathie clinique"],
    content: `
# Module 7 : Psychologie et Techniques d'Entretien

## 1. La posture professionnelle : Empathie et Neutralité
Le parajuriste, qu'il travaille sur un campus universitaire ou dans une ONG, fait souvent face à la détresse. 
* **Le Non-Jugement** : C'est la règle d'or. Face à une jeune fille ayant subi un avortement clandestin compliqué (illégal sauf conditions strictes de la loi de 2021 sur la SSR) ou une femme victime de viol, le parajuriste n'est pas un moralisateur. Il ne doit **jamais** dire : "Pourquoi tu as fait ça ?" ou "C'est de ta faute". 
* **L'Empathie** : Comprendre la souffrance de l'autre sans se laisser submerger par ses propres émotions (la juste distance).

## 2. L'Écoute Active (Méthode Carl Rogers)
L'écoute active n'est pas passive. C'est un travail intellectuel consistant à :
1.  **Questionnement ouvert** : Utiliser "Comment, Que s'est-il passé, Décrivez-moi..." au lieu de questions fermées "Avez-vous fait X ?".
2.  **La Reformulation** : Répéter avec ses propres mots les faits essentiels (Ex: "Si je comprends bien, vous dites que votre employeur a refusé de vous payer depuis trois mois après votre licenciement, c'est bien cela ?"). Cela montre à l'usager qu'il est compris et valide les faits juridiques.
3.  **Le Silence** : Savoir se taire. Le silence permet à l'usager de structurer sa pensée ou d'exprimer une émotion difficile.

## 3. Conduire l'entretien (Les 4 phases)
1.  **L'Accueil** : Mettre en confiance, présenter les règles (gratuité, confidentialité).
2.  **L'Investigation** : Laisser parler, puis creuser pour obtenir les faits matériels (dates, lieux, témoins, preuves).
3.  **L'Analyse** : Le parajuriste qualifie juridiquement les faits (s'agit-il d'un conflit civil, d'un délit pénal, d'un problème administratif ?).
4.  **L'Orientation/Plan d'action** : Proposer des solutions à l'usager sans décider à sa place.
    `,
    quiz: [
      {
        id: "q7_1",
        question: "Lorsqu'une victime raconte une histoire difficile, quelle est la pire erreur que le parajuriste puisse faire ?",
        options: ["Garder le silence pour la laisser pleurer", "La culpabiliser ou émettre un jugement moral sur son comportement", "Prendre des notes discrètement"],
        correctAnswer: 1
      },
      {
        id: "q7_2",
        question: "Qu'est-ce que la reformulation dans un entretien ?",
        options: ["Répéter exactement les mots de la victime comme un perroquet", "Résumer avec ses propres mots ce que l'usager vient de dire pour s'assurer d'avoir bien compris", "Donner son avis personnel sur l'affaire"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 8,
    title: "Documentation et Gestion des Preuves",
    introduction: "Méthodologie stricte pour monter un dossier solide, préserver les preuves et protéger les données.",
    objectives: [
      "Rédiger une fiche de signalement ou d'entretien claire et juridiquement exploitable",
      "Comprendre la chaîne de conservation des preuves (numériques, physiques, témoignages)",
      "Appliquer le Code du Numérique sur la protection des données personnelles (APDP)",
      "Mettre en place un système d'archivage sécurisé"
    ],
    keyNotions: ["Fiche de cas", "Preuve matérielle", "Données à caractère personnel", "Code du Numérique"],
    content: `
# Module 8 : Méthodologie, Preuves et Traçabilité

## 1. L'art de la Documentation
Les paroles s'envolent, les écrits restent. Un parajuriste inorganisé est inutile. Chaque interaction doit faire l'objet d'une **Fiche de Cas**.
Celle-ci doit contenir de manière neutre :
* L'identité complète (anonymisée par un code si besoin pour les bases de données informatiques).
* La chronologie exacte des faits reprochés.
* L'inventaire des pièces fournies (contrats, SMS imprimés, photos).
* L'action entreprise (ex: "Orienté vers le commissariat du 2ème arrondissement le 12/04").

## 2. La Préservation de la Preuve
Le droit fonctionne sur la preuve. Le parajuriste doit conseiller l'usager sur la sauvegarde des éléments à charge ou à décharge :
* **VBG / Coups et blessures** : Ne pas laver les vêtements déchirés ou ensanglantés, ils constituent des preuves matérielles pour la police scientifique. Obtenir le certificat médical le plus tôt possible.
* **Preuves numériques (Cybercriminalité/Harcèlement)** : Ne jamais supprimer les messages (WhatsApp, SMS, Facebook) ou les notes vocales de menaces. Faire des captures d'écran et, si possible, les faire constater par un huissier de justice avant toute chose.

## 3. Sécurité et Protection des Données (Code du Numérique)
Le Bénin possède un **Code du Numérique (2018)** très strict sur la protection des données à caractère personnel, veillé par l'APDP (Autorité de Protection des Données Personnelles).
* Le parajuriste collecte des données extrêmement sensibles (statut sérologique, antécédents pénaux, situation matrimoniale).
* Il est **interdit** de stocker ces fiches non-sécurisées sur un ordinateur public, de les envoyer via des canaux non cryptés, ou de laisser des dossiers papiers ouverts sur un bureau. Une faille de confidentialité ruine la réputation du parajuriste et l'expose légalement.
    `,
    quiz: [
      {
        id: "q8_1",
        question: "Un usager victime de menaces de mort par SMS vous demande conseil. Que lui dites-vous en premier ?",
        options: ["Supprimez le numéro pour ne plus être embêté", "Conservez précieusement votre téléphone, faites des captures d'écran et allez faire un constat à la police", "Répondez-lui avec des insultes pour vous défendre"],
        correctAnswer: 1
      },
      {
        id: "q8_2",
        question: "Au regard de la loi béninoise, est-il autorisé de partager les fiches détaillées des usagers dans un groupe WhatsApp pour avoir l'avis d'autres parajuristes ?",
        options: ["Oui, si le groupe est réservé aux parajuristes", "Non, c'est une violation flagrante de la confidentialité et des données personnelles", "Seulement si l'usager est d'accord verbalement"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: 9,
    title: "Mobilisation et Plaidoyer Communautaire",
    introduction: "Techniques pour transformer les constats individuels en réformes systémiques grâce à l'action collective.",
    objectives: [
      "Cartographier les parties prenantes et leaders d'opinion locaux",
      "Concevoir et animer une campagne de sensibilisation ciblée",
      "Monter une stratégie de plaidoyer auprès des autorités locales (Mairies, Préfectures)",
      "Utiliser les relais associatifs et estudiantins comme leviers de changement"
    ],
    keyNotions: ["Plaidoyer", "IEC/CCC", "Cartographie des acteurs", "Mobilisation des jeunes"],
    content: `
# Module 9 : De l'Individu au Collectif - Le Plaidoyer

## 1. La Cartographie des acteurs locaux
Un parajuriste n'a pas de pouvoir coercitif. Sa force réside dans son réseau. Pour mener une action (ex: lutter contre la pollution d'une rivière ou les mariages précoces), il doit identifier :
* **Les autorités politico-administratives** : Maires, Chefs d'Arrondissement (CA), Chefs de Quartier/Village (CQ/CV).
* **Les autorités traditionnelles et religieuses** : Têtes couronnées, Imams, Pasteurs, Prêtres (très écoutés au Bénin).
* **Les dynamiques associatives** : Les ONG de jeunesse, les fédérations d'étudiants, les groupements de femmes.

## 2. L'animation de stand et la Sensibilisation (IEC)
L'Information, Éducation, Communication (IEC) demande de la préparation.
* **Adaptation culturelle** : On ne parle pas de planification familiale ou de droits fonciers de la femme de la même manière au Nord et au Sud du Bénin. Le message doit respecter les codes culturels pour être accepté.
* **Les outils** : Animations de stands dans les universités ou marchés, boîtes à images, théâtre-forum (où le public propose des solutions juridiques à un conflit joué par des acteurs), émissions sur les radios communautaires.

## 3. Le Plaidoyer : Exiger le changement
Si le parajuriste constate un problème récurrent (ex: un commissariat local refuse systématiquement d'enregistrer les plaintes pour violences conjugales en disant "réglez ça en famille"), l'action individuelle ne suffit plus.
Il faut monter un **plaidoyer** :
1.  Rassembler les preuves (les statistiques anonymisées tirées des fiches de cas).
2.  Aller en coalition (avec des ONG, des réseaux de jeunes).
3.  Rencontrer le Commissaire Central ou le Procureur pour présenter le problème et exiger l'application stricte de la loi.
Le plaidoyer vise à changer les politiques ou l'application des lois au niveau local ou national.
    `,
    quiz: [
      {
        id: "q9_1",
        question: "Quelle est la principale différence entre la sensibilisation et le plaidoyer ?",
        options: ["Le plaidoyer coûte plus cher", "La sensibilisation vise à informer la population, le plaidoyer vise à influencer les décideurs pour changer une politique ou son application", "Il n'y a aucune différence, ce sont des synonymes"],
        correctAnswer: 1
      },
      {
        id: "q9_2",
        question: "Pourquoi est-il stratégique d'impliquer les chefs religieux et traditionnels dans une campagne contre les mariages forcés ?",
        options: ["Parce qu'ils ont le pouvoir d'emprisonner les coupables", "Parce qu'ils sont des leaders d'opinion dont la parole a un fort impact sur le changement de comportement des communautés", "Parce qu'ils peuvent financer la campagne"],
        correctAnswer: 1
      }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 10,
    title: "Signalement, Veille et Data communautaire",
    introduction: "Plateforme interactive et processus pour signaler les violations et contribuer à la justice prédictive.",
    isReporting: true,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  }
];