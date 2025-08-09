import React, { useEffect, useState } from "react";
import {
  getAllTickets,
  createTicket,
  deleteTicket,
  updateTicketStatus,
  getMessages,
  postMessage
} from "../api/SupportAPI";
import { useUser } from "../contexts/UserContext";

// ChatThread component inlined for simplicity
const ChatThread = ({ ticketId }) => {
  const { user } = useUser();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  const reload = async () => {
    const res = await getMessages(ticketId);
    if (res.status || res.success) setMsgs(res.data || []);
  };

  useEffect(() => { reload(); }, [ticketId]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await postMessage(ticketId, text);
    if (res.status || res.success) {
      setText("");
      reload();
    } else {
      alert("Send error: " + res.message);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="h-48 overflow-y-auto space-y-2 mb-2">
        {msgs.map(m => (
          <div
            key={m.id}
            className={`p-2 rounded ${m.sender_role === "admin"
              ? "bg-blue-100 ml-auto"
              : "bg-gray-100 mr-auto"}`}
          >
            <p className="text-xs text-gray-600">
              <strong>
                {m.sender_role === "admin" ? "Support" : user.name}
              </strong>{" "}
              • {new Date(m.created_at).toLocaleString()}
            </p>
            <p>{m.message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex space-x-2">
        <input
          className="flex-1 p-2 border rounded"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your message"
        />
        <button type="submit" className="bg-green-600 text-white px-4 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

const Support = () => {
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [showForm, setShowForm] = useState(false);
  const [openThread, setOpenThread] = useState(null); // which ticket’s chat is open

  const fetchTickets = async () => {
    const res = await getAllTickets();
    if (res.status || res.success) {
      setTickets(res.data || res.tickets || []);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await createTicket(formData);
    if (res.status || res.success) {
      alert("Ticket created");
      setFormData({ subject: "", description: "", priority: "medium" });
      setShowForm(false);
      fetchTickets();
    } else {
      alert("Error: " + res.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    const res = await updateTicketStatus(id, { status, id });
    if (res.status) fetchTickets();
  };

  const handleDelete = async id => {
    if (window.confirm("Delete this ticket?")) {
      const res = await deleteTicket(id);
      if (res.status) fetchTickets();
    }
  };

  const toggleThread = id =>
    setOpenThread(openThread === id ? null : id);

  // — Admin (অ্যাডমিন) View —
  if (user?.role === "admin") {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Admin - All Tickets
        </h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets.</p>
        ) : tickets.map(ticket => (
          <div
            key={ticket.id}
            className="border p-4 rounded bg-gray-50 shadow mb-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p><strong>User ID:</strong> {ticket.user_id}</p>
                <p><strong>Subject:</strong> {ticket.subject}</p>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p className="text-sm text-gray-600">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <select
                  value={ticket.status}
                  onChange={e =>
                    handleStatusChange(ticket.id, e.target.value)
                  }
                  className="border p-1 rounded"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={() => handleDelete(ticket.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => toggleThread(ticket.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {openThread === ticket.id ? "Hide Chat" : "View Chat"}
                </button>
              </div>
            </div>
            {openThread === ticket.id && (
              <ChatThread ticketId={ticket.id} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // — Normal User View —
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Support Center</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "New Ticket"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white p-4 shadow rounded mb-8"
        >
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Your issue"
            required
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
      )}

      <h3 className="text-xl font-semibold mb-2">My Tickets</h3>
      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets yet.</p>
      ) : tickets.map(ticket => (
        <div
          key={ticket.id}
          className="border p-3 rounded bg-gray-50 shadow mb-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <p><strong>Subject:</strong> {ticket.subject}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
            </div>
            <button
              onClick={() => toggleThread(ticket.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              {openThread === ticket.id ? "Hide Chat" : "Chat"}
            </button>
          </div>
          {openThread === ticket.id && (
            <ChatThread ticketId={ticket.id} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Support;
