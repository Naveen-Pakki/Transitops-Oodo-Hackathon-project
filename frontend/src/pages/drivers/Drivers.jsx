import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Drivers = () => {
  const { user } = useContext(AuthContext);
  // Fleet Manager, Dispatchers, and Safety Officers can write. Financial Analyst is read-only.
  const canEdit = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'].includes(user?.role);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [phone, setPhone] = useState('');
  const [safetyScore, setSafetyScore] = useState(100.0);
  const [status, setStatus] = useState('AVAILABLE');
  const [formError, setFormError] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/drivers');
      setDrivers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching drivers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const resetForm = () => {
    setName('');
    setLicenseNumber('');
    setLicenseExpiry('');
    setPhone('');
    setSafetyScore(100.0);
    setStatus('AVAILABLE');
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (driver) => {
    setEditingId(driver.id);
    setName(driver.name);
    setLicenseNumber(driver.licenseNumber);
    setLicenseExpiry(driver.licenseExpiry);
    setPhone(driver.phone);
    setSafetyScore(driver.safetyScore);
    setStatus(driver.status);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.delete(`/api/drivers/${id}`);
        setDrivers(drivers.filter(d => d.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete driver');
      }
    }
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    return exp < today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !licenseNumber || !licenseExpiry || !phone) {
      setFormError('All fields are required');
      return;
    }

    if (Number(safetyScore) < 0 || Number(safetyScore) > 100) {
      setFormError('Safety score must be between 0 and 100');
      return;
    }

    const driverPayload = {
      name,
      licenseNumber,
      licenseExpiry,
      phone,
      safetyScore: Number(safetyScore),
      status
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/drivers/${editingId}`, driverPayload);
        setDrivers(drivers.map(d => d.id === editingId ? res.data : d));
      } else {
        const res = await api.post('/api/drivers', driverPayload);
        setDrivers([...drivers, res.data]);
      }
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save driver details. Ensure license number is unique.');
    }
  };

  const getStatusBadgeClass = (s, expiry) => {
    if (isExpired(expiry)) {
      return 'status-inactive';
    }
    switch (s) {
      case 'AVAILABLE': return 'status-active';
      case 'ON_TRIP': return 'status-shop';
      case 'INACTIVE': return 'status-inactive';
      default: return '';
    }
  };

  return (
    <div className="drivers-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div className="table-header" style={{ borderBottom: 'none', marginBottom: '20px', padding: 0 }}>
        <h2>Drivers Directory</h2>
        {canEdit && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Add Driver
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Driver Profile' : 'Register New Driver'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {formError && <div className="login-error-alert" style={{ marginBottom: '20px' }}>{formError}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. DL-88776655"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Expiry Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. +15550100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Safety Score (0 - 100)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-input" 
                  placeholder="e.g. 95.0"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-input" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaCheck /> {editingId ? 'Save Changes' : 'Register Driver'}
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
                <th>Driver Name</th>
                <th>License Number</th>
                <th>License Expiry</th>
                <th>Phone</th>
                <th>Safety Score</th>
                <th>Status</th>
                {canEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No drivers registered in the platform yet.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => {
                  const expired = isExpired(driver.licenseExpiry);
                  return (
                    <tr key={driver.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{driver.name}</td>
                      <td>{driver.licenseNumber}</td>
                      <td style={{ color: expired ? '#ef4444' : 'inherit', fontWeight: expired ? '600' : 'normal' }}>
                        {driver.licenseExpiry} {expired && <FaExclamationTriangle style={{ marginLeft: '4px', verticalAlign: 'middle' }} title="License Expired" />}
                      </td>
                      <td>{driver.phone}</td>
                      <td style={{ fontWeight: '600', color: driver.safetyScore >= 90 ? '#10b981' : driver.safetyScore >= 75 ? '#f59e0b' : '#ef4444' }}>
                        {driver.safetyScore.toFixed(1)} / 100
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(driver.status, driver.licenseExpiry)}`}>
                          {expired ? 'EXPIRED' : driver.status.replace('_', ' ')}
                        </span>
                      </td>
                      {canEdit && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button 
                              className="btn-action edit" 
                              title="Edit Driver"
                              onClick={() => handleEdit(driver)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn-action delete" 
                              title="Delete Driver"
                              onClick={() => handleDelete(driver.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Drivers;
