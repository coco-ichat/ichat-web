import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FriendService } from 'src/app/serices/friend.service';
import { Setting } from 'src/app/Setting';
import { DataDialogComponent } from '../data-dialog/data-dialog.component';
import { FriendRequestService } from 'src/app/serices/friend-request.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.less']
})
export class AddFriendComponent{
  constructor(
    public dialog:MatDialog,
    public dialogRef:MatDialogRef<AddFriendComponent>,
    private friendService:FriendService,
    private friendReqService:FriendRequestService,
    ) { }
  key:string='';
  model:SearchUserModel;
  isEmpty:boolean=false;
  isEmail:boolean=false;
  isAdd:boolean = false;
  onSearch(){
      this.key = this.key.trimLeft().trimRight();
      if(this.key.length==0) return;
      this.friendService.search(this.key).subscribe(data=>{
          this.model = data;
          if(this.model == null){
            this.isEmpty = true;
          }else{
            this.isEmail = (this.key.indexOf('@')>0);
            this.isEmpty = false;
            this.isAdd = false;
          }
      });
  }

  sendFriendReq(){
    this.isAdd = true;
    if(this.model.id==Setting.UserId){
      this.dialog.open(DataDialogComponent,{data:"不能添加自己为好友"});
      return;
    }
    this.friendReqService.create(this.model.id).pipe(catchError(error=>{
      if(error.status == 400){
        if(error.error.message){
            this.dialog.open(DataDialogComponent,{data:error.error.message});
        }
      }
      return throwError("");
    })).subscribe(x=>{});
  }

  onClear(){
    this.key = '';
  }

  close(){
    this.dialogRef.close();
  }
}

export class SearchUserModel{
  id:number;
  nickName:string;
  phone:string;
  head:string;
  email:string;
}