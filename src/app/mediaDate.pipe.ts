import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({  name: 'mediaDate'})
export class mediaDatePipe implements PipeTransform {

  transform(value: number, args?: any): any {
    var time = new Date(value);
    var minutes = time.getMinutes().toString();
    var seconds = time.getSeconds().toString();
    if(minutes.length==1) minutes = "0"+minutes;
    if(seconds.length==1) seconds = "0"+seconds;
    return `${minutes}:${seconds}`;
  }

}
