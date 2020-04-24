import { Component, OnInit,ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ConversationService } from './conversation.service';
import { Conversation } from '../models/Conversation';
import { ManagerService } from '../manager.service';
import { Setting } from '../Setting';
import { FriendService } from '../serices/friend.service';
import { GroupService } from '../serices/group.service';
import { ScrollBar } from '../control/scrollBar';
import { IChatUsers, StaticUser } from '../Users';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../control/confirm-dialog/confirm-dialog.component';
import { DataDialogComponent } from '../control/data-dialog/data-dialog.component';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.less']
})
export class ConversationComponent implements OnInit,AfterViewInit {
  @ViewChild("scrollBox",{static:false}) scrollBox:ElementRef;
  //页面加载完之后
  ngAfterViewInit(): void {
    new ScrollBar(this.scrollBox.nativeElement);
  }

  @ViewChild("box",{static:false}) box:ElementRef;
  @ViewChild("menu",{static:false}) menuView:ElementRef;
  constructor(
    public managerService:ManagerService,
    private conversationService:ConversationService,
    private friendService:FriendService,
    private groupService:GroupService,
    private dialog:MatDialog,                           //弹出框
    ) { 
  }
  menus:Menu[];
  conversations:Conversation[];
  selectedItem:Conversation;
  ngOnInit() {
    let loadConversation = ()=>{
      //加载会话列表
      this.conversationService.GetList().subscribe(data=>{
        this.conversations = data;
        this.conversations.sort((a,b)=>{
          if(a.isPinTop>b.isPinTop){
            return -1;
          }else{
            if(a.isPinTop==false&&b.isPinTop==false){
              return a.endTime<b.endTime?1:-1;
            }else if(a.isPinTop==b.isPinTop == true){
              return a.topTime<b.topTime?1:-1;
            }
            return 1;
          }
        });
        this.conversations.forEach(x=>{
          if(x.receiverId>0){
            IChatUsers.setItem(new StaticUser(x.receiverId,x.head,x.name));
          }
        });
      })
    }
    loadConversation();
    this.managerService.ReConnectioned.subscribe(x=>{
        if(x&&x===true){
          loadConversation();
          setTimeout(()=>{
            if(this.selectedItem){
              this.conversations.forEach(y=>{
                if(y.id===this.selectedItem.id){
                   this.selectedItem.setValue(y);
                   y = this.selectedItem;
                }
              });
            }
          },0);
        }
    });

    //更新会话列表
    //x:{message,conversationId,head,nickName}
    this.managerService.updateConversation.subscribe(x=>{
      var model:Conversation;
      if(this.conversations){
        //更新最后一条消息，最后发送时间
        if(x!=null){
            //接收的消息是当前选择的会话，显示接收的会话
            if(this.selectedItem&&(this.selectedItem.id==x.conversationId||this.selectedItem.groupId == x.message.groupId)){
              if(!x.message.head) x.message.head = x.head;
              if(!x.message.nickName) x.message.nickName = x.nickName;
              this.managerService.addMessage.next(x.message);
            }
            //从会话列表中查找接收到的会话信息
            this.conversations.forEach(element => {
              if(x.message.receiverId>0){
                if(element.receiverId==x.message.userId||element.receiverId==x.message.receiverId){
                  model=element;
                  return;
                }
              }else{
                if(element.groupId == x.message.groupId){
                  model = element;
                  return;
                }
              }
            });
            //查找不到，重新创建一个会话
            if(!model){
              if(this.selectedItem&&((x.message.receiverId>0&&(this.selectedItem.receiverId == x.message.userId||this.selectedItem.userId == x.message.userId))||(x.message.groupId>0&&this.selectedItem.groupId==x.message.groupId))){
                model = this.selectedItem;
                x.message.head = x.head;
                x.message.nickName = x.nickName;
                this.managerService.addMessage.next(x.message);
              }else{
                model = new Conversation();
                model.receiverId = x.message.receiverId===Setting.UserId?x.message.userId:x.message.receiverId;
                model.userId = Setting.UserId;
                model.groupId = x.message.groupId;
                model.name = x.nickName;
                model.head = x.head;
                model.isPinTop = false;
              }
              //如果是群组会话不会返回conversationId，只能手动获取
              if(model.groupId>0){
                this.conversationService.getGroupConversation(model.groupId).subscribe(zz=>{
                    model.id = zz.id;
                    model.name = zz.name;
                    model.head = zz.head;
                });
              }else{
                model.id = x.conversationId;
              }
              this.conversations.unshift(model);
            }
            var content = x.message.content;
            var types = ['','[图片]','[语音]','[文件]','[视频]'];
            if(x.message.msgType>0&&x.message.msgType<5){
              content = types[x.message.msgType];
            }else if(x.message.msgType==6){
              if(x.message.userId == Setting.UserId){
                x.message.content= content = `你已添加了${x.nickName},现在可以开始聊天了`;
              }else{
                x.message.content= content = `${x.nickName}同意了你的好友请求,现在可以开始聊天了`;
              }
            }
            if(x.message.groupId>0&&x.message.userId!=Setting.UserId){
                content = `${x.nickName}：${content}`;
            }
            model.endContent = content;
            model.endTime = x.message.addTime;
            //如果当前窗口在打开状态，未读消息不加1
            if((this.selectedItem&&this.selectedItem.id==x.conversationId)||x.message.userId == Setting.UserId||(this.selectedItem&&x.message.groupId!=0&&x.message.groupId == this.selectedItem.groupId)){
              if(this.selectedItem&&x.message.userId!=Setting.UserId){
                this.conversationService.setRead(this.selectedItem.id,x.message.id).subscribe(data=>{
                  this.selectedItem.readEndId = x.message.id;
                  this.selectedItem.isTip = false;
                });
              }
            }else{
              model.noReads+=1;
              if(x.message.groupId>0){
                if(x.message.tipUsers&&x.message.tipUsers.length>0){
                  if(x.message.tipUsers==="ALL"||(<string>x.message.tipUsers).indexOf(`,${Setting.UserId},`)>-1){
                    model.isTip = true;
                  }
                }
              }
            } 
        }
        //会话列表排序
        this.sort();
      }

    });
    //同步其它设备消息已读
    this.managerService.conversationSetRead.subscribe(x=>{
      if(x>0&&this.conversations){
        this.conversations.forEach(item => {
          if(item.id===x){
              item.noReads = 0;
              item.isTip = false;
              return;
          } 
        });
      }
    });
    //更新好友备注
    this.managerService.setFriendRemark.subscribe(x=>{
      if(x&&this.conversations){
        this.conversations.forEach(item=>{
          if(x.fid == item.receiverId){
            item.name = x.remark;
            return;
          }
        });
      }
    });
    //开始新的会话
    this.managerService.newConversation.subscribe(x=>{
      if(x){
        if(this.conversations&&this.conversations.length>0){
          let conversation = this.conversations.find(y=>{
            return y.receiverId == x.friendId;
          })
          if(conversation){
            this.selectedItem = conversation;
            this.managerService.conversation.next(conversation);
            return;
          }
        }
        let conversation = new Conversation();
        conversation.name = ((x.remark&&x.remark.length>0)?x.remark:x.nickName);
        conversation.head = x.head;
        conversation.receiverId = x.friendId;
        conversation.userId = Setting.UserId;
        this.selectedItem = conversation;
        this.managerService.conversation.next(conversation);
      }
    });
    //添加新的会话
    this.managerService.addConversation.subscribe(x=>{
      if(!x) return;
      this.conversations.unshift(x);
    });
    //删除联系人
    this.managerService.removeContact.subscribe(x=>{
      if(!x) return;
      this.deleteConversation({receiverId:x});
    });
    //接收其它设备删除会话的请求
    this.managerService.deleteConversation.subscribe(x=>{
      if(!x) return;
      this.deleteConversation({conversationId:x});
    });
    /**本地请求删除会话 */
    this.managerService.removeConversation.subscribe(x=>{
      if(!x) return;
      let menu = new Menu();
      menu.id=2;
      menu.value = x;
      this.onmenuclick(menu);
    }) 
    /**清空消息记录 */
    this.managerService.clearHistory.subscribe(x=>{
      if(!x) return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach(y=>{
          if(y.id == x.conversation.id){
            y.endContent = "";
            y.noReads = 0;
            return;
          }
        })
      }
    });
    /**同步其它设备清空消息记录 */
    this.managerService.syncClearHistory.subscribe(x=>{
      if(!x) return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach(y=>{
          if(y.id == x.conversationId){
            y.endContent = "";
            y.noReads = 0;
            return;
          }
        })
      }
    })
    /**清空群组会话信息 */
    this.managerService.syncClearGroupHistory.subscribe(x=>{
      if(!x) return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach(y=>{
          if(y.groupId == x.gid){
            y.endContent = "";
            y.noReads = 0;
            return;
          }
        })
      }
    })
    /**解散群组 */
    this.managerService.disband.subscribe(x=>{
      if(!x) return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach((y,index)=>{
          if(y.groupId == x){
            this.dialog.open(DataDialogComponent,{data:`群主解散了群组 ${y.name}`});
            this.conversations.splice(index,1);
          }
        })
        //如果当前要删除的会话是选中的会话，那么清空选中的会话
        if(this.selectedItem&&this.selectedItem.groupId == x){
          this.selectedItem = null;
          //通知其它模块，当前选中的会话已被清空
          this.managerService.conversation.next(null);
        }
      }
    });
    /**同步其它设备置顶 */
    this.managerService.pinTopConversation.subscribe(x=>{
      if(!x)return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach((y,index)=>{
          if(y.id == x.conversationId){
            y.isPinTop = x.isPinTop;
            y.topTime = new Date();
            this.managerService.updateConversation.next(null);
            return;
          }
        });
      }
    });
    /**同步其它设备会话静音 */
    this.managerService.muteFriend.subscribe(x=>{
      if(!x)return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach((y,index)=>{
          if(y.receiverId == x.uid){
            y.isMute = x.isMute;
            return;
          }
        });
      }
    });
     /**同步其它设备会话静音 */
     this.managerService.muteGroup.subscribe(x=>{
      if(!x)return;
      if(this.conversations&&this.conversations.length>0){
        this.conversations.forEach((y,index)=>{
          if(y.groupId == x.gid){
            y.isMute = x.isMute;
            return;
          }
        });
      }
    });
  }
  //排序会话列表
  sort(){
    this.conversations.sort((a,b)=>{
      if(a.isPinTop>b.isPinTop){
        return -1;
      }else{
        if(a.isPinTop==false&&b.isPinTop==false){
          return (new Date(a.endTime.toString()))<(new Date(b.endTime.toString()))?1:-1;
        }else if(a.isPinTop==true&&b.isPinTop == true){
          return (new Date(a.topTime.toString()))<(new Date(b.topTime.toString()))?1:-1;
        }
        return 1;
      }
    });
  }
  //点击事件
  itemClick(conversation:Conversation){
    this.selectedItem = conversation;
    this.managerService.conversation.next(conversation);
  }
  //右击事件
  oncontextmenu(event:MouseEvent,item:Conversation){
      var newMenus:Menu[]=[];
      if(item.isPinTop){
        newMenus.push({id:0,name:'取消置顶',value:item})
      }else{
        newMenus.push({id:0,name:'置顶',value:item})
      }
      if(item.isMute){
        newMenus.push({id:1,name:'取消静音',value:item})
      }else{
        newMenus.push({id:1,name:'静音',value:item})
      }
      if(item.groupId>0){
        newMenus.push({id:2,name:'删除并退出',value:item})
      }else{
        newMenus.push({id:2,name:'删除会话',value:item})
      }
      this.menus = newMenus;
      var menuView:HTMLElement = this.menuView.nativeElement;
      var box:HTMLElement = <HTMLElement>document.getElementsByClassName("chatBox")[0];
      menuView.style.top = `${event.clientY+5-box.offsetTop}px`;
      menuView.style.left = `${event.clientX+5-box.offsetLeft}px`;
      menuView.style.display = "block";
      window.onclick = (e) =>{
        window.onclick = null;
        menuView.style.display = "none";
      }
      return false;
  }
  //菜单点击事件
  onmenuclick(item:Menu){
    switch(item.id){
      //置顶会话
      case 0:
        this.conversationService.setPinTop(item.value.id,!item.value.isPinTop).subscribe(x=>{
          item.value.isPinTop = !item.value.isPinTop;
          item.value.topTime = new Date();
          this.managerService.updateConversation.next(null);
        });
        break;
      //静音
      case 1:
        if(item.value.groupId>0){
          this.groupService.setMute(item.value.groupId,!item.value.isMute).subscribe(x=>{
            item.value.isMute = !item.value.isMute;
          });
        }else{
          this.friendService.setMute(item.value.receiverId,!item.value.isMute).subscribe(x=>{
            item.value.isMute = !item.value.isMute;
          });
        }
        break;
      //删除
      case 2:
        //退出群组
        if(item.value.groupId>0){
          let confirm = this.dialog.open(ConfirmDialogComponent,{panelClass:'confirmPanel',data:`确定要退出群组 ${item.value.name} ？`});
          confirm.afterClosed().subscribe(y=>{
            if(y&&y===true){
              this.groupService.leave(item.value.groupId).subscribe(x=>{
                this.deleteConversation({conversationId:item.value.id});
              });
            }
          });
        }else{
          this.conversationService.deleteModel(item.value.id).subscribe(x=>{
              this.deleteConversation({conversationId:item.value.id});
          })
        }
        break;
    }
  }

  //------------------------------------PRIVATE METHOD START---------------------------------//
  /**
   * 删除会话
   * @param conversationId 会话Id
   */
  private deleteConversation(data:{conversationId?:number,receiverId?:number}){
      if(!this.conversations) return;
      if(data.conversationId){
        //根据会话Id删除会话
        this.conversations.forEach((model,index)=>{
          if(model.id==data.conversationId){
            this.conversations.splice(index,1);
            if(this.selectedItem&&model.id===this.selectedItem.id){
              this.selectedItem = null;
              this.managerService.conversation.next(null);
            }
          }
        });
      }else{
        //根据联系人Id删除会话
        //循环会话列表删除会话
        this.conversations.forEach((y,index)=>{
          if(y.receiverId == data.receiverId){
            this.conversations.splice(index,1);
          }
        })
        //如果当前要删除的会话是选中的会话，那么清空选中的会话
        if(this.selectedItem&&this.selectedItem.receiverId == data.receiverId){
          this.selectedItem = null;
          //通知其它模块，当前选中的会话已被清空
          this.managerService.conversation.next(null);
        }
      }
  }
  //------------------------------------PRIVATE METHOD END-----------------------------------//
}
/**
 * 会话列表右键菜单
 */
export class Menu{
  /**
   * 标识菜单类型
   */
  id:number;
  /**
   * 菜单名称
   */
  name:string;
  /**
   * 绑定的会话
   */
  value:Conversation;
}