import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/interfaces/task';

import { TaskService } from './../../../services/task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {

  taskId!: string;
  listId!: string;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.listId = params['listId'];
      this.taskId = params['taskId'];
    })
  }

  updateTask(title: string) {
    if (title.length < 1) {
      console.log('Erro');
    } else {
      this.taskService.updateTask(title, this.listId, this.taskId).subscribe((res: Task) => {
        this.router.navigate([`/lists/${this.listId}`]);
      });
    }
  }

}
