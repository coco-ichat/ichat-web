import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Setting } from './Setting';
import { Router } from '@angular/router';
export class BaseService {

    constructor(protected http:HttpClient) { 
    }
    protected httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':'application/json;charset=utf-8',
        'Authorization': `Bearer ${Setting.Token}`
      })
    };
    protected put(url:string,data:any){
        return this.http.put(url,data,this.httpOptions).pipe(catchError(this.handleError));
    }
    protected get<T>(url:string){
        return this.http.get<T>(url,this.httpOptions).pipe(catchError(this.handleError));
    }

    protected post<T>(url:string,data:any){
        return this.http.post<T>(url,data,this.httpOptions).pipe(catchError(this.handleError));
    }

    protected delete(url:string){
        return this.http.delete(url,this.httpOptions).pipe(catchError(this.handleError));
    }

    protected handleError(error: HttpErrorResponse) {
      if(error.status==401){
         Setting.Token = null;
         localStorage.removeItem('token');
         window.location.href="/login";
      }
      // if (error.error instanceof ErrorEvent) {
      //   // A client-side or network error occurred. Handle it accordingly.
      //   console.error('An error occurred:', error.error.message);
      // } else {
      //   // The backend returned an unsuccessful response code.
      //   // The response body may contain clues as to what went wrong,
      //   console.error(
      //     `Backend returned code ${error.status}, ` +
      //     `body was: ${error.error}`);
      // }
      // return an observable with a user-facing error message
      return throwError(error);
    };
}
