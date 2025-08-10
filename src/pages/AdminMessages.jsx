import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../config";
import ErrorBox from "../components/ErrorBox";

export default function AdminMessages() {
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false); // NEW
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${BASE_URL}/list-message`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          signal
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
        }
        const data = await res.json();
        if (data?.status) {
          setMessages(Array.isArray(data.data) ? data.data : []);
        } else {
          setError(data?.message ?? 'Failed to load messages');
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Unknown fetch error');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, []);

  const sanitize = (raw = '') => raw.replace(/(\r|\n|%0A|%0D)/gi, ' ').trim();
  const isSuspicious = (raw = '') => /(?:\r|\n|%0A|%0D|bcc:|cc:|to:)/i.test(raw);

  const toggleRead = async (msg) => {
    try {
      const url = msg.is_read
        ? `${BASE_URL}/message-mark-as-unread/${msg.id}`
        : `${BASE_URL}/message-mark-as-read/${msg.id}`;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();
      if (data?.status) {
        setMessages(prev =>
          prev.map(m =>
            m.id === msg.id ? { ...m, is_read: m.is_read == 1 ? 0 : 1 } : m
          )
        );
      } else {
        alert(data?.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating read status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${BASE_URL}/delete/message/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data?.status) {
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        alert(data?.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting message: ' + err.message);
    }
  };

  const openReplyModal = (msg) => {
    setReplyingTo(msg);
    setReplySubject(`Re: ${msg.subject || ''}`);
    setReplyBody('');
  };

  // UPDATED sendReply: includes message_id, sending state, updates replied_id in UI
  const sendReply = async () => {
    if (!replyingTo) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${BASE_URL}/send-reply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyingTo.email,
          subject: replySubject,
          message: replyBody,
          message_id: replyingTo.id // <-- IMPORTANT: send message_id
        })
      });

      const data = await res.json();
      if (data?.status) {
        alert('Reply sent successfully');

        // Update UI to show replied. Server will set replied_id; frontend sets marker for UI.
        setMessages(prev => prev.map(m =>
          m.id === replyingTo.id ? { ...m, replied_id: 1 } : m
        ));
        setReplyingTo(null);
        setReplySubject('');
        setReplyBody('');
      } else {
        alert(data?.message || 'Failed to send reply');
      }
    } catch (err) {
      alert('Error sending reply: ' + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const filtered = messages.filter(m => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.subject || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q)
    );
  });

  // Pagination
  const indexOfLast = currentPage * messagesPerPage;
  const indexOfFirst = indexOfLast - messagesPerPage;
  const currentMessages = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / messagesPerPage);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">All Messages</h1>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </header>

      {error && <ErrorBox msg={error} />}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : currentMessages.length === 0 ? (
        <div className="text-center text-gray-600 py-8">No messages found.</div>
      ) : (
        <ul className="space-y-3">
          {currentMessages.map(msg => {
            const raw = msg.subject ?? '';
            const suspicious = isSuspicious(raw);
            const created = msg.created_at ? new Date(msg.created_at).toLocaleString() : '';

            return (
              <li key={msg.id} className="bg-white shadow-sm rounded-md p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{msg.name}</h3>
                        <span className="text-sm text-gray-500">({msg.email})</span>
                        {suspicious && (
                          <span className="ml-2 inline-block text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            Suspicious
                          </span>
                        )}
                        {msg.replied_id != 0 && msg.replied_id != null && (
                          <span className="ml-2 inline-block text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Replied
                          </span>
                        )}
                        {msg.is_read == 1 && (
                          <span className="ml-2 inline-block text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Read
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600"><em>{sanitize(raw)}</em></div>
                    </div>
                    <div className="text-xs text-gray-400">{created}</div>
                  </div>
                  <p className="mt-3 text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => toggleRead(msg)}
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                  >
                    {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => openReplyModal(msg)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Reply to {replyingTo.email}</h2>
            <label className="block mb-2 text-sm font-medium">Subject</label>
            <input
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <label className="block mb-2 text-sm font-medium">Message</label>
            <textarea
              rows="5"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                disabled={sendingReply} // NEW: disable while sending
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingReply ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
