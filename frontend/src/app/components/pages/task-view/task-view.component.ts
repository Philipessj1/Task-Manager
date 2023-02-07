import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  tasks: any;
  constructor() { }

  ngOnInit(): void {
    this.tasks = document.querySelectorAll('.task');

    this.tasks.forEach((task: HTMLElement) => {
      task.addEventListener('click', () => {
        task.classList.toggle('complete');
      });
    });

  }


}
