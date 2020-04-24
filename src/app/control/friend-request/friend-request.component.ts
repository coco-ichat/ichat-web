import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FriendRequestService } from 'src/app/serices/friend-request.service';
import { FriendRequest } from 'src/app/models/FriendRequest';

@Component({
  selector: 'app-friend-request',
  templateUrl: './friend-request.component.html',
  styleUrls: ['./friend-request.component.less']
})
export class FriendRequestComponent{


  constructor(
    public dialogRef:MatDialogRef<FriendRequestComponent>,
    private friendReqService:FriendRequestService,
    ) { 
    this.friendReqService.getList().subscribe(x=>{
      if(x&&x.length>0){
        this.friendRequests = x;
      }
    })
  }
  friendRequests:FriendRequest[];
  close(){
    this.dialogRef.close();
  }

  /**
   * 接收好友请求
   * @param model 好友请求
   */
  sendFriendReq(model:FriendRequest){
    this.friendReqService.agree(model.id).subscribe(x=>{
        model.status = 1;
    });
  }
}
