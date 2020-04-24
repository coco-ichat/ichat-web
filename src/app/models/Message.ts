export class Message{
    id:number;
    userId:number;
    receiverId:number;
    status:boolean;
    content:string;
    addTime:Date;
    groupId:number;
    msgType:number;
    head:string;
    nickName:string;
    tipUsers:string;
}
export enum MessageType{
    文本消息 = 0,
    图文消息 = 1,
    语音消息 = 2,
    文件消息 = 3,
    视频消息 = 4,
    系统消息 = 5,
    好友添加消息=6,
    未读提示 = 888,
    时间消息 = 999
}