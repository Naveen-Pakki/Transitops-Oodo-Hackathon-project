import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaGasPump } from 'react-icons/fa';

const Fuel = () => {
  const { user } = useContext(AuthContext);
  const { formatCurrency } = useContext(CurrencyContext);
  // Fleet Manager and Financial Analyst can write. Dispatcher/Safety Officer read-only.
  const canWrite = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(user?.role);

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [date, setDate] = useState('');
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [mileage, setMileage] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get('/api/fuel'),
        api.get('/api/vehicles')
      ]);
      setLogs(logsRes.data);
      setVehicles(vehiclesRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading fuel efficiency data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedVehicle('');
    setDate('');
    setLiters('');
    setCost('');
    setMileage('');
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (log) => {
    setEditingId(log.id);
    setSelectedVehicle(log.vehicleId);
    setDate(log.date);
    setLiters(log.liters);
    setCost(log.cost);
    setMileage(log.mileage);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this fuel log? This will also remove the corresponding operational expense record.')) {
      try {
        await api.delete(`/api/fuel/${id}`);
        setLogs(logs.filter(l => l.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete fuel log');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicle || !date || !liters || !cost || !mileage) {
      setFormError('All fields are required');
      return;
    }

    if (Number(liters) <= 0) {
      setFormError('Liters must be a positive number');
      return;
    }

    if (Number(cost) < 0) {
      setFormError('Fuel cost cannot be negative');
      return;
    }

    if (Number(mileage) < 0) {
      setFormError('Mileage reading cannot be negative');
      return;
    }

    // Odometer verification check
    const vehicle = vehicles.find(v => v.id === Number(selectedVehicle));
    if (vehicle && Number(mileage) < vehicle.odometer && !editingId) {
      if (!window.confirm(`Warning: Enter mileage (${Number(mileage).toLocaleString()} km) is less than vehicle's current odometer (${vehicle.odometer.toLocaleString()} km). Proceed anyway?`)) {
        return;
      }
    }

    const fuelPayload = {
      vehicleId: Number(selectedVehicle),
      date,
      liters: Number(liters),
      cost: Number(cost),
      mileage: Number(mileage)
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/fuel/${editingId}`, fuelPayload);
        setLogs(logs.map(l => l.id === editingId ? res.data : l));
      } else {
        const res = await api.post('/api/fuel', fuelPayload);
        setLogs([...logs, res.data]);
      }
      resetForm();
      loadData(); // refresh vehicle odometer in local state
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save fuel log');
    }
  };

  return (
    <div className="fuel-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div className="table-header" style={{ borderBottom: 'none', marginBottom: '20px', padding: 0 }}>
        <h2>Refueling Logs & Efficiency</h2>
        {canWrite && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Log Fueling
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Refuel Record' : 'Record Fuel Purchase'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {formError && <div className="login-error-alert" style={{ marginBottom: '20px' }}>{formError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select 
                  className="form-input"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} - {v.model} (Odo: {v.odometer.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Purchase</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Volume (Liters)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="e.g. 125.5"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="e.g. 187.50"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Odometer Reading (km)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 125000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaCheck /> {editingId ? 'Save Changes' : 'Record Fueling'}
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
                <th>Vehicle Plate</th>
                <th>Fuel Date</th>
                <th>Volume (Liters)</th>
                <th>Fuel Cost</th>
                <th>Odo Mileage (km)</th>
                <th>Fuel Efficiency</th>
                {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 7 : 6} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No fuel logs registered in the system.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{log.vehicleRegistration}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.vehicleModel}</div>
                    </td>
                    <td>{log.date}</td>
                    <td>{log.liters.toFixed(1)} L</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      {formatCurrency(log.cost)}
                    </td>
                    <td>{log.mileage.toLocaleString()} km</td>
                    <td style={{ fontWeight: '600', color: log.fuelEfficiency > 0 ? 'var(--success)' : 'inherit' }}>
                      {log.fuelEfficiency > 0 ? (
                        <>
                          <FaGasPump style={{ marginRight: '4px', verticalAlign: 'middle', fontSize: '12px' }} />
                          {log.fuelEfficiency.toFixed(2)} km/L
                        </>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Initial Log</span>
                      )}
                    </td>
                    {canWrite && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            className="btn-action edit" 
                            title="Edit Fueling Log"
                            onClick={() => handleEdit(log)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-action delete" 
                            title="Delete Fueling Log"
                            onClick={() => handleDelete(log.id)}
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

export default Fuel;
