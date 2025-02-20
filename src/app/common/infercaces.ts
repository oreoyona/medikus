// Définition des interfaces pour les différents types de contenu
export interface Video {
    title: string;
    description: string;
    videoLink: string;
    videoId?: string;

}

 
export interface User{
    id: string,
    password: string
}


export interface QuizQuestion {
    id: string;
    question: string;
    answers: { id: string; text: string }[];
}

export interface QuizContent {
    title: string;
    questions: QuizQuestion[];
}

export interface TextContent {
    title: string;
    text: string[];
    importantText?: string[];
    list?: string[];
}

export interface CoursePart<T> {
    title: string;
    content: T;
  }
// Interface générique pour les modules, permettant différents types de contenu
export interface CourseModule<T> {
    title: string;
    link: string;
    content: T,
    parts?: CoursePart<Video | TextContent | QuizContent>[];

}

// Interface principale pour les cours
export interface Cours {
    id: string;
    name: string;
    modules: CourseModule<Video | TextContent | QuizContent>[];
    img?: ImageBitmap | string
}



const quizContent: QuizContent = {
    title: "Quiz d'entraînement",
    questions: [
      {
        id: "question1",
        question: "Quelle onde de l'ECG représente la dépolarisation des ventricules ?",
        answers: [
          { id: "answer1", text: "Onde P" },
          { id: "answer2", text: "Complexe QRS" },
          { id: "answer3", text: "Onde T" },
          { id: "answer4", text: "Intervalle PR" }
        ]
      },
      {
        id: "question2",
        question: "Qu'est-ce qu'une fibrillation auriculaire ?",
        answers: [
          { id: "answer1", text: "Une arythmie ventriculaire" },
          { id: "answer2", text: "Une arythmie auriculaire" },
          { id: "answer3", text: "Une hypertrophie ventriculaire" },
          { id: "answer4", text: "Un bloc de branche" }
        ]
      },
      {
        id: "question3",
        question: "Quel signe ECG peut signaler un infarctus aigu du myocarde ?",
        answers: [
          { id: "answer1", text: "Une onde Q" },
          { id: "answer2", text: "Un sus-décalage du segment ST" },
          { id: "answer3", text: "Une onde T inversée" },
          { id: "answer4", text: "Un bloc de branche" }
        ]
      },
      {
        id: "question4",
        question: "Quelle est la principale cause d'hypertrophie ventriculaire gauche ?",
        answers: [
          { id: "answer1", text: "Une valvulopathie" },
          { id: "answer2", text: "Une péricardite" },
          { id: "answer3", text: "Une hypertension artérielle" },
          { id: "answer4", text: "Un infarctus du myocarde" }
        ]
      }
    ]
  };


const questions = [
    {
      id: "question1",
      question: "Quelle onde de l'ECG représente la dépolarisation des ventricules ?",
      answers: [
        { id: "answer1", text: "Onde P" },
        { id: "answer2", text: "Complexe QRS" },
        { id: "answer3", text: "Onde T" },
        { id: "answer4", text: "Intervalle PR" }
      ]
    },
    {
      id: "question2",
      question: "Qu'est-ce qu'une fibrillation auriculaire ?",
      answers: [
        { id: "answer1", text: "Une arythmie ventriculaire" },
        { id: "answer2", text: "Une arythmie auriculaire" },
        { id: "answer3", text: "Une hypertrophie ventriculaire" },
        { id: "answer4", text: "Un bloc de branche" }
      ]
    },
    {
      id: "question3",
      question: "Quel signe ECG peut signaler un infarctus aigu du myocarde ?",
      answers: [
        { id: "answer1", text: "Une onde Q" },
        { id: "answer2", text: "Un sus-décalage du segment ST" },
        { id: "answer3", text: "Une onde T inversée" },
        { id: "answer4", text: "Un bloc de branche" }
      ]
    },
    {
      id: "question4",
      question: "Quelle est la principale cause d'hypertrophie ventriculaire gauche ?",
      answers: [
        { id: "answer1", text: "Une valvulopathie" },
        { id: "answer2", text: "Une péricardite" },
        { id: "answer3", text: "Une hypertension artérielle" },
        { id: "answer4", text: "Un infarctus du myocarde" }
      ]
    }
  ]


