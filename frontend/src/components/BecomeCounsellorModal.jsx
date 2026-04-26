import { useState, useEffect, useMemo } from "react";
import { FaUser, FaBriefcase, FaFileUpload, FaCheckCircle, FaChevronRight, FaChevronLeft, FaTimes, FaEnvelope, FaPhone, FaGraduationCap, FaBuilding, FaUserMd } from "react-icons/fa";

export default function BecomeCounsellorModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [nicFile, setNicFile] = useState(null);
  const [certFiles, setCertFiles] = useState([]);

  // Store all form field values
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    workplace: "",
    about: "",
    registrationId: "",
  });

  const [errors, setErrors] = useState({});

  // validators for text-only and phone-only fields.
  const isLettersOnly = (value) => /^[A-Za-z\s]+$/.test(value.trim());
  const isPhoneNumber = (value) => /^\d+$/.test(value);

  /* Disable background scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Per-step validation keeps navigation and submit checks consistent.
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      // Personal details validation.
      if (!form.fullName) e.fullName = "Full name is required";
      else if (!isLettersOnly(form.fullName)) e.fullName = "Full name can contain letters only";
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
      if (!form.phone) e.phone = "Phone number is required";
      // Phone is constrained to digits in UI, but still validated here for safety.
      else if (!isPhoneNumber(form.phone)) e.phone = "Phone number must contain numbers only";
      else if (form.phone.length < 10) e.phone = "Phone number must be at least 10 digits";
    }
    if (s === 2) {
      // Professional details validation.
      if (!form.specialization) e.specialization = "Specialization is required";
      if (!form.qualification) e.qualification = "Qualification is required";
      else if (!isLettersOnly(form.qualification)) e.qualification = "Qualification can contain letters only";
      if (!form.experience) e.experience = "Experience is required";
      // Prevent negative experience values.
      else if (Number(form.experience) < 0) e.experience = "Experience cannot be negative";
      if (!form.workplace) e.workplace = "Workplace is required";
      else if (!isLettersOnly(form.workplace)) e.workplace = "Workplace can contain letters only";
      if (!form.registrationId) e.registrationId = "Registration ID is required";
    }
    if (s === 3) {
      // Required document uploads validation.
      if (!nicFile) e.nic = "NIC upload is required";
      if (certFiles.length === 0) e.cert = "At least one certificate is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  // Move to previous step.
  const prevStep = () => setStep(step - 1);

  const isUserLoggedIn = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return false;
    try {
      return !!JSON.parse(storedUser);
    } catch {
      return false;
    }
  };


  // SUBMIT COUNSELLOR APPLICATION TO BACKEND
  async function onSubmit(e) {
    e.preventDefault();

    // Validate final step before sending
    if (!validateStep(3)) return;

    setSubmitting(true);

    try {
      // Get logged-in user from localStorage
      const user = JSON.parse(localStorage.getItem("user"));

      // Create form data (needed for file uploads)
      const formData = new FormData();

      formData.append("userId", user.id);
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("specialization", form.specialization);
      formData.append("qualification", form.qualification);
      formData.append("experience", form.experience);
      formData.append("workplace", form.workplace);
      formData.append("about", form.about);
      formData.append("registrationId", form.registrationId);

      // Attach uploaded files
      if (nicFile) formData.append("nicFile", nicFile);
      certFiles.forEach(file => {
        formData.append("certFiles", file);
      });
      
      // Send request to backend API
      const res = await fetch("http://localhost:3000/api/counsellor/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      // Show success message
      setSubmitted(true);

    } catch (err) {
      alert(err.message);
    }

    setSubmitting(false);

    // Close modal after success
    setTimeout(onClose, 3000);
  }

  const steps = [
    { id: 1, title: "Personal", icon: <FaUser /> },
    { id: 2, title: "Professional", icon: <FaBriefcase /> },
    { id: 3, title: "Documents", icon: <FaFileUpload /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-4xl md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Header - Fixed at top */}
        <div className="bg-slate-50 px-6 md:px-10 pt-8 pb-6 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Join Our Expert Team
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
            >
              <FaTimes />
            </button>
          </div>

          {!submitted && (
            <div className="flex justify-between relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((s) => (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 md:border-4 ${step >= s.id
                      ? "bg-blue-600 border-white text-white shadow-lg shadow-blue-200 scale-110"
                      : "bg-white border-slate-200 text-slate-400"
                      }`}
                  >
                    {step > s.id ? <FaCheckCircle className="text-sm md:text-base" /> : <span className="text-sm md:text-base">{s.icon}</span>}
                  </div>
                  <span className={`text-[8px] md:text-[10px] font-bold mt-2 uppercase tracking-widest ${step >= s.id ? "text-blue-600" : "text-slate-400"
                    }`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar grow">
          {submitted ? (
            <div className="text-center py-10 animate-scaleIn">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl mx-auto mb-6 shadow-xl shadow-green-100">
                <FaCheckCircle />
              </div>
              <h4 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Application Received!</h4>
              <p className="text-slate-500 text-sm md:text-base">Thank you, {form.fullName}. Our team will review your credentials and get back to you within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col h-full">
              <div className="min-h-62.5 md:min-h-80">
                {step === 1 && (
                  <div className="space-y-6 animate-slideLeft">
                    <Input
                      label="Full Name"
                      icon={<FaUser />}
                      value={form.fullName}
                      onChange={(v) => {
                        // Allow letters and spaces only while typing.
                        const filtered = v.replace(/[^A-Za-z\s]/g, "");
                        setForm({ ...form, fullName: filtered });
                      }}

                      error={errors.fullName}
                      placeholder="Dr. Jane Doe"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Email Address"
                        icon={<FaEnvelope />}
                        type="email"
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                        error={errors.email}
                        placeholder="jane@university.edu"
                      />
                      <Input
                        label="Phone Number"
                        icon={<FaPhone />}
                        value={form.phone}
                        onChange={(v) => {
                          // Keep only digits and cap to 10 characters.
                          const filtered = v.replace(/\D/g, "").slice(0, 10);
                          setForm({ ...form, phone: filtered });
                        }}
                        error={errors.phone}
                        placeholder="+94 77 123 4567"
                        inputMode="numeric"
                      />
                    </div>
                    <TextArea
                      label="Brief Intro"
                      value={form.about}
                      onChange={(v) => setForm({ ...form, about: v })}
                      placeholder="A short sentence about your expertise..."
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-slideLeft">
                    <Select
                      label="Specialization"
                      icon={<FaUserMd />}
                      value={form.specialization}
                      onChange={(v) => setForm({ ...form, specialization: v })}
                      options={["Stress Management", "Academic Support", "Career Guidance", "Personal Development", "Mental Health Specialist", "Emotional Regulation Expert"]}
                      error={errors.specialization}
                    />
                    <Input
                      label="Professional Registration ID"
                      icon={<FaUserMd />}
                      value={form.registrationId}
                      onChange={(v) => setForm({ ...form, registrationId: v })}
                      error={errors.registrationId}
                      placeholder="e.g. SLMC-123456"
                    />
                    <Input
                      label="Highest Qualification"
                      icon={<FaGraduationCap />}
                      value={form.qualification}
                      onChange={(v) => {
                        // Restrict to alphabetic input and spaces.
                        const filtered = v.replace(/[^A-Za-z\s]/g, "");
                        setForm({ ...form, qualification: filtered });
                      }}
                      error={errors.qualification}
                      placeholder="e.g. Ph.D. in Clinical Psychology"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Years of Experience"
                        icon={<FaBriefcase />}
                        type="number"
                        value={form.experience}
                        onChange={(v) => {
                          // Ensure only numeric input.
                          const filtered = v.replace(/\D/g, "");
                          setForm({ ...form, experience: filtered });
                        }}
                        error={errors.experience}
                        placeholder="5"
                      />
                      <Input
                        label="Current Workplace"
                        icon={<FaBuilding />}
                        value={form.workplace}
                        onChange={(v) => {
                          // Restrict to alphabetic input and spaces.
                          const filtered = v.replace(/[^A-Za-z\s]/g, "");
                          setForm({ ...form, workplace: filtered });
                        }}
                        error={errors.workplace}
                        placeholder="University Wellness Center"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-slideLeft">
                    <UploadBox
                      label="National Identity Card (NIC)"
                      description="Upload a clear scan of your NIC (Front & Back)"
                      value={nicFile}
                      onChange={setNicFile}
                      error={errors.nic}
                    />
                    <UploadBox
                      label="Professional Certifications"
                      description="Upload all relevant clinical certifications"
                      value={certFiles}
                      onChange={setCertFiles}
                      error={errors.cert}
                      multiple
                    />
                  </div>
                )}
              </div>

              {/* Actions - Fixed at bottom of scroll area or moved to a separate footer */}
              <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-50 sticky bottom-0 bg-white pb-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-4 md:px-6 py-3 font-bold text-slate-400 hover:text-slate-900 transition-all text-sm md:text-base"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] text-sm md:text-base"
                  >
                    Next Step <FaChevronRight />
                  </button>
                ) : (
                  <button
                    disabled={submitting}
                    className="bg-slate-900 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold shadow-xl shadow-slate-100 hover:bg-slate-800 disabled:bg-slate-300 transition-all active:scale-[0.98] text-sm md:text-base"
                  >
                    {submitting ? "Processing..." : "Submit Application"}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* UI HELPERS */

function Input({ label, icon, value, onChange, error, type = "text", placeholder }) {
  return (
    <div className="w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-blue-500'}`}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border-2 rounded-2xl pl-12 pr-4 py-4 text-sm transition-all outline-none ${error ? 'border-red-100 bg-red-50 text-red-900' : 'border-slate-50 focus:border-blue-100 focus:bg-white text-slate-900'
            }`}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase ml-2">{error}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div className="w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-4 text-sm transition-all outline-none focus:border-blue-100 focus:bg-white text-slate-900"
      />
    </div>
  );
}

function Select({ label, icon, value, onChange, options, error }) {
  return (
    <div className="w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-blue-500'}`}>
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50 border-2 rounded-2xl pl-12 pr-10 py-4 text-sm transition-all outline-none appearance-none ${error ? 'border-red-100 bg-red-50 text-red-900' : 'border-slate-50 focus:border-blue-100 focus:bg-white text-slate-900'
            }`}
        >
          <option value="">Select Specialization</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase ml-2">{error}</p>}
    </div>
  );
}

function UploadBox({ label, description, value, onChange, multiple, error }) {
  const isFilled = multiple ? value.length > 0 : !!value;

  return (
    <div className="w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
      <div className={`relative p-6 md:p-8 border-2 border-dashed rounded-4xl transition-all text-center flex flex-col items-center justify-center group ${error ? 'border-red-200 bg-red-50' :
        isFilled ? 'border-blue-400 bg-blue-50/30' :
          'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white'
        }`}>
        <input
          type="file"
          multiple={multiple}
          onChange={(e) => multiple ? onChange([...Array.from(e.target.files)]) : onChange(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${isFilled ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'
          }`}>
          <FaFileUpload className="text-xl" />
        </div>
        <h5 className={`font-bold text-sm ${isFilled ? 'text-blue-900' : 'text-slate-600'}`}>
          {isFilled
            ? (multiple ? `${value.length} files selected` : value.name)
            : "Click to upload or drag & drop"}
        </h5>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">{description}</p>

        {isFilled && (
          <div className="mt-4 flex gap-1 justify-center flex-wrap">
            {Array.isArray(value) ? value.slice(0, 3).map((f, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-lg font-bold">{f.name.slice(0, 10)}...</span>
            )) : <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-lg font-bold">File Attached</span>}
            {Array.isArray(value) && value.length > 3 && <span className="text-[10px] text-blue-500 font-bold">+{value.length - 3} more</span>}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase ml-2">{error}</p>}
    </div>
  );
}
