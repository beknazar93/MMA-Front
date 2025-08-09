import React, { useState } from 'react';
import './AttendanceTracker.scss';

const groups = [
  { id: 1, name: 'Группа A', students: ['Иван Иванов', 'Мария Петрова', 'Алексей Сидоров'] },
  { id: 2, name: 'Группа B', students: ['Анна Смирнова', 'Дмитрий Кузнецов', 'Елена Васильева'] },
];

const AttendanceTracker = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [attendance, setAttendance] = useState({});

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setAttendance({});
  };

  const toggleAttendance = (student) => {
    setAttendance((prev) => ({
      ...prev,
      [student]: !prev[student],
    }));
  };

  return (
    <div className="attendance-tracker">
      <div className="attendance-tracker__groups">
        <h2 className="attendance-tracker__title">Группы</h2>
        <ul className="attendance-tracker__group-list">
          {groups.map((group) => (
            <li
              key={group.id}
              className={`attendance-tracker__group-item ${
                selectedGroup?.id === group.id ? 'attendance-tracker__group-item--active' : ''
              }`}
              onClick={() => handleGroupSelect(group)}
            >
              {group.name}
            </li>
          ))}
        </ul>
      </div>
      {selectedGroup && (
        <div className="attendance-tracker__students">
          <h2 className="attendance-tracker__title">{selectedGroup.name}</h2>
          <ul className="attendance-tracker__student-list">
            {selectedGroup.students.map((student) => (
              <li key={student} className="attendance-tracker__student-item">
                <span className="attendance-tracker__student-name">{student}</span>
                <button
                  className={`attendance-tracker__button ${
                    attendance[student]
                      ? 'attendance-tracker__button--present'
                      : 'attendance-tracker__button--absent'
                  }`}
                  onClick={() => toggleAttendance(student)}
                >
                  {attendance[student] ? 'Присутствует' : 'Отсутствует'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;