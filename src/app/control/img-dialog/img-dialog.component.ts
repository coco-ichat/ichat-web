import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-img-dialog',
  templateUrl: './img-dialog.component.html',
  styleUrls: ['./img-dialog.component.css']
})
export class ImgDialogComponent{
    @ViewChild("previewImg",{static:false}) previewImg:ElementRef;
    @ViewChild("box",{static:false}) box:ElementRef;
    constructor(public dialogRef: MatDialogRef<ImgDialogComponent>,@Inject(MAT_DIALOG_DATA) public img:HTMLImageElement){
     
    }
    load(){
      var model = this.previewImg.nativeElement;
      var boxElement = this.box.nativeElement;
      if(model.height>=model.width){
        if(model.height>boxElement.offsetHeight){
          model.height = boxElement.offsetHeight;
        }
      }else{
        if(model.width>boxElement.offsetWidth){
          model.width = boxElement.offsetWidth;
        }
      }
      model.style.marginTop = `-${model.height/2}px`;
      model.style.marginLeft = `-${model.width/2}px`;
    }
    close(){
        this.dialogRef.close();
    }
    
    scroll(event:WheelEvent){
      var model = this.previewImg.nativeElement;
      var boxElement = this.box.nativeElement;
      var panel = <HTMLDivElement>document.getElementsByClassName("imgPanel")[0];
      var left=event.clientX-model.offsetLeft-panel.offsetLeft;
      // var left = event.clientX-boxElement.offsetLeft;
      var top=event.clientY-model.offsetTop-panel.offsetTop;
      //var top = event.clientY - boxElement.offsetTop;
      var topx = top/model.height;
      var leftx = left/model.width;
      // console.log(topx);
      // console.log(leftx);
 
      var oldMarginTop= Number(model.style.marginTop.replace('px',''));
      var oldMarginLeft= Number(model.style.marginLeft.replace('px',''));
      if(event.deltaY>0){
          var width1 = model.width-100;
          if(width1<150){
              model.width = 150;
          }else{
            model.width-=100;
          }
          model.height = model.naturalHeight*(model.width/model.naturalWidth)
      }
      else if(event.deltaY<0){
          var width = model.width+100;
          if(width>(model.naturalWidth*5)){
            model.width = model.naturalWidth*5;
          }else{
            model.width=width;
          }
          model.height =  model.naturalHeight*(model.width/model.naturalWidth)
      }
      // model.style.marginTop = `-${(model.height)/2}px`;
      // model.style.marginLeft = `-${(model.width)/2}px`;
      if(model.height<boxElement.offsetHeight){
        model.style.marginTop = `-${model.height/2}px`;
      }else{
        var newMarginTop = -((-oldMarginTop-top)+(model.height*topx));
        var marginTop = newMarginTop - oldMarginTop;
        if(model.offsetTop+marginTop>=0){
          marginTop = oldMarginTop +(0-model.offsetTop);
          model.style.marginTop = `-${marginTop}px`;
          
        }else if((-model.offsetTop-marginTop+boxElement.offsetHeight)>=model.offsetHeight){
          marginTop = oldMarginTop+(boxElement.offsetHeight-model.offsetHeight-model.offsetTop);
          let str = `${marginTop}px`;
          model.style.marginTop = str;
        }else{
           model.style.marginTop = `-${(-oldMarginTop-top)+(model.height*topx)}px`;
        }
      }
      if(model.width<boxElement.offsetWidth){
        model.style.marginLeft = `-${model.width/2}px`;
      }else{
        var newMarginLeft = -((-oldMarginLeft-left)+(model.width*leftx));
        var marginLeft = newMarginLeft - oldMarginLeft;
        if(model.offsetLeft+marginLeft>0){
          marginLeft = oldMarginLeft +(0-model.offsetLeft);
          model.style.marginLeft = `${marginLeft}px`;
        }else if((-model.offsetLeft-marginLeft+boxElement.offsetWidth)>=model.offsetWidth){
          marginLeft = oldMarginLeft+boxElement.offsetWidth-model.offsetWidth-model.offsetLeft;
          model.style.marginLeft = `${marginLeft}px`;
        }else{
          model.style.marginLeft = `-${(-oldMarginLeft-left)+(model.width*leftx)}px`;
        }
      }
    }

    move(event:MouseEvent){
      var boxElement = this.box.nativeElement;
      var model = this.previewImg.nativeElement;
      if(model.width<=boxElement.offsetWidth&&model.height<boxElement.offsetHeight){
        return;
      }
      event.preventDefault();
      var clickX = event.clientX;
      var clickY = event.clientY;
      model.style.cursor="move";
      model.onclick=()=>{
        model.onmousemove = null;
        model.onmouseup = null;
        model.style.cursor="auto";
        model.onmouseleave=null;
      }
      var currentX = model.style.marginLeft.replace('px','');
      var currentY = model.style.marginTop.replace('px','');
      var currentHeight = model.offsetHeight;
      var currentWidth = model.offsetWidth;
      var currentLeft = model.offsetLeft;
      var currentTop = model.offsetTop;
      var boxHeight = boxElement.offsetHeight+1;
      var boxWidth = boxElement.offsetWidth+1;
      model.onmousemove=(x)=>{
          model.onmouseup=()=>{
              model.onmousemove = null;
              model.onmouseup = null;
              model.style.cursor="auto";
              model.onmouseleave=null;
          };
          model.onmouseleave=()=>{
            model.onmousemove = null;
            model.onmouseup = null;
            model.style.cursor="auto";
            model.onmouseleave=null;
          };
          var width = x.clientX-clickX;
          var height = x.clientY - clickY;
          
          if(width>0){
            if((currentLeft+width)>0)
              width = 0 - currentLeft;
          }else{
            if((-currentLeft-width+boxWidth)>=currentWidth){
              width = -(currentWidth+currentLeft-boxWidth);

            }
          }
          if(height>=0){
            if((currentTop+height)>0){
              height = 0-currentTop;
            }
          }else{
            if((-currentTop-height+boxHeight)>=currentHeight){
              height = -(currentHeight+currentTop-boxHeight);

            }
          }
         
          

          width = width+Number(currentX);
          height = height +Number(currentY);
          if(model.offsetWidth<boxElement.offsetWidth){
            model.style.marginTop =  `${height}px`;
            return;
          }
          if(model.offsetHeight<boxElement.offsetHeight){
            model.style.marginLeft = `${width}px`;
            return;
          }


          model.style.marginTop =  `${height}px`;
          model.style.marginLeft = `${width}px`;
      };
    }
}
