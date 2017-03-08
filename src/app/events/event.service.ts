import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { ConfigService } from '../config.service';
import { IEvent } from './event';

@Injectable()
export class EventService {
	private url = '/events';
	private content: string;

	constructor(private http: Http, private config: ConfigService) {}

	findAllEvents(): Observable<IEvent[]> {
		var _url: string = this.config.getServiceUrl() + this.url;
	  return this.http.get(_url).map((response: Response) => {
			var body = response.json()
			// special handling for Spring Rest empty value
			if(!body.content[0].id) return <IEvent[]>[];
			return <IEvent[]> body.content;
		});
	}

	findById(id: string): Observable<IEvent> {
		return this.findAllEvents()
			.map((events: IEvent[]) => events.find(e => e.id == id));
	}

	save(event : IEvent): Observable<string> {
		console.log(event);
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url;
		var id = null;
		return this.http.post(_url, event, options).map(data => data.json().id);
	}

	delete(event : IEvent) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url + "/" + event.id;
		console.log("delete", _url, event, options);
		this.http.delete(_url, options).subscribe(data => { console.log(data) });
	}
}
