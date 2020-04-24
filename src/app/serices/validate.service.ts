import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Setting } from '../Setting';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({providedIn:'root'})
export class ValidateService extends BaseService {
    private _url:string = `${environment.apiBaseUrl}Validate`
    email(email:string):Observable<boolean>{
      return this.http.get<boolean>(this._url+"/Email?email="+email);
    }
    phone(phone:string):Observable<boolean>{
      return this.http.get<boolean>(this._url+"/Phone?phone="+phone);
    }
}
