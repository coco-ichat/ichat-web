import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Setting } from '../Setting';
import { MatDialog } from '@angular/material/dialog';
import { DataDialogComponent } from '../control/data-dialog/data-dialog.component';
import { ImgCropperComponent } from '../control/img-cropper/img-cropper.component';
import { FileService } from '../serices/file.service';
import { UserInfoService } from '../serices/user-info.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})

export class PersonalComponent implements OnInit,AfterViewInit {
 
  Setting=Setting
  constructor(
    public dialog:MatDialog,
    public fileService:FileService,
    public userInfoSerivce:UserInfoService
    ) { 
  }
  @ViewChild('btnName',{static:false}) btnNameRef:ElementRef;

  ngOnInit() {
  }
  
  ngAfterViewInit(): void {
    let btnEdit = <HTMLElement>this.btnNameRef.nativeElement;
    var parentView = <HTMLElement>btnEdit.parentElement;
    var editView = <HTMLElement>btnEdit.previousElementSibling;
    btnEdit.onclick=()=>{
      parentView.className = "focus";
      editView.contentEditable = "true";
      editView.focus();
      document.getSelection().getRangeAt(0).setStart(document.getSelection().getRangeAt(0).startContainer,Setting.NickName.length);
      editView.onblur = ()=>{
        parentView.className = "";
        editView.contentEditable = "false";
        editView.onblur = null;
        editView.onpaste = null;
        let text =editView.textContent.substr(0,20);
        if(text=="") {
          editView.textContent = Setting.NickName;
          return;
        }
        this.userInfoSerivce.updateNickName(text).subscribe(x=>{
            Setting.NickName = text;
        });
      }
      editView.onpaste=()=>{
        return false;
      }
    }
  }

  //上传照片
  takePhoto(){
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
                this.userInfoSerivce.UpdateHead(data).subscribe(x=>{
                  Setting.Head = data;
                });
            });
          }
        });
      }
      
    }
  }
  //关闭面板
  close(){
    (<HTMLElement>document.getElementsByClassName('sidestrip')[0].getElementsByClassName('own_head')[0]).click();
  }

  exit(){
    Setting.Token = null;
    localStorage.removeItem('token');
    window.location.href="/login";
  }
}
