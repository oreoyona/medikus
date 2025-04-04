import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { webinaireBaseUrl } from "../../urls";
import { Webinaire } from "../../common/infercaces";



@Injectable({
    providedIn: 'root'

})
export class WebinaireService{

    http = inject(HttpClient)

    /**
     * Creates a webinaire 
     * @param webinaire the Webinaire Object to post 
     */
    createWebinaire(webinaire: Webinaire){
        console.log(webinaireBaseUrl)
        return this.http.post(webinaireBaseUrl, {'data': webinaire})
    }

    /**
     * get all the webinaires from the database
     */

    getWebinaires(){
        return this.http.get(webinaireBaseUrl)
    }

    /**
     * @param webinaireId 
     */
    getWebinaire(webinaireId: number){
        return this.http.get(`${webinaireBaseUrl}${webinaireId}`)
    }


}