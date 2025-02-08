import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from "../common/header/header.component";


export interface ProjectTask{
  name: string,
  importance: "urgent"|"normale"|"pas urgent",
  etat: "en cours"| "pas encore commencé" | "terminé"
  responsable: string,

}
const TASK_DATA: ProjectTask[] = [
  {name: 'Construire la page APPRENDRE', importance: "normale", etat: "en cours", responsable: "Dr Chabu"},
  {name: 'Construire la page A PROPOS', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page CONTACT', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page LE BLOG', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page ABONNEMENT', importance: "urgent", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page PROCHAINES ACTIVITES', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page NOUS REJOINDRE', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page BLOG', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Ajouter un lien aux icones sociales', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire la page CATALOGUE', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire une API: base de donnees', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire une API: routes', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Construire une API: cours', importance: "normale", etat: "pas encore commencé", responsable: "Dr Chabu"},
  {name: 'Publier le site web', importance: "urgent", etat: "pas encore commencé", responsable: "Medikus"}










]
@Component({
  selector: 'app-progress',
  imports: [MatTableModule, HeaderComponent],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent {

  displayedColumns = ['name', 'importance', 'etat', 'responsable'];
  dataSource = TASK_DATA;

}
