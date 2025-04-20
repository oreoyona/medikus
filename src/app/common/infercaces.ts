// Définition des interfaces pour les différents types de contenu
export interface Video {
    title: string;
    description: string;
    videoLink: string;
    videoId?: string;

}
export interface ServerResponse{
    message: string | number
    courseId?: string | number
}
 


export type role = "subscriber" | "admin" | "editor" | "instructor"
export interface User{
    id: string | number,
    password?: string,
    role?: role,
    name?: string,
    email?: string,
    imgUrl?: string,
    username?: string,
    courses?: Array<number>,
    


}

export interface rubanObject {
  icon: String;
  title: String;
  link?: any;
  value?: number;
  chartData?: any;
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

export interface Webinaire{
    title: string,
    id?: string | number,
    description?: string,
    instructor?: string,
    videoLink?: string,
    imageUrl?: string,
    inscriptionLink?: string,
    date?: string | Date,
    endDate?: string | Date,

}
  