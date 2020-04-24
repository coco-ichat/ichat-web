import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ManagerService } from '../manager.service';
import { Conversation } from '../models/Conversation';
import { GroupUserService } from './group-user.service';
import { HttpClient } from '@angular/common/http';
import { GroupUser } from '../models/GroupUser';
import { GroupService } from '../serices/group.service';
import { FriendService } from '../serices/friend.service';
import { ConversationService } from '../conversation/conversation.service';
import { Setting } from '../Setting';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../control/confirm-dialog/confirm-dialog.component';
import { ScrollBar } from '../control/scrollBar';
import { InviteGroupDialogComponent } from '../control/invite-group-dialog/invite-group-dialog.component';
import { DataDialogComponent } from '../control/data-dialog/data-dialog.component';
import { ImgCropperComponent } from '../control/img-cropper/img-cropper.component';
import { FileService } from '../serices/file.service';
import { LoadingDialogComponent } from '../control/loading-dialog/loading-dialog.component';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConfirmCheckboxDialogComponent } from '../control/confirm-checkbox-dialog/confirm-checkbox-dialog.component';
import { GroupAdminComponent } from '../control/group-admin/group-admin.component';

@Component({
  selector: 'app-conversation-detail',
  templateUrl: './conversation-detail.component.html',
  styleUrls: ['./conversation-detail.component.less']
})
export class ConversationDetailComponent implements OnInit,AfterViewInit {
 
  conversation:Conversation;
  groupUsers:GroupUser[];
  title:string;
  isCreator:boolean = false;
  isAdmin:boolean = false;
  isShow:boolean = false;
  admins:GroupUser[]=[];
  constructor(
    public managerService:ManagerService,
    public groupUserService:GroupUserService,
    public groupService:GroupService,
    public friendService:FriendService,
    public conversationService:ConversationService,
    public dialog:MatDialog,
    public fileService:FileService
    ) { }

  ngOnInit() {
      this.managerService.showConversationDetail.subscribe(x=>{
          this.admins = [];
          if(x&&(x.receiverId>0||x.groupId>0)){
            let box:HTMLScriptElement = <HTMLScriptElement>document.getElementsByClassName("chatBox").item(0);
            box.style.width="1110px";
            setTimeout(()=>{
              box.style.minWidth="1110px";
            },400);
            this.isShow = true;
            this.conversation = x;
            if(x.groupId>0){
                this.title = "群组信息";
                this.groupService.getInfo(x.groupId).subscribe(data=>{
                    if(Setting.UserId == data.creator){
                      this.isCreator = true;
                      this.isAdmin = true;
                    }
                    this.groupUserService.getUsers(x.groupId).subscribe(data=>{
                      this.groupUsers = data;
                      this.groupUsers.forEach(x=>{
                        if(x.isAdmin){
                          this.admins.push(x);
                        }
                        if(x.userId == Setting.UserId&&x.isAdmin == true){
                          this.isAdmin = true;
                        }
                      })
                    });
                });
               
            }else{
              this.title="个人信息";
            }
          }else{
            let box:HTMLScriptElement = <HTMLScriptElement>document.getElementsByClassName("chatBox").item(0);
            box.style.width="860PX";
            box.style.minWidth="860px";
            this.isShow = false;
            setTimeout(()=>{
              this.conversation = null;
            },400);
          }

      });
  }

  @ViewChild("scroll",{static:false}) scrollBar:ElementRef;
  ngAfterViewInit(): void {
     let scroll = new ScrollBar(this.scrollBar.nativeElement);
  }

  /**
   * 修改群组头像
   */
  updateHead(){
    var input = document.createElement("input");
    input.type = "file";
    input.click();
    input.onchange = ()=>{
      var file = input.files[0];
      if(file.type.indexOf("image/")==-1){
        this.dialog.open(DataDialogComponent,{data:"请选择图片上传"});
      }else{
        let resultDialog = this.dialog.open(ImgCropperComponent,{panelClass:'imgCropperPanel',data:file,disableClose:true});
        resultDialog.afterClosed().subscribe(result=>{
          if(result){
            let file = result.data;
            var arr = file.split(','), mime = arr[0].match(/:(.*?);/)[1],bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            var uploadFile = new File([u8arr],`${(new Date()).getTime()}.png`);
            this.fileService.upload(uploadFile).subscribe(data=>{
                this.conversation.head = data;
                this.groupService.updateHead(this.conversation.groupId,data).subscribe(x=>{});
            });
          }
        });
      }
      
    }
  }

