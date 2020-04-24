import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.less']
})
export class ConfirmDialogComponent {

  btnOkText = "删除";
  message:string;
  constructor(public dialogRef:MatDialogRef<ConfirmDialogComponent>,@Inject(MAT_DIALOG_DATA) public data:any) { 
    if(data){
      if(typeof(data)==="string"){
        this.message = data;
      }else if(typeof(data)==="object"){
        if(data.btnOk){
          this.message = data.message;
          this.btnOkText = data.btnOk;
        }
      }
    }
  }
   
  ok(){
    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close(false);
  }
}
