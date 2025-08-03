import React, { useEffect, useState } from "react";
import { getAllTickets, createTicket } from "../api/SupportAPI";
import { useUser } from "../contexts/UserContext";

const Support = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [showForm, setShowForm] = useState(false); // Controls visibility

  const fetchTickets = async () => {
    const response = await getAllTickets();
    if (response.status) {
      setTickets(response.data);
    } else {
      console.log("Failed to load tickets");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createTicket(formData);
    if (res.status) {
      alert("Ticket submitted successfully");
      setFormData({ subject: "", description: "", priority: "medium" });
      setShowForm(false); // Hide form after submit
      fetchTickets();
    } else {
      alert("Error: " + res.message);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Support Center</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "Create New Ticket"}
        </button>
      </div>

      {/* Show form if showForm = true */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white p-4 shadow rounded mb-8"
        >
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Subject"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe your issue"
            className="w-full p-2 border rounded h-24"
          />
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>
      ) : (
        <>
          <h3 className="text-xl font-semibold mt-4 mb-2">My Tickets</h3>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-gray-500">No tickets found.</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded p-3 bg-gray-50 shadow"
                >
                  <p>
                    <strong>Subject:</strong> {ticket.subject}
                  </p>
                  <p>
                    <strong>Status:</strong> {ticket.status}
                  </p>
                  <p>
                    <strong>Priority:</strong> {ticket.priority}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Support;
