import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-confirm-checkbox-dialog',
  templateUrl: './confirm-checkbox-dialog.component.html',
  styleUrls: ['./confirm-checkbox-dialog.component.less']
})
export class ConfirmCheckboxDialogComponent{
  btnOkText = "删除";
  message:string;
  message2:string;
  checked:boolean = true;
  constructor(public dialogRef:MatDialogRef<ConfirmDialogComponent>,@Inject(MAT_DIALOG_DATA) public data:{message:string,message2:string,btnOk?:string}) { 
    if(data){
      if(data.btnOk){
        this.btnOkText = data.btnOk;
      }
      this.message = data.message;
      this.message2 = data.message2;
    }
  }
   
  ok(){
    this.dialogRef.close({btn:true,isCheck:this.checked});
  }

  cancel(){
    this.dialogRef.close();
  }
}
