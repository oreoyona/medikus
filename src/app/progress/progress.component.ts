import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';



export interface ProjectTask{
  name: string,
  importance: "urgent"|"normale"|"pas urgent",
  etat: "en cours"| "pas encore commencé" | "terminé"
  responsable: string,

}
const TASK_DATA: ProjectTask[] = [
  {name: "Implementer l'interoperabilite sur plusieurs mobiles pour un utilisateur donne", importance: 'urgent', etat: 'en cours', responsable: 'Dr Chabu'},
  {name: "Creer un spiner pour toute l'application", importance: 'pas urgent', etat: 'pas encore commencé', responsable: "Dr Chabu"},
  {name: "Configurer un service d'authentification", importance: 'urgent', etat: 'pas encore commencé', responsable: "Dr Chabu"},
  {name: "Configurer un service d'inscription aux cours", importance: 'urgent', etat: 'pas encore commencé', responsable: "Dr Chabu"},
  {name: "Configurer un service de suivi de progression des cours", importance: 'urgent', etat: 'pas encore commencé', responsable: "Dr Chabu"},
  {name: "Configurer le modele User", importance: 'urgent', etat: 'en cours', responsable: "Dr Chabu"},
  {name: "Completer la page Single-Cours", importance: 'normale', etat: 'en cours', responsable: "Dr Chabu"},
  {name: 'Construire les page LOGIN/INSCRIPTION', importance: "urgent", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Construire la page CATALOGUE', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Construire la page APPRENDRE/COURS-ID', importance: "urgent", etat: "terminé", responsable: "Dr Chabu"},

  {name: 'Construire la page APPRENDRE', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'construire la page CONTACT', importance: "normale", etat: "terminé", responsable: "Dr Chabu"},
  {name: 'Construire la page A PROPOS', importance: "normale", etat: "terminé", responsable: "Dr Chabu"},
  {name: 'Construire la page LE BLOG', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page ABONNEMENT', importance: "urgent", etat: "en cours", responsable: "Dr Chabu, Medikus pour le texte"},
  {name: 'Construire la page PROCHAINES ACTIVITES', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page NOUS REJOINDRE', importance: "normale", etat: "terminé", responsable: "Dr Chabu"},
  {name: 'Construire la page BLOG', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Ajouter un lien aux icones sociales', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Construire une API: base de donnees', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Construire une API: routes', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Construire une API: cours', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Publier le site web', importance: "urgent", etat: "pas encore commencé", responsable: "Medikus"}










]
@Component({
  selector: 'app-progress',
  imports: [MatTableModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent {

  displayedColumns = ['name', 'importance', 'etat', 'responsable'];
  dataSource = TASK_DATA;

}
