// src/admin/api/VehicleAPI.js
import { BASE_URL } from "../../config";

const endpoint = `${BASE_URL}/vehicles`;

export const getVehicles = async () => {
  const res = await fetch(endpoint);
  return res.json();
};

export const getVehicle = async (id) => {
  const res = await fetch(`${endpoint}/${id}`);
  return res.json();
};

export const createVehicle = async (vehicle) => {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  return res.json();
};

export const updateVehicle = async (id, vehicle) => {
  const res = await fetch(`${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  return res.json();
};

export const deleteVehicle = async (id) => {
  const res = await fetch(`${endpoint}/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
