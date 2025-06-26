import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useAppointments, useAppointmentUtils } from '../hooks/useAppointments';
import { AppointmentModal } from './AppointmentModal';

const AppointmentsList = () => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const { 
    appointments, 
    loading, 
    error, 
    cancelAppointment, 
    refresh 
  } = useAppointments(false); // Don't auto-fetch to control when it fetches

  // Only fetch appointments when component mounts
  useEffect(() => {
    refresh();
  }, []);
  
  const { 
    getStatusDisplayName, 
    getStatusColor, 
    canReschedule, 
    canCancel, 
    formatTimeForDisplay, 
    formatDateForDisplay 
  } = useAppointmentUtils();

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId);
        alert('Appointment cancelled successfully');
      } catch (err) {
        alert('Error cancelling appointment: ' + err.message);
      }
    }
  };

  const getLocationName = (locationId) => {
    const locations = {
      'LCTID_001': 'LTO Manila East',
      'LCTID_002': 'LTO Quezon City',
      'LCTID_003': 'LTO Makati',
      'LCTID_004': 'LTO Pasig',
      'LCTID_005': 'LTO Manila West',
      'LCTID_006': 'LTO Mandaluyong'
    };
    return locations[locationId] || locationId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-blue-600">Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <p>Error loading appointments: {error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
        <p className="text-gray-500">You haven't scheduled any appointments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Appointments</h3>
      
      {appointments.map((appointment) => (
        <div key={appointment.appointment_id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {formatDateForDisplay(appointment.appointment_date)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {formatTimeForDisplay(appointment.appointment_time)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {getLocationName(appointment.location_id)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs">Status:</span>
                <span 
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
                  style={{
                    backgroundColor: getStatusColor(appointment.status) + '20',
                    color: getStatusColor(appointment.status)
                  }}
                >
                  {getStatusDisplayName(appointment.status)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {canReschedule(appointment.status, appointment.appointment_date) && (
                <button
                  onClick={() => handleReschedule(appointment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Reschedule"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              
              {canCancel(appointment.status, appointment.appointment_date) && (
                <button
                  onClick={() => handleCancel(appointment.appointment_id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Reschedule Modal */}
      <AppointmentModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
};

export default AppointmentsList; 