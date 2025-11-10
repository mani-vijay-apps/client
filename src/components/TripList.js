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
    axios.get(`${API_BASE_URL}/api/trips`)
      .then(res => {
        setTrips(res.data);
        setLoading(false); // ✅ Trips loaded, stop showing "Loading..."
      })
      .catch(err => {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips');
        setLoading(false);
      });

    axios.get(`${API_BASE_URL}/api/trucks`)
      .then(res => setTrucks(res.data))
      .catch(err => console.error('Error fetching trucks:', err));
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
    const data = filterTrips().map(trip => {
      const totalExpense =
        (trip.loadingAmount || 0) +
        (trip.unloadingAmount || 0) +
        (trip.driverBeta || 0) +
        (trip.dieselAmount || 0) +
        (trip.oilAmount || 0) +
        (trip.fastTagAmount || 0) +
        (trip.taxAmount || 0);

      const balance = totalExpense - (trip.advanceAmount || 0);

      return {
        Date: new Date(trip.date).toLocaleDateString(),
        Truck: trip.truck?.vehicleNumber || '',
        Destination: trip.destination,
        'Freight per Ton': trip.freightPerTon,
        Freight: trip.freightAmount,
        Loading: trip.loadingAmount,
        Unloading: trip.unloadingAmount,
        Beta: trip.driverBeta,
        Diesel: trip.dieselAmount,
        Oil: trip.oilAmount,
        FastTag: trip.fastTagAmount,
        Tax: trip.taxAmount,
        Advance: trip.advanceAmount,
        'Total Expense': totalExpense.toFixed(2),
        Balance: balance.toFixed(2)
      };
    });

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
    <div className="trips-container">
      <h1>Trip Records</h1>

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

      <button className="export btn-export" onClick={exportToExcel} disabled={filteredTrips.length === 0}>
        Export to Excel
      </button>

      <div className='table-container'>
        <table className='modern-table'>
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
              <th>Oil ₹</th>
              <th>FastTag ₹</th>
              <th>Tax ₹</th>
              <th>Advance Amount ₹</th>
              <th>Total Expense ₹</th>
              <th>Balance Amount ₹</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => {
              const totalExpense =
                (trip.loadingAmount || 0) +
                (trip.unloadingAmount || 0) +
                (trip.driverBeta || 0) +
                (trip.dieselAmount || 0) +
                (trip.oilAmount || 0) +
                (trip.fastTagAmount || 0) +
                (trip.taxAmount || 0);

              const balance = totalExpense - (trip.advanceAmount || 0);

              return (
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
                  <td>{trip.oilAmount}</td>
                  <td>{trip.fastTagAmount}</td>
                  <td>{trip.taxAmount}</td>
                  <td>{trip.advanceAmount}</td>
                  <td>{totalExpense.toFixed(2)}</td>
                  <td>{balance.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEdit(trip)} className="btn edit-btn">Edit</button>
                    <button onClick={() => handleDelete(trip._id)} className="btn delete-btn">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripList;