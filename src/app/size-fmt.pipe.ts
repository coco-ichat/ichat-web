import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sizeFmt'
})
export class SizeFmtPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    var match = /^(\d+(\.\d)?)(\d*)$/;
    if(value<1024){
      return `${value}B`;
    }
    if(value>=1024&&value<(1024*1024)){
      match.test((value/1024).toString());
      var result = RegExp.$1;
      return `${result}KB`;
    }
    if(value>=(1024*1024)&&value<(1024*1024*1024)){
      match.test((value/1024/1024).toString());
      var result = RegExp.$1;
      return `${result}MB`;
    }
  }

}
