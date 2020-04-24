export class Setting {
    public static UserId:number = 0;
    public static NickName:string = '';
    public static Head:string = '';
    public static Phone:string = '';
    public static Email:string = '';
    private static _token:string;
    public static get Token(){
        if(this._token) return this._token;
        else{
            return localStorage.getItem("token")?localStorage.getItem("token"):'';
        }
    }
    public static set Token(value:string){
        this._token = value;
    }

    public static VoiceAudio:HTMLAudioElement;
}