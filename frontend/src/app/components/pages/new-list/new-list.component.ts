import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { List } from './../../../interfaces/list';
import { ListService } from './../../../services/list.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(
    private listService: ListService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  createList(title: string) {
    if (title.length < 1) {
      console.log('Erro');
    } else {
      this.listService.createList(title).subscribe((res: List) => {
        this.router.navigate([`/lists/${res._id}`]);
      });
    }
  }

}
