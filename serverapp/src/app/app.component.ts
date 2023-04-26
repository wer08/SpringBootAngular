import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { AppState } from './interface/app-state';
import { Observable } from 'rxjs/internal/Observable';
import { CustomResponse } from './interface/custom-response';
import { map } from 'rxjs/internal/operators/map';
import { DataState } from './enum/data-state.enum';
import { startWith } from 'rxjs/internal/operators/startWith';
import { of } from 'rxjs/internal/observable/of';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Status } from './enum/status.enum';
import { Server } from './interface/server';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import {NgForm} from '@angular/forms'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'serverapp';
  appState$: Observable<AppState<CustomResponse>>
  readonly DataState = DataState;
  readonly Status = Status;
  selectedStatus: Status = Status.ALL;
  
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();

  private isLoading = new BehaviorSubject<Boolean>(false);
  isLoading$ = this.filterSubject.asObservable();

  serverForm = this.formBuilder.group({
    ipAddress: "",
    name: "",
    memory: "",
    type: "",
    imageUrl: "",
    status: Status
  })

  constructor(
    private serverService: ServerService,
    private formBuilder: FormBuilder,
    ){}

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
    .pipe(
      map(response => {
        this.dataSubject.next(response);
        return {
          dataState: DataState.LOADED_STATE,
          appData: {...response, data: {servers: response.data.servers.reverse()}}
        }
      }),
      startWith({
        dataState: DataState.LOADING_STATE,
      }),
      catchError((error: any) => {
        return of({dataState: DataState.ERROR_STATE, error})
      })
    );
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
    .pipe(
      map(response => {
        this.dataSubject.value.data.servers[
          this.dataSubject.value.data.servers.findIndex(server => 
            server.id === response.data.server.id)
        ] = response.data.server
        this.filterSubject.next("");
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: any) => {
        this.filterSubject.next("");
        return of({dataState: DataState.ERROR_STATE, error})
      })
    );
  }

  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.serverService.save$(serverForm.value)
    .pipe(
      map(response => {
        this.dataSubject.next(
          {...response, data: {servers: [response.data.server, ...this.dataSubject.value.data.servers]}}
        );
        this.isLoading.next(false);
        serverForm.resetForm( {status: this.Status.SERVER_DOWN} );
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: any) => {
        this.isLoading.next(false);
        return of({dataState: DataState.ERROR_STATE, error})
      })
    );
  }

  deleteServer(serverId: number): void {
    this.appState$ = this.serverService.delete$(serverId)
    .pipe(
      map(response => {
        this.dataSubject.next({...response, data: {
          servers: this.dataSubject.value.data.servers.filter(s => s.id !== serverId)
        }})
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: any) => {
        this.isLoading.next(false);
        return of({dataState: DataState.ERROR_STATE, error})
      })
    );
  }


  filterServers(event: Event): void {
    let status = Status.ALL
    switch((event.target as HTMLSelectElement).value){
      case "ALL":
        status = Status.ALL;
        break;
      case "SERVER_UP":
        status = Status.SERVER_UP;
        break;
      case "SERVER_DOWN":
        status = Status.SERVER_DOWN;
        break;
    }
    this.appState$ = this.serverService.filter$(status,this.dataSubject.value)
    .pipe(
      map(response => {
        return {
          dataState: DataState.LOADED_STATE,
          appData: response
        }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: any) => {
        return of({dataState: DataState.ERROR_STATE, error})
      })
    );
  }
}
