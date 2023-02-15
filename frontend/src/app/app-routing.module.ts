import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditListComponent } from './components/pages/edit-list/edit-list.component';
import { EditTaskComponent } from './components/pages/edit-task/edit-task.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { NewListComponent } from './components/pages/new-list/new-list.component';
import { NewTaskComponent } from './components/pages/new-task/new-task.component';
import { SignUpComponent } from './components/pages/sign-up/sign-up.component';
import { TaskViewComponent } from './components/pages/task-view/task-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'lists', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'lists', component: TaskViewComponent },
  { path: 'lists/:listId', component: TaskViewComponent },
  { path: 'new-list', component: NewListComponent },
  { path: 'edit-list/:listId', component: EditListComponent },
  { path: 'lists/:listId/new-task', component: NewTaskComponent },
  { path: 'lists/:listId/edit-task/:taskId', component: EditTaskComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
