import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { isSameDay, isSameMonth, addMinutes, addDays, addWeeks, addMonths, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarEventAction } from 'angular-calendar';
import { colors } from '../const/colors';
import { months } from '../const/months';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/mergeMap';

import { TenantService } from '../tenants/tenant.service';
import { ITenant } from '../tenants/tenant';
import { WorkdayService } from '../workers/workday.service';
import { IWorkday } from '../workers/workday';
import { EventService } from '../events/event.service';
import { IEvent } from '../events/event';
import { PropertyService } from '../properties/property.service';
import { IProperty } from '../properties/property';

interface WorkerEvent extends CalendarEvent {
  workerId: string;
}

@Component({
	templateUrl: './tenant-calendar.component.html',
})
export class TenantCalendarComponent implements OnInit {

  monthNames = months;

	constructor(
		private route: ActivatedRoute,
		private tenantService: TenantService,
	  private workdayService: WorkdayService,
		private eventService: EventService,
		private propertyService: PropertyService,
	  private modal: NgbModal,
	  private router: Router) {
			this.dayModifier = function(day: CalendarMonthViewDay): void {
	      if (!this.dateIsValid(day.date)) {
	        day.cssClass = 'cal-disabled';
	      }
	    }.bind(this);
	    this.dateOrViewChanged();
		}

	modalRef: NgbModalRef;
		  // tenant link modal
	@ViewChild('content') modalContent: TemplateRef<any>;

	refresh: Subject<any> = new Subject();

  viewDate: Date = new Date();
	minDate: Date = new Date();
	maxDate: Date = addMonths(new Date(), 3);
	dayModifier: Function;
  locale: string = "de";

	tenant: ITenant;
	property: IProperty;
  events: Observable<WorkerEvent[]>;
	selectedEvent: WorkerEvent;
  tenantEvents: IEvent[];

	prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;

	ngOnInit() {
		this.route.params.subscribe(params => {
			let tenantId = "" + params['id'];
			this.tenantService.findTenantById(tenantId).subscribe(t => {
				this.tenant = t;
				this.propertyService.getProperty(t.propertyId).subscribe(p => this.property = p);
			});
      this.eventService.findAllEvents().subscribe(events => this.tenantEvents = events);
			this.events = this.workdayService.findAll().map(workdays => {
				var events = [];
				workdays.filter(workday => workday.propertyId === this.tenant.propertyId)
          .forEach(workday => {
					var date;
					for(date = new Date(workday.start); date < new Date(workday.end); date = addMinutes(date, 30)) {
            var eventDate = date.toJSON();
            if(this.tenantEvents.find(e => e.start === eventDate) != null) {
              console.log("event skipped: " + eventDate);
              continue;
            }
						events.push({
	            title: date.toJSON().substring(11, 16) + "-" + addMinutes(date, 30).toJSON().substring(11, 16),
	            start: date,
	            end: addMinutes(date, 30),
	            color: colors.blue,
	            actions: [],
							workerId: workday.workerId,
	          });
					}
				});
				return events;
      })
		});
	}

  eventClicked({event}: {event: WorkerEvent}): void {
    console.log('Event clicked', event);
		this.selectedEvent = event;
		this.modalRef = this.modal.open(this.modalContent);
  }

  confirm(): void {
		this.modalRef.close();
    this.eventService.save({
			id: "",
			propertyId: this.property.id,
			tenantId: this.tenant.id,
			workerId: this.selectedEvent.workerId,
			start: this.selectedEvent.start.toJSON(),
			end: this.selectedEvent.end.toJSON(),
		}).subscribe(eventId => this.router.navigate(["/tenant-event-confirmation", eventId]));
	}

	increment(): void {
    this.changeDate(addWeeks(this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subWeeks(this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(endOfWeek(subWeeks(this.viewDate, 1)));
    this.nextBtnDisabled = !this.dateIsValid(startOfWeek(addWeeks(this.viewDate, 1)));
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }
}
