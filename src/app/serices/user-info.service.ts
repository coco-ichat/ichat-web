import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Setting } from '../Setting';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserInfoService extends BaseService {
    private _url = `${environment.apiBaseUrl}UserInfo`;

    /**
     * 获取当前登录用户的个人信息
     */
    getInof():Observable<{id:number,nickName:string,phone:string,head:string,email:string}>{
        return this.get<{id:number,nickName:string,phone:string,head:string,email:string}>(this._url);
    }
    /**
     * 修改个人昵称
     * @param value 新的昵称
     */
    updateNickName(value:string){
       return this.post(this._url+"/NickName",JSON.stringify(value));
    }

    /**
     * 修改性别
     * @param value 性别
     */
    updateSex(value:number){
        return this.post(this._url+"/Sex",value);
    }

    /**
     * 修改头像
     * @param value 头像
     */
    UpdateHead(value:string){
        return this.post(this._url+"/Head",JSON.stringify(value));
    }
}
