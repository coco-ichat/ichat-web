import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { Setting } from '../Setting';
import { catchError } from 'rxjs/operators';
import { Group } from '../models/Group';
import { environment } from 'src/environments/environment';
import { GroupUser } from '../models/GroupUser';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends BaseService {
    private _url:string = `${environment.apiBaseUrl}Group`;
    /**
     * 获取群组信息
     * @param gid 群组Id
     */
    getInfo(gid:number):Observable<Group>{
        return this.get<Group>(`${environment.apiBaseUrl}Group/${gid}`);
    }
    /**
     * 获取指定的群组用户信息
     * @param gid 群组Id
     * @param userIds 用户Id
     */
    getUsers(gid:number,userIds:number[]):Observable<GroupUser[]>{
        return this.post<GroupUser[]>(`${this._url}/GetUsers`,{gid,userIds});
    }
    /**
     * 创建群组
     * @param name 群组名称
     * @param head 群组头像
     * @param userIds 群成员Id
     */
    create(name:string,head:string,userIds:number[]){
        return this.http.put(`${environment.apiBaseUrl}Group/Create`,{name,head,userIds},this.httpOptions).pipe(catchError(this.handleError));
    }
    /**
     * 群组静音
     * @param gid 群组Id
     * @param isMute 是否静音
     */
    setMute(gid:number,isMute:boolean){
        return this.http.post(`${environment.apiBaseUrl}Group/Mute`,{gid,isMute},this.httpOptions).pipe(catchError(this.handleError));
    }
    /**
     * 退出群组
     * @param gid 群组Id
     */
    leave(gid:number){
        return this.post(this._url+"/Leave",gid);
    }

    /**
     * 修改群组名称
     * @param gid 群组Id
     * @param name 群名称
     */
    updateName(gid:number,name:string){
        return this.post(this._url+"/Name",{gid,name});
    }
    /**
     * 修改群组简介
     * @param gid 群组Id
     * @param description 群组简介 
     */
    updateDescription(gid:number,description:string){
        return this.post(this._url+"/Description",{gid,description});
    }

    /**
     * 修改群组头像
     * @param gid 群组id
     * @param head 群组头像
     */
    updateHead(gid:number,head:string){
        return this.post(this._url+"/Head",{gid,head});
    }

    /**
     * 设置管理员
     * @param gid 群组id
     * @param uid 成员id
     */
    setAdmin(gid:number,uid:number){
        return this.post(this._url+"/SetAdmin",{gid,uid});
    }

    /**
     * 删除管理员
     * @param gid 群组id
     * @param uid 成员id
     */
    deleteAdmin(gid:number,uid:number){
        return this.post(this._url+"/RemoveAdmin",{gid,uid});
    }

    /**
     * 邀请用户进群
     * @param gid 群组id
     * @param uid 成员id
     */
    invite(gid:number,userIds:number[]){
        return this.post(this._url+"/Invite",{gid,userIds});
    }

    /**
     * 移除群成员
     * @param gid 群组id
     * @param uid 成员id
     */
    removeUser(gid:number,uid:number){
        return this.post(this._url+"/RemoveUser",{gid,uid});
    }

    /**
     * 解散群组
     * @param gid 群组id
     */
    disband(gid:number){
        return this.delete(`${this._url}/Disband/${gid}`); 
    }

    /**为所有成员清理消息记录 */
    clearHistory(gid:number,msgId:number){
        return this.post(`${this._url}/ClearHistory`,{gid,msgId});
    }
}
