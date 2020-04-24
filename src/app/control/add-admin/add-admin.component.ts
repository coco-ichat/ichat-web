import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupUser } from 'src/app/models/GroupUser';
import { GroupService } from 'src/app/serices/group.service';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.less']
})
export class AddAdminComponent{
  groupUsers:GroupUser[]=[];
  private users:GroupUser[]=[];
  private _searchText:string="";
  get searchText(){
    return this._searchText;
  }
  set searchText(value:string){
    this._searchText=value;
    this.groupUsers=[];
    var text = value.trimLeft().trimRight().toLowerCase();
    if(text.length>0){
        this.users.forEach(item=>{
          var name = item.nickName;
          if(name.toLowerCase().indexOf(text.toLowerCase())>-1){
            this.groupUsers.push(item);
          }
        });
    }else{
      this.groupUsers = this.users;
    }
  }
  selectedItem:GroupUser=null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{groupUsers:GroupUser[]},
    public dialogRef:MatDialogRef<AddAdminComponent>,
    private groupService:GroupService,
    ){
        data.groupUsers.forEach(x=>{
          if(!x.isCreator){
            this.groupUsers.push(x);
          }
        });
        this.users = this.groupUsers;
    }
  //选中要添加的管理员
  onSelectedItem(item:GroupUser){
    this.selectedItem = item;
  }
  //添加管理员
  add(){
    if(this.selectedItem){
      this.groupService.setAdmin(this.selectedItem.groupId,this.selectedItem.userId).subscribe(x=>{
        this.dialogRef.close(this.selectedItem);
      });
    }
  }
  //关闭
  close(){
    this.dialogRef.close();
  }

  onClear(){
    this.searchText = "";
    this.groupUsers = this.users;
  }
}
