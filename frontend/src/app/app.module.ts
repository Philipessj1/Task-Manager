import { WebReqInterceptor } from './services/web-req.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskViewComponent } from './components/pages/task-view/task-view.component';
import { NewListComponent } from './components/pages/new-list/new-list.component';
import { NewTaskComponent } from './components/pages/new-task/new-task.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { SignUpComponent } from './components/pages/sign-up/sign-up.component';
import { EditListComponent } from './components/pages/edit-list/edit-list.component';
import { EditTaskComponent } from './components/pages/edit-task/edit-task.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskViewComponent,
    NewListComponent,
    NewTaskComponent,
    LoginPageComponent,
    SignUpComponent,
    EditListComponent,
    EditTaskComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
