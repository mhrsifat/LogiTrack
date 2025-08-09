import React, { useEffect, useRef, useState } from "react";
import { getMessages, postMessage } from "../api/SupportAPI";
import { useUser } from "../contexts/UserContext";

export default function ChatThread({ ticketId }) {
  const { user } = useUser();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  const chatBoxRef = useRef(null);

  const reload = async () => {
    const data = await getMessages(ticketId);
    if (data.status) setMsgs(data.data);
  };

  useEffect(() => {
    reload();
  }, [ticketId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages update
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [msgs]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const res = await postMessage(ticketId, text);
    if (res.status) {
      setText("");
      reload();
    }
  };

  return (
    <div className="border p-4 rounded max-w-xl mx-auto space-y-4">
      <div
        ref={chatBoxRef}
        className="h-64 overflow-y-auto space-y-2 border rounded p-2 bg-white"
      >
        {msgs.map((m) => {
          const senderLabel =
            m.sender_role === "admin"
              ? "Support"
              : user.role	=== "admin"
              ? "user"
              : user.name;

          const isAdmin = m.sender_role === "admin";

          return (
            <div
              key={m.id}
              className={`p-2 rounded max-w-xs ${
                isAdmin ? "bg-blue-100 ml-auto text-right" : "bg-gray-100 mr-auto text-left"
              }`}
            >
              <p className="text-sm font-semibold">{senderLabel}:</p>
              <p className="whitespace-pre-wrap">{m.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="flex space-x-2">
        <textarea
          className="flex-1 p-2 border rounded resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              send(e);
            }
          }}
          rows={2}
          placeholder="Type your message"
        />
        <button type="submit" className="bg-green-600 text-white px-4 rounded">
          Send
        </button>
      </form>
    </div>
  );
}
