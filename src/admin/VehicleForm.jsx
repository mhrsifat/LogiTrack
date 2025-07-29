// src/admin/VehicleForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createVehicle, getVehicle, updateVehicle } from '../admin/api/VehicleAPI';

const VehicleForm = () => {
  const [formData, setFormData] = useState({
    owner_id: '',
    vehicle_type: '',
    license_plate: '',
    capacity: '',
    status: 'active',
  });

  const navigate = useNavigate();
  const { id } = useParams(); // if editing, id will exist

  useEffect(() => {
    if (id) {
      getVehicle(id).then((res) => setFormData(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await updateVehicle(id, formData);
    } else {
      await createVehicle(formData);
    }

    navigate('/vehicles');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{id ? 'Edit' : 'Add'} Vehicle</h1>
      <form onSubmit={handleSubmit} className="grid gap-4 max-w-md">
        <input
          name="owner_id"
          placeholder="Owner ID"
          value={formData.owner_id}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="vehicle_type"
          placeholder="Vehicle Type"
          value={formData.vehicle_type}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="license_plate"
          placeholder="License Plate"
          value={formData.license_plate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="capacity"
          placeholder="Capacity"
          value={formData.capacity}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {id ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default VehicleForm;