import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Friend } from 'src/app/models/Friend';
import { FriendService } from 'src/app/serices/friend.service';
import { HttpClient } from '@angular/common/http';
import { ManagerService } from 'src/app/manager.service';
import { IChatUsers, StaticUser } from 'src/app/Users';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.less']
})
export class ContactDialogComponent{
  @ViewChild("remark",{static:false}) remarkContainer:ElementRef;
  @ViewChild("input",{static:false}) txtRemark:ElementRef;
  content:string="";
  constructor(private http:HttpClient,
    public dialogRef:MatDialogRef<ContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public contact:Friend,
    public managerService:ManagerService,
    public friendService:FriendService,
    public dialog:MatDialog) { 
    if(this.contact.remark&&this.contact.remark.length>0){
      this.content = this.contact.remark;
    }
  }

  setRemark(){
      this.remarkContainer.nativeElement.style.display="none";
      this.txtRemark.nativeElement.style.display = "inline-block";
      this.txtRemark.nativeElement.focus();
      // var input = document.createElement("input");
      // input.value = this.contact.remark;
      // this.remarkContainer.nativeElement.innerHTML = input.outerHTML;
  }
  input_blur(){
    var oldValue = this.contact.remark==null?this.contact.nickName:this.contact.remark;
    var value = this.content.trimLeft().trimRight();
    value = value==""?null:value;
    if(value!=this.contact.remark){
      this.contact.remark = value;
      this.friendService.setRemark(this.contact.friendId,this.contact.remark).subscribe();
      this.managerService.sortContact.next({model:this.contact,oldValue:oldValue});
      //更新备注信息
      this.managerService.setFriendRemark.next({fid:this.contact.friendId,remark:value});
      IChatUsers.setItem(new StaticUser(this.contact.friendId,this.contact.head,value));
    }
    this.remarkContainer.nativeElement.style.display="initial";
    this.txtRemark.nativeElement.style.display = "none";
  }
  /**
   * 发送消息
   */
  sendMessage(){
    this.managerService.newConversation.next(this.contact);
    this.dialogRef.close();
  }
  /**
   * 删除好友
   */
  deleteContact(){
    let confirmDialog = this.dialog.open(ConfirmDialogComponent,{panelClass:'confirmPanel',data:`确定删除 ${this.contact.nickName}?`,disableClose:true});
    confirmDialog.afterClosed().subscribe(x=>{
      if(!x) return;
      this.friendService.deleteModel(this.contact.friendId).subscribe(x=>{
          this.managerService.removeContact.next(this.contact.friendId);
          this.dialogRef.close();
      });
    });
  }

  close(){
    this.dialogRef.close();
  }
  
}
