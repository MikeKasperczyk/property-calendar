import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/find';
import 'rxjs/add/observable/of';

import { ConfigService } from '../config.service';
import { ITenant } from './tenant';

@Injectable()
export class TenantService {
	private url = '/tenants';

	constructor(private http: Http, private config: ConfigService) {}

	getAllTenants(): Observable<ITenant[]> {
		var _url: string = this.config.getServiceUrl() + this.url;
	  return this.http.get(_url).map((response: Response) => {
			var body = response.json()
			// special handling for Spring Rest empty value
			if(!body.content[0].id) return <ITenant[]>[];
			return <ITenant[]> body.content;
		});
	}

	getTenants(propertyId: string): Observable<ITenant[]> {
		return this.getAllTenants().map((tenants: ITenant[]) => tenants.filter(t => t.propertyId == propertyId));
	}

	findTenantById(id: string): Observable<ITenant> {
		return this.getAllTenants()
			.map((tenants: ITenant[]) => tenants.find(p => p.id == id));
	}

	save(tenant: ITenant) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url;
		console.log("post", _url, tenant, options);
		this.http.post(_url, tenant, options).subscribe(data => { console.log(data) });
	}

	delete(tenant : ITenant) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

		var _url: string = this.config.getServiceUrl() + this.url + "/" + tenant.id;
		console.log("delete", _url, tenant, options);
		this.http.delete(_url, options).subscribe(data => { console.log(data) });
	}
}
