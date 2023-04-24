import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomResponse } from '../interface/custom-response';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Server } from '../interface/server';
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private handleErrror(error: HttpErrorResponse):Observable<never> {
    console.log(error)
    return throwError(()=>error);
  }
  private readonly apiUrl = 'http://localhost:8081';


  constructor(private http: HttpClient) { }

  servers$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/server/list`)
  .pipe(
    tap(console.log),
    catchError(this.handleErrror)
  );

  save$ = (server:Server) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/server/save`,server)
  .pipe(
    tap(console.log),
    catchError(this.handleErrror)
  );

  ping$ = (ipAddress: string) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
  .pipe(
    tap(console.log),
    catchError(this.handleErrror)
  );

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
  new Observable<CustomResponse>(
    subscriber => {
      console.log(response);
      subscriber.next(
        status === Status.ALL ? {...response, message: `Servers filtered by ${status} status`} : 
        {
          ...response,
          message: response.data.servers.filter(server => server.status === status).length >0 ?
           `Servers filtered by ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'} status` :
            `No servers of${status} found`,
          data: { servers: response.data.servers.filter(server => server.status === status) }

        }
      );
      subscriber.complete();
    }
  )
  .pipe(
    tap(console.log),
    catchError(this.handleErrror)
  );

  delete$ = (serverId: number)=> <Observable<CustomResponse>>this.http.delete<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
  .pipe(
    tap(console.log),
    catchError(this.handleErrror)
  );
}
