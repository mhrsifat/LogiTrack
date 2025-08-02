import React, { useState } from "react";

const BookingForm = ({ onSubmit, initialData = {} }) => {
  const [pickupLocation, setPickupLocation] = useState(initialData.pickup_location || "");
  const [dropoffLocation, setDropoffLocation] = useState(initialData.dropoff_location || "");
  const [vehicleId, setVehicleId] = useState(initialData.vehicle_id || "");
  const [date, setDate] = useState(initialData.date || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ pickup_location: pickupLocation, dropoff_location: dropoffLocation, vehicle_id: vehicleId, date });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Pickup Location"
        value={pickupLocation}
        onChange={(e) => setPickupLocation(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Dropoff Location"
        value={dropoffLocation}
        onChange={(e) => setDropoffLocation(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Vehicle ID"
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
};

export default BookingForm;
