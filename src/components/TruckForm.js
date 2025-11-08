import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const TruckForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTruck = location.state;

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTruck) {
      setVehicleNumber(editingTruck.vehicleNumber);
    }
  }, [editingTruck]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (editingTruck) {
        await axios.put(`${API_BASE_URL}/api/trucks/${editingTruck._id}`, { vehicleNumber });
        setMessage('Truck updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/trucks`, { vehicleNumber });
        setMessage('Truck added successfully!');
      }

      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Error saving truck:', err);
      setMessage(err.response?.data?.message || 'Error saving truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2>{editingTruck ? 'Edit Truck' : 'Add Truck'}</h2>
      <button className="btn" onClick={() => navigate('/')}>← Back to Trip List</button>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle Number:</label>
          <input
            type="text"
            value={vehicleNumber}
            onChange={e => setVehicleNumber(e.target.value)}
            required
            placeholder="e.g. TN45AB1234"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingTruck ? 'Updating...' : 'Adding...'
            : editingTruck ? 'Update Truck' : 'Add Truck'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default TruckForm;