import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { GroupUser } from '../models/GroupUser';
import { Setting } from '../Setting';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupUserService extends BaseService {
    getUsers(gid:number):Observable<GroupUser[]>{
        return this.http.get<GroupUser[]>(`${environment.apiBaseUrl}Group/GetGroupUsers/${gid}`,this.httpOptions).pipe(catchError(this.handleError));
    }
}
