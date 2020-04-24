export class LoginModel{
    public account:string;
    public password:string;
    public isAutoLogin:boolean=true;
}

export class RegisterModel{
    public nickName:string;
    public email:string;
    public phone:string;
    public sex:string='0';
    public password:string;
    public passwordRepeat:string;
}