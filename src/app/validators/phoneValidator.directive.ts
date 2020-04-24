import { AsyncValidator, NG_VALIDATORS, EmailValidator, NG_ASYNC_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { Injectable, Directive } from '@angular/core';
import { ValidateService } from '../serices/validate.service';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Directive({
    selector: '[appPhoneValidator]',
    providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: PhoneValidatorDirective, multi: true}]
})
export class PhoneValidatorDirective implements AsyncValidator {
    constructor(private validateService:ValidateService){}
    validate(control: AbstractControl): Promise<ValidationErrors|null> | Observable<ValidationErrors|null> {
        return this.validateService.phone(control.value).pipe(
            map(isTaken => (isTaken ?  { "phoneValidator": true }:null )),
            catchError(() => null)
        )
    }   
}
