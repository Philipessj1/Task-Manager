import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/interfaces/task';

import { TaskService } from './../../../services/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  listId: string = '';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.listId = params['listId'];
    });
  }

  createTask(title: string) {
    if (title.length < 1) {
      console.log('Erro');
    } else {
      this.taskService.createTask(title, this.listId).subscribe((res: Task) => {
        this.router.navigate([`/lists/${this.listId}`]);
      });
    }
  }

}
