import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { List } from './../interfaces/list';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  readonly ROOT_URI = 'http://localhost:3000';

  constructor( private http: HttpClient ) { }

  createList(title: string): Observable<List> {
    return this.http.post<List>(`${this.ROOT_URI}/lists`, { title });
  }

  getLists(): Observable<List[]> {
    return this.http.get<List[]>(`${this.ROOT_URI}/lists`);
  }
}
