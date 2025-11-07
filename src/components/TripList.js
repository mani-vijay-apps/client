import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripRes, truckRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/trips`),
          axios.get(`${API_BASE_URL}/api/trucks`)
        ]);
        setTrips(tripRes.data);
        setTrucks(truckRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterTrips = () => {
    return trips.filter(trip => {
      const matchesTruck = selectedTruckId ? trip.truck?._id === selectedTruckId : true;
      const tripDate = new Date(trip.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      const matchesFrom = fromDate ? tripDate >= fromDate : true;
      const matchesTo = toDate ? tripDate <= toDate : true;
      return matchesTruck && matchesFrom && matchesTo;
    });
  };

  const exportToExcel = () => {
    const data = filterTrips().map(trip => ({
      Date: new Date(trip.date).toLocaleDateString(),
      Truck: trip.truck?.vehicleNumber || '',
      Destination: trip.destination,
      'Freight per Ton': trip.freightPerTon,
      Freight: trip.freightAmount,
      Loading: trip.loadingAmount,
      Unloading: trip.unloadingAmount,
      Beta: trip.driverBeta,
      Diesel: trip.dieselAmount,
      Toll: trip.tollAmount,
      Other: trip.otherExpense,
      TotalExpense: trip.totalExpense,
      Advance: trip.advanceAmount,
      Balance: trip.balanceAmount
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'TripRecords.xlsx');
  };

  const handleEdit = (trip) => {
    navigate('/add-trip', { state: trip });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/trips/${id}`);
        setTrips(prev => prev.filter(trip => trip._id !== id));
      } catch (err) {
        console.error('Error deleting trip:', err);
        alert('Failed to delete trip');
      }
    }
  };

  const filteredTrips = filterTrips();

  if (loading) return <div className="container"><p>Loading trips...</p></div>;
  if (error) return <div className="container"><p>{error}</p></div>;

  return (
    <div className="container">
      <h2>Trip Records</h2>

      <div className="filter-group">
        <div>
          <label>Truck:</label>
          <select value={selectedTruckId} onChange={e => setSelectedTruckId(e.target.value)}>
            <option value="">All Trucks</option>
            {trucks.map(truck => (
              <option key={truck._id} value={truck._id}>
                {truck.vehicleNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date From:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label>Date To:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      <button className="export" onClick={exportToExcel} disabled={filteredTrips.length === 0}>
        Export to Excel
      </button>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Truck</th>
            <th>Destination</th>
            <th>Freight per Ton ₹</th>
            <th>Freight Amount ₹</th>
            <th>Loading Amount ₹</th>
            <th>Unloading Amount ₹</th>
            <th>Driver Beta ₹</th>
            <th>Diesel ₹</th>
            <th>Toll ₹</th>
            <th>Other ₹</th>
            <th>Total Expense ₹</th>
            <th>Advance Amount ₹</th>
            <th>Balance Amount ₹</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTrips.map(trip => (
            <tr key={trip._id}>
              <td>{new Date(trip.date).toLocaleDateString()}</td>
              <td>{trip.truck?.vehicleNumber}</td>
              <td>{trip.destination}</td>
              <td>{trip.freightPerTon}</td>
              <td>{trip.freightAmount}</td>
              <td>{trip.loadingAmount}</td>
              <td>{trip.unloadingAmount}</td>
              <td>{trip.driverBeta}</td>
              <td>{trip.dieselAmount}</td>
              <td>{trip.tollAmount}</td>
              <td>{trip.otherExpense}</td>
              <td>{trip.totalExpense}</td>
              <td>{trip.advanceAmount}</td>
              <td>{trip.balanceAmount}</td>
              <td>
                <button onClick={() => handleEdit(trip)} className="btn">Update</button>
                <button onClick={() => handleDelete(trip._id)} className="btn delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripList;