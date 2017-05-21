import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { CalendarEvent } from 'angular-calendar';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { ConfigService } from '../config.service';
import { IWorkday } from './workday';

@Injectable()
export class WorkdayService {
	private url = '/workdays';
	private content: string;

	constructor(private http: Http, private config: ConfigService) {}

	findAll(): Observable<IWorkday[]> {
		var _url: string = this.config.getServiceUrl() + this.url + "?size=1000";
	  return this.http.get(_url).map((response: Response) => {
			var body = response.json()
			// special handling for Spring Rest empty value
			if(!body.content[0].id) return <IWorkday[]>[];
			return <IWorkday[]> body.content;
		});
	}

	save(workday : IWorkday) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url;
		console.log("post", _url, workday, options);
		this.http.post(_url, workday, options).subscribe(data => { console.log(data) });
	}

	delete(workday : IWorkday) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url + "/" + workday.id;
		console.log("delete", _url, workday, options);
		this.http.delete(_url, options).subscribe(data => { console.log(data) });
	}
}
