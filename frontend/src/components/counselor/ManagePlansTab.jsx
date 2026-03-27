import React, { useState } from "react";
import { FaPlus, FaUserCircle } from "react-icons/fa";

export default function ManagePlansTab() {
  const [isCreating, setIsCreating] = useState(false);

  // Dummy appointment data
  const appointments = [
    {
      id: 1,
      student: "Hiruki Rathnayake",
      date: "2026-03-25",
      reason: "Exam anxiety",
      sessions: 2,
    },
    {
      id: 2,
      student: "Kavindu Perera",
      date: "2026-03-26",
      reason: "Stress management",
      sessions: 1,
    },
    {
      id: 3,
      student: "Minoli Silva",
      date: "2026-03-27",
      reason: "Low motivation",
      sessions: 3,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Counselling Appointments – Treatment Plans
        </h2>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          <FaPlus /> New Plan
        </button>
      </div>


      {/* Create Plan Form */}
      {isCreating && (
        <div className="bg-white p-6 border rounded">

          <h3 className="text-lg font-bold mb-4">
            Create Treatment Plan
          </h3>

          <div className="mb-3">
            <label>Student</label>
            <select className="w-full border p-2">
              <option>Hiruki Rathnayake</option>
              <option>Kavindu Perera</option>
              <option>Minoli Silva</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Goal Title</label>
            <input
              type="text"
              className="w-full border p-2"
              placeholder="Enter goal"
            />
          </div>

          <div className="mb-3">
            <label>Notes</label>
            <textarea
              className="w-full border p-2"
              rows={3}
            />
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Save Plan
          </button>

        </div>
      )}


      {/* Appointment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {appointments.map((a) => (

          <div
            key={a.id}
            className="border rounded p-4 bg-white shadow"
          >

            <div className="text-3xl mb-2">
              <FaUserCircle />
            </div>

            <h3 className="font-bold">
              {a.student}
            </h3>

            <p>Date: {a.date}</p>
            <p>Reason: {a.reason}</p>
            <p>Sessions: {a.sessions}</p>


            <div className="flex gap-2 mt-3">

              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => setIsCreating(true)}
              >
                Add Plan
              </button>

              <button
                className="bg-gray-800 text-white px-3 py-1 rounded"
              >
                Edit Plan
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}