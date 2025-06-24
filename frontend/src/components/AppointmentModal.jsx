import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const AppointmentModal = ({ isOpen, onClose }) => {
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateAvailable = (day) => {
    if (!day) return false;
    const today = new Date();
    const checkDate = new Date(currentYear, currentMonth, day);
    return checkDate >= today;
  };

  const handleDateSelect = (day) => {
    if (isDateAvailable(day)) {
      setSelectedDate(day);
      setSelectedTime(null);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleBookAppointment = () => {
    if (location && selectedDate && selectedTime) {
      alert(`Appointment booked!\nLocation: ${location}\nDate: ${months[currentMonth]} ${selectedDate}, ${currentYear}\nTime: ${selectedTime}`);
      onClose();
      setLocation('');
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const handleClose = () => {
    onClose();
    setLocation('');
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const calendarDays = generateCalendarDays();

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30">
        <div className="bg-white rounded-2xl w-full max-w-[60%] shadow-2xl">
          <div className="p-4 items-center">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 rounded-lg p-1">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <h2 className="text-lg font-bold text-blue-800">Schedule Appointment</h2>
              </div>
              <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-light"
              >
                ×
              </button>
            </div>

            {/* Location Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Location</label>
              <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-500"
              >
                <option value="">Text Hint</option>
                <option value="Office A">Office A</option>
                <option value="Office B">Office B</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Calendar Section */}
            <h3 className="text-base font-bold text-blue-800 mb-1">Select Date</h3>
            <div className="mb-3 flex justify-center">
              <div className="w-full max-w-xs">

                {/* Month Navigation */}
                <div className="flex items-center justify-center mb-2">
                  <button
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="text-gray-600" size={18} />
                  </button>
                  <h4 className="text-base font-medium text-gray-400 mx-6 min-w-[100px] text-center">
                    {months[currentMonth]} {currentYear}
                  </h4>
                  <button
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="text-gray-600" size={18} />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {calendarDays.map((day, index) => (
                      <button
                          key={index}
                          onClick={() => handleDateSelect(day)}
                          disabled={!isDateAvailable(day)}
                          className={`
                    w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors font-medium
                    ${!day ? 'invisible' : ''}
                    ${isDateAvailable(day)
                              ? selectedDate === day
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-blue-50 text-gray-700 border border-transparent hover:border-blue-200'
                              : 'text-gray-300 cursor-not-allowed bg-gray-50'
                          }
                  `}
                      >
                        {day}
                      </button>
                  ))}
                </div>

                {/* Available indicator */}
                {selectedDate && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs font-medium">Available</span>
                    </div>
                )}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className="mb-4">
                  <h3 className="text-base font-bold text-blue-800 mb-2">Select Time Slot</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {timeSlots.map((time) => (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`
                      py-1 px-2 rounded-lg border text-sm font-medium transition-colors
                      ${selectedTime === time
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                            }
                    `}
                        >
                          {time}
                        </button>
                    ))}
                  </div>
                </div>
            )}

            {/* Book Button */}
            <button
                onClick={handleBookAppointment}
                disabled={!location || !selectedDate || !selectedTime}
                className={`
              w-full py-2 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2
              ${location && selectedDate && selectedTime
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }
            `}
            >
              Book Appointment
              {location && selectedDate && selectedTime && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
              )}
            </button>
          </div>
        </div>
      </div>
  );
};

// Demo component to show the modal
export default function AppointmentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Open Appointment Modal
        </button>

        <AppointmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        />
      </div>
  );
}