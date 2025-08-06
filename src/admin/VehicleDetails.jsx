import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicle, deleteVehicle } from '../admin/api/VehicleAPI';

const VehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    const res = await getVehicle(id);
    if (res?.data) {
      setVehicle(res.data);
    } else {
      alert('Vehicle not found');
      navigate('/vehicles');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure?')) {
      await deleteVehicle(id);
      navigate('/vehicles');
    }
  };

  if (!vehicle) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vehicle Details</h1>
      <div className="border p-4 rounded shadow space-y-2">
        <p><strong>ID:</strong> {vehicle.id}</p>
        <p><strong>Owner ID:</strong> {vehicle.owner_id}</p>
        <p><strong>Type:</strong> {vehicle.vehicle_type}</p>
        <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
        <p><strong>Capacity:</strong> {vehicle.capacity}</p>
        <p><strong>Status:</strong> {vehicle.status}</p>

        <div className="mt-4 space-x-2">
          <button
            onClick={() => navigate(`/admin/vehicles/edit/${vehicle.id}`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;