import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const initialFormState = {
  date: '',
  truckId: '',
  destination: '',
  freightAmount: '',
  freightPerTon: '',
  loadingAmount: '',
  unloadingAmount: '',
  driverBeta: '',
  advanceAmount: '',
  dieselAmount: '',
  oilAmount: '',
  fastTagAmount: '',
  taxAmount: ''
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
        date: editingTrip.date?.slice(0, 10) || '',
        truckId: editingTrip.truck?._id || '',
        destination: editingTrip.destination || '',
        freightAmount: editingTrip.freightAmount?.toString() || '',
        freightPerTon: editingTrip.freightPerTon?.toString() || '',
        loadingAmount: editingTrip.loadingAmount?.toString() || '',
        unloadingAmount: editingTrip.unloadingAmount?.toString() || '',
        driverBeta: editingTrip.driverBeta?.toString() || '',
        advanceAmount: editingTrip.advanceAmount?.toString() || '',
        dieselAmount: editingTrip.dieselAmount?.toString() || '',
        oilAmount: editingTrip.oilAmount?.toString() || '',
        fastTagAmount: editingTrip.fastTagAmount?.toString() || '',
        taxAmount: editingTrip.taxAmount?.toString() || ''
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
      'advanceAmount',
      'dieselAmount',
      'oilAmount',
      'fastTagAmount',
      'taxAmount'
    ];

    if (numericFields.includes(name) && value !== '' && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
      setMessage(`${name} must be a valid non-negative number`);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const calculateBalanceAmount = () => {
    const {
      loadingAmount,
      unloadingAmount,
      driverBeta,
      dieselAmount,
      oilAmount,
      fastTagAmount,
      taxAmount,
      advanceAmount
    } = formData;

    const totalExpense =
      parseFloat(loadingAmount || 0) +
      parseFloat(unloadingAmount || 0) +
      parseFloat(driverBeta || 0) +
      parseFloat(dieselAmount || 0) +
      parseFloat(oilAmount || 0) +
      parseFloat(fastTagAmount || 0) +
      parseFloat(taxAmount || 0);

    const balance = totalExpense - parseFloat(advanceAmount || 0);
    return parseFloat(balance.toFixed(2));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
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
    <div className="trip-form-container">
      <h1>{editingTrip ? 'Update Trip' : 'Add Trip'}</h1>
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
          <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Enter destination" required />
        </div>
        <div>
          <label htmlFor="freightPerTon">Freight per Ton ₹:</label>
          <input type="number" name="freightPerTon" value={formData.freightPerTon} onChange={handleChange} placeholder="e.g. 500.00" min="0" />
        </div>
        <div>
          <label htmlFor="freightAmount">Total Freight Amount ₹:</label>
          <input type="number" name="freightAmount" value={formData.freightAmount} onChange={handleChange} placeholder="e.g. 10000.00" min="0" />
        </div>
        <div>
          <label htmlFor="loadingAmount">Load labor amount ₹:</label>
          <input type="number" name="loadingAmount" value={formData.loadingAmount} onChange={handleChange} placeholder="e.g. 300.00" min="0" />
        </div>
        <div>
          <label htmlFor="unloadingAmount">Unload labor amount ₹:</label>
          <input type="number" name="unloadingAmount" value={formData.unloadingAmount} onChange={handleChange} placeholder="e.g. 250.00" min="0" />
        </div>
        <div>
          <label htmlFor="driverBeta">Driver Beta ₹:</label>
          <input type="number" name="driverBeta" value={formData.driverBeta} onChange={handleChange} placeholder="e.g. 500.00" min="0" />
        </div>
        <div>
          <label htmlFor="dieselAmount">Diesel Amount ₹:</label>
          <input type="number" name="dieselAmount" value={formData.dieselAmount} onChange={handleChange} placeholder="e.g. 3000.00" min="0" />
        </div>
        <div>
          <label htmlFor="oilAmount">Oil Amount ₹:</label>
          <input type="number" name="oilAmount" value={formData.oilAmount} onChange={handleChange} placeholder="e.g. 500.00" min="0" />
        </div>
        <div>
          <label htmlFor="fastTagAmount">Fast Tag Amount ₹:</label>
          <input type="number" name="fastTagAmount" value={formData.fastTagAmount} onChange={handleChange} placeholder="e.g. 200.00" min="0" />
        </div>
        <div>
          <label htmlFor="taxAmount">Tax Amount ₹:</label>
          <input type="number" name="taxAmount" value={formData.taxAmount} onChange={handleChange} placeholder="e.g. 1000.00" min="0" />
        </div>
        <div>
          <label htmlFor="advanceAmount">Advance amount ₹:</label>
          <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} placeholder="e.g. 5000.00" min="0" />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingTrip ? 'Update Trip' : 'Add Trip'}
        </button>
      </form>
      <div className='flex-balance'>
        <strong>Balance Amount ₹: </strong> {calculateBalanceAmount().toFixed(2)}
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default TripForm;