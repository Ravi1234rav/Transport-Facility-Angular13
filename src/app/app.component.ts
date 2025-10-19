import { Component, OnInit } from '@angular/core';

interface Ride {
  id: string;
  employeeId: string; // owner
  vehicleType: 'Bike' | 'Car';
  vehicleNo: string;
  vacantSeats: number;
  time: string; // HH:MM
  pickup: string;
  destination: string;
  date: string; // YYYY-MM-DD
  bookings: string[]; // employeeIds who booked
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Transport Facility Management';

  today = new Date().toLocaleDateString();

  // Add form model
  addForm = {
    employeeId: '',
    vehicleType: 'Car',
    vehicleNo: '',
    vacantSeats: 1,
    time: '',
    pickup: '',
    destination: '',
  };

  message = '';
  rides: any[] = [];
  filteredRides: any[] = [];
  filterType: string = 'All';
  filterTime: string = '';

  constructor() {}

  ngOnInit() {
    this.loadRides();
  }

  addRide() {
    const exists = this.rides.find(
      (r) => r.employeeId === this.addForm.employeeId
    );
    if (exists) {
      this.message = 'Employee ID already has a ride.';
      return;
    }

    const newRide = {
      ...this.addForm,
      bookings: [],
    };
    this.rides.push(newRide);
    this.saveRides();
    this.filterRides();
    this.message = 'Ride added successfully!';
  }

  bookRide(ride: any, empId: string) {
    if (!empId) return alert('Enter Employee ID to book.');
    if (ride.employeeId === empId)
      return alert('You cannot book your own ride.');
    if (ride.bookings.includes(empId))
      return alert('You have already booked this ride.');
    if (ride.vacantSeats <= 0) return alert('No seats left.');

    ride.bookings.push(empId);
    ride.vacantSeats--;
    this.saveRides();
    this.filterRides();
  }

  applyFilters() {
    this.filteredRides = this.rides.filter((r) => {
      const matchType =
        this.filterType === 'All' || r.vehicleType === this.filterType;

      const matchTime =
        !this.filterTime || this.isWithinTimeRange(this.filterTime, r.time, 60);

      return matchType && matchTime;
    });
  }

  // Reset filters
  resetFilters() {
    this.filterType = 'All';
    this.filterTime = '';
    this.filteredRides = this.rides;
  }

  // ±60 minutes logic
  isWithinTimeRange(selected: string, rideTime: string, bufferMinutes: number) {
    const [sh, sm] = selected.split(':').map(Number);
    const [rh, rm] = rideTime.split(':').map(Number);
    const selectedMins = sh * 60 + sm;
    const rideMins = rh * 60 + rm;
    return Math.abs(selectedMins - rideMins) <= bufferMinutes;
  }

  filterRides() {
    this.filteredRides = this.rides.filter((r) => {
      if (this.filterType !== 'All' && r.vehicleType !== this.filterType)
        return false;
      if (this.filterTime) {
        const rideTime = this.timeToMinutes(r.time);
        const filterTime = this.timeToMinutes(this.filterTime);
        const diff = Math.abs(rideTime - filterTime);
        if (diff > 60) return false; // ±60 mins
      }
      return true;
    });
  }

  saveRides() {
    localStorage.setItem('rides', JSON.stringify(this.rides));
  }

  loadRides() {
    const stored = localStorage.getItem('rides');
    this.rides = stored ? JSON.parse(stored) : [];
    this.filterRides();
  }

  timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
}
