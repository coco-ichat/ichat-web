import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { ContactGroup } from 'src/app/contact/contact.component';
import { Friend } from 'src/app/models/Friend';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ManagerService } from 'src/app/manager.service';
import { FriendService } from 'src/app/serices/friend.service';
import { ContactService } from 'src/app/contact/contact.service';
import { FileService } from 'src/app/serices/file.service';
import { GroupService } from 'src/app/serices/group.service';
import { ConvertPinYin } from 'src/app/ConvertPinYin';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GroupUser } from 'src/app/models/GroupUser';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-invite-group-dialog',
  templateUrl: './invite-group-dialog.component.html',
  styleUrls: ['./../add-group-dialog/add-group-dialog.component.less']
})
export class InviteGroupDialogComponent {

  groups:ContactGroup[]=[];
  selectedFriends:Friend[]=[];
  searchFriends:Friend[]=[];
  private _searchText:string="";
  selectNumber:number=0;
  get searchText(){
    return this._searchText;
  }
  set searchText(value:string){
    this._searchText=value;
    this.searchFriends=[];
      var text = value.trimLeft().trimRight().toLowerCase();
      if(text.length>0){
          this.groups.forEach(item=>{
            item.friends.forEach(x=>{
              var name = x.remark==null?x.nickName:x.remark;
              if(name.toLowerCase().indexOf(text.toLowerCase())>-1){
                this.searchFriends.push(x);
              }
            });
          });
      }
  }

  @ViewChild('selctedView',{static:false}) selectedView:ElementRef;
  @ViewChild('groupHead',{static:false}) groupHead:ElementRef;
  private currentUsers:GroupUser[];
  private groupId:number;
  constructor(
    public dialogRef:MatDialogRef<InviteGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{groupUsers:GroupUser[],groupId:number},
    public managerService:ManagerService,
    public friendService:FriendService,
    public contactService:ContactService,
    public fileService:FileService,
    public groupService:GroupService,
    public dialog:MatDialog,
    ) { 
    this.currentUsers = data.groupUsers;
    this.groupId = data.groupId;
    //获取联系人，并排序
    this.contactService.GetFriends().subscribe(data=>{
      this.selectNumber = this.currentUsers.length;
      if(data&&data.length>0){
        data.forEach(x=>{
            this.currentUsers.forEach(y=>{
                if (y.userId == x.friendId){
                  x.disabled = "disabled";
                  x.checked = true;
                }
              
            });
            var word = x.remark==null?x.nickName:x.remark;
            var p = /[a-z]/i;
            var pinYin:string;
            if(p.test(word[0])){
              pinYin = word[0].toUpperCase();
            }else{
              pinYin = ConvertPinYin.toPinYin(word[0]).toUpperCase()[0];

            }
            var group = this.groups.find(y=>{
             return y.title==pinYin;
            });
            if(group){
              group.friends.push(x);
            }else{
              group = new ContactGroup();
              group.title = pinYin;
              group.friends = [];
              group.friends.push(x);
              this.groups.push(group);
            }
        });

        this.groups.sort((a,b)=>{
            if(a.title=='#') return 1;
            if(b.title=="#") return -1;
            return a.title>b.title?1:-1;
        });
      }
       
        
    });
  }

  onclick(event:MouseEvent,item:Friend){
    event.preventDefault();
    if(item.disabled=="disabled") return;
    item.checked = !item.checked;
    if(item.checked){
      this.selectedFriends.push(item);
      this.selectNumber +=1;
      setTimeout(() => {
        var view:HTMLElement = this.selectedView.nativeElement;
        view.scrollTo({top:view.scrollHeight});
      }, 0);
    }
    else{
      this.selectedFriends.forEach((x,index)=>{
        if(x.id==item.id){
          this.selectedFriends.splice(index,1);
          this.selectNumber -=1;
        }
      })
    }
  }


  onRemove(item:Friend){
    this.groups.forEach(x=>{
      x.friends.forEach((y,index)=>{
        if(y.id==item.id){
          y.checked=false;
        }
      })
    })
    this.selectedFriends.forEach((x,index)=>{
      if(x.id==item.id){
        this.selectedFriends.splice(index,1);
        this.selectNumber -=1;
      }
    })
  }

  //邀请好友
  invite(){
    var loading = this.dialog.open(LoadingDialogComponent,{panelClass:'loadingPanel',disableClose:true});
    let userIds:number[]=[];
    this.selectedFriends.forEach(x=>{
      userIds.push(x.friendId);
    });
    this.groupService.invite(this.groupId,userIds).subscribe(x=>{
      loading.close();
      this.dialogRef.close(userIds);
    });
  }

  onClear(){
    this.searchText = "";
    this.searchFriends=[];
  }
  close(){
    this.dialogRef.close();
  }


}
