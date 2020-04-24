class Users{
    private items: StaticUser[] = [];
    length:number=this.items.length;
    getItem(id: number): StaticUser {
        return this.items.find(x=>{
            return x.id==id;

        });
    }
    setItem(item: StaticUser) {
        let result = this.getItem(item.id);
        if(result){
            result.setValue(item);
        }else{
            this.items.push(item);
        }
    }
}
export class StaticUser{
    constructor(public id:number,public head:string,public name:string){
    }
    setValue(item:StaticUser){
        this.id = item.id;
        this.head = item.head;
        this.name = item.name;
    }
}
export const IChatUsers:Users =new Users();