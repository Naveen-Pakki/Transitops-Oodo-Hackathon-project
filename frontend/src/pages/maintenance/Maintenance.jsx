import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { CurrencyContext } from '../../context/CurrencyContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const Maintenance = () => {
  const { formatCurrency } = useContext(CurrencyContext);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get('/api/maintenance'),
        api.get('/api/vehicles')
      ]);
      setLogs(logsRes.data);
      setVehicles(vehiclesRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedVehicle('');
    setMaintenanceType('');
    setDate('');
    setCost('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (log) => {
    setEditingId(log.id);
    setSelectedVehicle(log.vehicleId);
    setMaintenanceType(log.maintenanceType);
    setDate(log.date);
    setCost(log.cost);
    setNotes(log.notes || '');
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this maintenance record? This will also remove its expense record and release the vehicle status.')) {
      try {
        await api.delete(`/api/maintenance/${id}`);
        setLogs(logs.filter(l => l.id !== id));
        loadData(); // Reload to refresh vehicle statuses
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete record');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicle || !maintenanceType || !date || !cost) {
      setFormError('Required fields: Vehicle, Type, Date, Cost');
      return;
    }

    if (Number(cost) < 0) {
      setFormError('Maintenance cost cannot be negative');
      return;
    }

    const logPayload = {
      vehicleId: Number(selectedVehicle),
      maintenanceType,
      date,
      cost: Number(cost),
      notes
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/maintenance/${editingId}`, logPayload);
        setLogs(logs.map(l => l.id === editingId ? res.data : l));
      } else {
        const res = await api.post('/api/maintenance', logPayload);
        setLogs([...logs, res.data]);
      }
      resetForm();
      loadData(); // reload list to update vehicle status to IN_SHOP in local state
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save maintenance record');
    }
  };

  return (
    <div className="maintenance-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div className="table-header" style={{ borderBottom: 'none', marginBottom: '20px', padding: 0 }}>
        <h2>Service Logs</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Log Service
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Service Record' : 'Record Vehicle Maintenance'}</h3>
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
                      {v.registrationNumber} - {v.model} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Type</label>
                <select 
                  className="form-input"
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  required
                >
                  <option value="">-- Service Category --</option>
                  <option value="Routine Oil & Filter Change">Routine Oil & Filter Change</option>
                  <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                  <option value="Engine Tuning & Inspection">Engine Tuning & Inspection</option>
                  <option value="Tire Rotation / Change">Tire Rotation / Change</option>
                  <option value="Suspension Repair">Suspension Repair</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Other Repairs">Other Repairs</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Service</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Cost ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Technician Notes</label>
              <textarea 
                className="form-input" 
                rows="3"
                placeholder="Describe works performed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaCheck /> {editingId ? 'Save Changes' : 'Record Service'}
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
                <th>Service Type</th>
                <th>Date</th>
                <th>Maintenance Cost</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No vehicle service records logged in the system.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{log.vehicleRegistration}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.vehicleModel}</div>
                    </td>
                    <td style={{ fontWeight: '500' }}>{log.maintenanceType}</td>
                    <td>{log.date}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      {formatCurrency(log.cost)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '250px' }}>
                      {log.notes || <span style={{ fontStyle: 'italic' }}>No notes provided</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          className="btn-action edit" 
                          title="Edit Service Record"
                          onClick={() => handleEdit(log)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-action delete" 
                          title="Delete Service Record"
                          onClick={() => handleDelete(log.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
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

export default Maintenance;
