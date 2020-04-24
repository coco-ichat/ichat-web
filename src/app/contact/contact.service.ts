import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { Setting } from '../Setting';
import { Friend } from '../models/Friend';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService extends BaseService {
    GetFriends():Observable<Friend[]>{
        return this.http.get<Friend[]>(`${environment.apiBaseUrl}Friend`,this.httpOptions).pipe(catchError(this.handleError));
    }

}
