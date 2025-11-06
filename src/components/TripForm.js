import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const initialFormState = {
  date: '',
  truckId: '',
  destination: '',
  freightAmount: 0,
  freightPerTon: 0,
  loadingAmount: 0,
  unloadingAmount: 0,
  driverBeta: 0,
  advanceAmount: 0
};

const TripForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTrip = location.state;

  const [trucks, setTrucks] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/trucks`);
        setTrucks(res.data);
      } catch (err) {
        console.error('Error fetching trucks:', err);
        setMessage('Failed to load trucks');
      }
    };
    fetchTrucks();
  }, []);

  useEffect(() => {
    if (editingTrip) {
      setFormData({
        date: editingTrip.date?.slice(0, 10),
        truckId: editingTrip.truck?._id || '',
        destination: editingTrip.destination || '',
        freightAmount: editingTrip.freightAmount || 0,
        freightPerTon: editingTrip.freightPerTon || 0,
        loadingAmount: editingTrip.loadingAmount || 0,
        unloadingAmount: editingTrip.unloadingAmount || 0,
        driverBeta: editingTrip.driverBeta || 0,
        advanceAmount: editingTrip.advanceAmount || 0
      });
    }
  }, [editingTrip]);

  const handleChange = e => {
    const { name, value } = e.target;
    const numericFields = [
      'freightAmount',
      'freightPerTon',
      'loadingAmount',
      'unloadingAmount',
      'driverBeta',
      'advanceAmount'
    ];

    const newValue = numericFields.includes(name) ? parseFloat(value) : value;

    if (numericFields.includes(name) && (isNaN(newValue) || newValue < 0)) {
      setMessage(`${name} must be a valid non-negative number`);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setMessage('');
  };

  const calculateTotalExpense = () => {
    const { freightAmount, loadingAmount, unloadingAmount, driverBeta } = formData;
    const total = freightAmount + loadingAmount + unloadingAmount + driverBeta;
    return parseFloat(total.toFixed(2));
  };

  const calculateBalanceAmount = () => {
    const balance = calculateTotalExpense() - formData.advanceAmount;
    return parseFloat(balance.toFixed(2));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        totalExpense: calculateTotalExpense(),
        balanceAmount: calculateBalanceAmount()
      };

      if (editingTrip) {
        await axios.put(`${API_BASE_URL}/api/trips/${editingTrip._id}`, payload);
        setMessage('Trip updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/trips`, payload);
        setMessage('Trip added successfully!');
        setFormData(initialFormState);
      }

      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Submission error:', err);
      setMessage(err.response?.data?.message || 'Error saving trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2>{editingTrip ? 'Update Trip' : 'Add Trip'}</h2>
      <button className="btn" onClick={() => navigate('/')}>← Back to Trip List</button>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="truckId">Truck:</label>
          <select name="truckId" value={formData.truckId} onChange={handleChange} required>
            <option value="">Select Truck</option>
            {trucks.map(truck => (
              <option key={truck._id} value={truck._id}>
                {truck.vehicleNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="destination">Destination:</label>
          <input type="text" name="destination" value={formData.destination} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="freightAmount">Total Freight Amount ₹:</label>
          <input type="number" name="freightAmount" value={formData.freightAmount} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <label htmlFor="freightPerTon">Freight per Ton ₹:</label>
          <input type="number" name="freightPerTon" value={formData.freightPerTon} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <label htmlFor="loadingAmount">Load labor amount ₹:</label>
          <input type="number" name="loadingAmount" value={formData.loadingAmount} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <label htmlFor="unloadingAmount">Unload labor amount ₹:</label>
          <input type="number" name="unloadingAmount" value={formData.unloadingAmount} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <label htmlFor="driverBeta">Driver Beta ₹:</label>
          <input type="number" name="driverBeta" value={formData.driverBeta} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <label htmlFor="advanceAmount">Advance amount ₹:</label>
          <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} min="0" step="0.01" />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingTrip ? 'Update Trip' : 'Add Trip'}
        </button>
      </form>
      <div>
        <strong>Total Expense ₹:</strong> {calculateTotalExpense().toFixed(2)}
      </div>
      <div>
        <strong>Balance Amount ₹:</strong> {calculateBalanceAmount().toFixed(2)}
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default TripForm;