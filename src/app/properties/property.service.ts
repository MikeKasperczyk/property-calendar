import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { ConfigService } from '../config.service';
import { IProperty } from './property';

@Injectable()
export class PropertyService {
	private url = '/properties';

	constructor(private http: Http, private config: ConfigService) {}

	getProperties(): Observable<IProperty[]> {
		var _url: string = this.config.getServiceUrl() + this.url + "?size=1000";
	  return this.http.get(_url).map((response: Response) => {
			var body = response.json();
			// special handling for Spring Rest empty value
			if(!body.content[0].id) return <IProperty[]>[];
			return <IProperty[]> body.content;
		});
	}

	getProperty(id: string): Observable<IProperty> {
		return this.getProperties().map((properties: IProperty[]) => properties.find(p => p.id == id));
	}

	save(property: IProperty) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url;
		console.log("post", _url, property, options);
		this.http.post(_url, property, options).subscribe(data => { console.log(data) });
	}
}
