import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { Task } from '../interfaces/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  readonly ROOT_URI = `${environment.baseApiUrl}/lists`;

  constructor(
    private http: HttpClient
  ) { }

  createTask(title: string, listId: string): Observable<Task> {
    return this.http.post<Task>(`${this.ROOT_URI}/${listId}/tasks`, { title });
  }

  updateTask(title: string, listId: string, taskId: string): Observable<Task> {
    return this.http.patch<Task>(`${this.ROOT_URI}/${listId}/tasks/${taskId}`, { title });
  }

  getTasks(listId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.ROOT_URI}/${listId}/tasks`);
  }

  completeTask(task: Task) {
    return this.http.patch(`${this.ROOT_URI}/${task._listId}/tasks/${task._id}`, { completed: !task.completed });
  }

  deleteTask(listId: string, taskId: string) {
    return this.http.delete(`${this.ROOT_URI}/${listId}/tasks/${taskId}`);
  }
}
