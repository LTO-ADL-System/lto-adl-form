import { useState, useEffect, useCallback } from 'react';
import appointmentService from '../services/appointmentService.js';

// Hook for managing user appointments
export const useAppointments = (autoFetch = true) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 20,
    pages: 0
  });

  // Fetch user appointments
  const fetchAppointments = useCallback(async (skip = 0, limit = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.getUserAppointments(skip, limit);
      setAppointments(response.data);
      setPagination({
        total: response.total,
        page: Math.floor(skip / limit) + 1,
        size: limit,
        pages: response.pages
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Schedule new appointment
  const scheduleAppointment = async (appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const formattedData = appointmentService.formatAppointmentData(appointmentData);
      const response = await appointmentService.scheduleAppointment(formattedData);
      
      // Refresh appointments list after successful scheduling
      if (response.success) {
        await fetchAppointments();
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update/reschedule appointment
  const updateAppointment = async (appointmentId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.updateAppointment(appointmentId, updateData);
      
      // Update appointment in local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, ...updateData }
            : apt
        )
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.cancelAppointment(appointmentId);
      
      // Remove appointment from local state or update status
      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, status: 'Cancelled' }
            : apt
        )
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load more appointments (pagination)
  const loadMore = async () => {
    const skip = appointments.length;
    const limit = pagination.size;

    setLoading(true);
    try {
      const response = await appointmentService.getUserAppointments(skip, limit);
      setAppointments(prev => [...prev, ...response.data]);
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1
      }));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh appointments
  const refresh = () => {
    return fetchAppointments(0, pagination.size);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAppointments();
    }
  }, [autoFetch, fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    pagination,
    fetchAppointments,
    scheduleAppointment,
    updateAppointment,
    cancelAppointment,
    loadMore,
    refresh,
    clearError
  };
};

// Hook for managing a single appointment
export const useAppointment = (appointmentId) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch appointment by ID
  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount or when appointmentId changes
  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, fetchAppointment]);

  return {
    appointment,
    loading,
    error,
    fetchAppointment,
    clearError
  };
};

// Hook for managing appointment availability
export const useAppointmentSlots = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get available slots for location and date
  const getAvailableSlots = async (locationId, appointmentDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.getAvailableSlots(locationId, appointmentDate);
      setAvailableSlots(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate all possible time slots
  const getAllTimeSlots = () => {
    return appointmentService.generateTimeSlots();
  };

  // Clear slots
  const clearSlots = () => {
    setAvailableSlots([]);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    availableSlots,
    loading,
    error,
    getAvailableSlots,
    getAllTimeSlots,
    clearSlots,
    clearError
  };
};

// Hook for appointment utilities and validation
export const useAppointmentUtils = () => {
  // Get appointment status display name
  const getStatusDisplayName = (status) => {
    return appointmentService.getAppointmentStatusDisplayName(status);
  };

  // Get appointment status color
  const getStatusColor = (status) => {
    return appointmentService.getAppointmentStatusColor(status);
  };

  // Check if appointment can be rescheduled
  const canReschedule = (status, appointmentDate) => {
    return appointmentService.canRescheduleAppointment(status, appointmentDate);
  };

  // Check if appointment can be cancelled
  const canCancel = (status, appointmentDate) => {
    return appointmentService.canCancelAppointment(status, appointmentDate);
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    return appointmentService.formatTimeForDisplay(timeString);
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    return appointmentService.formatDateForDisplay(dateString);
  };

  // Check if date is weekend
  const isWeekend = (dateString) => {
    return appointmentService.isWeekend(dateString);
  };

  // Check if date is in the past
  const isPastDate = (dateString) => {
    return appointmentService.isPastDate(dateString);
  };

  // Get minimum appointment date
  const getMinimumDate = () => {
    return appointmentService.getMinimumAppointmentDate();
  };

  // Get maximum appointment date
  const getMaximumDate = () => {
    return appointmentService.getMaximumAppointmentDate();
  };

  // Validate appointment date
  const validateDate = (dateString) => {
    try {
      appointmentService.validateAppointmentDate(dateString);
      return { isValid: true, error: null };
    } catch (err) {
      return { isValid: false, error: err.message };
    }
  };

  return {
    getStatusDisplayName,
    getStatusColor,
    canReschedule,
    canCancel,
    formatTimeForDisplay,
    formatDateForDisplay,
    isWeekend,
    isPastDate,
    getMinimumDate,
    getMaximumDate,
    validateDate
  };
};

// Hook for appointment form validation
export const useAppointmentValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  // Validate appointment data
  const validateAppointment = (appointmentData) => {
    const errors = {};

    if (!appointmentData.applicationId) {
      errors.applicationId = 'Application is required';
    }

    if (!appointmentData.locationId) {
      errors.locationId = 'Location is required';
    }

    if (!appointmentData.appointmentDate) {
      errors.appointmentDate = 'Date is required';
    } else {
      // Validate date using appointment service
      try {
        appointmentService.validateAppointmentDate(appointmentData.appointmentDate);
      } catch (err) {
        errors.appointmentDate = err.message;
      }
    }

    if (!appointmentData.appointmentTime) {
      errors.appointmentTime = 'Time is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate reschedule data
  const validateReschedule = (rescheduleData) => {
    const errors = {};

    if (!rescheduleData.appointment_date) {
      errors.appointment_date = 'New date is required';
    } else {
      try {
        appointmentService.validateAppointmentDate(rescheduleData.appointment_date);
      } catch (err) {
        errors.appointment_date = err.message;
      }
    }

    if (!rescheduleData.appointment_time) {
      errors.appointment_time = 'New time is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors
  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  return {
    validationErrors,
    validateAppointment,
    validateReschedule,
    clearValidationErrors
  };
};

// Hook for appointment notifications and reminders
export const useAppointmentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Check for upcoming appointments
  const checkUpcomingAppointments = (appointments) => {
    const now = new Date();
    const upcoming = [];

    appointments.forEach(appointment => {
      if (appointment.status === 'Scheduled') {
        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff <= 7 && daysDiff > 0) {
          upcoming.push({
            ...appointment,
            daysUntil: daysDiff,
            message: `Appointment in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`
          });
        } else if (daysDiff === 0) {
          const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
          if (hoursDiff > 0) {
            upcoming.push({
              ...appointment,
              hoursUntil: hoursDiff,
              message: `Appointment today in ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`
            });
          }
        }
      }
    });

    setNotifications(upcoming);
    return upcoming;
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    checkUpcomingAppointments,
    clearNotifications
  };
}; 