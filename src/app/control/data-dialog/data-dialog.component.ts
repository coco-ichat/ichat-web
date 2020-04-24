import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-dialog',
  templateUrl: './data-dialog.component.html',
  styleUrls: ['./data-dialog.component.css']
})
export class DataDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public message:string,public dialogRef:MatDialogRef<DataDialogComponent>){
      window.onmousedown = ()=>{
        this.dialogRef.close();
        window.onmousedown = null;
      }
    }
}
