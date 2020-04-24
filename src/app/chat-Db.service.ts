import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatDbService {

constructor() {
   var db = window.indexedDB.open("chat_db");
 }

}
