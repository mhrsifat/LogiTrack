import { BASE_URL } from "../../config";

export async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return await res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

export async function updateUser(id, updatedData) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  return await res.json();
}
