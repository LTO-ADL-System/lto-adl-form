import apiService from './api.js';

class AppointmentService {
  // Schedule a new appointment
  async scheduleAppointment(appointmentData) {
    const response = await apiService.post('/appointments/', appointmentData);
    return response;
  }

  // Get user's appointments
  async getUserAppointments(skip = 0, limit = 20) {
    const response = await apiService.get(`/appointments/?skip=${skip}&limit=${limit}`);
    return response;
  }

  // Get specific appointment by ID
  async getAppointmentById(appointmentId) {
    const response = await apiService.get(`/appointments/${appointmentId}`);
    return response;
  }

  // Update/reschedule appointment
  async updateAppointment(appointmentId, updateData) {
    const response = await apiService.put(`/appointments/${appointmentId}`, updateData);
    return response;
  }

  // Cancel appointment
  async cancelAppointment(appointmentId) {
    const response = await apiService.delete(`/appointments/${appointmentId}`);
    return response;
  }

  // Get available time slots for a location and date
  async getAvailableSlots(locationId, appointmentDate) {
    const response = await apiService.get(
      `/appointments/locations/${locationId}/available-slots?appointment_date=${appointmentDate}`
    );
    return response;
  }

  // Format appointment data for submission
  formatAppointmentData(formData) {
    return {
      application_id: formData.applicationId || formData.application_id,
      location_id: formData.locationId || formData.location_id,
      appointment_date: formData.appointmentDate || formData.appointment_date,
      appointment_time: formData.appointmentTime || formData.appointment_time
    };
  }

  // Convert time from 12-hour to 24-hour format
  convertTo24HourFormat(time12h) {
    try {
      const [time, period] = time12h.trim().split(' ');
      let [hours, minutes] = time.split(':');
      
      // Convert to integers for proper calculation
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10) || 0;
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Format with leading zeros and add seconds
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      
      console.log(`Converting time: ${time12h} -> ${formattedTime}`);
      return formattedTime;
    } catch (error) {
      console.error('Error converting time format:', error, 'Input:', time12h);
      throw new Error(`Invalid time format: ${time12h}`);
    }
  }

  // Convert date to ISO format
  formatDateForAPI(year, month, day) {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  }

  // Get appointment status display name
  getAppointmentStatusDisplayName(status) {
    const statuses = {
      'Scheduled': 'Scheduled',
      'Completed': 'Completed',
      'Reschedule': 'Needs Reschedule',
      'Cancelled': 'Cancelled',
      'Missed': 'Missed'
    };
    return statuses[status] || status;
  }

  // Get appointment status color for UI
  getAppointmentStatusColor(status) {
    const colors = {
      'Scheduled': 'blue',
      'Completed': 'green',
      'Reschedule': 'orange',
      'Cancelled': 'red',
      'Missed': 'red'
    };
    return colors[status] || 'gray';
  }

  // Check if appointment can be rescheduled
  canRescheduleAppointment(status, appointmentDate) {
    const rescheduleableStatuses = ['Scheduled', 'Reschedule'];
    const appointmentDateTime = new Date(`${appointmentDate}T00:00:00`);
    const now = new Date();
    
    // Can reschedule if status allows and appointment is in the future
    return rescheduleableStatuses.includes(status) && appointmentDateTime > now;
  }

  // Check if appointment can be cancelled
  canCancelAppointment(status, appointmentDate) {
    const cancellableStatuses = ['Scheduled', 'Reschedule'];
    const appointmentDateTime = new Date(`${appointmentDate}T00:00:00`);
    const now = new Date();
    
    // Can cancel if status allows and appointment is in the future
    return cancellableStatuses.includes(status) && appointmentDateTime > now;
  }

  // Generate time slots for a day (9:00 AM - 11:30 AM, 1:00 PM - 4:30 PM)
  generateTimeSlots() {
    const slots = [];
    
    // Morning slots: 9:00 AM - 11:30 AM
    for (let hour = 9; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 11 && minute > 30) break; // Stop at 11:30
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        slots.push(timeString);
      }
    }
    
    // Afternoon slots: 1:00 PM - 4:30 PM
    for (let hour = 13; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 16 && minute > 30) break; // Stop at 4:30 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        slots.push(timeString);
      }
    }
    
    return slots;
  }

  // Format time for display (24-hour to 12-hour format)
  formatTimeForDisplay(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Format date for display
  formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Check if date is a weekend (assuming LTO doesn't operate on weekends)
  isWeekend(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  // Check if date is in the past
  isPastDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Get minimum date for appointment (tomorrow)
  getMinimumAppointmentDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Get maximum date for appointment (3 months from now)
  getMaximumAppointmentDate() {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  }

  // Validate appointment date
  validateAppointmentDate(dateString) {
    if (this.isPastDate(dateString)) {
      throw new Error('Cannot schedule appointment in the past');
    }

    if (this.isWeekend(dateString)) {
      throw new Error('Appointments are not available on weekends');
    }

    const minDate = this.getMinimumAppointmentDate();
    const maxDate = this.getMaximumAppointmentDate();

    if (dateString < minDate) {
      throw new Error('Appointment must be scheduled at least 1 day in advance');
    }

    if (dateString > maxDate) {
      throw new Error('Appointment cannot be scheduled more than 3 months in advance');
    }

    return true;
  }
}

export default new AppointmentService(); 