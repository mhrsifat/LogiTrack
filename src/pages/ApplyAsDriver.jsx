// path: src/pages/ApplyAsDriverFull.jsx
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBox from "../components/ErrorBox";
import Successfull from "../components/Successfull";
import { BASE_URL } from "../config";

/**
 * Modern, accessible driver application form page.
 * - drag & drop file upload
 * - client-side validation
 * - previews + remove file
 * - graceful UX for loading / success / error
 *
 * Note: keep server API consistent with POST expecting `documents[]` files
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf", "image/jpg"];

const Field = ({ label, children, error }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default function ApplyAsDriverFull() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    vehicleType: "",
    experience: "",
  });

  const [files, setFiles] = useState([]); // { file, previewUrl }
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name required";
    if (!form.username.trim()) errors.username = "Username required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email";
    if (!/^[0-9+\-\s]{6,}$/.test(form.phone)) errors.phone = "Enter a valid phone";
    if (form.password.length < 6) errors.password = "Password must be ≥ 6 chars";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!form.vehicleType.trim()) errors.vehicleType = "Vehicle type required";
    if (!form.experience.trim()) errors.experience = "Experience required";
    if (!files.length) errors.documents = "Please upload at least one document";
    return errors;
  };

  const normalizeNewFiles = (incomingFiles) => {
    const arr = Array.from(incomingFiles);
    const accepted = [];
    const errs = [];
    arr.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.push(`${file.name} — unsupported type`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errs.push(`${file.name} — file too large (max 5MB)`);
        return;
      }
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      accepted.push({ file, previewUrl });
    });
    return { accepted, errs };
  };

  const onFilesAdded = (incomingFiles) => {
    const { accepted, errs } = normalizeNewFiles(incomingFiles);
    if (errs.length) setGlobalError(errs.join("; "));
    setFiles((f) => [...f, ...accepted]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files?.length) {
      onFilesAdded(e.dataTransfer.files);
    }
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const removeFileAt = (idx) => {
    setFiles((f) => {
      const newF = [...f];
      const removed = newF.splice(idx, 1)[0];
      if (removed && removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return newF;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    setGlobalSuccess("");
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const fd = new FormData();
      // append fields
      fd.append("name", form.name.trim());
      fd.append("username", form.username.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("password", form.password);
      fd.append("vehicle_type", form.vehicleType.trim());
      fd.append("experience", form.experience.trim());
      // append files as documents[]
      files.forEach((f) => fd.append("documents[]", f.file));

      const res = await fetch(`${BASE_URL}/drivers/applyDriver`, {
        method: "POST",
        body: fd,
      });

      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        // ignore parse err
      }

      if (!res.ok) {
        throw new Error((data && data.message) || "Submission failed");
      }

      setGlobalSuccess("Application submitted. Check your email for verification.");
      // small delay then navigate
      setTimeout(() => navigate("/email-verify"), 1500);
    } catch (err) {
      setGlobalError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Driver Application</h1>
            <p className="text-sm text-gray-500 mt-1">Fast registration — upload your documents and apply.</p>
          </div>
          <div className="text-right text-xs text-gray-400">Step 1 of 1</div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
          <div>
            <Field label="Full name" error={fieldErrors.name}>
              <input
                aria-label="Full name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g., Mohammad Sifat"
                required
              />
            </Field>

            <Field label="Username" error={fieldErrors.username}>
              <input
                aria-label="Username"
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="yourusername"
                required
              />
            </Field>

            <Field label="Email" error={fieldErrors.email}>
              <input
                type="email"
                aria-label="Email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="you@example.com"
                required
              />
            </Field>

            <Field label="Phone" error={fieldErrors.phone}>
              <input
                aria-label="Phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="+8801XXXXXXXXX"
                required
              />
            </Field>
          </div>

          <div>
            <Field label="Password" error={fieldErrors.password}>
              <input
                type="password"
                aria-label="Password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="At least 6 characters"
                required
              />
            </Field>

            <Field label="Confirm password" error={fieldErrors.confirmPassword}>
              <input
                type="password"
                aria-label="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Repeat password"
                required
              />
            </Field>

            <Field label="Vehicle Type" error={fieldErrors.vehicleType}>
              <input
                aria-label="Vehicle type"
                value={form.vehicleType}
                onChange={(e) => setField("vehicleType", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Truck, Pickup, Microbus..."
                required
              />
            </Field>

            <Field label="Driving Experience" error={fieldErrors.experience}>
              <input
                aria-label="Experience"
                value={form.experience}
                onChange={(e) => setField("experience", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g., 3 years"
                required
              />
            </Field>
          </div>

          {/* full width: file upload + file list */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Upload Documents</label>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              className="border-dashed border-2 border-gray-300 rounded p-4 flex items-center justify-between cursor-pointer hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <div>
                <p className="text-sm text-gray-600">Drag & drop files here, or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, PDF. Max: 5MB each.</p>
              </div>
              <div className="text-sm">
                <button type="button" className="px-3 py-1 bg-indigo-600 text-white rounded">Select files</button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              name="documents[]"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => onFilesAdded(e.target.files)}
            />

            {fieldErrors.documents && <p className="text-xs text-red-600 mt-2">{fieldErrors.documents}</p>}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {files.map((f, idx) => (
                  <motion.div
                    key={f.file.name + "_" + idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <div className="flex items-center gap-3">
                      {f.previewUrl ? (
                        <img src={f.previewUrl} alt={f.file.name} className="w-14 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded text-sm">
                          PDF
                        </div>
                      )}
                      <div className="text-sm">
                        <div className="font-medium truncate" style={{ maxWidth: 220 }}>{f.file.name}</div>
                        <div className="text-xs text-gray-500">{Math.round(f.file.size / 1024)} KB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeFileAt(idx)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between mt-4">
            <div className="flex-1">
              {globalError && <ErrorBox msg={globalError} />}
              {globalSuccess && <Successfull msg={globalSuccess} />}
            </div>

            <div className="ml-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                ) : null}
                <span>{loading ? "Submitting..." : "Submit Application"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}