import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GroupUser } from 'src/app/models/GroupUser';
import { AddGroupDialogComponent } from '../add-group-dialog/add-group-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GroupService } from 'src/app/serices/group.service';
import { AddAdminComponent } from '../add-admin/add-admin.component';

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  styleUrls: ['./group-admin.component.less']
})
export class GroupAdminComponent{
  admins:GroupUser[];
  groupUsers:GroupUser[];
  private users:GroupUser[]=[];
  private _searchText:string="";
  isSearch:boolean = false;
  get searchText(){
    return this._searchText;
  }
  set searchText(value:string){
    this._searchText=value;
    this.isSearch = false;
    this.admins = [];
    var text = value.trimLeft().trimRight().toLowerCase();
    if(text.length>0){
        this.isSearch = true;
        this.users.forEach(item=>{
          var name = item.nickName;
          if(name.toLowerCase().indexOf(text.toLowerCase())>-1){
            this.admins.push(item);
          }
        });
    }else{
      this.admins = this.users;
    }
  }
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{admins:GroupUser[],groupUsers:GroupUser[]},
    public dialog:MatDialog,
    public dialogRef:MatDialogRef<GroupAdminComponent>,
    public groupService:GroupService,
  ){
      this.admins = this.users = data.admins;
      this.groupUsers = data.groupUsers;
  }
  /**
   * 删除管理员
   * @param item 管理员
   */
  removeAdmin(item:GroupUser){
    let dialogResult = this.dialog.open(ConfirmDialogComponent,{panelClass:'confirmPanel',data:`要撤销 ${item.nickName} 的管理权限吗？`,disableClose:true});
    dialogResult.afterClosed().subscribe(x=>{
        if(x&&x===true){
          this.groupService.deleteAdmin(item.groupId,item.userId).subscribe(y=>{
            this.users.forEach((z,index)=>{
              if(z.userId==item.userId){
                this.users.splice(index,1);
                return;
              }
            });
            this.admins.forEach((z,index)=>{
              if(z.userId==item.userId){
                this.admins.splice(index,1);
                return;
              }
            });
          });
        }
    });
  }
  /**
   * 添加管理员
   */
  add(){
    let dialogResult = this.dialog.open(AddAdminComponent,{panelClass:'addAdminPanel',data:{groupUsers:this.groupUsers},disableClose:true});
    dialogResult.afterClosed().subscribe(x=>{
      if(x){
        let isAdmin = this.users.find(y=>{
          return y.userId==x.userId;
        })
        if(!isAdmin){
          this.users.push(x);
        }
      }
    })
  }

  //关闭
  close(){
    this.dialogRef.close();
  }

  onClear(){
    this.searchText = "";
    this.admins = this.users;
  }
}
