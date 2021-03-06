import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  urlBase: string = "http://edwin-todos.ipd24.ca"; /* "http://todo.api"; //local */
  constructor(private http: HttpClient) { }
  
  getAll():Observable<Todo[]>
  {
    return this.http.get<Todo[]>(this.urlBase+`/api/todos`)
      .pipe( catchError( (err)=>{
        console.log('error caught in service')
        console.error(err);
        return throwError(err);
      })
      );
  }

  get(id: any):Observable<Todo>
  {
    return this.http.get<Todo>(this.urlBase+`/api/todo/`+id)
      .pipe( catchError( (err)=>{
        console.log('error caught in service')
        console.error(err);
        return throwError(err);
      })
      );
  }

  delete(id: any):Observable<string>
  {
    //console.log("http handling delete...")
    return this.http.delete<string>(this.urlBase+`/api/todo/`+id)
      .pipe( catchError( (err)=>{
        console.log('error caught in service')
        console.error(err);
        return throwError(err);
      })
      );
  }

  update(todo: Todo):Observable<Todo>
  {
    return this.http.put<Todo>(this.urlBase+`/api/todo/`+todo.id, todo)
      .pipe( catchError( (err)=>{
        console.log('error caught in service')
        console.error(err);
        return throwError(err);
      })
      );
  }

  add(todo: Todo):Observable<string>
  {
    return this.http.post<string>(this.urlBase+`/api/add`, todo)
      .pipe( catchError( (err)=>{
        console.log('error caught in service')
        console.error(err);
        return throwError(err);
      })
      );
  }

}
