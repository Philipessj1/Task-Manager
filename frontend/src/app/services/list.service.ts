import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { List } from './../interfaces/list';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  readonly ROOT_URI = `${environment.baseApiUrl}/lists`;

  constructor( private http: HttpClient ) { }

  createList(title: string): Observable<List> {
    return this.http.post<List>(this.ROOT_URI, { title });
  }

  updateList(listId: string, title: string): Observable<List> {
    return this.http.patch<List>(`${this.ROOT_URI}/${listId}`, { title });
  }

  getLists(): Observable<List[]> {
    return this.http.get<List[]>(this.ROOT_URI);
  }

  deleteList(listId: string) {
    return this.http.delete(`${this.ROOT_URI}/${listId}`);
  }
}