  /**
   * 修改群组名称
   */
  updateName(event:MouseEvent){
      if(!(this.conversation.groupId>0)) return;
      let parentView = (<HTMLDivElement>event.target).parentElement;
      let editView = (<HTMLElement>(<HTMLDivElement>event.target).previousElementSibling);
      parentView.className += " focus";
      editView.contentEditable = "true";
      editView.focus();
      document.getSelection().getRangeAt(0).setStart(document.getSelection().getRangeAt(0).startContainer,this.conversation.name.length);
      editView.onblur = ()=>{
        parentView.className = "conversation-name";
        editView.contentEditable = "false";
        editView.onblur = null;
        editView.onpaste = null;
        let text =editView.textContent.substr(0,20);
        if(text.trim().length==0) {
          editView.textContent = this.conversation.name;
          return;
        }
        if(text.trim()==this.conversation.name) return;
        this.conversation.name = text;
        this.groupService.updateName(this.conversation.groupId,text).subscribe(x=>{});
      }
      editView.onpaste=()=>{
        return false;
      }
  }

  /**
   * 邀请新成员
   */
  inviteUser(){
     let inviteDialog = this.dialog.open(InviteGroupDialogComponent,{panelClass:'inviteGroupPanel',data:{groupUsers:this.groupUsers,groupId:this.conversation.groupId}});
     inviteDialog.afterClosed().subscribe((x:number[])=>{
        if(x&&x.length>0){
          this.groupService.getUsers(this.conversation.groupId,x).subscribe(y=>{
            if(y&&y.length>0){
              y.forEach(zz=>{
                this.groupUsers.push(zz);
              });
            }
          })
        }
     });
  }
  /**
   * 删除会话
   */
  deleteConversation(){
    if(this.conversation.id>0){
      if(this.isCreator){
        let resultDialog = this.dialog.open(ConfirmDialogComponent,{panelClass:'confirmPanel',data:{message:`确定要解散群组 ${this.conversation.name} ？`,btnOk:'确定'}});
        resultDialog.afterClosed().subscribe(x=>{
          if(x===true){
              let loadingDialog = this.dialog.open(LoadingDialogComponent,null);
              this.groupService.disband(this.conversation.groupId).pipe(catchError(()=>{
                this.dialog.open(DataDialogComponent,{data:"发生未知错误，请刷新页面重试"});
                loadingDialog.close();
                return throwError("");  
              })).subscribe(x=>{
                loadingDialog.close();
              })
          }
        });
      }else{
        this.managerService.removeConversation.next(this.conversation);
      }
    }
  }
  /**
   * 删除用户
   * @param model GroupUser
   */
  removeUser(event:MouseEvent,model:GroupUser){
      let currentView:HTMLElement;
      if((<HTMLElement>event.target).tagName=="I"){
          currentView = (<HTMLElement>event.target).parentElement.parentElement;
      }else{
          currentView = (<HTMLElement>event.target).parentElement;
      }
      let confirmDialog = this.dialog.open(ConfirmDialogComponent,{panelClass:'confirmPanel',data:`确定移除 ${model.nickName}?`,disableClose:true});
      confirmDialog.afterClosed().subscribe(x=>{
        if(!x) return;
        this.groupService.removeUser(model.groupId,model.userId).subscribe(x=>{});
        this.groupUsers.forEach((item,index)=>{
          if(item.userId == model.userId){
              let left = 0;
              let st = setInterval(()=>{
                left-=10;
                currentView.style.marginLeft = left +"px";
                if(left<=-230)  {  
                  this.groupUsers.splice(index,1);
                  clearInterval(st);
                }
              },30);
              return;
          }
        });
      });
  }
  /**静音 */
  mute(){
    this.conversation.isMute = !this.conversation.isMute;
    if(this.conversation.groupId>0){
       this.groupService.setMute(this.conversation.groupId,this.conversation.isMute).subscribe();
    }else{
       this.friendService.setMute(this.conversation.receiverId,this.conversation.isMute).subscribe();
    }
  }
  /**置顶 */
  top(){
    this.conversation.isPinTop=!this.conversation.isPinTop;
    this.conversationService.setPinTop(this.conversation.id,this.conversation.isPinTop).subscribe();
    this.managerService.updateConversation.next(null);
  }
  /**清空历史对话 */
  clearHistory(){
      if(this.conversation.id>0){
        if(this.isCreator||this.isAdmin){
            let dialogResult = this.dialog.open(ConfirmCheckboxDialogComponent,{panelClass:'confirmCheckboxPanel',data:{message:`您确定要删除群组 ${this.conversation.name} 的所有消息记录吗？`,message2:'为所有人删除',btnOk:'确定'}});
            dialogResult.afterClosed().subscribe(x=>{
                if(x&&x.btn === true){
                  if(x.isCheck===true){
                    this.managerService.clearHistory.next({conversation:this.conversation,isAll:true});
                  }else{
                    this.managerService.clearHistory.next({conversation:this.conversation});
                  }
                }
            });
        }else{
          this.managerService.clearHistory.next({conversation:this.conversation});
        }
      }
  }

  /**管理员管理 */
  editAdmin(){
      this.dialog.open(GroupAdminComponent,{panelClass:"groupAdminPanel",data:{admins:this.admins,groupUsers:this.groupUsers}});
  }
}
