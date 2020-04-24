import { Injectable } from '@angular/core';
import {HubConnection,HubConnectionBuilder,IHttpConnectionOptions} from '@aspnet/signalr';
import { ManagerService } from './manager.service';
import { Message } from './models/Message';
import { Setting } from './Setting';
import { FriendRequest } from './models/FriendRequest';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DataDialogComponent } from './control/data-dialog/data-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public static connection:HubConnection;
  private connectionOptions:IHttpConnectionOptions;
  //消息提示音
  private tipAudio:HTMLAudioElement;

  constructor(public managerService:ManagerService,public dialog:MatDialog) { 
    this.connectionOptions={accessTokenFactory:()=>{return Setting.Token;}};
    ChatService.connection = new HubConnectionBuilder().withUrl(environment.chatUrl,this.connectionOptions).build();
    ChatService.connection.start().then(()=>{
        console.log("服务器连接成功");
    });
    ChatService.connection.onclose(async(error)=>{
      console.log(error);
      console.log("服务器断开连接成功,等待自动连接");
      await this.start();
    });

    //------------- 通知接口API START -------------//
    ChatService.connection.on("ReceiveMessage",this.receiveMessage);                  //接收消息
    ChatService.connection.on("ReceiveFriendReq",this.receiveFriendReq);              //接收好友请求
    ChatService.connection.on("PinTop",this.pinTop);                                  //会话置顶
    ChatService.connection.on("DeleteConversation",this.deleteConversation);          //删除会话
    ChatService.connection.on("MuteUser",this.muteUser);                              //静音用户
    ChatService.connection.on("MuteGroup",this.muteGroup);                            //静音群组
    ChatService.connection.on("UpdateGroupInfo",this.updateGroupInfo);                //修改群组信息
    ChatService.connection.on("Disband",this.disband);                                //解散群组
    ChatService.connection.on("RemoveFriend",this.removeFriend);                      //被好友移除
    ChatService.connection.on("RemoveContact",this.removeContact);                    //删除好友
    ChatService.connection.on("UpdateInfo",this.updateInfo);                          //修改个人信息
    ChatService.connection.on("RemoveMessages",this.removeMessages);                  //删除聊天信息
    ChatService.connection.on("DeleteFriendRequest",this.deleteFriendRequest);        //删除好友请求
    ChatService.connection.on("SetRead",this.setRead);                                //设置会话已读
    ChatService.connection.on("SetRemark",this.setRemark);                            //设置好友备注
    ChatService.connection.on("ClearHistory",this.clearHistory);                      //同步其它设备删除会话消息
    ChatService.connection.on("ClearGroupHistory",this.clearGroupHistory);            //删除群组消息
    //------------- 通知接口API END -------------//
    //------------- 加载消息提示音 START -------------//
    this.tipAudio = document.createElement('audio');
    this.tipAudio.src = '/assets/sound/tip.mp3';
    this.tipAudio.load();
    //------------- 加载消息提示音 END -------------//
  }
  private async start(){
    try{
      await ChatService.connection.start();
      this.managerService.ReConnectioned.next(true);
      console.log("重新连接成功！");
    }catch(error){
      console.log("重新连接失败，5S后自动重连...");
      setTimeout(() => {
        this.start();
      }, 5000);
    }
  }

  isMute:boolean = true;
  /**
   * 接收消息通知
   * @param data 消息
   * @param conversationId 会话Id
   * @param head 发送人头像
   * @param nickName 发送人昵称
   */
  private receiveMessage=(data:Message,conversationId:number,head:string,nickName:string)=>{
    //非消息同步播放提示音
    if(data.userId!=Setting.UserId){
      let playPromise = this.tipAudio.play();
      if (playPromise !== undefined) {
          playPromise.then(() => {
            this.tipAudio.play();
          }).catch(()=> {  
            if(this.isMute){
              this.isMute = false;
              this.dialog.open(DataDialogComponent,{data:'当前消息提示声音未开启，点击开启'});
            } 
          })
      }
    }
    this.managerService.updateConversation.next({message:data,conversationId,head,nickName});
  }
  /**
   * 好友请求
   * @param request 好友请求
   */
  private receiveFriendReq=(request:FriendRequest)=>{
    let playPromise = this.tipAudio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
          this.tipAudio.play();
        }).catch(()=> {  
          if(this.isMute){
            this.isMute = false;
            this.dialog.open(DataDialogComponent,{data:'当前消息提示声音未开启，点击开启'});
          } 
        })
    }
    this.managerService.setFriendRequest.next(request);
  }
  /**
   * 会话置顶
   * @param conversationId 会话Id
   * @param isPinTop 是否置顶
   */
  private pinTop=(conversationId:number,isPinTop:boolean)=>{
    this.managerService.pinTopConversation.next({conversationId,isPinTop});
  }
  /**
   * 删除会话
   * @param conversationId 会话Id
   */
  private deleteConversation=(conversationId:number)=>{
    this.managerService.deleteConversation.next(conversationId);
  }
  /**
   * 好友消息免打扰
   * @param uid 好友Id
   * @param isMute 是否静音
   */
  private muteUser=(uid:number,isMute:boolean)=>{
    this.managerService.muteFriend.next({uid,isMute});
  }
  /**
   * 群组消息免打扰
   * @param gid 群组Id
   * @param isMute 是否静音
   */
  private muteGroup=(gid:number,isMute:boolean)=>{
    this.managerService.muteGroup.next({gid,isMute});
  }
  /**
   * 修改群组信息
   * @param gid 群组Id
   * @param property 要修改的属性名称
   * @param value 属性值
   */
  private updateGroupInfo=(gid:number,property:string,value:string)=>{
    this.managerService.updateGroupInfo.next({gid,property:GroupInfo[property],value});
  }
  /**
   * 解散群组
   * @param gid 群组Id
   */
  private disband=(gid:number)=>{
    this.managerService.disband.next(gid);
  }
  /**
   * 对方删除自己
   * @param uid 好友Id
   */
  private removeFriend=(uid:number)=>{
    this.managerService.removeFriend.next(uid);
  }
  /**
   * 删除联系人
   * @param uid 联系人Id
   */
  private removeContact=(uid:number)=>{
    this.managerService.removeContact.next(uid);
  }
  /**
   * 修改个人信息
   * @param property 要修改的属性名称
   * @param value 属性值
   */
  private updateInfo=(property:string, value:string)=>{
    this.managerService.updateInfo.next({property:UserInfo[property],value});
  }
  /**
   * 删除聊天消息
   * @param ids 消息Id
   */
  private removeMessages=(ids:number[])=>{
    this.managerService.removeMessages.next(ids);
  }
  /**
   * 删除好友请求
   * @param rid 请求Id
   */
  private deleteFriendRequest=(rid:number)=>{
    this.managerService.deleteFriendRequest.next(rid);
  }
  /**
   * 设置会话已读
   * @param conversationId 会话Id
   */
  private setRead=(conversationId:number)=>{
      this.managerService.conversationSetRead.next(conversationId);
  }
  /**
   * 设置好友备注
   * @param fid 好友Id
   * @param remark 备注
   */
  private setRemark=(fid:number,remark:string)=>{
      this.managerService.setFriendRemark.next({fid,remark});
  }

  /**
   * 同步其它设备清除会话消息
   */
  private clearHistory=(conversationId:number,msgId:number)=>{
      this.managerService.syncClearHistory.next({conversationId,msgId});
  }

  /**
   * 同步服务器删除群组会话
   */
  private clearGroupHistory=(gid:number,msgId:number)=>{
    this.managerService.syncClearGroupHistory.next({gid,msgId});
  }

}

export enum GroupInfo{
    Description,Head,Name
}

export enum UserInfo{
  Head,NickName,Sex
}