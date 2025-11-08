import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TruckList = () => {
  const [trucks, setTrucks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await axios.get('/api/trucks');
      setTrucks(response.data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      try {
        await axios.delete(`/api/trucks/${id}`);
        setTrucks(trucks.filter(truck => truck._id !== id));
      } catch (error) {
        console.error('Error deleting truck:', error);
      }
    }
  };

  const handleEdit = (truck) => {
    navigate('/add-truck', { state: truck });
  };

  return (
    <div className="truck-list-container">
      <h2>Truck List</h2>
      {trucks.length === 0 ? (
        <p>No trucks found.</p>
      ) : (
        <table className="truck-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vehicle Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((truck, index) => (
              <tr key={truck._id}>
                <td>{index + 1}</td>
                <td>{truck.vehicleNumber}</td>
                <td>
                  <button className="btn edit-btn" onClick={() => handleEdit(truck)}>Edit</button>
                  <button className="btn delete-btn" onClick={() => handleDelete(truck._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TruckList;