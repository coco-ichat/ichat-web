import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ContactService } from './contact.service';
import { HttpClient } from '@angular/common/http';
import { Friend } from '../models/Friend';
import { ConvertPinYin } from '../ConvertPinYin';
import { MatDialog } from '@angular/material/dialog';
import { ContactDialogComponent } from '../control/contact-dialog/contact-dialog.component';
import { ManagerService } from '../manager.service';
import { ScrollBar } from '../control/scrollBar';
import { IChatUsers, StaticUser } from '../Users';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit,AfterViewInit {

  constructor(public dialog:MatDialog,public managerService:ManagerService,public contactService:ContactService) { 
    //重新排序联系人列表
    this.managerService.sortContact.subscribe(data=>{
      if(data&&data.model.id>0){
        var word = data.model.remark==null?data.model.nickName:data.model.remark;
        var p = /[a-z]/i;
        var pinYin:string;
        var oldPinYin:string;
        if(p.test(word[0])){
          pinYin = word[0].toUpperCase();
        }else{
          pinYin = ConvertPinYin.toPinYin(word[0]).toUpperCase()[0];
        }
        if(p.test(data.oldValue[0])){
          oldPinYin = data.oldValue[0].toUpperCase();
        }else{
          oldPinYin = ConvertPinYin.toPinYin(data.oldValue[0]).toUpperCase()[0];
        }
        var oldGroup = this.groups.find((y,i)=>{
           return y.title == oldPinYin;
        })
        oldGroup.friends.forEach((item,index)=>{
            if(item.friendId==data.model.friendId){
              oldGroup.friends.splice(index,1);
            }
        });
        if(oldGroup.friends.length==0){
          this.groups.forEach((item,index)=>{
            if(item.title==oldGroup.title){
              this.groups.splice(index,1);
            }
          })
        }
        var group = this.groups.find(y=>{
          return y.title==pinYin;
         });
        if(group){
          group.friends.push(data.model);
        }else{
          group = new ContactGroup();
          group.title = pinYin;
          group.friends = [];
          group.friends.push(data.model);
          this.groups.push(group);
          this.groups.sort((a,b)=>{
            if(a.title=='#') return 1;
            if(b.title=="#") return -1;
            return a.title>b.title?1:-1;
          });
        }
      }
    });
  }
  private _searchText:string="";
  get searchText(){
    return this._searchText;
  }
  set searchText(value:string){
    this._searchText=value;
    this.groups=[];
    var text = value.trimLeft().trimRight().toLowerCase();
    if(text.length>0){
        let group = new ContactGroup();
        group.title="";
        group.friends=[];
        this.groups.push(group);
        this.users.forEach(item=>{
          var name = item.nickName;
          if(name.toLowerCase().indexOf(text.toLowerCase())>-1){
            group.friends.push(item);
          }
        });
    }else{
      this.groups = this.groups2;
    }
  }
  private groups2:ContactGroup[]=[];
  groups:ContactGroup[]=[];
  private users:Friend[]=[];
  ngOnInit() {
    //获取联系人，并排序
    this.contactService.GetFriends().subscribe(data=>{
      if(data&&data.length>0){
        this.users = data;
        data.forEach(x=>{
            IChatUsers.setItem(new StaticUser(x.friendId,x.head,x.nickName));
            var word = x.remark==null?x.nickName:x.remark;
            var p = /[a-z]/i;
            var pinYin:string;
            if(p.test(word[0])){
              pinYin = word[0].toUpperCase();
            }else{
              pinYin = ConvertPinYin.toPinYin(word[0]).toUpperCase()[0];

            }
            var group = this.groups.find(y=>{
             return y.title==pinYin;
            });
            if(group){
              group.friends.push(x);
            }else{
              group = new ContactGroup();
              group.title = pinYin;
              group.friends = [];
              group.friends.push(x);
              this.groups.push(group);
            }
        });

        this.groups.sort((a,b)=>{
            if(a.title=='#') return 1;
            if(b.title=="#") return -1;
            return a.title>b.title?1:-1;
        });
      }
      this.groups2 = this.groups; 
        
    });
    //删除联系人
    this.managerService.removeContact.subscribe(x=>{
      if(x&&this.groups.length>0){
        this.groups.forEach((y,yindex)=>{
            y.friends.forEach((z,index)=>{
              if(z.friendId == x){
                y.friends.splice(index,1);
                if(y.friends.length==0){
                  this.groups.splice(yindex,1);
                }
                return;
              }
            })
        });
        this.groups2.forEach((y,yindex)=>{
          y.friends.forEach((z,index)=>{
            if(z.friendId == x){
              y.friends.splice(index,1);
              if(y.friends.length==0){
                this.groups.splice(yindex,1);
              }
              return;
            }
          })
        });
      }
    });
  }
  @ViewChild('scrollBox',{static:false}) scrollBox:ElementRef;
  ngAfterViewInit(): void {
    new ScrollBar(this.scrollBox.nativeElement);
  }

  //显示联系人详细信息
  showDetail(model:Friend){
     this.dialog.open(ContactDialogComponent,{panelClass:'contactPanel',data:model});
  }
}


export class ContactGroup{
    title:string;
    friends:Friend[];
}