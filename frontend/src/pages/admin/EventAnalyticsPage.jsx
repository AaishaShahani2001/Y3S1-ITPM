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

  // 📊 Chart refs
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
      .then(setRegistrations);
  }, [id]);

  if (!event) return <div className="p-10">Loading...</div>;

  // 🔥 DATA PROCESSING
  const male = registrations.filter(r => r.Gender === "Male").length;
  const female = registrations.filter(r => r.Gender === "Female").length;

  const facultyMap = {};
  registrations.forEach(r => {
    facultyMap[r.Faculty] = (facultyMap[r.Faculty] || 0) + 1;
  });

  const uniMap = {};
  registrations.forEach(r => {
    uniMap[r.University] = (uniMap[r.University] || 0) + 1;
  });

  // 📊 CHART DATA
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

  // 📄 PDF FUNCTION (WITH CHARTS)
  const downloadPDF = async () => {
    const doc = new jsPDF();

    // TITLE
    doc.setFontSize(16);
    doc.text(`${event.Title} Analytics Report`, 14, 20);

    // STATS
    doc.setFontSize(12);
    doc.text(`Total: ${registrations.length}`, 14, 30);
    doc.text(`Capacity: ${event.Capacity}`, 14, 38);
    doc.text(`Remaining: ${event.Capacity - registrations.length}`, 14, 46);

    // 📊 CAPTURE CHARTS
    const genderCanvas = await html2canvas(genderRef.current);
    const totalCanvas = await html2canvas(totalRef.current);

    const genderImg = genderCanvas.toDataURL("image/png");
    const totalImg = totalCanvas.toDataURL("image/png");

    // ADD CHARTS
    doc.addImage(genderImg, "PNG", 10, 55, 90, 70);
    doc.addImage(totalImg, "PNG", 110, 55, 90, 70);

    // 📋 TABLE
    const tableData = registrations.map(r => [
      r.Name,
      r.Email,
      r.University,
      r.Faculty,
      r.Gender
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

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          📊 {event.Title} Analytics
        </motion.h2>

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📄 Download PDF
        </button>
      </div>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[ 
          { label: "Total", value: registrations.length },
          { label: "Capacity", value: event.Capacity },
          { label: "Remaining", value: event.Capacity - registrations.length }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-5 rounded-2xl shadow-lg"
          >
            <p className="text-gray-500">{item.label}</p>
            <h3 className="text-xl font-bold">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* 🔥 CHARTS */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div ref={genderRef} className="bg-white p-4 rounded-2xl shadow">
          <h3 className="mb-3 font-semibold">Gender Distribution</h3>
          <Pie data={pieData} />
        </div>

        <div ref={totalRef} className="bg-white p-4 rounded-2xl shadow">
          <h3 className="mb-3 font-semibold">Total Registrations</h3>
          <Bar data={totalData} />
        </div>

        <div ref={facultyRef} className="bg-white p-4 rounded-2xl shadow">
          <h3 className="mb-3 font-semibold">Faculty Distribution</h3>
          <Bar data={facultyData} />
        </div>

        <div ref={uniRef} className="bg-white p-4 rounded-2xl shadow">
          <h3 className="mb-3 font-semibold">University Distribution</h3>
          <Bar data={universityData} />
        </div>

      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="mb-4 font-semibold">Registered Students</h3>

        {registrations.length === 0 ? (
          <p>No registrations</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th>Name</th>
                <th>Email</th>
                <th>University</th>
                <th>Faculty</th>
                <th>Gender</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((r) => (
                <tr key={r.ID} className="border-b hover:bg-gray-50">
                  <td>{r.Name}</td>
                  <td>{r.Email}</td>
                  <td>{r.University}</td>
                  <td>{r.Faculty}</td>
                  <td>{r.Gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}