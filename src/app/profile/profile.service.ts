import { Injectable } from '@angular/core';

interface cours{
  id: string,
  name: string,
  enseignant: string,
  photo?: string
}
interface certificat{
  id: string
  name: string,
  type: "participation" | "réussite",
  date: Date,
  courseTitle: string | cours

}

export interface Profile{
  name: string,
  titre: string,
  education: certificat[] | string[],
  cours: cours[] | string[],
  photo?: string
}



@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  today = new Date()

  gloireCertificats: certificat = {
    id: "12fffD",
    name: "Dr Kilembi Chabu Magloire",
    type: "participation",
    date: this.today,
    courseTitle: "Maitriser l'ECG pour les nuls",

  }
  user: Profile = {
    name:"Gloire Chabu",
    titre: "Dr",
    education: [this.gloireCertificats, this.gloireCertificats, this.gloireCertificats],
    cours: ["Maitriser les techniques d'echo pour les anesthesistes", "Gestion de Projet pour les medecins"]
  }
  
  constructor() { }
}
