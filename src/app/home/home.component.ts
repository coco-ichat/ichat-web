import { Component, OnInit, LOCALE_ID, ViewChild, ElementRef, ContentChildren } from '@angular/core';
import { ChatService } from '../chat.service';
import { ManagerService } from '../manager.service';
import { MatDialog } from '@angular/material/dialog';
import { AddGroupDialogComponent } from '../control/add-group-dialog/add-group-dialog.component';
import { AddFriendComponent } from '../control/add-friend/add-friend.component';
import { FriendRequestComponent } from '../control/friend-request/friend-request.component';
import { Setting } from '../Setting';
import { UserInfoService } from '../serices/user-info.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
   chatService:ChatService;
   head:string;
   //当前选择的菜单
   selected:number=1;
   //好友请求数量
   friendReqCount:number=0;
   name:string;
   Setting = Setting;
   constructor(public managerService:ManagerService,public dialog:MatDialog,public userInfoService:UserInfoService,private router:Router){
    if(Setting.Token==""){
      this.router.navigate(['/login']);
      return;
    }
    this.userInfoService.getInof().subscribe(x=>{
      Setting.NickName = x.nickName;
      Setting.UserId = x.id;
      Setting.Head = x.head;
      Setting.Email = x.email;
      Setting.Phone = x.phone;
    });
   }


  ngOnInit() {
    this.chatService = new ChatService(this.managerService,this.dialog);
    this.managerService.setFriendRequest.subscribe(data=>{
      if(data){
          this.friendReqCount+=1;
      }
    });
  }

  //---------- 显示个人信息面板 START ---------- 
  //信息面板元素
  @ViewChild("personal",{static:false}) personalPanel:ElementRef;
  //动画是否在运行，以防多次点击
  isRun:boolean=false;
  showInfo(){
    if(this.isRun) return;
    this.isRun = true;
    const panel:HTMLElement = this.personalPanel.nativeElement;
    const content:HTMLElement = <HTMLElement>panel.firstChild;
    if(panel.style.display=="none"||panel.style.display==""){
      panel.style.display = "block";
      setTimeout(() => {
        content.style.left = "0";
      }, 0);
    }else{
      content.style.left = "-250px";
    }
    let end = ()=>{
      this.isRun = false;
      if(parseInt(content.style.left)==-250){
        panel.style.display = "none";
      }
      content.removeEventListener('transitionend',end);
    }
    content.addEventListener('transitionend',end);
  }
  //---------- 显示个人信息面板 END ---------- 

  /**
   * 菜单切换
   * @param num 菜单Id
   */
  selectedPanel(num:number){
    if(num==6){
        this.dialog.open(AddGroupDialogComponent,{panelClass:"addGroupPanel",disableClose:true});
        return;
    }
    if(num==4){
      this.dialog.open(AddFriendComponent,{panelClass:"addFriendPanel",disableClose:true});
      return;
    }
    if(num==5){
      this.dialog.open(FriendRequestComponent,{panelClass:'friendReqPanel',disableClose:true});
      this.friendReqCount = 0;
      return;
    }
    this.selected = num;
  }
}