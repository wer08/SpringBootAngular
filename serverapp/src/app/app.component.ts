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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'serverapp';
  appState$: Observable<AppState<CustomResponse>>
  constructor(private serverService: ServerService){}

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
    .pipe(
      map(response => {
        return {
          dataState: DataState.LOADED_STATE,
          appData: response
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
}
