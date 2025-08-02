import { BASE_URL } from "../config";
const API_BASE = BASE_URL + "/bookings";

export async function getAllBookings() {
  const res = await fetch(API_BASE, { credentials: "include" });
  return res.json();
}

export async function getBooking(id) {
  const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
  return res.json();
}

export async function createBooking(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBooking(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export const deleteBooking = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};
