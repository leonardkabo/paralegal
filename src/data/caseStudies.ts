
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

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case1',
    title: 'Litige Foncier : L\'héritage contesté',
    description: 'Aidez M. Soglo à protéger son terrain hérité.',
    scenario: 'M. Soglo a hérité d\'un terrain de son père à Abomey-Calavi. Il possède un acte de donation sous seing privé, mais son cousin conteste la propriété en prétendant que le terrain appartient à la collectivité familiale. Que conseillez-vous à M. Soglo pour sécuriser son droit de propriété ?',
    options: [
      {
        id: 'a',
        text: 'Ignorer le cousin car l\'acte de donation suffit.',
        isCorrect: false,
        feedback: 'Mauvais choix. Un acte sous seing privé est fragile face à une contestation collective.'
      },
      {
        id: 'b',
        text: 'Entamer une procédure de confirmation de droits fonciers pour obtenir un Titre Foncier.',
        isCorrect: true,
        feedback: 'Excellent ! Le Titre Foncier est le seul document qui garantit une propriété inattaquable au Bénin.'
      },
      {
        id: 'c',
        text: 'Vendre le terrain rapidement avant que le litige ne s\'aggrave.',
        isCorrect: false,
        feedback: 'Risqué et potentiellement illégal si la propriété est contestée.'
      }
    ]
  },
  {
    id: 'case2',
    title: 'Droit du Travail : Licenciement abusif',
    description: 'Analysez la situation de Mme Azon qui a été renvoyée sans préavis.',
    scenario: 'Mme Azon travaille comme secrétaire dans une entreprise depuis 3 ans. Un matin, son employeur lui demande de ne plus revenir car il a trouvé "quelqu\'un de plus jeune", sans lui verser d\'indemnités. Quelle est la première démarche que Mme Azon doit entreprendre ?',
    options: [
      {
        id: 'a',
        text: 'Saisir directement le tribunal du travail.',
        isCorrect: false,
        feedback: 'Pas tout à fait. Au Bénin, une tentative de conciliation à l\'Inspection du Travail est généralement obligatoire avant le tribunal.'
      },
      {
        id: 'b',
        text: 'Saisir l\'Inspection du Travail pour une tentative de conciliation.',
        isCorrect: true,
        feedback: 'Correct ! L\'inspecteur du travail tentera de régler le litige à l\'amiable avant toute action judiciaire.'
      },
      {
        id: 'c',
        text: 'Bloquer l\'entrée de l\'entreprise pour protester.',
        isCorrect: false,
        feedback: 'Inapproprié et peut se retourner contre elle juridiquement.'
      }
    ]
  }
];
