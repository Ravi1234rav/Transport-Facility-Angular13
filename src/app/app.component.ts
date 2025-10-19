import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Ride {
  employeeId: string;
  vehicleType: string;
  vehicleNo: string;
  vacantSeats: number;
  time: string;
  pickup: string;
  destination: string;
  bookings: string[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Transport Facility';
  today = new Date().toISOString().split('T')[0];
  message = '';
  addRideForm!: FormGroup;
  rides: Ride[] = [];
  filteredRides: Ride[] = [];
  filterType: string = 'All';
  filterTime: string = '';
  isEditMode = false;
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addRideForm = this.fb.group({
      employeeId: ['', Validators.required],
      vehicleType: ['Bike', Validators.required],
      vehicleNo: ['', Validators.required],
      vacantSeats: [1, [Validators.required, Validators.min(1)]],
      time: ['', Validators.required],
      pickup: ['', Validators.required],
      destination: ['', Validators.required],
    });

    this.filteredRides = this.rides;
  }

  popupMessage: string = '';

  private showMessage(msg: string, duration: number = 3000): void {
    this.popupMessage = msg;
    setTimeout(() => (this.popupMessage = ''), duration);
  }

  closePopup(): void {
    this.popupMessage = '';
  }

  get f() {
    return this.addRideForm.controls;
  }

  addRide(): void {
    if (this.addRideForm.invalid) return;

    const formValue = this.addRideForm.value;

    if (this.isEditMode && this.editingIndex !== null) {
      // Update existing ride
      this.rides[this.editingIndex] = {
        ...this.rides[this.editingIndex],
        ...formValue,
      };
      this.isEditMode = false;
      this.editingIndex = null;
      this.showMessage('Ride Updated successfully!');
    } else {
      // Check unique Employee ID
      const exists = this.rides.some(
        (r) => r.employeeId === formValue.employeeId
      );
      if (exists) {
        this.showMessage('Employee ID already has a ride.');
        return;
      }

      const newRide: Ride = {
        ...formValue,
        bookings: [],
      };

      this.rides.push(newRide);
      this.showMessage('Ride added successfully!');
    }

    this.addRideForm.reset({ vehicleType: 'Bike', vacantSeats: 1 });
    this.filteredRides = [...this.rides];
  }

  editRide(index: number): void {
    this.isEditMode = true;
    this.editingIndex = index;
    const ride = this.rides[index];
    this.addRideForm.patchValue(ride);
    this.message = '';
  }

  deleteRide(index: number): void {
    if (confirm('Are you sure you want to delete this ride?')) {
      this.rides.splice(index, 1);
      this.filteredRides = [...this.rides];
      this.showMessage('Ride deleted successfully!');
      this.isEditMode = false;
      this.editingIndex = null;
    }
  }

  bookRide(ride: Ride, empId: string): void {
    if (!empId.trim()) {
      this.showMessage('Employee ID required to book.');
      return;
    }
    if (ride.employeeId === empId) {
      this.showMessage('You cannot book your own ride.');
      return;
    }
    if (ride.bookings.includes(empId)) {
      this.showMessage('You already booked this ride.');
      return;
    }
    if (ride.vacantSeats <= 0) {
      this.showMessage('No seats available.');
      return;
    }

    ride.bookings.push(empId);
    ride.vacantSeats--;
    this.showMessage(`Ride booked successfully by ${empId}.`);
  }

  applyFilters(): void {
    this.filteredRides = this.rides.filter((ride) => {
      const typeMatch =
        this.filterType === 'All' || ride.vehicleType === this.filterType;

      let timeMatch = true;
      if (this.filterTime) {
        const rideTime = this.timeToMinutes(ride.time);
        const filterTime = this.timeToMinutes(this.filterTime);
        timeMatch = Math.abs(rideTime - filterTime) <= 60;
      }

      return typeMatch && timeMatch;
    });
  }

  resetFilters(): void {
    this.filterType = 'All';
    this.filterTime = '';
    this.filteredRides = [...this.rides];
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
