import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ConfigService } from '../config.service';
import { PropertyService } from './property.service';
import { IProperty } from './property';
import { TenantService } from '../tenants/tenant.service';
import { ITenant } from '../tenants/tenant';

@Component({
	templateUrl: './property-tenants.component.html'
})
export class PropertyTenantsComponent implements OnInit {

	constructor(private _route: ActivatedRoute, private _propertyService: PropertyService, private _tenantService: TenantService, private modal: NgbModal, private config: ConfigService ) { }

	property: IProperty;
	tenants: ITenant[];
	selectedTenantUrl: string;
	copied: boolean = false;


	ngOnInit() {
		this._route.params.subscribe(params => {
			let propertyId = params['id'];
			this._propertyService.getProperty(propertyId).subscribe(property => this.property = property);
			this._tenantService.getTenants(propertyId).subscribe(tenants => this.tenants = tenants);
		})
	}

	open(content: any, tenantId: string) {
		this.selectedTenantUrl = this.config.getUrl() + "/tenant-calendar/" + tenantId;
		this.copied = false;
		console.log(this.selectedTenantUrl);
		this.modal.open(content);
	}
}
