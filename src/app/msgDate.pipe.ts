import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({  name: 'msgDate'})
export class MsgDatePipe implements PipeTransform {

  transform(value: Date, args?: any): any {
    var now = new Date();
    var old = new Date(value);
    if(old.getFullYear()!=now.getFullYear()){
      return formatDate(old,'M-d-yy','zh-CN');
    }
    if(old.getDate()==now.getDate()&&old.getMonth()==now.getMonth()){
      return formatDate(old,'HH:mm','zh-CN');
    }
    var oneTime = now.getTime()-(now.getDay()-1)*24*60*60*1000-(now.getHours()*1000*60*60)-now.getMinutes()*60*1000-now.getSeconds()*1000;
    if(old.getTime()>oneTime){
      var weeekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      var oldWeekDay = old.getDay()==0?7:old.getDay();
      return weeekdays[oldWeekDay];
    }
    return formatDate(old,'M月d日','zh-CN');
  }

}
