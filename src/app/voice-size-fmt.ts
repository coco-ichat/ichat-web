import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'voiceTimeFmt'
})
export class VoiceSizeFmtPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    var date = new Date(value);
    return date.getSeconds();
  }

}
