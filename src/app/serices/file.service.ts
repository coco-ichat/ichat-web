import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { Setting } from '../Setting';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService extends BaseService {
    httpOptions2 = {
      headers: new HttpHeaders({
        'Accept':'application/json',
        'Authorization': `Bearer ${Setting.Token}`
      })
    };
    upload(file:File):Observable<string>{
        let formData = new FormData();
        formData.append('file',file);
        return this.http.post<string>(`${environment.apiBaseUrl}File`,formData,this.httpOptions2).pipe(catchError(this.handleError));
    }
}
