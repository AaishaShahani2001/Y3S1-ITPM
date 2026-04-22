import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function QRScannerPage() {
  const videoRef = useRef(null);
  const { id } = useParams(); // event ID

  useEffect(() => {
    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        try {
          console.log("QR RAW:", result.data);

          // ✅ Parse QR JSON
          const data = JSON.parse(result.data);
          console.log("QR PARSED:", data);

          // ✅ Validate event ID
          if (parseInt(data.event_id) !== parseInt(id)) {
            alert("❌ This QR is for another event");
            return;
          }

          console.log("SENDING ID:", data.id);

          // ✅ Call backend (FIXED URL)
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/events/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,   // ✅ IMPORTANT
          },
          body: JSON.stringify({
            id: data.id,
            event_id: data.event_id,
            user_id: data.user_id,
          }),
        });

          // ✅ Handle non-JSON errors safely
          if (!res.ok) {
            const text = await res.text();
            console.log("SERVER ERROR:", text);

            alert("❌ Already scanned or invalid request");
            return;
          }

          const response = await res.json();
          console.log("SUCCESS:", response);

          alert("✅ Attendance Marked!");

        } catch (err) {
          console.log("PARSE ERROR:", err);
          alert("❌ Invalid QR");
        }
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner.start();

    return () => {
      scanner.stop();
    };
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Scan QR</h2>

      <video
        ref={videoRef}
        className="w-full max-w-md border rounded"
      />
    </div>
  );
}