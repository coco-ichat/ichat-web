import { Component, OnInit, SystemJsNgModuleLoader, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginModel, RegisterModel } from '../models/LoginModel';
import { LoginService } from './login.service';
import { Setting } from '../Setting';
import { MatDialog } from '@angular/material/dialog';
import { DataDialogComponent } from '../control/data-dialog/data-dialog.component';
import { Router } from '@angular/router';
import { RegisterService, RegisterPostModel } from '../serices/register.service';
import { LoadingDialogComponent } from '../control/loading-dialog/loading-dialog.component';
import { ValidateService } from '../serices/validate.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit{
  ngOnInit() {
    if(Setting.Token!=""){
      location.href='/home';
    }
  }
  @ViewChild("loginForm",{static:false}) loginViewRef:ElementRef;
  @ViewChild("registerForm",{static:false}) registerViewRef:ElementRef;
  @ViewChild("forgetForm",{static:false}) forgetViewRef:ElementRef;

  constructor(private http:HttpClient,public dialog:MatDialog,private router:Router,
    public registerService:RegisterService,
    public validateService:ValidateService) { 
  }

  model = new LoginModel();
  registModel = new RegisterModel();
  loginService = new LoginService(this.http);
  
  loginAction(){
    let loading = this.dialog.open(LoadingDialogComponent,null);
    if(this.model.account&&this.model.password&&this.model.account.length>0&&this.model.password.length>0){
      this.loginService.login(this.model.account,this.model.password).pipe(catchError(error=>{
        this.dialog.open(DataDialogComponent,{data:"账户或者密码错误，请重新输入"});
        loading.close();
        return throwError('');
      })).subscribe(data=>{
        if(this.model.isAutoLogin){
          localStorage.setItem('token',data.token);
        }else{
          Setting.Token = data.token;
        }
        setTimeout(() => {
          loading.close();
          this.router.navigate(['/home']);
        }, 0);
      })
    }else{
      this.dialog.open(DataDialogComponent,{data:"请输入用户名和密码"});
      loading.close();
    }
  }

  create(){
    this.validateService.email('ffffgggg@qq.com').subscribe();
     let loginView = <HTMLElement>this.loginViewRef.nativeElement;
     let registerView = <HTMLElement>this.registerViewRef.nativeElement;
     let forgetView = <HTMLElement>this.forgetViewRef.nativeElement;
     loginView.style.display = "none";
     registerView.style.display = "block";
     forgetView.style.display = "none";
  }

  back(){
    let loginView = <HTMLElement>this.loginViewRef.nativeElement;
     let registerView = <HTMLElement>this.registerViewRef.nativeElement;
     let forgetView = <HTMLElement>this.forgetViewRef.nativeElement;
     loginView.style.display = "block";
     registerView.style.display = "none";
     forgetView.style.display = "none";
  }


  register(){
      let loading = this.dialog.open(LoadingDialogComponent,null);
      this.registerService.register(RegisterPostModel.Convert(this.registModel)).pipe(catchError(x=>{
        this.dialog.open(DataDialogComponent,{data:"注册失败，请刷新页面重试"});
        loading.close();
        return null;
      })).subscribe(x=>{
          loading.close();
          let loginView = <HTMLElement>this.loginViewRef.nativeElement;
          let registerView = <HTMLElement>this.registerViewRef.nativeElement;
          let forgetView = <HTMLElement>this.forgetViewRef.nativeElement;
          loginView.style.display = "block";
          registerView.style.display = "none";
          forgetView.style.display = "none";
          this.dialog.open(DataDialogComponent,{data:"注册成功，请登录"});
      });
  }
}
