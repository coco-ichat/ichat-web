import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { ConversationComponent } from './conversation/conversation.component';
import { ChatComponent } from './chat/chat.component';
import { MsgDatePipe } from './msgDate.pipe';
import { MessageTemplateComponent } from './message-template/message-template.component';
import {mediaDatePipe} from './mediaDate.pipe';
import { ContactComponent } from './contact/contact.component';
import { ConversationDetailComponent } from './conversation-detail/conversation-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { DataDialogComponent } from './control/data-dialog/data-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { ImgDialogComponent } from './control/img-dialog/img-dialog.component';
import { SizeFmtPipe } from './size-fmt.pipe';
import { ContactDialogComponent } from './control/contact-dialog/contact-dialog.component';
import { HeadComponent } from './control/head/head.component';
import { AddGroupDialogComponent } from './control/add-group-dialog/add-group-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ImgCropperComponent } from './control/img-cropper/img-cropper.component';
import { AddFriendComponent } from './control/add-friend/add-friend.component';
import { FriendRequestComponent } from './control/friend-request/friend-request.component';
import { VideoDialogComponent } from './control/video-dialog/video-dialog.component';
import { ConfirmDialogComponent } from './control/confirm-dialog/confirm-dialog.component';
import { InviteGroupDialogComponent } from './control/invite-group-dialog/invite-group-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingDialogComponent } from './control/loading-dialog/loading-dialog.component';
import { PersonalComponent } from './personal/personal.component';
import { MatRadioModule } from '@angular/material/radio';
import { PhoneValidatorDirective } from './validators/phoneValidator.directive';
import { EmailValidatorDirective } from './validators/emailValidator.directive';
import { ConfirmCheckboxDialogComponent } from './control/confirm-checkbox-dialog/confirm-checkbox-dialog.component';
import { GroupAdminComponent } from './control/group-admin/group-admin.component';
import { AddAdminComponent } from './control/add-admin/add-admin.component';
import { VoiceSizeFmtPipe } from './voice-size-fmt';

@NgModule({
   declarations: [
      AppComponent,
      MsgDatePipe,
      SizeFmtPipe,
      VoiceSizeFmtPipe,
      LoginComponent,
      HomeComponent,
      ConversationComponent,
      ChatComponent,
      MessageTemplateComponent,
      mediaDatePipe,
      ContactComponent,
      ConversationDetailComponent,
      DataDialogComponent,
      ImgDialogComponent,
      ContactDialogComponent,
      HeadComponent,
      AddGroupDialogComponent,
      ImgCropperComponent,
      AddFriendComponent,
      FriendRequestComponent,
      VideoDialogComponent,
      ConfirmDialogComponent,
      InviteGroupDialogComponent,
      LoadingDialogComponent,
      PersonalComponent,
      PhoneValidatorDirective,
      EmailValidatorDirective,
      ConfirmCheckboxDialogComponent,
      GroupAdminComponent,
      AddAdminComponent,
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      FormsModule,
      BrowserAnimationsModule,
      MatDialogModule,
      MatMenuModule,
      MatCheckboxModule,
      MatProgressSpinnerModule,
      MatRadioModule,
   ],
   entryComponents: [
      DataDialogComponent,
      ImgDialogComponent,
      ContactDialogComponent,
      AddGroupDialogComponent,
      ImgCropperComponent,
      AddFriendComponent,
      FriendRequestComponent,
      VideoDialogComponent,
      ConfirmDialogComponent,
      InviteGroupDialogComponent,
      LoadingDialogComponent,
      ConfirmCheckboxDialogComponent,
      GroupAdminComponent,
      AddAdminComponent,
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
