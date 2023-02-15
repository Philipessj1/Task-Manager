import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { List } from 'src/app/interfaces/list';

import { ListService } from './../../../services/list.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {

  listId!: string;

  constructor(
    private listService: ListService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
    this.listId = params['listId'];
    })
  }

  updateList(title: string) {
    if (title.length < 1) {
      console.log('Erro');
    } else {
      this.listService.updateList(this.listId, title).subscribe((res: List) => {
        console.log(res);
        this.router.navigate([`/lists/${res._id}`]);
      });
    }
  }
}
