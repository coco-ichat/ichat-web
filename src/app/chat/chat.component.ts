import { Component, OnInit, ViewChild, ElementRef, AfterViewInit,ViewChildren, QueryList, ɵConsole } from '@angular/core';
import { MessageService } from './message.service';
import { Message,MessageType } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { ManagerService } from '../manager.service';
import { ChatService } from '../chat.service';
import { MatDialog } from '@angular/material/dialog';
import { DataDialogComponent } from '../control/data-dialog/data-dialog.component';
import { FileService } from '../serices/file.service';
import { GroupService } from '../serices/group.service';
import { Group } from '../models/Group';
import { Setting } from '../Setting';
import { formatDate, DOCUMENT } from '@angular/common';
import { ScrollBar } from '../control/scrollBar';
import { GroupUser } from '../models/GroupUser';
import { GroupUserService } from '../conversation-detail/group-user.service';
import { ConversationService } from '../conversation/conversation.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit,AfterViewInit {
  //消息窗口
  @ViewChild('chatBox',{static:false}) chatBox:ElementRef;
  //消息列表
  @ViewChildren('chatBox') box:QueryList<Message>;
  @ViewChild('scrollBox',{static:false}) scrollBox:ElementRef;
  //拖拽文件弹出遮罩
  @ViewChild('dropModal',{static:false}) dropModal:ElementRef;
  //文件选择按钮
  @ViewChild('btnFile',{static:false}) btnFile:ElementRef;
  //消息发送按钮
  @ViewChild('btnSend',{static:false}) btnSend:ElementRef;
  //消息输入框
  @ViewChild('inputView',{static:false}) inputView:ElementRef;

  setting = Setting;
  //时间最早一条消息
  lastMessage:Message;
  //当前窗口显示的会话
  conversation:Conversation=new Conversation();
  //消息列表
  messages:Message[]=[];
  //是否显示会话详情
  isShowDetail:boolean=false;
  //当前群组
  group:Group;
  //表情
  emojs:any[]=['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','😘','😗','😙','😚','😋','😜','😝','😛','🤑','🤗','🤓','😎','🤡','🤠','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','😤','😠','😡','😶','😐','😑','😯','😦','😧','😮','😲','😵','😳','😱','😨','😰','😢','😥','🤤','😭','😓','😪','😴','🙄','🤔','🤥','😬','🤐','🤢','🤧','😷','🤒','🤕','😈','👿','👹','👺','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾','👐','🙌','👏','🙏','🤝','👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤘','👌','👈','👉','👆','👇','☝️','✋','🤚','🖐','🖖','👋','🤙','💪','🖕','✍️','🤳','💅','🖖','💄','💋','👄','👅','👂','👃','👣','👁','👀'];
  //当前显示的消息的时间序号
  timeIndex:number = 0;
  //--------输入框内容 START---------//
  private _content:string="";
  set content(value:string){
      this._content = value;
      this.inputView.nativeElement.innerHTML  = this._content;
      //设置发送按钮的显示与隐藏
      if(this._content.trim().length>0){
        this.btnSend.nativeElement.style.display = "block";
        this.btnFile.nativeElement.style.display = "none";
      }else{
        this.btnSend.nativeElement.style.display = "none";
        this.btnFile.nativeElement.style.display = "block";
      }
  }
  get content(){
    return this.inputView.nativeElement.innerHTML;
  }
   //--------输入框内容 END---------//

  //构造函数
  constructor(
    public managerService:ManagerService,               //页面数据传递服务
    public dialog:MatDialog,                            //页面弹出框
    private messageService:MessageService,              //消息相关服务器同步服务
    private groupService:GroupService,                  //群组相关服务器同步服务
    private fileService:FileService,                    //文件相关服务器同步服务
    private groupUserService:GroupUserService,          //群组成员相关服务器同步服务
    private conversationService:ConversationService,    //会话相关服务器同步服务
    ){}

  //群成员
  groupUsers:GroupUser[]=[];
  isShow:boolean = false;
  //@好友
  tipUsers:string="";
  //模块加载完成之后
  ngOnInit(): void {
    //监听当前选择的会话
    this.managerService.conversation.subscribe(data=>{
      if(!data){
        this.first = true;
        this.isShow = false;
        this.isShowDetail = false;
        this.timeIndex = -1;
        this.conversation = new Conversation();
        this.messages = [];
        this.content = "";
        this.lastMessage = null;
        this.group = null;
        this.managerService.showConversationDetail.next(null);
        this.tipUsers="";
        setTimeout(() => {
          this.oninput({data:"",target:this.inputView.nativeElement});
        }, 0);
        return;
      }
      if(data&&(data.receiverId>0||data.groupId>0)){
        this.first = true;
        this.group = null;
        this.isShow = true;
        this.timeIndex = -1;
        this.conversation = data;
        this.messages = [];
        this.content = "";
        this.tipUsers ="";
        this.lastMessage = null;
        setTimeout(() => {
          this.oninput({data:"",target:this.inputView.nativeElement});
           //发送消息输入框获取焦点
          this.inputView.nativeElement.focus();
        }, 0);
        //加载消息
        let lastMessageId = this.conversation.readEndId;
        if(lastMessageId > 0){
          lastMessageId+=1;
        } else{
          let tipNoReadMsg = new Message();
          tipNoReadMsg.content = '以下是未读消息';
          tipNoReadMsg.msgType = <number>MessageType.未读提示;
          this.messages.push(tipNoReadMsg);
        }

        this.messageService.getHistory(lastMessageId,this.conversation.receiverId,this.conversation.groupId).subscribe(data=>{
          if(data){
            //反转数据，按AddTime Asc排序
            var datas = data.reverse();
            if(datas.length>0) this.lastMessage = datas[0];
            for(var i=0;i<datas.length;i++){
                //如果当前消息是好友添加的消息，插入提示
                if(datas[i].msgType==MessageType.好友添加消息){
                  if(datas[i].userId == Setting.UserId){
                    datas[i].content= `你已添加了${this.conversation.name},现在可以开始聊天了`;
                  }else{
                    datas[i].content = `${this.conversation.name}同意了你的好友请求,现在可以开始聊天了`;
                  }
                }
                //-------------------消息时间分组 START--------------------//
                //当前的时间消息
                let time1 = formatDate(datas[i].addTime,"M/d/yy",navigator.language);
                //上一条的时间消息
                let time2 = i==0? '00000' : formatDate(datas[i-1].addTime,"M/d/yy",navigator.language);
                //如果两条消息不一样，插入时间--M月d日--当前滚动条所在的时间位置+1
                if(time1!=time2){
                  let message:Message = new Message();
                  message.content = formatDate(datas[i].addTime,"M月d日",navigator.language);
                  message.msgType = <number>MessageType.时间消息;
                  this.messages.push(message);
                  this.timeIndex+=1;
                }
                 //-------------------消息时间分组 END--------------------//
                this.messages.push(datas[i]);
            }
            this.refreshScroll();
          }
          //如果是群组消息，在加载完之后加载群组成员@显示
          if(this.conversation.groupId>0){
            this.groupUserService.getUsers(this.conversation.groupId).subscribe(data=>{
              data.forEach((x,index)=>{
                if(x.userId===Setting.UserId){
                  data.splice(index,1);
                }
              })
              let allUsers = new GroupUser();
              allUsers.nickName = "全部";
              allUsers.userId = 0;
              data.unshift(allUsers);
              this.groupUsers = this.searchUsers = data;
            });
          }
          //如果有未读消息，加载完成之后设置消息已读
          if(this.conversation.noReads>0){
            if(lastMessageId>0){
              let tipNoReadMsg = new Message();
              tipNoReadMsg.content = '以下是未读消息';
              tipNoReadMsg.msgType = <number>MessageType.未读提示;
              this.messages.push(tipNoReadMsg);
              this.messageService.getHistory(this.conversation.readEndId,this.conversation.receiverId,this.conversation.groupId,this.conversation.noReads,1).subscribe(newData=>{
                  if(newData){
                    for(var i=0;i<newData.length;i++){
                      //如果当前消息是好友添加的消息，插入提示
                      if(newData[i].msgType==MessageType.好友添加消息){
                        if(newData[i].userId == Setting.UserId){
                          newData[i].content= `你已添加了${this.conversation.name},现在可以开始聊天了`;
                        }else{
                          newData[i].content = `${this.conversation.name}同意了你的好友请求,现在可以开始聊天了`;
                        }
                      }
                      //-------------------消息时间分组 START--------------------//
                      //当前的时间消息
                      let time1 = formatDate(newData[i].addTime,"M/d/yy",navigator.language);
                      //上一条的时间消息
                      let time2 = i==0? '00000' : formatDate(newData[i-1].addTime,"M/d/yy",navigator.language);
                      //如果两条消息不一样，插入时间--M月d日--当前滚动条所在的时间位置+1
                      if(time1!=time2){
                        let message:Message = new Message();
                        message.content = formatDate(newData[i].addTime,"M月d日",navigator.language);
                        message.msgType = <number>MessageType.时间消息;
                        this.messages.push(message);
                      }
                       //-------------------消息时间分组 END--------------------//
                      this.messages.push(newData[i]);
                    }
                    setTimeout(() => {
                      if((this.lastScrollTop+280)>this.scrollBox.nativeElement.scrollHeight){
                        (<HTMLElement>this.scrollBox.nativeElement).scrollTo(0,this.scrollBox.nativeElement.scrollHeight);
                        this.lastScrollTop = this.scrollBox.nativeElement.scrollHeight;
                      }else{
                        (<HTMLElement>this.scrollBox.nativeElement).scrollTo(0,this.lastScrollTop+280);
                        this.lastScrollTop = this.lastScrollTop+280;
                      }
                    }, 0);
                  }
                  this.conversationService.setRead(this.conversation.id,this.messages[this.messages.length-1].id).subscribe(data=>{
                    //同步成功，更新UI
                    this.conversation.isTip = false;
                    this.conversation.noReads = 0;
                    this.conversation.readEndId = this.messages[this.messages.length-1].id;
                 });
              });
            }
            else{
              this.conversationService.setRead(this.conversation.id,this.messages[this.messages.length-1].id).subscribe(data=>{
                //同步成功，更新UI
                this.conversation.isTip = false;
                this.conversation.noReads = 0;
                this.conversation.readEndId = this.messages[this.messages.length-1].id;
             });
            }
          }
        });
        //如果是群组，加载群组基本信息
        if(this.conversation.groupId>0){
          this.groupService.getInfo(this.conversation.groupId).subscribe(data=>{
              this.group = data;
          });
        }
        //如果显示会话信息，加载会话信息
        if(this.isShowDetail){
            this.managerService.showConversationDetail.next(this.conversation);
        }
      }
    })
    //监听消息接收
    this.managerService.addMessage.subscribe(data=>{
      if(data.id){
        this.messages.push(data);
        this.refreshScroll();
      }
    })
    //清空消息记录
    this.managerService.clearHistory.subscribe(x=>{
      if(!x) return;
      if(this.messages&&this.messages.length>0){
        if(x.isAll&&x.isAll===true){
          this.groupService.clearHistory(this.conversation.groupId,this.messages[this.messages.length-1].id).subscribe(y=>{
            this.messages = [];
            this.timeIndex = -1;
            this.lastMessage = null;
          });
        }else{
          this.conversationService.clearHisotry(this.conversation.id,this.messages[this.messages.length-1].id).subscribe(y=>{
            this.messages = [];
            this.timeIndex = -1;
            this.lastMessage = null;
          });
        }
      }
    })
    //同步其它设备清除会话
    this.managerService.syncClearHistory.subscribe(x=>{
      if(!x) return;
      if(this.conversation&&this.conversation.id==x.conversationId){
        if(this.messages&&this.messages.length>0){
          this.messages = [];
          this.timeIndex  = -1;
          this.lastMessage = null;
        }
      }
    })
    //同步服务器清除群组会话
    this.managerService.syncClearGroupHistory.subscribe(x=>{
      if(!x) return;
      if(this.conversation&&this.conversation.groupId == x.gid){
        if(this.messages&&this.messages.length>0){
          this.messages = [];
          this.timeIndex  = -1;
          this.lastMessage = null;
        }
      }
    });
  }

  //消息时间淡入淡出计时器
  timer:any;
  //消息时间元素
  @ViewChild('time',{static:false}) time:ElementRef;
  /**
   * 鼠标滚动显示消息时间
   * @param moveY 移动的距离
   */
  showTime(moveY:number){
    if(this.first){
      return;
    } 
    //鼠标滚动，取消计时器
    if(this.timer){
      clearTimeout(this.timer);
    }
    var element = <HTMLSpanElement>this.time.nativeElement;
    var scrollBox = <HTMLSpanElement>this.scrollBox.nativeElement;
    let time = <HTMLElement>document.getElementsByClassName("system_time")[this.timeIndex];
    if(moveY<0){
      if(scrollBox.scrollTop<(time.offsetTop+25)){
        this.timeIndex = this.timeIndex-1;
        if(this.timeIndex < 0) this.timeIndex = 0;
        time = <HTMLElement>document.getElementsByClassName("system_time")[this.timeIndex];
      }
      let arrays =  document.getElementsByClassName("system_time");
      if(this.timeIndex<(arrays.length-1)){
        let lasttime = <HTMLElement>document.getElementsByClassName("system_time")[this.timeIndex+1];
        if((lasttime.offsetTop-scrollBox.scrollTop)<50){
          element.style.display = 'none';
          element.style.opacity = "0";
          return;
        }
      }
      if((scrollBox.scrollTop-25) <= time.offsetTop){
        element.style.display = 'none';
        element.style.opacity = "0";
      }else{
        if(element.style.display=="none"||element.style.display==""){
          element.style.display ="block";
        }
        if(element.style.opacity == "0"){
          var speed = speed || 30 ;
          var num = 0;
          var st = setInterval(function(){
            num++;
            element.style.opacity = (num/10)+"";
            if(num>=10)  {  clearInterval(st);  }
          },speed);
        }
        element.innerText = time.innerText;
        //重置计时器，1s之后不滚动，隐藏消息时间
        this.timer = setTimeout(() => {
          if(element.style.opacity =="1"){
            var speed = speed || 30 ;
            var num = 10;
            var st = setInterval(function(){
              num--;
              element.style.opacity = (num / 10)+"" ;
              if(num<=0)  {  
                clearInterval(st);
                element.style.display="none";
              }
            },speed);
          }
        }, 1000);
      }
     
    }else{
      this.timer = setTimeout(() => {
          var speed = speed || 30 ;
          var num = 10;
          var st = setInterval(function(){
            num--;
            element.style.opacity = (num / 10)+"" ;
            if(num<=0)  {  
              clearInterval(st);
              element.style.display="none";
            }
          },speed);
      }, 100);
      if(scrollBox.scrollTop>time.offsetTop){
        this.timeIndex = this.timeIndex+1;
        let arrays =  document.getElementsByClassName("system_time");
        if(this.timeIndex>(arrays.length-1)){
          this.timeIndex = arrays.length-1;
        }
      }
    }
    let cTop = this.scrollBox.nativeElement.scrollTop;
    let cHeight = this.scrollBox.nativeElement.scrollHeight;
    if(((cHeight-cTop)/cHeight)>0.8){
      this.loadHistory();
      return false;
    }

  }

  //当前光标位置
  cursorPosition:number=0;
  /**
   * 插入表情
   * @param emoj 表情符号
   */
  inserEmoj(emoj:string){
      let range:Range = document.getSelection().getRangeAt(0);
      let node = document.getSelection().focusNode;
      // let positon = range.startOffset;
      if(node.nodeName.toLowerCase() === "#text"&&node.parentElement.classList.contains("input-view")){
      }else if(node.nodeName.toLowerCase() === "div"&&(<HTMLDivElement>node).classList.contains("input-view")){

      }else{
        range = document.createRange();
        range.selectNodeContents(this.inputView.nativeElement);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);
        range.collapse(false);
        // range.set(this.inputView.nativeElement);
      }
      setTimeout(()=>{
        // //创建TextNode，否则选则的内容是输入框整个DIV会报错
        let text = document.createTextNode('');
        text.textContent = emoj;
        range.insertNode(text);
        range.collapse(false);

        // //获取当前的Range
        // //清除输入框的内容
        // range.startContainer.textContent = null;
        // //对输入框重新赋值
        // range.startContainer.appendChild(text);
        // //设置光标的位置
        // range.setStart(text,positon);
      },0);
      setTimeout(()=>{
        //输入框获取焦点
        (<HTMLDivElement>this.inputView.nativeElement).focus();
      },0);
      setTimeout(() => {
        //调整输入框的大小
        this.oninput({data:emoj,target:this.inputView.nativeElement});
      }, 0);
  }

  /**
   * 刷新滚动条
   */
  private refreshScroll(){
    setTimeout(() => {
      (<HTMLElement>this.scrollBox.nativeElement).scrollTo(0,this.scrollBox.nativeElement.scrollHeight);
      this.lastScrollTop = this.scrollBox.nativeElement.scrollHeight;
    }, 0);
  }
  /**
   * 页面加载完之后
   */
  first:boolean = true;
  @ViewChild("tipFriends",{static:false}) tipFriends:ElementRef;
  lastScrollTop = 0;
  ngAfterViewInit(){
    let scrollBox = <HTMLElement>this.scrollBox.nativeElement;
    scrollBox.addEventListener("scroll",()=>{
       let st = scrollBox.scrollTop;
       if(st>this.lastScrollTop){
          this.showTime(1);
       }else{
          this.showTime(-1);
       }
       this.lastScrollTop = st;
    });
    scrollBox.addEventListener("wheel",()=>{
      this.first = false;
    });
    scrollBox.addEventListener('mousedown',()=>{
      this.first = false;
    })
    // //消息滚动条
    // var scroll = new ScrollBar(this.chatBox.nativeElement.parentElement);
    // //绑定鼠标滚动事件
    // scroll.onwhell =(event,view)=> this.showTime(event.deltaY,view);
    // //绑定滚动条拖拽滚动事件
    // scroll.onmove = (event,moveY,currentY,view)=>this.showTime(currentY,view);
    //@窗口滚动条
    var scroll2 = new ScrollBar(this.tipFriends.nativeElement);
    //消息加载完重置滚动条位置，显示最后一条消息
    this.box.changes.subscribe(x=>{
      // console.log(this.first);
      // if(this.first){
        
        // this.first = false;
      // }
      // console.log(height);
      // console.log(this.chatBox);
      // setTimeout(() => {
      //   var height = this.chatBox.nativeElement.scrollHeight-474;
      //   height = height<0?0:height;
      //   this.chatBox.nativeElement.style.top = `-${height}px`;
      // }, 40);
    });
    
  }

  /**
   * 加载历史消息
   */
  isloading = false;
  private loadHistory(){
    //最早一条消息不存在，或者正在加载返回
    if(!this.lastMessage||this.isloading==true) return;
    //正在加载，防止鼠标滚动太快多次加载数据
    this.isloading = true;
    //加载历史消息--按AddTime Desc加载
    this.messageService.getHistory(this.lastMessage.id,this.conversation.receiverId,this.conversation.groupId).subscribe(x=>{
        if(x){
          //设置最早的消息，表示还可以继续滚动加载
          this.lastMessage = x[x.length-1];
          //如果消息小于50条，说明已经加载完毕，清空最早的消息，继续滚动无法加载
          if(x.length<50) this.lastMessage=null;
          //当前消息列表按AddTime Asc排序，加载的数据按AddTime Desc排序，所以循环添加到数组的开始位置
          for(var i=0;i<x.length;i++){
              //当前的消息的时间
              let time1 = formatDate(x[i].addTime,"M/d/yy",navigator.language);
              //上一条消息的时间，如果是第一次，那么上一条消息必定为时间消息，所以获取上上一条的消息
              let time2 = (i==0||this.messages[0].msgType==<number>MessageType.时间消息)? formatDate(this.messages[1].addTime,"M/d/yy",navigator.language) : formatDate(x[i-1].addTime,"M/d/yy",navigator.language);
              //如果历史记录跟上一条消息是同一个时间，那么在上一条时间消息之前插入数据
              if((i==0||this.messages[0].msgType==<number>MessageType.时间消息)&&time1==time2){
                  this.messages.splice(1,0,x[i]);
                  continue;
              }
              //否则插入时间消息
              if(time1!=time2&&this.messages[0].msgType!=<number>MessageType.时间消息){
                let message:Message = new Message();
                message.content = formatDate(x[i-1].addTime,"M月d日",navigator.language);
                message.msgType = <number>MessageType.时间消息;
                this.messages.unshift(message);
                this.timeIndex+=1;
              }
              //插入数据
              this.messages.unshift(x[i]);
              //数据加载完，最后在最上面再插入一条消时间消息
              if(i==x.length-1){
                let message:Message = new Message();
                message.content = formatDate(x[i].addTime,"M月d日",navigator.language);
                message.msgType = <number>MessageType.时间消息;
                this.messages.unshift(message);
                this.timeIndex+=1;
              }
          }
          this.isloading = false;
          return;
        }
        this.isloading = false;
        this.lastMessage = null;
    });
  }
  
  /**
   * 获取输入框光标相对于输入框的X,Y坐标位置
   * @param view 输入框
   * @param position 当前光标的位置
   */
  private getCursorXY(view:HTMLDivElement,position:number):{X:number,Y:number}{
    let div = document.createElement('div');
    let copystyle:any = getComputedStyle(view);
    for(var item of copystyle){
      div.style[item] = copystyle[item];
    }
    div.style['position'] = "relative";      
    const textContent = view.innerHTML.substr(0,position-1);
    div.innerHTML = textContent;
    const span = document.createElement('span')
    span.textContent = view.innerHTML.substr(position-1,1);
    div.appendChild(span)
    div.append(view.innerHTML.substr(position));
    document.body.appendChild(div);
    let result = {X:span.offsetLeft,Y:span.offsetTop};
    document.body.removeChild(div);
    return result;
  }

  /**
   * 点击·@·弹出框
   * @param model 当前点击的群组成员
   */
  clickTip(model:GroupUser){
    window.onkeydown = null;
    window.onmousedown = null;
    let span = document.createElement("span");
    span.contentEditable = "false";
    span.textContent = `@${model.nickName}`;
    span.style['font-size']="15px";
    span.style['padding-left']="2px";
    span.style['padding-right']="2px";
    span.style['margin-right']="4px";
    span.style['background-color']="rgba(22, 134, 217, 0.1)";
    span.style['border-radius']="4px";
    span.style['display'] = "inline-block";
    span.setAttribute('data',model.userId.toString());
    let range = document.getSelection().getRangeAt(0);
    let oldContent = range.startContainer.textContent;
    let preContent = oldContent.substr(0,range.endOffset);
    let nextContent = oldContent.substr(range.endOffset);
    let newContent = preContent.substr(0,preContent.lastIndexOf('@'))+nextContent;
    range.startContainer.textContent = newContent;
    range.setStart(range.startContainer,preContent.lastIndexOf('@'));
    range.insertNode(span);
    range.collapse(false);
    //TODO FENG
    // let space = document.createTextNode(' ');
    // range.insertNode(space);
    // range.collapse(false);
    // (<Text>document.getSelection().getRangeAt(0).startContainer).after(span);
    // document.getSelection().getRangeAt(0).collapse(false);
    // let position = document.getSelection().getRangeAt(0).endOffset;
    // this.content= this.content.substr(0,position)+span.outerHTML+this.content.substr(position);
    // console.log(position)
    setTimeout(() => {
      if(this.selectedElement) this.selectedElement.style['background-color']="";
      setTimeout(()=>{
        this.oninput({data:model.nickName,target:this.inputView.nativeElement});
      },0);
      (<HTMLElement>this.tipFriends.nativeElement).style['visibility'] = "hidden";
    },0);
    this.inputView.nativeElement.focus();
  }
  selectedIndex:number=0;
  selectedElement:HTMLElement;
  searchText:string="";
  searchUsers:GroupUser[]=[];
  searchTextPositon:number=0;

  /**
   * 调整页面高度
   * @param event 
   */
  oninput(event:any){
      let view = <HTMLDivElement>event.target;
      if(this.content.trim().length>0){
         this.btnSend.nativeElement.style.display = "block";
         this.btnFile.nativeElement.style.display = "none";
      }else{
         this.btnSend.nativeElement.style.display = "none";
         this.btnFile.nativeElement.style.display = "block";
      }
      // this.content = view.innerHTML;
      let preView = <HTMLDivElement>this.chatBox.nativeElement.parentElement.parentElement;
      view.style.height = '25px';
      if(view.scrollHeight>150){
        view.style.overflowY = "auto";
        view.style.height = '150px';
        preView.style.marginTop = (-(150-25))+"px";
        view.parentElement.style.height = 50+(150-25)+"px";
        // if(view.scrollHeight)
      }else{
        view.style.overflowY = "hidden";
        preView.style.marginTop = (-(view.scrollHeight-25))+"px";
        view.parentElement.style.height = 50+(view.scrollHeight-25)+"px";
        view.style.height = view.scrollHeight+ "px";
      }
    
      if((<HTMLElement>this.tipFriends.nativeElement).style['visibility']=="visible"){
          let selectionEnd = document.getSelection().getRangeAt(0).endOffset;
          // let size = this.getCursorXY(view,selectionEnd);
          let rect = document.getSelection().getRangeAt(0).getBoundingClientRect();
          // let size = this.getCursorXY(view,this.searchTextPositon);
          let dropBox = <HTMLElement>document.getElementsByClassName('dropBox')[0];
          let inputBox = <HTMLElement>document.getElementsByClassName('windows_input')[0];
          let bodyBox = <HTMLElement>document.getElementsByClassName('chatBox')[0];
          let left = rect.left-dropBox.offsetLeft-inputBox.offsetLeft-bodyBox.offsetLeft;
          let top = rect.top-dropBox.offsetTop-bodyBox.offsetTop;
          let tip = <HTMLElement>this.tipFriends.nativeElement;
          if(selectionEnd<this.searchTextPositon){
            window.onkeydown = null;
            window.onmousedown = null;
            if(this.selectedElement) this.selectedElement.style['background-color']="";
            (<HTMLElement>this.tipFriends.nativeElement).style['visibility'] = "hidden";
          }else{
            if(event.data){
              this.searchText+=event.data;
            }else{
                //退格删除键
                if(event.inputType.toLowerCase() == "deleteContentBackward".toLocaleLowerCase()){
                    if((selectionEnd+1)<=(this.searchText.length+this.searchTextPositon)){
                        let position = selectionEnd-this.searchTextPositon;
                        this.searchText = this.searchText.substring(0,position)+this.searchText.substring(position+1);
                    }
                }
                //向前删除键
                if(event.inputType.toLowerCase() == "deleteContentForward".toLocaleLowerCase()){
                  if(selectionEnd<=(this.searchText.length+this.searchTextPositon)){
                    let position = selectionEnd-this.searchTextPositon;
                    this.searchText = this.searchText.substring(0,position)+this.searchText.substring(position+1);
                  }
                }
            }
            let searchResults = [];
            this.groupUsers.forEach(x=>{
              if(x.nickName.toLowerCase().indexOf(this.searchText.toLowerCase())>-1){
                  searchResults.push(x);
              }
            });
            if(searchResults.length>0){
              this.searchUsers = searchResults;
              setTimeout(() => {
                if(this.selectedElement) this.selectedElement.style['background-color']="";
                let tipHeight=(<HTMLElement>tip.firstChild).clientHeight;
                if(tipHeight>200) tipHeight = 200;
                tip.style['height'] = tipHeight+"px";
                tip.style['top']=(top-tipHeight)+"px";
                tip.style['left']=left+"px";
                this.selectedIndex = 0;
                this.selectedElement = <HTMLLIElement>(<HTMLUListElement>tip.firstChild).children[this.selectedIndex];
                this.selectedElement.style['background-color'] = "#d6d5d5";
              }, 0);
            }else{
              window.onkeydown = null;
              window.onmousedown = null;
              if(this.selectedElement) this.selectedElement.style['background-color']="";
              (<HTMLElement>this.tipFriends.nativeElement).style['visibility'] = "hidden";
            }
          }
      }
      //如果是@，则显示提示窗口
      setTimeout(() => {
        let word = event.data;
        if(word==='@'&&this.conversation.groupId>0){
          this.searchUsers = this.groupUsers;
          this.searchText = "";
          this.searchTextPositon = document.getSelection().getRangeAt(0).endOffset;
          let rect = document.getSelection().getRangeAt(0).getBoundingClientRect();
          // let size = this.getCursorXY(view,this.searchTextPositon);
          let dropBox = <HTMLElement>document.getElementsByClassName('dropBox')[0];
          let inputBox = <HTMLElement>document.getElementsByClassName('windows_input')[0];
          let bodyBox = <HTMLElement>document.getElementsByClassName('chatBox')[0];
          let left = rect.left-dropBox.offsetLeft-inputBox.offsetLeft-bodyBox.offsetLeft;
          let top = rect.top-dropBox.offsetTop-bodyBox.offsetTop;
          let tip = <HTMLElement>this.tipFriends.nativeElement;
          setTimeout(() => {
            let tipHeight=(<HTMLElement>tip.firstChild).clientHeight;
            if(tipHeight>200) tipHeight = 200;
            tip.style['height'] = tipHeight+"px";
            // tip.style['top']=size.Y+view.offsetTop-tipHeight-view.scrollTop+"px";
            // tip.style['left']=size.X+view.offsetLeft+15+"px";
            tip.style['top']=(top-tipHeight)+"px";
            tip.style['left']=left+"px";
            tip.style['visibility'] = "visible";
            let count = (<HTMLUListElement>tip.firstChild).childElementCount;
            let boxElement = (<HTMLUListElement>tip.firstChild);
            boxElement.style['top']="0px";
            this.selectedIndex = 0;
            this.selectedElement = <HTMLLIElement>(<HTMLUListElement>tip.firstChild).children[this.selectedIndex];
            this.selectedElement.style['background-color'] = "#d6d5d5";
            window.onkeydown=(keyevent:KeyboardEvent)=>{
              if(this.selectedElement) this.selectedElement.style['background-color']="";
              switch(keyevent.keyCode){
                //上键
                case 38:
                  keyevent.preventDefault();
                  keyevent.stopPropagation();
                  this.selectedIndex-=1;
                  if(this.selectedIndex<0) this.selectedIndex = 0;
                  break;
                //下键
                case 40:
                  keyevent.preventDefault();
                  keyevent.stopPropagation();
                  this.selectedIndex+=1;
                  if(this.selectedIndex>(count-1)) this.selectedIndex = count-1;
                  break;
                //回车键
                case 13:
                    keyevent.preventDefault();
                    keyevent.stopPropagation();
                    window.onkeydown = null;
                    window.onmousedown = null;
                    setTimeout(() => {
                      this.selectedElement.click();
                    },0);
                  break;
              }
              this.selectedElement = <HTMLLIElement>(<HTMLUListElement>tip.firstChild).children[this.selectedIndex];
              this.selectedElement.style['background-color'] = "#d6d5d5";
              if((this.selectedElement.offsetTop+boxElement.offsetTop)>=200){
                boxElement.style['top']=-(this.selectedElement.offsetTop-200+40)+"px";
              }
              if(this.selectedElement.offsetTop<(-5-boxElement.offsetTop)){
                boxElement.style['top'] = -this.selectedElement.offsetTop+"px";
              }
            }
            //鼠标按下隐藏@提示窗口
            window.onmousedown=(mouseevent:MouseEvent)=>{
              //过滤当前的@提示窗口
              let isTip = false;
              mouseevent.composedPath().forEach(x=>{
                  if((<HTMLElement>x).className){
                    if((<HTMLElement>x).className.indexOf('tip_friends')>-1){
                      isTip = true;
                      return;
                    }
                  }
              });
              if(isTip){
                return;
              }
              if(this.selectedElement) this.selectedElement.style['background-color']="";
              tip.style['visibility'] = "hidden";
              window.onkeydown = null;
              window.onmousedown = null;
            }
          }, 0);
        }
      }, 0);
  }

  /**
   * 回车键发送消息
   * @param event 按键事件
   */
  onkeypress(event:KeyboardEvent){
    if(event.which == 13&&!event.shiftKey){
      event.preventDefault();
        this.send();
    }
    // if(event.which == 13 && event.shiftKey){
    //   event.preventDefault();
    //   let range:Range = document.getSelection().getRangeAt(0);
    //   let rect = range.getBoundingClientRect();
    //   let length = range.startContainer.textContent.length;
    //   let position = range.startOffset;
    //   let text:Text = document.createTextNode('\n\n');
    //   let dropBox = <HTMLElement>document.getElementsByClassName('dropBox')[0];
    //   let inputBox = <HTMLElement>document.getElementsByClassName('windows_input')[0];
    //   let bodyBox = <HTMLElement>document.getElementsByClassName('chatBox')[0];
    //   console.log(range.startContainer.textContent);
    //   console.log(range.startContainer.nextSibling);
    //   console.log(position);
    //   console.log(length);
    //   console.log(range.startContainer.textContent);
    //   if(position != range.startContainer.textContent.length||(range.startContainer.nextSibling&&range.startContainer.nextSibling.textContent.indexOf('\n')==0)){
    //     position -=1;
    //     text = document.createTextNode('\n');
    //   }
    //   range.insertNode(text);
    //   range.collapse(false);
    //   setTimeout(() => {
    //     let view = <HTMLDivElement>this.inputView.nativeElement;
    //     //调整输入框的大小
    //     if(position === length){
    //       this.oninput({data:"\n\n",target:this.inputView.nativeElement});
    //       setTimeout(()=>{
    //         if(view.scrollHeight>150){
    //           view.scrollTop = view.scrollHeight;
    //         }
    //       })
    //     }else{
    //       this.oninput({data:"\n",target:this.inputView.nativeElement});
    //         setTimeout(()=>{
    //           if(view.scrollHeight>150){
    //             if(rect.top-dropBox.offsetTop-inputBox.offsetTop-bodyBox.offsetTop+25>=150)
    //             {
    //               view.scrollTop += rect.top-dropBox.offsetTop-inputBox.offsetTop-bodyBox.offsetTop+25-14-125;
    //             }
    //           }
    //         },0);
    //     }
    //   }, 0);
    //   // let position = range.startOffset;
    //   // if(position === this.content.length){
    //   //   this.content= this.content.substr(0,position)+"\n\n"+this.content.substr(position);
    //   // }else{
    //   //   this.content= this.content.substr(0,position)+"\n"+this.content.substr(position);
    //   // }
    //   // position+=1;
    //   // //输入框获取焦点
    //   // setTimeout(()=>{
    //   //   //创建TextNode，否则选则的内容是输入框整个DIV会报错
    //   //   let text = document.createTextNode(this.content);
    //   //   //获取当前的Range
    //   //   //清除输入框的内容
    //   //   range.startContainer.textContent = null;
    //   //   //对输入框重新赋值
    //   //   range.startContainer.appendChild(text);
    //   //   //设置光标的位置
    //   //   range.setStart(text,position);
    //   // },0);
    //   // setTimeout(() => {
    //   //   let view = <HTMLDivElement>this.inputView.nativeElement;
    //   //   //调整输入框的大小
    //   //   if((position+1) === this.content.length){
    //   //     this.oninput({data:"\n\n",target:this.inputView.nativeElement});
    //   //     setTimeout(()=>{
    //   //       if(view.scrollHeight>150){
    //   //         view.scrollTop = view.scrollHeight;
    //   //       }
    //   //     })
    //   //   }else{
    //   //     this.oninput({data:"\n",target:this.inputView.nativeElement});
    //   //     setTimeout(()=>{
    //   //       let size = this.getCursorXY(view,position+1);
    //   //       if(view.scrollHeight>150){
    //   //         if(size.Y>=(view.scrollTop+150))
    //   //         {
    //   //           view.scrollTop = size.Y-125;
    //   //         }
    //   //       }
    //   //     },0);
    //   //   }
    //   // }, 0);
    // }
  }

  //发送消息
  send(){
    
    if(this.content.trim().length==0){return;}
    var model = {
        ReceiverId:this.conversation.receiverId,
        GroupId:this.conversation.groupId,
        Content:this.inputView.nativeElement.textContent.trimLeft().trimRight(),
        MsgType:0,
        tipUsers:null,
    };

    let inputDiv = <HTMLDivElement>this.inputView.nativeElement;
    let spans = inputDiv.getElementsByTagName('span');
    if(spans&&spans.length>0){
      model.tipUsers = ',';
      for(let i=0;i<spans.length;i++){
        let item = spans[i];
        if(item.getAttribute('data')==='0'){
          model.tipUsers = "ALL";
          break;
        }else{
          model.tipUsers+=item.getAttribute('data')+',';
        }
      }
    }
    let message=new Message();
    message.groupId = model.GroupId;
    message.receiverId = model.ReceiverId;
    message.head=Setting.Head;
    message.content=model.Content;
    message.msgType = model.MsgType;
    message.addTime = new Date();
    message.nickName=Setting.NickName;
    message.id = 0;
    message.userId = Setting.UserId;
    this.messages.push(message);
    this.refreshScroll();
    if(this.conversation.id>0){
      this.managerService.updateConversation.next({message});
    }
    this.content="";
    setTimeout(() => {
      this.oninput({data:"",target:this.inputView.nativeElement});
    }, 0);
    this.inputView.nativeElement.focus();
    ChatService.connection.invoke("SendMessage",model).then(x=>{
      if(x==null){
        return;
      }
      message.addTime = x.addTime;
      message.id = x.id;
      this.conversation.readEndId = x.id;
      if(this.conversation.id<1){
        this.conversation.id = x.conversationId;
        let content = message.content;
        let types = ['','[图片]','[语音]','[文件]','[视频]'];
        if(message.msgType>0&&message.msgType<5){
          content = types[message.msgType];
        }
        this.conversation.endContent = content;
        this.conversation.endTime = message.addTime;
        this.managerService.addConversation.next(this.conversation);
      }
    });
  }
 
  /**
   * 显示会话详细信息
   */
  showDetail(){
    if(!this.isShowDetail){
      this.managerService.showConversationDetail.next(this.conversation);
      this.isShowDetail = true;
    }else{
      this.managerService.showConversationDetail.next(null);
      this.isShowDetail = false;
    }
  }

  /**
   * 选择文件
   */
  openFile(){
    var input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange =async (e:Event)=>{
      await this.checkFile((<HTMLInputElement>e.target).files);
    }
    input.click();
  }

  /**
   * 复制获取粘贴板内容
   * @param event 
   */
  async paste(event:ClipboardEvent){
    var data = event.clipboardData;
    var type = data.items[0].type;
    var content:any;
    if(type.startsWith('image')){
      var file = data.items[0].getAsFile();
      let img = await this.getImgInfo(file);
      let msgType:number = MessageType.图文消息;
      content = {Name:file.name,Path:img.src,Width:img.width,Height:img.height,Size:file.size};
      var message=new Message();
      message.groupId = this.conversation.groupId;
      message.receiverId = this.conversation.receiverId;
      message.addTime = new Date();
      message.head = Setting.Head;
      message.nickName=Setting.NickName;
      message.id = 0;
      message.userId = Setting.UserId;
      message.msgType = msgType;
      message.content = JSON.stringify(content);
      this.messages.push(message);
      this.refreshScroll();
      this.managerService.updateConversation.next({message});
      this.fileService.upload(file).subscribe(data=>{
        content.Path = data;
        var model = {
          ReceiverId:this.conversation.receiverId,
          GroupId:this.conversation.groupId,
          Content:JSON.stringify(content),
          MsgType:message.msgType,
        };
        ChatService.connection.invoke("SendMessage",model).then(x=>{
          message.addTime = x.addTime;
          message.id = x.id;
        });
      });
    }
    if(type.startsWith('text/plain')){
      event.preventDefault();
      data.items[0].getAsString((html)=>{
        document.execCommand('insertHTML',true,html);
        let view = <HTMLDivElement>this.inputView.nativeElement;
        setTimeout(()=>{
          let dropBox = <HTMLElement>document.getElementsByClassName('dropBox')[0];
          let inputBox = <HTMLElement>document.getElementsByClassName('windows_input')[0];
          let bodyBox = <HTMLElement>document.getElementsByClassName('chatBox')[0];
          let rect = document.getSelection().getRangeAt(0).getBoundingClientRect();
          if(view.scrollHeight>150){
            if(rect.top-dropBox.offsetTop-inputBox.offsetTop-bodyBox.offsetTop>=150)
            {
              view.scrollTop += rect.top-dropBox.offsetTop-inputBox.offsetTop-bodyBox.offsetTop-14-125;
            }
          }
        },0);
      });
    }
  }
  /**
   * 获取图片信息
   * @param file 图片文件
   */
  private async getImgInfo(file:File):Promise<{src:string,width:number,height:number}>{
    var promise = new Promise<{src:string,width:number,height:number}>(x=>{
      var render = new FileReader();
      render.readAsDataURL(file);
      render.onload = ()=>{
          var img = new Image();
          img.src = render.result.toString();
          img.onload = ()=>{
              x({src:img.src,width:img.width,height:img.height})
          }
      }
    })
    return promise;
  }

  /**
   * 获取视频信息
   * @param file 视频文件
   */
  private async getVideoInfo(file:File):Promise<{path:string,imgSrc:string,imgWidth:number,imgHeight:number,time:number,width:number,height:number}>{
    let promise = new Promise<{path:string,imgSrc:string,imgWidth:number,imgHeight:number,time:number,width:number,height:number}>(x=>{
      let video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.onloadstart=function(){
        video.currentTime = 0.01;
      };
      video.onloadedmetadata =()=>{
        let duration = video.duration;
        let width = video.videoWidth;
        let height = video.videoHeight;
        var canvans = document.createElement("canvas");
        if(width>height){
          canvans.width= width>300?300:width;
          height = (canvans.width/width)*height;
        }else{
          canvans.height = height>300?300:height;
          width = (canvans.height/height)*width;
        }
        video.oncanplay=()=>{
          canvans.getContext('2d').drawImage(video,0,0,canvans.width,canvans.height);
          x({path:video.src,imgSrc:canvans.toDataURL("image/png"),imgWidth:canvans.width,imgHeight:canvans.height,time:duration,width:width,height:height});
        }
      }
    })
    return promise;
  }

  /**
   * 上传图片
   * @param file 图片DataUrl
   */
  private async uploadImg(file:any):Promise<string>{
    let arr = file.split(','), mime = arr[0].match(/:(.*?);/)[1],bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    let uploadFile = new File([u8arr],`${(new Date()).getTime()}.png`);
    let promise = new Promise<string>(x=>{
        this.fileService.upload(uploadFile).subscribe(y=>{
          x(y);
        });
    });
    return promise;
  }


  /**
   * 检查并上传文件
   * @param files 文件列表
   */
  async checkFile(files:FileList){
    if(files.length>10){
        this.dialog.open(DataDialogComponent,{data:'选择文件数不能超过10个'});
        return;
    }
    for(let i=0;i<files.length;i++){
        let item = files[i];
        if(item.size==0){
          continue;
        }
        let extension = ""
        if(item.name.lastIndexOf('.')>-1){
           extension = item.name.substr(item.name.lastIndexOf('.')+1).toLowerCase();
        }
        let msgType:number;
        let content:any;
        switch(extension){
            case 'png':
            case 'jpg':
            case 'gif':
            case 'bmp':
            case 'ico':
            case 'webp':
              msgType = MessageType.图文消息;
              let img = await this.getImgInfo(item);
              content = {Name:item.name,Path:img.src,Width:img.width,Height:img.height,Size:item.size};
              break;
            case 'mp4':
              msgType = MessageType.视频消息;
              let video = await this.getVideoInfo(item);
              content = {Name:item.name,Thum:video.imgSrc,Time:video.time,ThumWidth:video.width,ThumHeight:video.height,Path:video.path,Width:video.width,Height:video.height,Size:item.size};
              break;
            case 'wav':
              msgType = MessageType.语音消息;
              break;
            default:
              content = {Name:item.name,Size:item.size};
              msgType = MessageType.文件消息;
        }
        let message:Message=new Message();
        message.groupId = this.conversation.groupId;
        message.receiverId = this.conversation.receiverId;
        message.addTime = new Date();
        message.head = Setting.Head;
        message.nickName=Setting.NickName;
        message.id = 0;
        message.userId = Setting.UserId;
        message.msgType = msgType;
        message.content = JSON.stringify(content);
        this.messages.push(message);
        this.refreshScroll();
        if(this.conversation.id>0){
          this.managerService.updateConversation.next({message});
        }
        let sendMedia=()=>{
          this.fileService.upload(item).subscribe(data=>{
            content.Path = data;
            if(message.msgType==MessageType.文件消息||message.msgType == MessageType.视频消息){
              message.content = JSON.stringify(content);
            }
            var model = {
              ReceiverId:this.conversation.receiverId,
              GroupId:this.conversation.groupId,
              Content:JSON.stringify(content),
              MsgType:msgType,
            };
            ChatService.connection.invoke("SendMessage",model).then(x=>{
              message.addTime = x.addTime;
              message.id = x.id;
              this.conversation.readEndId = x.id;
              if(this.conversation.id<1){
                this.conversation.id = x.conversationId;
                let content = message.content;
                let types = ['','[图片]','[语音]','[文件]','[视频]'];
                if(message.msgType>0&&message.msgType<5){
                  content = types[message.msgType];
                }
                this.conversation.endContent = content;
                this.conversation.endTime = message.addTime;
                this.managerService.addConversation.next(this.conversation);
              }
            });
          });
        };
        if(msgType==MessageType.视频消息){
          let arr = content.Thum.split(','), mime = arr[0].match(/:(.*?);/)[1],bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }
          let uploadFile = new File([u8arr],`${(new Date()).getTime()}.png`);
          this.fileService.upload(uploadFile).subscribe(y=>{
            content.Thum = y;
            sendMedia();
          });
        }else{
          sendMedia();
        }
        
    }
  }

  /**上传拖动文件 */
  async ondrop(event:DragEvent){
    event.preventDefault();
    var view = this.dropModal.nativeElement;
    view.style.display = "none";
    let files:FileList = event.dataTransfer.files;
    if(files&&files.length>0&&files[0].size>0){
      var isFile = files[0].slice(0,7);
      let reader = new FileReader();
      reader.readAsDataURL(isFile);
      reader.onload=async ()=>{
        await this.checkFile(files);
      };
    }
  }
  ondragenter(event:DragEvent){
    event.preventDefault();
    var view = this.dropModal.nativeElement;
    view.style.display = "block";
  }
  ondragover(event:DragEvent){
    event.preventDefault();
  }
  ondragleave(event:DragEvent){
    event.preventDefault();
    var box = <HTMLElement>event.target;
    if(box.className=="drop-modal"&&(<HTMLElement>event.relatedTarget).parentElement.innerText!="拖动文件即可发送"){
      var view = this.dropModal.nativeElement;
      view.style.display = "none";
    }
  }
}
