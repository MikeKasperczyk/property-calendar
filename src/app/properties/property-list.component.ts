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
	address: string;

	ngOnInit() {
		this._propertyService.getProperties().subscribe(properties => this.properties = properties);
	}

	addProperty() {
    var property: IProperty = {
      id : "",
      address : this.address
    }
    // save event in database
    this._propertyService.save(property);

    // if successfull add it to the list
    this.properties.push(property);

    this.modalRef.close();
  }

	open(content) {
    this.modalRef = this.modal.open(content);
  }
}
