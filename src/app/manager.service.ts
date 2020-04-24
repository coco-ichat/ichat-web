import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Conversation } from './models/Conversation';
import { Message } from './models/Message';
import { Friend } from './models/Friend';
import { FriendRequest } from './models/FriendRequest';
import { GroupInfo, UserInfo } from './chat.service';

@Injectable({providedIn: 'root'})
export class ManagerService {
    /**当前会话 */
    public conversation:BehaviorSubject<Conversation> = new BehaviorSubject<Conversation>(new Conversation());
    /**当前消息列表 */
    public addMessage:BehaviorSubject<Message> = new BehaviorSubject<Message>(new Message()); 
    /**更新会话列表中会话的信息 */
    public updateConversation:BehaviorSubject<any> = new BehaviorSubject<any>({});
    /**显示会话详细信息 */
    public showConversationDetail:BehaviorSubject<Conversation> = new BehaviorSubject<Conversation>(new Conversation());
    /**联系人列表重新排序 */
    public sortContact:BehaviorSubject<{model:Friend,oldValue:string}> = new BehaviorSubject<{model:Friend,oldValue:string}>({model:new Friend(),oldValue:''});
    /**同步其它设备会话已读 */
    public conversationSetRead:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    /**设置好友请求数 */
    public setFriendRequest:BehaviorSubject<FriendRequest> = new BehaviorSubject<FriendRequest>(null);
    /**接收其它设备删除会话的请求 */
    public deleteConversation:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    /**设置置顶 */
    public pinTopConversation:BehaviorSubject<{conversationId:number,isPinTop:boolean}> = new BehaviorSubject<{conversationId:number,isPinTop:boolean}>(null);
    /**设置好友会话静音 */
    public muteFriend:BehaviorSubject<{uid:number,isMute:boolean}> = new BehaviorSubject<{uid:number,isMute:boolean}>(null);
     /**设置群组会话静音 */
    public muteGroup:BehaviorSubject<{gid:number,isMute:boolean}> = new BehaviorSubject<{gid:number,isMute:boolean}>(null);
    /**修改群组信息 */
    public updateGroupInfo:BehaviorSubject<{gid:number,property:GroupInfo,value:string}> = new BehaviorSubject<{gid:number,property:GroupInfo,value:string}>(null); 
    /**解散群组 */
    public disband:BehaviorSubject<number> = new BehaviorSubject<number>(null);
    /**对方删除自己 */
    public removeFriend:BehaviorSubject<number> = new BehaviorSubject<number>(null);
    /**删除联系人 */
    public removeContact:BehaviorSubject<number> = new BehaviorSubject<number>(null);
    /**修改个人信息 */
    public updateInfo:BehaviorSubject<{property:UserInfo, value:string}> = new BehaviorSubject<{property:UserInfo, value:string}>(null);
    /**删除聊天消息 */
    public removeMessages:BehaviorSubject<number[]> = new BehaviorSubject<number[]>(null);
    /*#删除好友请求*/
    public deleteFriendRequest:BehaviorSubject<number> = new BehaviorSubject<number>(null);
    /**设置好友备注 */
    public setFriendRemark:BehaviorSubject<{fid:number,remark:string}> = new BehaviorSubject<{fid:number,remark:string}>(null);
    /**开始新的会话 */
    public newConversation:BehaviorSubject<Friend> = new BehaviorSubject<Friend>(null);
    /**向会话列表添加一个新的会话 */
    public addConversation:BehaviorSubject<Conversation> = new BehaviorSubject<Conversation>(null);
    /**本地请求删除会话 */
    public removeConversation:BehaviorSubject<Conversation> = new BehaviorSubject<Conversation>(null);
    /**清空会话消息 */
    public clearHistory:BehaviorSubject<{conversation:Conversation,isAll?:boolean}> = new BehaviorSubject<{conversation:Conversation,isAll?:boolean}>(null);
    /**同步清空会话消息 */
    public syncClearHistory:BehaviorSubject<{conversationId:number,msgId:number}> = new BehaviorSubject<{conversationId:number,msgId:number}>(null);
    /**同步清理群组历史记录 */
    public syncClearGroupHistory:BehaviorSubject<{gid:number,msgId:number}> = new BehaviorSubject<{gid:number,msgId:number}>(null);
    /**断线重连更新会话 */
    public ReConnectioned:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);    
}
