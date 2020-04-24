import { Component, OnInit, Input, ChangeDetectorRef, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css']
})
export class HeadComponent{

  word:string;
  show:boolean = true;
  private _name:string;
  private _head:string;

  @Input()
  set head(head:string){
    this._head = head;
    this.show = head&&head.toLowerCase().startsWith('http');
  }
  get head(){
    return this._head;
  }

  @Input()
  set name(name:string){
    if(this._name!=name){
      this._name  = name;
      this.word = this._name.substr(0,1);
    }
  }
  get name(){
    return this._name;
  }
  constructor() {
  }
  onError(){
    if(this.name){
      this.show = false;
      this.word = this.name.substr(0,1);
    }
  }
}
