import { Component, Inject, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.css']
})
export class VideoDialogComponent implements AfterViewInit{
  ngAfterViewInit(): void {
    let video:HTMLVideoElement = this.video.nativeElement;
    video.oncanplay = ()=>{
      video.play();
    }
  }

  width:number;
  height:number;

  @ViewChild('video',{static:false}) video:ElementRef;
  constructor(public dialogRef:MatDialogRef<VideoDialogComponent>,@Inject(MAT_DIALOG_DATA) public videoData:any) {
    this.width = videoData.Width;
    this.height = videoData.Height;
    if(this.height>=this.width){
      if(this.height>500){
        this.height = 500;
        this.width = videoData.Width/videoData.Height*500;
      }
    }else{
      if(this.width>500){
        this.width = 500;
        this.height = videoData.Height/videoData.Width*500;
      }
    }
    // console.log(this.width);
    // console.log(this.height);
  }

  close(){
    this.dialogRef.close();
  }
}
