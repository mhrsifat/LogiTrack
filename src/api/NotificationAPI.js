import { BASE_URL } from "../config";

// Get all notifications for the logged-in user
export const fetchNotifications = async () => {
  try {
    const res = await fetch(`${BASE_URL}/notifications`, {
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return { status: false };
  }
};

// Get unread notification count for the logged-in user
export const fetchUnreadCount = async () => {
  try {
    const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("Error fetching unread count:", err);
    return { status: false };
  }
};

// Mark a single notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return { status: false };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: "PUT",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("Error marking all as read:", err);
    return { status: false };
  }
};

// Send a new notification (admin only)
export const sendNotification = async (payload) => {
  try {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error("Error sending notification:", err);
    return { status: false };
  }
};


export const getUsers = async () => {
  try {
    const res = await fetch(BASE_URL + "/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return { status: false, data: [] };
  }
};

