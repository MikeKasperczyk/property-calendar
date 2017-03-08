import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { startOfDay, endOfDay, isSameDay, isSameMonth, addDays, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarEventAction } from 'angular-calendar';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { colors } from '../const/colors';
import { months } from '../const/months';
import 'rxjs/add/operator/catch';

import { AuthService } from '../authn/auth.service';
import { PropertyService } from './property.service';
import { IProperty } from './property';
import { WorkdayService } from '../workers/workday.service';
import { IWorkday } from '../workers/workday';
import { EventService } from '../events/event.service';
import { IEvent } from '../events/event';
import { TenantService } from '../tenants/tenant.service';
import { ITenant } from '../tenants/tenant';

interface TenantEvent extends CalendarEvent {
  tenant: IEvent;
}

interface WorkdayEvent extends CalendarEvent {
  workday: IWorkday;
}

@Component({
  templateUrl: './property-calendar.component.html',
})
export class PropertyCalendarComponent implements OnInit {

  monthNames = months;

  constructor(
    private route: ActivatedRoute,
    private modal: NgbModal,
    private authService: AuthService,
    private propertyService: PropertyService,
    private workdayService: WorkdayService,
    private eventService: EventService,
    private tenantService: TenantService) {
    this.dayModifier = function(day: CalendarMonthViewDay): void {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
      day.badgeTotal = day.events.filter(event => event.title != 'neu').length;
    }.bind(this);
    this.dateOrViewChanged();
  }

  // modal and properties
  @ViewChild('content') modalContent: TemplateRef<any>;
  modalRef: NgbModalRef;
  start: any = "09:00";
  end: any = "17:00";

  workdayActions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({event}: {event: WorkdayEvent}): void => {
        this.deleteEvent(event);
      }
    }
  ];

  tenantActions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({event}: {event: TenantEvent}): void => {
        this.deleteTenantEvent(event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  activeDayIsOpen: boolean = false;
  viewDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = addMonths(new Date(), 3);
  dayModifier: Function;
  locale: string = "de";

  property: IProperty;
  events: CalendarEvent[] = [];
  tenants: ITenant[];

  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;

  ngOnInit() {
    // add 'new' event for each day
    var startDate = addDays(this.minDate, 1);
    var endDate = this.maxDate;
    for(var date = startDate; date <= endDate; date = addDays(date, 1)) {
      this.events.push({
        title: "neu",
        start: new Date(date),
        color: colors.white,
      });
    }

    this.route.params.subscribe(params => {
      let propertyId = params['id'];
      var propertyObservable = this.propertyService.getProperty(propertyId).map(property => this.property = property);
      var tenantsObservable = this.tenantService.getAllTenants().map(tenants => this.tenants = tenants);

      propertyObservable.zip(tenantsObservable).subscribe(() => {
        // add workdays
        this.workdayService.findAll().subscribe(workdays => {
          workdays.filter(workday => workday.propertyId === propertyId).forEach(workday => {
            this.events.push(this.createWorkdayEvent(workday));
            this.refresh.next();
          });
        });

        // add tenant events
        this.eventService.findAllEvents().subscribe(events => {
          events.filter(event => event.propertyId === propertyId).forEach(event => {
            this.events.push(this.createTenantEvent(event));
            this.refresh.next();
          })
        });
      });
    });


  }

  addEvent() {
    var startDateTime = new Date(this.viewDate);
    startDateTime.setUTCHours(parseInt(this.start.substring(0, 2)));
    startDateTime.setUTCMinutes(0);
    startDateTime.setUTCSeconds(0);
    var endDateTime = new Date(this.viewDate);
    endDateTime.setUTCHours(parseInt(this.end.substring(0, 2)));
    endDateTime.setUTCMinutes(0);
    endDateTime.setUTCSeconds(0);
    console.log("start/end", startDateTime.toJSON(), endDateTime.toJSON());
    var workday: IWorkday = {
      id : "",
      propertyId : this.property.id,
      workerId : this.authService.getUserName(),
      start : startDateTime.toJSON(),
      end : endDateTime.toJSON(),
    }
    // save event in database
    this.workdayService.save(workday);

    // if successfull add it to calendar
    this.events.push(this.createWorkdayEvent(workday));
    this.refresh.next();

    // close modal
    this.modalRef.close();
  }

  deleteEvent(event: WorkdayEvent): void {
      this.workdayService.delete(event.workday);
      this.events = this.events.filter(e => e !== event);
  }

  deleteTenantEvent(event: TenantEvent): void {
    this.eventService.delete(event.tenant);
    this.events = this.events.filter(e => e !== event);
  }

  open(content) {
    this.modal.open(content);
  }

  eventClicked({event}: { event: CalendarEvent }): void {
    if(event.title === 'neu') {
      this.viewDate = event.start;
      this.modalRef = this.modal.open(this.modalContent, { size: 'sm' });
    }
  }

  dayClicked({date, events}: { date: Date, events: CalendarEvent[] }): void {
    if (
      (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true)
    ) {
      this.activeDayIsOpen = false;
    } else {
      this.activeDayIsOpen = true;
    }

    this.viewDate = date;
  }

  increment(): void {
    this.changeDate(addMonths(this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subMonths(this.viewDate, 1));
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
    this.prevBtnDisabled = !this.dateIsValid(endOfMonth(subMonths(this.viewDate, 1)));
    this.nextBtnDisabled = !this.dateIsValid(startOfMonth(addMonths(this.viewDate, 1)));
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  createWorkdayEvent(workday : IWorkday) : WorkdayEvent {
    return {
      title: workday.start.substring(11, 16) + "-" + workday.end.substring(11, 16) + " (" + workday.workerId + ")",
      start: new Date(workday.start),
      end: new Date(workday.end),
      color: colors.blue,
      actions: this.workdayActions,
      workday: workday,
    };
	}

  createTenantEvent(event : IEvent) : TenantEvent {
    var tenant = this.tenants.find(t => t.id === event.tenantId);
    return {
      title: event.start.substring(11, 16) + "-" + event.end.substring(11, 16) + " (" + tenant.firstName + " " + tenant.lastName + ")",
      start: new Date(event.start),
      end: new Date(event.end),
      color: colors.green,
      actions: this.tenantActions,
      tenant: event,
    };
	}
}
