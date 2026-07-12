import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const Vehicles = () => {
  const { user } = useContext(AuthContext);
  const { formatCurrency } = useContext(CurrencyContext);
  const isFleetManager = user?.role === 'FLEET_MANAGER';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [regNumber, setRegNumber] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [formError, setFormError] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/vehicles');
      setVehicles(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching vehicles list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const resetForm = () => {
    setRegNumber('');
    setModel('');
    setCapacity('');
    setOdometer('');
    setPurchaseCost('');
    setStatus('ACTIVE');
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setRegNumber(vehicle.registrationNumber);
    setModel(vehicle.model);
    setCapacity(vehicle.capacity);
    setOdometer(vehicle.odometer);
    setPurchaseCost(vehicle.purchaseCost);
    setStatus(vehicle.status);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/api/vehicles/${id}`);
        setVehicles(vehicles.filter(v => v.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete vehicle');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    if (!regNumber || !model || !capacity || !odometer || !purchaseCost) {
      setFormError('All fields are required');
      return;
    }

    if (Number(capacity) <= 0) {
      setFormError('Capacity must be a positive number');
      return;
    }

    if (Number(odometer) < 0) {
      setFormError('Odometer reading cannot be negative');
      return;
    }

    if (Number(purchaseCost) < 0) {
      setFormError('Purchase cost cannot be negative');
      return;
    }

    const vehiclePayload = {
      registrationNumber: regNumber,
      model,
      capacity: Number(capacity),
      odometer: Number(odometer),
      purchaseCost: Number(purchaseCost),
      status
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/vehicles/${editingId}`, vehiclePayload);
        setVehicles(vehicles.map(v => v.id === editingId ? res.data : v));
      } else {
        const res = await api.post('/api/vehicles', vehiclePayload);
        setVehicles([...vehicles, res.data]);
      }
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save vehicle. Make sure the registration is unique.');
    }
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'ACTIVE': return 'status-active';
      case 'IN_SHOP': return 'status-shop';
      case 'OUT_OF_SERVICE': return 'status-inactive';
      default: return '';
    }
  };

  return (
    <div className="vehicles-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div className="table-header" style={{ borderBottom: 'none', marginBottom: '20px', padding: 0 }}>
        <h2>Fleet Inventory</h2>
        {isFleetManager && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Add Vehicle
          </button>
        )}
      </div>

      {showForm && isFleetManager && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Vehicle Profile' : 'Register New Vehicle'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {formError && <div className="login-error-alert" style={{ marginBottom: '20px' }}>{formError}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. TX-9876-A"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Volvo FH16"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (Cargo limit in kg)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 20000"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Odometer (km)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 125000"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Cost ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 145000"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operational Status</label>
                <select 
                  className="form-input" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active (In Service)</option>
                  <option value="IN_SHOP">In Shop (Maintenance)</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaCheck /> {editingId ? 'Save Changes' : 'Register Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Model</th>
                <th>Capacity (kg)</th>
                <th>Odometer (km)</th>
                <th>Purchase Cost</th>
                <th>Status</th>
                {isFleetManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={isFleetManager ? 7 : 6} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No vehicles registered in the platform yet.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{vehicle.registrationNumber}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.capacity.toLocaleString()} kg</td>
                    <td>{vehicle.odometer.toLocaleString()} km</td>
                    <td>{formatCurrency(vehicle.purchaseCost)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </td>
                    {isFleetManager && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            className="btn-action edit" 
                            title="Edit Vehicle"
                            onClick={() => handleEdit(vehicle)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-action delete" 
                            title="Delete Vehicle"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
