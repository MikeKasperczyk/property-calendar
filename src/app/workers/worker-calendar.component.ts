import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { isSameDay, isSameMonth, addMinutes, addDays, addWeeks, addMonths, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarEventAction } from 'angular-calendar';
import { colors } from '../const/colors';

import { AuthService } from '../authn/auth.service';
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
	templateUrl: './worker-calendar.component.html',
})
export class WorkerCalendarComponent implements OnInit {

	monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];

	constructor(
		private authService: AuthService,
		private tenantService: TenantService,
	  private workdayService: WorkdayService,
		private eventService: EventService,
		private propertyService: PropertyService) {
			this.dayModifier = function(day: CalendarMonthViewDay): void {
	      if (!this.dateIsValid(day.date)) {
	        day.cssClass = 'cal-disabled';
	      }
	    }.bind(this);
	    this.dateOrViewChanged();
		}

	refresh: Subject<any> = new Subject();

  viewDate: Date = new Date();
	minDate: Date = addDays(new Date(), 1);
	maxDate: Date = addMonths(new Date(), 3);
	dayModifier: Function;

  events: CalendarEvent[] = [];
  tenants: ITenant[] = [];
  properties: IProperty[] = [];

	prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;

	ngOnInit() {
    var isAdmin = this.authService.hasRole('AdminRole');
    this.tenantService.getAllTenants().subscribe(tenants => this.tenants = tenants);
    this.propertyService.getProperties().subscribe(props => this.properties = props);
    // if worker then find all worker workdays and if admin find all workers workdays
    var workerId = this.authService.getUserName();
    this.workdayService.findAll().subscribe(events => {
      events.filter(e => isAdmin || e.workerId === workerId)
        .forEach(e => {
          this.events.push(this.createWorkdayEvent(e, isAdmin));
          this.refresh.next();
        })
    });
    // find all tenants events and apply to same calendar
    this.eventService.findAllEvents().subscribe(events => {
      events.filter(e => isAdmin || e.workerId === workerId)
        .forEach(e => {
          this.events.push(this.createTenantEvent(e, isAdmin));
          this.refresh.next();
        })
    });
	}

  createWorkdayEvent(workday : IWorkday, showWorker: boolean) : CalendarEvent {
    var property = this.properties.find(p => p.id === workday.propertyId);
    var time = workday.start.substring(11, 16) + "-" + workday.end.substring(11, 16);
    return {
      title: time + (showWorker?" " + workday.workerId:"") + " " + property.address,
      start: new Date(workday.start),
      end: new Date(workday.end),
      color: colors.blue,
      actions: [],
    };
	}

  createTenantEvent(event : IEvent, showWorker: boolean) : CalendarEvent {
    var tenant = this.tenants.find(t => t.id === event.tenantId);
    var property = this.properties.find(p => p.id === event.propertyId);
    var time = event.start.substring(11, 16) + "-" + event.end.substring(11, 16);
    return {
      title: time + (showWorker?" " + event.workerId:"") + " " + property.address + ": " + tenant.firstName + " " + tenant.lastName,
      start: new Date(event.start),
      end: new Date(event.end),
      color: colors.green,
      actions: [],
    };
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
