import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { Message } from '../models/Message';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Setting } from '../Setting';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService extends BaseService {
    /**
     * 获取历史消息
     * @param msgId 最后一条消息Id
     * @param rid 接收人Id
     * @param gid 接收群组Id
     * @param count 获取数量：默认50
     * @param order 时间排序，默认DESC,0:DESC,1:ASC
     */
    getHistory(msgId:number=0,rid:number=0,gid:number=0,count:number=50,order:number=0):Observable<Message[]>{
      return this.http.get<Message[]>(`${environment.apiBaseUrl}Message/History/${msgId}?rid=${rid}&gid=${gid}&count=${count}&order=${order}`,this.httpOptions).pipe(catchError(this.handleError));
    }
}
