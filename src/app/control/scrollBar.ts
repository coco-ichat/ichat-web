export class ScrollBar {
    /**
     * 
     * @param element 要滚动的区域
     */
    constructor(private element:HTMLElement){
        this.init();
    }
    private scrollBox:HTMLElement;
    private scrollBar:HTMLElement;
    private scrollBoxClass="zUIpanelScrollBox";
    private scrollBarClass="zUIpanelScrollBar"
    init(){
        if(this.element.style.position === "static"){
            this.element.style.position = "relative";
        }
        this.element.style.overflow = "hidden";
        let firstElement = <HTMLElement>this.element.children.item(0);
        firstElement.style.top="0";
        firstElement.style.position= "absolute";
        this.scrollBox = document.createElement("div");
        this.scrollBox.className = this.scrollBoxClass;
        this.scrollBar = document.createElement("div");
        this.scrollBar.className = this.scrollBarClass;
        this.scrollBox.append(this.scrollBar);
        this.element.append(this.scrollBox);

        this.element.onmouseenter = ()=>{
            this.freshScroll();
            this.scrollBox.style.display = "block";
        }
        this.element.onmouseleave = ()=>{
            this.scrollBox.style.display = "none";
        }

        //鼠标滚动
        this.element.onwheel=(event)=>{
            let maxTop = this.element.offsetHeight-firstElement.offsetHeight;
            if(maxTop>0){
                firstElement.style.top="0";
                return;
            }
            let moveY = event.deltaY>0?-32:32;
            let contentTop = parseInt(firstElement.style.top)+moveY;
            contentTop = contentTop>0?0:contentTop;
            contentTop = contentTop < maxTop?maxTop:contentTop;
            firstElement.style.top = contentTop+"px";
            let rate = contentTop/(firstElement.offsetHeight-this.element.offsetHeight)
            this.scrollBar.style.top = (this.scrollBar.offsetHeight-this.scrollBox.offsetHeight)*rate+"px";
            if(this.onwhell){
                this.onwhell(event,this);
            }
        }
        //鼠标拖拽
        this.scrollBar.onmousedown=(event)=>{
            let maxTop = this.element.offsetHeight-firstElement.offsetHeight;
            if(maxTop>0){
                firstElement.style.top="0";
                return;
            }
            let height = firstElement.offsetHeight;
            let scrollBoxHeight = this.scrollBox.offsetHeight;
            let scrollBarHeight = this.scrollBar.offsetHeight;
            var contentTop = parseInt(firstElement.style.top);
            let height2 = this.element.offsetHeight;
            let lastY = 0;
            window.onmousemove = (event2)=>{
                let currentY = event2.clientY-lastY;
                lastY = event2.clientY;
                let moveY = event.clientY-event2.clientY;
                moveY = height*moveY/scrollBoxHeight+contentTop;
                moveY = moveY>0?0:moveY;
                moveY = moveY < maxTop?maxTop:moveY;
                firstElement.style.top = moveY+"px";
                let rate = moveY/(height-height2);
                this.scrollBar.style.top = (scrollBarHeight-scrollBoxHeight)*rate+"px";
                if(this.onmove){
                    this.onmove(event2,event2.clientY-event.clientY,currentY,this);
                }
                window.onmouseup = ()=>{
                    window.onmousemove = null;
                };
            }
        }
    }

    /**
     * 刷新滚动条
     */
    public freshScroll(){
        let scrollBoxHeight = this.element.offsetHeight;
        let rate = this.element.offsetHeight/(<HTMLElement>this.element.firstChild).offsetHeight;
        let scrollBarHeight = Math.round(rate*scrollBoxHeight);
        if(rate>=1){
            this.scrollBar.style.height = "0";
            this.scrollBox.style.height = "0";
            return;
        }
        this.scrollBar.style.height = scrollBarHeight+"px";
        this.scrollBox.style.height = scrollBoxHeight+"px";
        let rate2 =(<HTMLElement>this.element.firstChild).offsetTop /((<HTMLElement>this.element.firstChild).offsetHeight-this.element.offsetHeight)
        this.scrollBar.style.top = (scrollBarHeight-scrollBoxHeight)*rate2+"px";
    }

    onwhell:((event:WheelEvent,scrollBar:ScrollBar)=>any) | null;
    onmove:((event:MouseEvent,moveY:number,currentY:number,scrollBar:ScrollBar)=>any) | null;
    
}
