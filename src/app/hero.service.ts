import {Injectable} from '@angular/core';
import {Hero} from './Hero';
import {Observable, of} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'api/heroes';

  constructor(private messageService: MessageService,
              private http: HttpClient
  ) {
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id ${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  getHeroes(): Observable<Hero[]> {
    this.log('fetched heroes');
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap(_ => this.log('fetched heroes')),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    );
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`updated hero: id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    )
      ;

  }


  addHero(hero: Hero): Observable<Hero> {
    return this.http.post(this.heroesUrl, hero, httpOptions).pipe(
      tap((newHero: Hero) => {
        this.log(`added hero w/ id=${newHero.id}`);
      }),
      catchError(this.handleError<Hero>('addHero'))
    );

  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);

    };
  }

  private log(message: string): void {
    this.messageService.add(`HeroService: ${message}`);

  }

  deleteHero(hero: Hero | number): Observable<any> {
    const id = typeof hero === 'number' ? hero : hero.id;

    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero: id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );

  }

  searchHeroes(term: string): Observable<Hero[]> {
    term = term.trim();
    if (!term) {
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}?name=${term}`).pipe(
      tap(_ => this.log(`found heroes: matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
}
