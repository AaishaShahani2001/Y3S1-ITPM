import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import "chart.js/auto";

export default function EventAnalyticsPage() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const genderRef = useRef();
  const totalRef = useRef();
  const facultyRef = useRef();
  const uniRef = useRef();

  useEffect(() => {
    fetch(`http://localhost:3000/api/events/${id}`)
      .then(res => res.json())
      .then(setEvent);

    fetch(`http://localhost:3000/api/events/${id}/registrations`)
      .then(res => res.json())
      .then(data => {
        console.log("REG DATA:", data); // 🔥 debug
        setRegistrations(data || []);
      });
  }, [id]);

  if (!event) return <div className="p-10">Loading...</div>;

  // ✅ FIXED FILTERS (lowercase)
  const confirmedRegs = registrations.filter(r => r.status !== "waitlist");
  const waitlistRegs = registrations.filter(r => r.status === "waitlist");
  const attendedRegs = registrations.filter(r => r.attended === true);

  const male = confirmedRegs.filter(r => r.gender === "Male").length;
  const female = confirmedRegs.filter(r => r.gender === "Female").length;

  const facultyMap = {};
  confirmedRegs.forEach(r => {
    facultyMap[r.faculty] = (facultyMap[r.faculty] || 0) + 1;
  });

  const uniMap = {};
  confirmedRegs.forEach(r => {
    uniMap[r.university] = (uniMap[r.university] || 0) + 1;
  });

  // 📊 CHARTS
  const pieData = {
    labels: ["Male", "Female"],
    datasets: [{
      data: [male, female],
      backgroundColor: ["#3b82f6", "#ec4899"]
    }]
  };

  const totalData = {
    labels: ["Registrations"],
    datasets: [{
      label: "Students",
      data: [registrations.length],
      backgroundColor: "#3b82f6"
    }]
  };

  const facultyData = {
    labels: Object.keys(facultyMap),
    datasets: [{
      label: "Students",
      data: Object.values(facultyMap),
      backgroundColor: "#6366f1"
    }]
  };

  const universityData = {
    labels: Object.keys(uniMap),
    datasets: [{
      label: "Students",
      data: Object.values(uniMap),
      backgroundColor: "#10b981"
    }]
  };

  // 📄 PDF
  const downloadPDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${event.Title} Analytics Report`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Total: ${registrations.length}`, 14, 30);
    doc.text(`Capacity: ${event.Capacity}`, 14, 38);
    doc.text(`Remaining: ${event.Capacity - registrations.length}`, 14, 46);

    const genderCanvas = await html2canvas(genderRef.current);
    const totalCanvas = await html2canvas(totalRef.current);

    doc.addImage(genderCanvas.toDataURL("image/png"), "PNG", 10, 55, 90, 70);
    doc.addImage(totalCanvas.toDataURL("image/png"), "PNG", 110, 55, 90, 70);

    const tableData = registrations.map(r => [
      r.name,
      r.email,
      r.university,
      r.faculty,
      r.gender
    ]);

    autoTable(doc, {
      startY: 135,
      head: [["Name", "Email", "University", "Faculty", "Gender"]],
      body: tableData,
    });

    doc.save("event-report.pdf");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <motion.h2 className="text-2xl font-bold">
          📊 {event.Title} Analytics
        </motion.h2>

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          📄 Download PDF
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded shadow">
          <p>Total</p>
          <h3 className="text-xl font-bold">{confirmedRegs.length}</h3>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p>Capacity</p>
          <h3 className="text-xl font-bold">{event.Capacity}</h3>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p>Remaining</p>
          <h3 className="text-xl font-bold">
            {event.Capacity - confirmedRegs.length}
          </h3>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div ref={genderRef} className="bg-white p-4 rounded shadow">
          <h3>Gender Distribution</h3>
          <Pie data={pieData} />
        </div>

        <div ref={totalRef} className="bg-white p-4 rounded shadow">
          <h3>Total Registrations</h3>
          <Bar data={totalData} />
        </div>

        <div ref={facultyRef} className="bg-white p-4 rounded shadow">
          <h3>Faculty Distribution</h3>
          <Bar data={facultyData} />
        </div>

        <div ref={uniRef} className="bg-white p-4 rounded shadow">
          <h3>University Distribution</h3>
          <Bar data={universityData} />
        </div>
      </div>

      {/* REGISTERED */}
      <div className="bg-white rounded shadow mb-6">
        <h3 className="p-4 font-semibold border-b">Registered Students</h3>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th>Email</th>
              <th>University</th>
              <th>Faculty</th>
              <th>Gender</th>
            </tr>
          </thead>

          <tbody>
            {confirmedRegs.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td>{r.email}</td>
                <td>{r.university}</td>
                <td>{r.faculty}</td>
                <td>{r.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WAITLIST */}
      <div className="bg-white rounded shadow mb-6">
        <h3 className="p-4 font-semibold border-b">Waitlist Students</h3>

        <table className="w-full text-sm">
          <tbody>
            {waitlistRegs.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{r.name}</td>
                <td>{r.email}</td>
                <td>{r.university}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ATTENDED */}
      <div className="bg-white rounded shadow">
        <h3 className="p-4 font-semibold border-b">Attended Students</h3>

        <table className="w-full text-sm">
          <tbody>
            {attendedRegs.length === 0 ? (
              <tr>
                <td className="p-4 text-center">No attendees yet</td>
              </tr>
            ) : (
              attendedRegs.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.university}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}