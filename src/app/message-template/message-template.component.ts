import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Message, MessageType } from '../models/Message';
import { MatDialog } from '@angular/material/dialog';
import { ImgDialogComponent } from '../control/img-dialog/img-dialog.component';
import { VideoDialogComponent } from '../control/video-dialog/video-dialog.component';
import { StaticUser, IChatUsers } from '../Users';
import { Setting } from '../Setting';

@Component({
  selector: 'app-message-template',
  templateUrl: './message-template.component.html',
  styleUrls: ['./message-template.component.css']
})
export class MessageTemplateComponent {
  @ViewChild('img', { static: false }) img: ElementRef;
  private _message = new Message();
  user: StaticUser;
  isMe: boolean;
  media: any;

  constructor(public dialog: MatDialog) { }

  @Input()
  set message(message: Message) {
    this.isMe = message.userId === Setting.UserId;
    if (!this.isMe && message.msgType < 5) {
      this.user = IChatUsers.getItem(message.userId);
      if (!this.user) {
        this.user = new StaticUser(message.userId, message.head, message.nickName);
        IChatUsers.setItem(this.user);
      }
    }
    if (message.msgType > 0 && message.msgType < 5) {
      this.media = JSON.parse(message.content);
      if (message.msgType == MessageType.图文消息) {
        if (this.media.Width > 250) {
          this.media.Height = this.media.Height * (250 / this.media.Width);
          this.media.Width = 250;
        }
        if (this.media.Width < 150 && this.media.Height < 150) {
          this.media.Height = 150;
        }
      }
    }
    this._message = message;
  }
  get message(): Message {
    return this._message;
  }

  /**
   * 播放视频
   */
  playVideo() {
    this.dialog.open(VideoDialogComponent, { panelClass: 'videoPanel', data: this.media });
  }

  /**
   * 播放语音消息
   */
  async playVoice(event:any){
    let spanVoice = <HTMLSpanElement>(<HTMLSpanElement>event.target).parentElement.getElementsByClassName('voice')[0];
    let listenerStart = ()=>{
      spanVoice.classList.add('voice_start');
    }
    let listenerPause = ()=>{
      console.log('停止播放');
      spanVoice.classList.remove('voice_start');
      Setting.VoiceAudio.removeEventListener("playing",listenerStart);
      Setting.VoiceAudio.removeEventListener("pause",listenerPause);
    }
    if (Setting.VoiceAudio == null) {
      Setting.VoiceAudio = document.createElement('audio');
    }
    if (Setting.VoiceAudio.paused) {
      if(Setting.VoiceAudio.src == this.media.path){
        Setting.VoiceAudio.currentTime=0;
        Setting.VoiceAudio.addEventListener("playing",listenerStart);
        Setting.VoiceAudio.addEventListener("pause",listenerPause);
        await Setting.VoiceAudio.play();
        return;
      }
      Setting.VoiceAudio.src = this.media.Path;
      Setting.VoiceAudio.load();
      Setting.VoiceAudio.addEventListener("playing",listenerStart);
      Setting.VoiceAudio.addEventListener("pause",listenerPause);
      await  Setting.VoiceAudio.play();
     
    } else {
      Setting.VoiceAudio.pause();
      if (Setting.VoiceAudio.src != this.media.Path) {
        setTimeout(async () => {
          Setting.VoiceAudio.src = this.media.Path;
          Setting.VoiceAudio.load();
          Setting.VoiceAudio.addEventListener("playing",listenerStart);
          Setting.VoiceAudio.addEventListener("pause",listenerPause);
          await Setting.VoiceAudio.play();
        },0);
      }
    }
  }

  error() {
    console.log(this.media.Path);
    this.img.nativeElement.src = "/assets/images/error.jpg";
    this.media.Width = 150;
    this.media.Height = 128;
  }
  /**
   * 显示图片
   */
  showImg() {
    this.dialog.open(ImgDialogComponent, { panelClass: 'imgPanel', data: this.img.nativeElement });
  }
  /**
   * 下载文件
   */
  download() {
    var model = JSON.parse(this.message.content);
    if (model.Path) {
      var path = model.Path;
      path = path.toLocaleLowerCase().replace('/upload/', '/api/file/download?s=') + '&t=' + this.media.Name;
      var a = document.createElement('a');
      a.href = path;
      a.click();
    }
  }
}