// Exemple de données pour un cours (ECG)
export const ecgCours: Cours = {
    id: '1',
    name: "Maitriser l'ECG avec Medicus",
    modules: [
        {
            title: "Introduction",
            link: "introduction",
            content: {
                title: "L'ECG est tres importante en cardiologie",
                text: [
                    "L'ECG est un examen essentiel...",
                    "L'ECG offre un aperçu précieux...",
                    "Au-delà du diagnostic, l'ECG joue également un rôle essentiel...",
                    "La réalisation d'un ECG est simple...",
                    "L'interprétation des résultats de l'ECG nécessite cependant une expertise...",
                    "Enfin, l'ECG est un examen complémentaire essentiel..."
                ],
                importantText: [
                    "L'ECG ne doit jamais être interprété seul...",
                    "Bien que l'ECG soit un outil extrêmement précieux...",
                    "En effet, un ECG peut parfois présenter des anomalies..."
                ],
                list: [
                    "L'ECG ne s'interprète pas seul...",
                    "Un ECG peut montrer des anomalies sans pathologie sous-jacente...",
                    "L'approche holistique, combinant ECG et contexte..."
                ]
            } as TextContent, // Cast nécessaire

            parts: [
                { title: "Introduction - Partie 1", content: { title: "Bases de l'ECG", text: ["Ce module couvre les bases de l'ECG..."] } as TextContent },
                { title: "Introduction - Partie 2", content: { title: "Principes de l'ECG", text: ["Les principes fondamentaux de l'ECG..."] } as TextContent },
                { title: "Introduction - Partie 3", content: { title: "Interprétation de l'ECG", text: ["Comment interpréter un ECG..."] } as TextContent },
                { title: "Introduction - Partie 4", content: { title: "Importance de l'ECG", text: ["Pourquoi l'ECG est important..."] } as TextContent },

                // Video (4 exemples)
                { title: "Introduction - Vidéo 1", content: { title: "Introduction à l'ECG", description: "Vidéo introductive sur l'ECG", videoLink: "URL_DE_LA_VIDEO_1" } as Video },
                { title: "Introduction - Vidéo 2", content: { title: "Placement des électrodes", description: "Comment placer les électrodes", videoLink: "URL_DE_LA_VIDEO_2" } as Video },
                { title: "Introduction - Vidéo 3", content: { title: "Les ondes de l'ECG", description: "Explication des ondes", videoLink: "URL_DE_LA_VIDEO_3" } as Video },
                { title: "Introduction - Vidéo 4", content: { title: "Interprétation rapide", description: "Interprétation rapide d'un ECG", videoLink: "URL_DE_LA_VIDEO_4" } as Video },

                // QuizContent (4 exemples)
                { title: "Introduction - Quiz 1", content: quizContent }, // Utilisez le quizContent défini plus haut
                { title: "Introduction - Quiz 2", content: { title: "Quiz sur les bases", questions: questions } as QuizContent },
                { title: "Introduction - Quiz 3", content: { title: "Quiz sur les principes", questions: questions } as QuizContent },
                { title: "Introduction - Quiz 4", content: { title: "Quiz d'interprétation", questions: questions } as QuizContent }
            
            ]
        },
        {
            title: "Maitriser le placement des electrodes",
            link: "placement-electrodes",
            content: {
                title: "Maitriser le placement des electrodes",
                description: "Lorem ipsum",
                videoLink: "https://www.youtube.com/embed/vcoPfVubLKQ?si=yXMLzCysHviTi2w7", // Lien YouTube valide
                videoId: "vcoPfVubLKQ&t=1s"
            } as Video // Cast nécessaire
        },
        {
            title: "Interprétation des ondes et des intervalles",
            link: "interpretation-ondes-intervalles",
            content: {
                title: "Interprétation des ondes et des intervalles",
                text: [
                    "L'onde P représente l'activité électrique des oreillettes...",
                    "Le complexe QRS correspond à la dépolarisation des ventricules...",
                    "L'onde T traduit la repolarisation ventriculaire...",
                    "L'intervalle PR mesure le temps de conduction auriculo-ventriculaire...",
                    "L'intervalle QT reflète la durée de la repolarisation ventriculaire..."
                ],
                importantText: [
                    "Une onde P anormale peut signaler un problème auriculaire.",
                    "Un complexe QRS large peut signaler un trouble de la conduction.",
                    "Une onde T inversée peut signaler une ischémie myocardique."
                ],
                list: [
                    "Onde P : morphologie, amplitude, durée",
                    "Complexe QRS : morphologie, durée, axe",
                    "Onde T : morphologie, amplitude",
                    "Intervalle PR : durée",
                    "Intervalle QT : durée"
                ]
            } as TextContent
        },
        {
            title: "Troubles du rythme cardiaque (arythmies)",
            link: "troubles-rythme",
            content: {
                title: "Troubles du rythme cardiaque (arythmies)",
                text: [
                    "Il existe différents types d'arythmies : tachycardie, bradycardie, fibrillation auriculaire, etc.",
                    "Chaque arythmie a ses propres caractéristiques ECG.",
                    "Les arythmies peuvent avoir des conséquences cliniques variables."
                ],
                importantText: [
                    "La fibrillation auriculaire est une arythmie fréquente.",
                    "La tachycardie ventriculaire peut être dangereuse."
                ],
                list: [
                    "Tachycardie : définition, types, ECG",
                    "Bradycardie : définition, causes, ECG",
                    "Fibrillation auriculaire : définition, ECG, traitement",
                    "Flutter auriculaire : définition, ECG, traitement",
                    "Extrasystoles : définition, types, ECG"
                ]
            } as TextContent
        },
        {
            title: "Ischémie et infarctus du myocarde",
            link: "ischemie-infarctus",
            content: {
                title: "Ischémie et infarctus du myocarde",
                text: [
                    "L'ECG est un outil essentiel pour diagnostiquer l'ischémie et l'infarctus.",
                    "Les modifications ECG au cours d'un infarctus évoluent dans le temps.",
                    "L'ECG peut aider à localiser l'infarctus."
                ],
                importantText: [
                    "Un sus-décalage du segment ST peutSignaler un infarctus aigu.",
                    "Des ondes Q peuventSignaler un infarctus ancien."
                ],
                list: [
                    "Ischémie : définition, ECG",
                    "Infarctus : définition, types, ECG",
                    "Onde Q : signification",
                    "Segment ST : modifications",
                    "Onde T : modifications"
                ]
            } as TextContent
        },
        {
            title: "Hypertrophie ventriculaire et autres anomalies",
            link: "hypertrophie-anomalies",
            content: {
                title: "Hypertrophie ventriculaire et autres anomalies",
                text: [
                    "L'hypertrophie ventriculaire peut modifier l'ECG.",
                    "D'autres anomalies peuvent être visibles sur l'ECG : blocs de branche, péricardite, etc."
                ],
                importantText: [
                    "L'hypertrophie ventriculaire gauche peutSignaler une hypertension artérielle.",
                    "La péricardite peut provoquer des douleurs thoraciques."
                ],
                list: [
                    "Hypertrophie ventriculaire gauche : ECG",
                    "Hypertrophie ventriculaire droite : ECG",
                    "Bloc de branche : types, ECG",
                    "Péricardite : ECG",
                    "Embolie pulmonaire : ECG"
                ]
            } as TextContent
        },
        {
            title: "ECG et urgences cardiologiques",
            link: "ecg-urgences",
            content: {
                title: "ECG et urgences cardiologiques",
                text: [
                    "L'ECG est crucial dans les situations d'urgence cardiologique.",
                    "Il permet de reconnaître les signes de gravité et de prendre les décisions appropriées."
                ],
                importantText: [
                    "En cas de douleur thoracique, un ECG doit être réalisé rapidement.",
                    "L'ECG peut aider à identifier les causes de palpitations ou de syncopes."
                ],
                list: [
                    "Douleur thoracique : ECG",
                    "Palpitations : ECG",
                    "Syncope : ECG",
                    "Arrêt cardiaque : ECG",
                    "Urgence hypertensive : ECG"
                ]
            } as TextContent
        },

        {
            title: "Quiz d'entraînement",
            link: "quiz",
            content: quizContent
          } 
        


        
    ],
    
};