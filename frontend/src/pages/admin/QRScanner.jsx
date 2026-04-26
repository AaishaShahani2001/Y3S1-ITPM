import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function QRScannerPage() {
  const videoRef = useRef(null);
  const scannedRef = useRef(false); // prevent multiple scans
  const scannerRef = useRef(null);  // keep scanner instance

  const { id } = useParams(); // event ID

  useEffect(() => {
    scannerRef.current = new QrScanner(
      videoRef.current,
      async (result) => {

        // STOP multiple scans
        if (scannedRef.current) return;

        try {
          scannedRef.current = true; 

          console.log("QR RAW:", result.data);

          // ✅ Parse QR JSON
          const data = JSON.parse(result.data);
          console.log("QR PARSED:", data);

          // ✅ Validate event
          if (parseInt(data.event_id) !== parseInt(id)) {
            alert("❌ This QR is for another event");
            scannedRef.current = false;
            return;
          }

          const token = localStorage.getItem("token");

          // ✅ Send to backend
          const res = await fetch("http://localhost:3000/api/events/scan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: data.id,
              event_id: data.event_id,
              user_id: data.user_id,
            }),
          });

          // ❌ Error handling
          if (!res.ok) {
            const text = await res.text();
            console.log("SERVER ERROR:", text);

            alert("❌ Already scanned or invalid request");
            scannedRef.current = false;
            return;
          }

          const response = await res.json();
          console.log("SUCCESS:", response);

          alert("✅ Attendance Marked!");

          // STOP scanning after success
          scannerRef.current.stop();

        } catch (err) {
          console.log("PARSE ERROR:", err);
          alert("❌ Invalid QR");
          scannedRef.current = false;
        }
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current.start();

    return () => {
      scannerRef.current.stop();
    };
  }, [id]);

  //  OPTIONAL: scan next student
  const handleScanNext = () => {
    scannedRef.current = false;
    scannerRef.current.start();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Scan QR</h2>

      <video
        ref={videoRef}
        className="w-full max-w-md border rounded"
      />

      {/* Scan next button */}
      <button
        onClick={handleScanNext}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Scan Next Student
      </button>
    </div>
  );
}