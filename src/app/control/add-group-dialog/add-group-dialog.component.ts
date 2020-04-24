import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FriendService } from 'src/app/serices/friend.service';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Friend } from 'src/app/models/Friend';
import { ManagerService } from 'src/app/manager.service';
import { ContactGroup } from 'src/app/contact/contact.component';
import { ContactService } from 'src/app/contact/contact.service';
import { ConvertPinYin } from 'src/app/ConvertPinYin';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FileService } from 'src/app/serices/file.service';
import { DataDialogComponent } from '../data-dialog/data-dialog.component';
import { ImgCropperComponent } from '../img-cropper/img-cropper.component';
import { GroupService } from 'src/app/serices/group.service';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-add-group-dialog',
  templateUrl: './add-group-dialog.component.html',
  styleUrls: ['./add-group-dialog.component.less']
})
export class AddGroupDialogComponent{
  groups:ContactGroup[]=[];
  selectedFriends:Friend[]=[];
  searchFriends:Friend[]=[];
  groupName:string="";
  file:any;
  private _searchText:string="";
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
  constructor(
    public dialog:MatDialog,
    public dialogRef:MatDialogRef<AddGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public contact:Friend,
    public managerService:ManagerService,
    public friendService:FriendService,
    public contactService:ContactService,
    public fileService:FileService,
    public groupService:GroupService,
    ) { 
    //获取联系人，并排序
    this.contactService.GetFriends().subscribe(data=>{
      if(data&&data.length>0){
        data.forEach(x=>{
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

  onChange(event:MouseEvent,item:Friend){
    event.preventDefault();
    if(item.disabled=="disabled") return;
    item.checked = !item.checked;
    if(item.checked){
      this.selectedFriends.push(item);
      setTimeout(() => {
        var view:HTMLElement = this.selectedView.nativeElement;
        view.scrollTo({top:view.scrollHeight});
      }, 0);
    }
    else{
      this.selectedFriends.forEach((x,index)=>{
        if(x.id==item.id){
          this.selectedFriends.splice(index,1);
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
      }
    })
  }

  //上传群组照片
  takePhoto(){
    var input = document.createElement("input");
    input.type = "file";
    input.click();
    input.onchange = ()=>{
      var file = input.files[0];
      if(file.type.indexOf("image/")==-1){
        this.dialog.open(DataDialogComponent,{data:"请选择图片上传"});
      }else{
        const resultDialog = this.dialog.open(ImgCropperComponent,{panelClass:'imgCropperPanel',data:file,disableClose:true});
        resultDialog.afterClosed().subscribe(result=>{
          if(result){
            var img = this.groupHead.nativeElement;
            img.src =this.file= result.data;
            img.style.display="block";
          }
        });
      }
      
    }
  }
  //创建群组
  create(){
    if(this.groupName.trimLeft().trimRight().length<1)
    {
      this.dialog.open(DataDialogComponent,{data:"请输入群组名称"});
      return;
    }
    if(this.selectedFriends.length<2){
      return;
    }
    let loading = this.dialog.open(LoadingDialogComponent,{panelClass:'loadingPanel',disableClose:true});
    let groupModel = {name:this.groupName.substr(0,20),userIds:[],head:null};
    this.selectedFriends.forEach(x=>{
        groupModel.userIds.push(x.friendId);
    });
    if(this.file){
        let arr = this.file.split(','), mime = arr[0].match(/:(.*?);/)[1],bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        let uploadFile = new File([u8arr],`${(new Date()).getTime()}.png`);
        this.fileService.upload(uploadFile).subscribe(data=>{
            groupModel.head = data;
            this.groupService.create(groupModel.name,groupModel.head,groupModel.userIds).subscribe(x=>{
              loading.close();
              this.dialogRef.close();
            });
            return;
        });
        return;
    }
    this.groupService.create(groupModel.name,null,groupModel.userIds).subscribe(x=>{
      loading.close();
      this.dialogRef.close();
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
