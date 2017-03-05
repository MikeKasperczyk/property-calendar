import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EventService } from '../events/event.service';
import { IEvent } from '../events/event';

@Component({
  template: `
<div *ngIf="event != null">
	<div class="modal-header">
		<h4 class="modal-title">Termin bestätigt</h4>
	</div>
	<div class="modal-body">
		<p>Herr {{event.workerId}} wird Sie zum vereinbarten Zeit besuchen. Details zum Termin erhalten Sie via Mail.</p>
	</div>
	<div class="modal-footer">
	</div>
</div>`
})
export class TenantEventConfirmationComponent implements OnInit {
  event: IEvent;

  constructor(private route: ActivatedRoute, private eventService: EventService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      var eventId = "" + params['id'];
      this.eventService.findEventById(eventId).subscribe(t => {
        this.event = t;
      });
		});
	}
}
