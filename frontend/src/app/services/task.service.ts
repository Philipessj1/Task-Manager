import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Task } from '../interfaces/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  readonly ROOT_URI = 'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) { }

  createTask(title: string, listId: string): Observable<Task> {
    return this.http.post<Task>(`${this.ROOT_URI}/lists/${listId}/tasks`, { title });
  }

  getTasks(listId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.ROOT_URI}/lists/${listId}/tasks`);
  }

  completeTask(task: Task) {
    return this.http.patch(`${this.ROOT_URI}/lists/${task._listId}/tasks/${task._id}`, { completed: !task.completed });
  }
}
