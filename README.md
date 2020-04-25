[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/)

# ichat-web
[![GitHub stars](https://img.shields.io/github/stars/coco-ichat/ichat-web)](https://github.com/coco-ichat/ichat-web/stargazers) [![GitHub forks](https://img.shields.io/github/forks/coco-ichat/ichat-web)](https://github.com/coco-ichat/ichat-web) [![GitHub issues](https://img.shields.io/github/issues/coco-ichat/ichat-web)](https://github.com/coco-ichat/ichat-web/issues) <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=5tBvVUn"><img border="0" src="https://pub.idqqimg.com/wpa/images/group.png" alt="flutter-candies" title="flutter-candies"></a>

ichat聊天软件Web端

# 效果图


# 功能列表
* [x] 登录
* [x] 注册
* [x] 自动登录
* [ ] 忘记密码
* [x] 会话列表
> * [x] 置顶会话
> * [x] 静音会话
> * [x] 删除会话
* [x] 创建群组
* [x] 添加好友
* [x] 好友请求
* [ ] 收藏夹
* [x] 联系人列表
> * [x] 搜索好友
> * [x] 修改备注
> * [x] 发送消息
> * [x] 删除好友
* [x] 个人信息
> * [x] 修改头像
> * [x] 修改昵称
> * [x] 退出登录
* [ ] 聊天窗口
> * [x] 文字消息
> * [x] 图片消息
> * [x] 接收语音消息
> * [ ] 发送语音消息
> * [x] 视频消息
> * [ ] 位置消息
> * [x] 文件消息
> * [x] 包含链接的消息
> * [ ] 语音通话
> * [ ] 视频通话
> * [x] 发送Emoj
> * [ ] 发送自定义表情
> * [x] 文件拖拽发送
> * [ ] 右键菜单
> >* [ ] 消息转发
> > * [ ] 消息收藏
> * [ ] 图片查看上一张、下一张
> * [ ] 查看历史消息
> * [x] 个人会话&群组会话
> > * [x] 清空消息历史
> > * [x] 删除会话
> > * [x] 静音
> > * [x] 置顶聊天
> * [x] 群组会话
> > * [x] 修改群组名称
> > * [x] 修改群组头像
> > * [ ] 修改群组简介
> > * [x] 管理员管理
> > * [x] 邀请新成员
> > * [x] 解散群组
> > * [x] 成员管理
> > * [ ] 群组成员信息查看
> > * [ ] 添加群组成员为好友
> > * [x] @群组成员
> > * [ ] 分组查看群分享
> > > * [ ] 图片
> > > * [ ] 视频
> > > * [ ] 语音
> > > * [ ] 文件
> > > * [ ] 链接
* [x] 图片裁剪、放大缩小
* [x] 消息声音提醒
* [x] 多设备同步
* [ ] 多语言
* [ ] Chrome桌面通知

# 使用教程
1. 在开始之前，请确保你的开发环境中包括 Node.js和 npm 包管理器。Angular 需要 Node.js 版本 10.9.0 或更高版本。
2. 安装Angluar CLI `npm install -g @angular/cli@8.2.1`。
3. 下载项目用`Visual Studio Code`打开
4. 在终端输入`npm install`自动安装项目需要的包
5. 修改`src/environments/`目录下的`environment.ts`文件与`environment.prod.ts`文件

    `environment.ts`文件是本地运行配置文件

    `environment.prod.ts`文件是编译之后配置文件
    ```
    export const environment = {
        production: false,
        apiBaseUrl:"https://localhost:44353/api/",
        chatUrl:"http://localhost:49782/ChatServer",
    };
    ```
    把`apiBaseUrl`跟`chatUrl`修改成你的服务器地址
6. 运行项目:在终端输入 `ng serve`

    等待编译完成，会输出
    ```
    ** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
    i ｢wdm｣: Compiled successfully.
    ```
    在浏览里打开上述地址就可以正常访问
7. 部署到服务器:在终端输入`ng build --prod`

    把输出目录（默认为 dist/）下的每个文件都复制到到服务器上的某个目录下
8. 关于更多Angular的问题，请访问Angular中文官方文档 [Angular中文文档](https://angular.cn/docs)

# 更新日志
* 2020.04.24 项目上传
