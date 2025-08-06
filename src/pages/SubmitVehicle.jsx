import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SubmitVehicle = () => {
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    plateNumber: '',
    color: '',
    vehicleType: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const payload = {
      make: formData.make,
      model: formData.model,
      license_plate: formData.plateNumber,
      color: formData.color,
      type: formData.vehicleType
    }

    try {
      const response = await fetch('/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit vehicle')
      }

      setSuccess('Vehicle submitted successfully.')
      setTimeout(() => navigate('/admin/vehicles'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Submit Vehicle</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Plate Number</label>
          <input
            type="text"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select type</option>
            <option value="truck">Truck</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 rounded-2xl shadow font-medium"
        >
          {loading ? 'Submitting...' : 'Submit Vehicle'}
        </button>
      </form>
    </div>
  )
}

export default SubmitVehicle

