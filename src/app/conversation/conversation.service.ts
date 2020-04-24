import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Conversation } from '../models/Conversation';
import { BaseService } from '../base.service';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})

export class ConversationService extends BaseService {
  private _url = `${environment.apiBaseUrl}Conversation`;
  /**
   * 获取会话列表
   */
  GetList():Observable<Conversation[]>{
    return this.http.get<Conversation[]>(this._url,this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * 获取群组会话
   * @param gid 群组Id
   */
  getGroupConversation(gid:number):Observable<Conversation>{
    return this.get<Conversation>(`${this._url}/${gid}`);
  }

  /**
   * 设置置顶
   * @param conversationId 会话Id
   * @param isPinTop 是否置顶
   */
  setPinTop(conversationId:number,isPinTop:boolean){
    return this.http.post(`${this._url}/PinTop`,{conversationId,isPinTop},this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * 删除会话
   * @param conversationId 会话Id
   */
  deleteModel(conversationId:number){
     return this.delete(`${this._url}/${conversationId}`);
  }
  
  /**
   * 设置会话已读
   * @param conversationId 会话Id
   */
  setRead(conversationId:number,msgId:number){
    return this.post(this._url+"/SetRead",{conversationId,msgId});
  }
  
  /**
   * 清空会话消息记录
   * @param conversationId 会话Id
   * @param msgId 消息id
   */
  clearHisotry(conversationId:number,msgId:number){
    return this.post(this._url+"/ClearHistory",{conversationId,msgId});
  }
}
