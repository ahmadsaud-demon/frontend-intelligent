import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Clock, GripHorizontal } from 'lucide-react';
import { fetchTimetable, updateTimetableSlot } from '../lib/api';

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  subject?: string;
  teacher?: string;
  room?: string;
}

interface TimetableProps {
  courseId?: string;
  onSlotUpdate?: (slot: TimeSlot) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export default function Timetable({ courseId, onSlotUpdate }: TimetableProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [draggedSlot, setDraggedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, [courseId]);

  async function loadTimetable() {
    try {
      const data = await fetchTimetable();
      // Filter slots by courseId if provided
      const filteredData = courseId
        ? data.filter(slot => slot.subject === courseId)
        : data;
      setSlots(filteredData);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(e: React.DragEvent, slot: TimeSlot) {
    e.dataTransfer.setData('text/plain', JSON.stringify(slot));
    setDraggedSlot(slot);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.add('bg-indigo-100');
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove('bg-indigo-100');
  }

  async function handleDrop(e: React.DragEvent, targetDay: string, targetTime: string) {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-indigo-100');

    if (!draggedSlot) return;

    const updatedSlot = {
      ...draggedSlot,
      day: targetDay,
      time: targetTime,
    };

    try {
      await updateTimetableSlot(draggedSlot.id, updatedSlot);
      setSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.id === draggedSlot.id ? updatedSlot : slot
        )
      );
      onSlotUpdate?.(updatedSlot);
    } catch (error) {
      console.error('Error updating timetable slot:', error);
    }

    setDraggedSlot(null);
  }

  function getSlot(day: string, time: string) {
    return slots.find(slot => slot.day === day && slot.time === time);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-indigo-600" />
          {courseId ? 'Course Timetable' : 'All Classes'}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                {DAYS.map(day => (
                  <th
                    key={day}
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {TIMES.map(time => (
                <tr key={time}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {time}
                  </td>
                  {DAYS.map(day => {
                    const slot = getSlot(day, time);
                    return (
                      <td
                        key={`${day}-${time}`}
                        className={classNames(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          'border border-gray-100',
                          'transition-colors duration-150'
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, time)}
                      >
                        {slot ? (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, slot)}
                            className={classNames(
                              'p-2 rounded-lg',
                              'bg-indigo-50 border border-indigo-100',
                              'cursor-move transition-shadow duration-150 hover:shadow-md'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-indigo-700">
                                {slot.subject}
                              </span>
                              <GripHorizontal className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div className="text-xs text-indigo-600">
                              {slot.teacher}
                            </div>
                            <div className="text-xs text-indigo-500">
                              Room {slot.room}
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 flex items-center justify-center text-gray-300">
                            Drop here
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}