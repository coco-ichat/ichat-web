import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Setting } from '../Setting';
import { RegisterModel } from '../models/LoginModel';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class RegisterService extends BaseService {
    private _url:string = `${environment.apiBaseUrl}Register`;
    register(model:RegisterPostModel){
        return this.post(this._url,model);
    }
}

export class RegisterPostModel{
    static Convert(model:RegisterModel):RegisterPostModel{
        let result = new RegisterPostModel();
        result.nickName = model.nickName;
        result.password = model.password;
        result.confirmPassword = model.passwordRepeat;
        result.email = model.email;
        result.phone = model.phone;
        result.sex = parseInt(model.sex);
        return result;
    }
    nickName:string;
    password:string;
    confirmPassword:string;
    email:string;
    phone:string;
    sex:number;
}