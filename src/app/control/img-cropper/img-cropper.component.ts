import { Component, Inject, ViewChild, ElementRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DataDialogComponent } from '../data-dialog/data-dialog.component';

@Component({
  selector: 'app-img-cropper',
  templateUrl: './img-cropper.component.html',
  styleUrls: ['./img-cropper.component.less']
})
export class ImgCropperComponent{

  @ViewChild("img",{static:false}) img:ElementRef;
  @ViewChild("img2",{static:false}) img2:ElementRef;
  @ViewChild("img3",{static:false}) img3:ElementRef;
  @ViewChild("area",{static:false}) area:ElementRef;
  constructor(@Inject(MAT_DIALOG_DATA) public file:File,public dialogRef:MatDialogRef<ImgCropperComponent>,public dialog:MatDialog) { 
    var render = new FileReader();
    render.readAsDataURL(file);
    render.onload = ()=>{
        this.img.nativeElement.src = render.result.toString();
        this.img2.nativeElement.src = render.result.toString();
        this.img.nativeElement.onload = ()=>{
          if(this.img.nativeElement.height<150||this.img.nativeElement.width<150){
            this.dialog.open(DataDialogComponent,{data:"选择的照片尺寸太小，请重新选择"});
            this.dialogRef.close();
          }
        }
    }
  }
  onmousedown(event:MouseEvent){
    var area:HTMLElement = this.area.nativeElement;
    event.preventDefault();
    area.onclick=()=>{
      window.onmousemove = null;
      window.onmouseup = null;
    }
    var currentX = event.clientX;
    var currentY = event.clientY;
    var oldTop = area.offsetTop;
    var oldLeft = area.offsetLeft;
    var height = area.offsetHeight;
    var imgHeight = this.img2.nativeElement.height;
    var imgWidth = this.img2.nativeElement.width;
    window.onmousemove = (x)=>{
      window.onmouseup=()=>{
          window.onmousemove = null;
          window.onmouseup = null;
      };
      var moveX= oldLeft+ x.clientX - currentX;
      var moveY= oldTop + x.clientY - currentY;
      if(moveX<0) moveX = 0;
      if(moveY<0) moveY = 0;
      if(moveY>(imgHeight-height)) moveY = imgHeight - height;
      if(moveX>(imgWidth-height)) moveX = imgWidth - height;
      this.img2.nativeElement.style.transform = `translateX(${-moveX}px) translateY(${-moveY}px)`;
      area.style.top = `${moveY}px`;
      area.style.left=`${moveX}px`;
    }
  }

  changeSize(current:HTMLElement,event:MouseEvent,num:number){
      event.preventDefault();
      event.stopPropagation();
      current.onclick = ()=>{
        window.onmouseup = null;
        window.onmousemove = null;
      }

      var area = this.area.nativeElement;
      var img = this.img.nativeElement;
      var areaWidth = area.offsetWidth;
      var areaHeight = area.offsetHeight;
      var oldTop = area.offsetTop;
      var oldLeft = area.offsetLeft;
      var imgHeight = img.offsetHeight;
      var imgWidth = img.offsetWidth;
      window.onmousemove = (x)=>{
        window.onmouseup = ()=>{
          window.onmousemove = null;
          window.onmouseup = null;
        }
        // var clientX = x.clientX;
        // var clientY = x.clientY;
        // if(x.clientX<0) clientX = 0;
        // if(x.clientX>imgWidth) clientX = imgWidth;
        // if(x.clientY<0) clientY = 0;
        // if(x.clientY>imgHeight) clientY = imgHeight;
        var moveX = x.clientX - event.clientX;
        var moveY = x.clientY - event.clientY;
        switch(num){
          case 0:
            moveX = event.clientX - x.clientX;
            moveY = event.clientY - x.clientY;
            break;
          case 1:
            moveX = event.clientX - x.clientX;
            break;
          case 2:
              moveY = event.clientY - x.clientY;
        }
        var move = moveX>moveY?moveX:moveY;
        var newWidth = areaWidth +move;
        if(newWidth<50){
          newWidth = 50;
          move = newWidth-areaWidth;
        } 
        switch(num){
          case 0:
            if(newWidth>(areaHeight+oldTop)){
              newWidth = areaHeight+oldTop;
              move = newWidth - areaWidth;
            }
            if(newWidth>(areaWidth+oldLeft))
            {
              newWidth = areaWidth+oldLeft;
              move = newWidth - areaWidth;
            }
            break;
          case 1:
            if((newWidth+oldTop)>imgHeight) newWidth = imgHeight-oldTop;
            if(newWidth>(areaWidth+oldLeft))
            {
              newWidth = areaWidth+oldLeft;
              move = newWidth - areaWidth;
            }
            break;
          case 2:
              if(newWidth>(areaHeight+oldTop)){
                newWidth = areaHeight+oldTop;
                move = newWidth - areaWidth;
              }
              if((newWidth+oldLeft)>imgWidth) newWidth = imgWidth - oldLeft;
            break;
          case 3:
            if((newWidth+oldTop)>imgHeight) newWidth = imgHeight-oldTop;
            if((newWidth+oldLeft)>imgWidth) newWidth = imgWidth - oldLeft;
            break;
        }
        area.style.width = newWidth+"px";
        area.style.height = newWidth +"px";
        var newTop = oldTop-move;
        var newLeft = oldLeft-move;
        // if(newLeft<0) newLeft = 0;
        // if(newTop<0) newTop = 0;
        // if(newLeft>(imgWidth-areaWidth)) newLeft = imgWidth-areaWidth;
        // if(newTop>(imgHeight-areaHeight)) newTop = imgHeight-areaHeight;
        switch(num){
          case 0:
            area.style.top = `${newTop}px`;
            area.style.left=`${newLeft}px`;
            this.img2.nativeElement.style.transform = `translateX(${-newLeft}px) translateY(${-newTop}px)`
            break;
          case 1:
            area.style.left=`${newLeft}px`;
            this.img2.nativeElement.style.transform = `translateX(${-newLeft}px) translateY(${-oldTop}px)`
            break;
          case 2:
              area.style.top = `${newTop}px`;
              this.img2.nativeElement.style.transform = `translateX(${-oldLeft}px) translateY(${-newTop}px)`
            break;
          case 3:
            break;
        }
      }
  }

  save(){
    var img = this.img.nativeElement;
    var area = this.area.nativeElement;
    var canvas = document.createElement('canvas');
    //计算截图区域
    var scale = img.naturalHeight/img.offsetHeight;
    var width = area.offsetWidth*scale;
    canvas.width =canvas.height = 150;
    var context = canvas.getContext('2d');
    context.drawImage(img,area.offsetLeft*scale,area.offsetTop*scale,width,width,0,0,150,150);
    this.dialogRef.close({data:canvas.toDataURL()});
  }
  close(){
    this.dialogRef.close();
  }
}
