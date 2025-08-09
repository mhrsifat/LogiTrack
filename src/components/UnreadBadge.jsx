import React, { useEffect, useState } from "react";
import { fetchUnreadCount } from "../api/NotificationAPI";

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetchUnreadCount();
      if (mounted && res.success) setCount(res.data.unread);
    };
    load();

    const iv = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <span className="relative">
      🔔
      {count > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
          {count}
        </span>
      )}
    </span>
  );
}
