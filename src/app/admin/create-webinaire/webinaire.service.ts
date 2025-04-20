import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { baseUrl, webinaireBaseUrl } from "../../urls";
import { Webinaire } from "../../common/infercaces";



@Injectable({
    providedIn: 'root'

})
export class WebinaireService {

    http = inject(HttpClient)

    /**
     * Creates a webinaire 
     * @param webinaire the Webinaire Object to post 
     */
    createWebinaire(webinaire: Webinaire) {
        console.log(webinaireBaseUrl)
        return this.http.post(webinaireBaseUrl, { 'data': webinaire })
    }

    /**
     * get all the webinaires from the database
     */

    getWebinaires() {
        return this.http.get(webinaireBaseUrl)
    }

    /**
     * @param webinaireId 
     */
    getWebinaire(webinaireId: number) {
        return this.http.get(`${webinaireBaseUrl}/${webinaireId}`)
    }


    /** Edits a webinaire by making a PUT request
     * @param  webinaire The Webinaire object
     * @param webinaireId
     */
    editWebinaire(id: number, webinaire: Webinaire) {
        const editWebinaireUrl = `${baseUrl}webinaires/${id}`
        return this.http.put(editWebinaireUrl, webinaire)
    }


    /**
     * Deletes a webinaire
     * @param id - the webinaire to delete
     */
    deleteWebinaire(id: number){
        return this.http.delete(`${webinaireBaseUrl}/${id}`)
    }

    


}