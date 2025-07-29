import React from 'react';
import { useNavigate } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded shadow p-4 hover:bg-gray-50 transition">
      <h2 className="text-lg font-semibold">{vehicle.vehicle_type}</h2>
      <p>License: {vehicle.license_plate}</p>
      <p>Status: {vehicle.status}</p>
      <p>Capacity: {vehicle.capacity}</p>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          View
        </button>
        <button
          onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;