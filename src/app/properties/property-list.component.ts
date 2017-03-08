import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IProperty } from './property';
import { PropertyService } from './property.service';
import { AuthService } from '../authn/auth.service';

@Component({
	templateUrl: './property-list.component.html'
})
export class PropertyListComponent implements OnInit {
	properties: IProperty[] = [];

	constructor(private _propertyService: PropertyService, private auth: AuthService, private modal: NgbModal) {}

	// modal and properties
  @ViewChild('content') modalContent: TemplateRef<any>;
  modalRef: NgbModalRef;
	property: IProperty;

	ngOnInit() {
		this._propertyService.getProperties().subscribe(properties => this.properties = properties);
	}

	saveProperty() {
		var newProperty = !this.property.id;
    // save event in database
    this._propertyService.save(this.property);
    // if successfull add it to the list
		if(newProperty) {
    	this.properties.push(this.property);
		}
    this.modalRef.close();
  }

	open(content: any, propertyId: string) {
		console.log("called: " + propertyId);
		if(!propertyId) {
			this.property = <IProperty>{};
		} else {
			this.property = this.properties.find(p => p.id === propertyId);
		}
		this.modalRef = this.modal.open(content);
  }
}
