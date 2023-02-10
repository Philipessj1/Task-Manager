import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { List } from './../../../interfaces/list';
import { Task } from './../../../interfaces/task';
import { ListService } from './../../../services/list.service';
import { TaskService } from './../../../services/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  tasksElements: any;
  lists: List[] = [];
  tasks: Task[] = [];

  constructor(
    private listService: ListService,
    private taskService: TaskService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getLists();
    this.getTasks();
  }

  getLists() {
    this.listService.getLists().subscribe((data: List[]) => {
      this.lists = data;
    });
  }

  getTasks() {
    this.route.params.subscribe((params: Params) => {
      this.taskService.getTasks(params['listId']).subscribe((data: Task[]) => {
        this.tasks = data;
      });
    })
  }

  onTaskClick(task: Task) {
    this.taskService.completeTask(task).subscribe(() => {
      task.completed = !task.completed;
    });
  }

}
