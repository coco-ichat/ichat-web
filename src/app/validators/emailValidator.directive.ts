import { AsyncValidator, NG_VALIDATORS, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { Injectable, Directive } from '@angular/core';
import { ValidateService } from '../serices/validate.service';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Directive({
    selector: '[appEmailValidator]',
    providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: EmailValidatorDirective, multi: true}]
  })
export class EmailValidatorDirective implements AsyncValidator {
    constructor(private validateService:ValidateService){}
    validate(control: AbstractControl): Promise<ValidationErrors|null> | Observable<ValidationErrors|null> {
        return this.validateService.email(control.value).pipe(
            map(isTaken => (isTaken ? { 'emailValidator': true } : null)),catchError(()=>null)
        );
    }   
}
