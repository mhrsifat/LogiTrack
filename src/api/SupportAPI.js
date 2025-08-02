import { BASE_URL } from "../config";
const API_BASE = BASE_URL + "/support-tickets";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "API error");
  }
  return data;
}

export const getAllTickets = async () => {
  try {
    const res = await fetch(`${API_BASE}/support-tickets`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export const createTicket = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/support-tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return await res.json();
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export async function updateTicket(id, data) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("updateTicket error:", error);
    return { status: false, message: error.message };
  }
}

export async function deleteTicket(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("deleteTicket error:", error);
    return { status: false, message: error.message };
  }
}
