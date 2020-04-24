import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { FriendRequest } from '../models/FriendRequest';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestService extends BaseService {
    private readonly _url:string = `${environment.apiBaseUrl}FriendRequest`;
    /**
     * 获取好友请求列表
     */
    getList():Observable<FriendRequest[]>{
        return this.get<FriendRequest[]>(this._url);
    }
    /**
     * 发送好友请求
     * @param friendId 好友Id 
     */
    create(friendId:number){
        return this.put(this._url,{friendId});
    }
    /**
     * 同意好友请求
     * @param rid 请求Id
     */
    agree(rid:number):Observable<Date>{
        return this.post<Date>(this._url,rid);
    }

    /**
     * 
     * @param rid 请求Id
     */
    deleteModel(rid:number){
        return this.delete(this._url+"/"+rid);
    }
}
