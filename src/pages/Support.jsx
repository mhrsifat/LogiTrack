import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import Error from "../components/Error";

const Support = () => {
  // State for ticket list & loading
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for current ticket form (create or edit)
  const [editingTicket, setEditingTicket] = useState(null); // null means creating new
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("open"); // for edit only (user can't change status but backend requires it)
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${BASE_URL}/support-tickets`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        setTickets(data.data);
      } else {
        setError(data.message || "Failed to load tickets.");
      }
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form to empty (create mode)
  const resetForm = () => {
    setEditingTicket(null);
    setSubject("");
    setMessage("");
    setStatus("open");
    setFormError("");
    setFormSuccess("");
  };

  // Fill form for editing
  const startEdit = (ticket) => {
    setEditingTicket(ticket);
    setSubject(ticket.subject);
    setMessage(ticket.message);
    setStatus(ticket.status);
    setFormError("");
    setFormSuccess("");
  };

  // Handle create or update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!subject.trim() || !message.trim()) {
      setFormError("Subject and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingTicket
        ? `${BASE_URL}/support-tickets/${editingTicket.id}`
        : `${BASE_URL}/support-tickets`;
      const method = editingTicket ? "PUT" : "POST";

      const bodyData = editingTicket
        ? { subject, message, status }
        : { subject, message };

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();

      if (data.status) {
        setFormSuccess(
          editingTicket
            ? "Ticket updated successfully."
            : "Ticket created successfully."
        );
        resetForm();
        fetchTickets(); // refresh list
      } else {
        setFormError(data.message || "Failed to save ticket.");
      }
    } catch {
      setFormError("Failed to save ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete ticket
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const res = await fetch(`${BASE_URL}/support-tickets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        fetchTickets();
      } else {
        alert(data.message || "Failed to delete ticket.");
      }
    } catch {
      alert("Failed to delete ticket.");
    }
  };

  if (loading) return <p className="text-center">Loading tickets...</p>;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-3xl mx-auto p-4 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Support Tickets</h2>

      {/* Ticket Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-3">
          {editingTicket ? "Edit Ticket" : "Create New Ticket"}
        </h3>

        <div className="mb-4">
          <label htmlFor="subject" className="block mb-1 font-semibold">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled={submitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block mb-1 font-semibold">
            Message
          </label>
          <textarea
            id="message"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled={submitting}
          />
        </div>

        {/* Status field only visible when editing */}
        {editingTicket && (
          <div className="mb-4">
            <label htmlFor="status" className="block mb-1 font-semibold">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={submitting}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {formError && <p className="text-red-600 mb-2">{formError}</p>}
        {formSuccess && <p className="text-green-600 mb-2">{formSuccess}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? editingTicket
                ? "Updating..."
                : "Submitting..."
              : editingTicket
              ? "Update Ticket"
              : "Submit Ticket"}
          </button>

          {editingTicket && (
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <p className="text-gray-600">No support tickets found.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="bg-white p-4 rounded shadow border border-gray-200"
            >
              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
              <p className="text-gray-700">{ticket.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                Status:{" "}
                <span
                  className={
                    ticket.status === "open" ? "text-green-600" : "text-red-600"
                  }
                >
                  {ticket.status}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Created at: {new Date(ticket.created_at).toLocaleString()}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startEdit(ticket)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ticket.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Support;