import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

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
  lists!: List[];
  tasks!: Task[];

  selectedListId!: string;

  constructor(
    private listService: ListService,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
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
      this.selectedListId = params['listId'];
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

  onClickDeleteList() {
    return this.listService.deleteList(this.selectedListId).subscribe(
      (res: any) => {
      console.log(res);
      this.router.navigate(['lists']);
    })
  }

  onClickDeleteTask(taskId: string) {
    return this.taskService.deleteTask(this.selectedListId, taskId).subscribe(
      (res: any) => {
      console.log(res);
      this.tasks = this.tasks.filter(data => data._id !== taskId);
    })
  }

}
