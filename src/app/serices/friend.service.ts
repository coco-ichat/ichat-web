import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Setting } from '../Setting';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Friend } from '../models/Friend';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendService extends BaseService {
  private _url = `${environment.apiBaseUrl}Friend`;
  //查的好友
  search(key:string):Observable<Friend>{
    return this.get<Friend>(`${environment.apiBaseUrl}Friend/Search?key=${key}`);
  }
  //设置静音
  setMute(fid:number,isMute:boolean){
    return this.http.post(`${environment.apiBaseUrl}Friend/Mute`,{fid,isMute},this.httpOptions).pipe(catchError(this.handleError));
  }
  //设置备注
  setRemark(fid:number,remark:string){
    return this.http.post(`${environment.apiBaseUrl}Friend/Remark`,{fid,remark},this.httpOptions).pipe(catchError(this.handleError));
  }

  //删除好友
  deleteModel(uid:number){
    return this.delete(`${this._url}/${uid}`);
  }
}
