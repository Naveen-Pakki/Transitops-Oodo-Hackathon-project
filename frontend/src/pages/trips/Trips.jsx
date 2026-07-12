import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, 
  FaPaperPlane, FaFlagCheckered, FaBan, FaCalendarAlt 
} from 'react-icons/fa';

const Trips = () => {
  const { user } = useContext(AuthContext);
  const canModify = ['FLEET_MANAGER', 'DISPATCHER'].includes(user?.role);

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get('/api/trips'),
        api.get('/api/vehicles'),
        api.get('/api/drivers')
      ]);

      setTrips(tripsRes.data);
      
      // Filter list of vehicles & drivers for dropdowns:
      // Show all, but indicate statuses (e.g. IN_SHOP, ON_TRIP, EXPIRED) so dispatchers make informed decisions.
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dispatches data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSource('');
    setDestination('');
    setSelectedVehicle('');
    setSelectedDriver('');
    setCargoWeight('');
    setDistance('');
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (trip) => {
    setEditingId(trip.id);
    setSource(trip.source);
    setDestination(trip.destination);
    setSelectedVehicle(trip.vehicleId);
    setSelectedDriver(trip.driverId);
    setCargoWeight(trip.cargoWeight);
    setDistance(trip.distance);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip assignment?')) {
      try {
        await api.delete(`/api/trips/${id}`);
        setTrips(trips.filter(t => t.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete trip record');
      }
    }
  };

  const handleDispatch = async (id) => {
    if (window.confirm('Dispatch vehicle and driver for this trip?')) {
      try {
        const res = await api.put(`/api/trips/${id}/dispatch`);
        setTrips(trips.map(t => t.id === id ? res.data : t));
        loadData(); // Refresh list to update driver/vehicle statuses
      } catch (err) {
        alert(err.response?.data?.message || 'Dispatch failure');
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Mark this trip as completed? This updates vehicle mileage.')) {
      try {
        const res = await api.put(`/api/trips/${id}/complete`);
        setTrips(trips.map(t => t.id === id ? res.data : t));
        loadData(); // Refresh list to update driver/vehicle statuses
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to complete trip');
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this trip dispatch?')) {
      try {
        const res = await api.put(`/api/trips/${id}/cancel`);
        setTrips(trips.map(t => t.id === id ? res.data : t));
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel trip');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!source || !destination || !selectedVehicle || !selectedDriver || !cargoWeight || !distance) {
      setFormError('All fields are required');
      return;
    }

    const vehicle = vehicles.find(v => v.id === Number(selectedVehicle));
    if (vehicle && Number(cargoWeight) > vehicle.capacity) {
      setFormError(`Cargo weight exceeds capacity limit for selected vehicle (${vehicle.capacity.toLocaleString()} kg)`);
      return;
    }

    const driver = drivers.find(d => d.id === Number(selectedDriver));
    if (driver) {
      const today = new Date().toISOString().split('T')[0];
      if (driver.licenseExpiry < today) {
        setFormError('Cannot assign driver with an expired license');
        return;
      }
    }

    const tripPayload = {
      source,
      destination,
      vehicleId: Number(selectedVehicle),
      driverId: Number(selectedDriver),
      cargoWeight: Number(cargoWeight),
      distance: Number(distance)
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/trips/${editingId}`, tripPayload);
        setTrips(trips.map(t => t.id === editingId ? res.data : t));
      } else {
        const res = await api.post('/api/trips', tripPayload);
        setTrips([...trips, res.data]);
      }
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save trip dispatch');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'DRAFT': return 'status-draft';
      case 'DISPATCHED': return 'status-shop';
      case 'COMPLETED': return 'status-active';
      case 'CANCELLED': return 'status-inactive';
      default: return '';
    }
  };

  return (
    <div className="trips-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div className="table-header" style={{ borderBottom: 'none', marginBottom: '20px', padding: 0 }}>
        <h2>Dispatch Control</h2>
        {canModify && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Draft Dispatch
          </button>
        )}
      </div>

      {showForm && canModify && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Modify Trip Plan' : 'Create Dispatch Plan'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {formError && <div className="login-error-alert" style={{ marginBottom: '20px' }}>{formError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Source Terminal</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Warehouse A (Houston)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination Location</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Dallas Center"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Fleet Vehicle</label>
                <select 
                  className="form-input"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => {
                    const isBusy = trips.some(t => t.vehicleId === v.id && t.status === 'DISPATCHED' && t.id !== editingId);
                    return (
                      <option 
                        key={v.id} 
                        value={v.id} 
                        disabled={v.status !== 'ACTIVE' || isBusy}
                      >
                        {v.registrationNumber} - {v.model} ({v.capacity}kg cap){v.status !== 'ACTIVE' ? ` [${v.status}]` : ''}{isBusy ? ' [BUSY]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Driver</label>
                <select 
                  className="form-input"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  required
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(d => {
                    const isBusy = trips.some(t => t.driverId === d.id && t.status === 'DISPATCHED' && t.id !== editingId);
                    const today = new Date().toISOString().split('T')[0];
                    const expired = d.licenseExpiry < today;
                    return (
                      <option 
                        key={d.id} 
                        value={d.id}
                        disabled={d.status !== 'AVAILABLE' || expired || isBusy}
                      >
                        {d.name} (Safety: {d.safetyScore}/100){expired ? ' [EXPIRED LICENSE]' : ''}{d.status !== 'AVAILABLE' && !expired ? ` [${d.status}]` : ''}{isBusy ? ' [ON TRIP]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cargo Weight (kg)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 15000"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Route Distance (km)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 385"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaCheck /> {editingId ? 'Update Plan' : 'Create Draft'}
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
                <th>Route Info</th>
                <th>Vehicle Assigned</th>
                <th>Driver</th>
                <th>Cargo / Dist</th>
                <th>Status</th>
                <th>Dates</th>
                {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={canModify ? 7 : 6} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No trips logged in the system.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{trip.source}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>➔ {trip.destination}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{trip.vehicleRegistration}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{trip.vehicleModel}</div>
                    </td>
                    <td>{trip.driverName}</td>
                    <td>
                      <div>{trip.cargoWeight.toLocaleString()} kg</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trip.distance} km</div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {trip.dispatchDate && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Out:</span> {new Date(trip.dispatchDate).toLocaleString()}
                        </div>
                      )}
                      {trip.completionDate && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>In:</span> {new Date(trip.completionDate).toLocaleString()}
                        </div>
                      )}
                      {!trip.dispatchDate && <span style={{ color: 'var(--text-muted)' }}>Not Dispatched</span>}
                    </td>
                    {canModify && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {trip.status === 'DRAFT' && (
                            <>
                              <button 
                                className="btn-action edit" 
                                title="Dispatch Trip" 
                                style={{ color: 'var(--success)' }}
                                onClick={() => handleDispatch(trip.id)}
                              >
                                <FaPaperPlane />
                              </button>
                              <button 
                                className="btn-action edit" 
                                title="Edit Trip Info"
                                onClick={() => handleEdit(trip)}
                              >
                                <FaEdit />
                              </button>
                            </>
                          )}
                          {trip.status === 'DISPATCHED' && (
                            <>
                              <button 
                                className="btn-action edit" 
                                title="Complete Trip" 
                                style={{ color: 'var(--success)' }}
                                onClick={() => handleComplete(trip.id)}
                              >
                                <FaFlagCheckered />
                              </button>
                              <button 
                                className="btn-action delete" 
                                title="Cancel Dispatch"
                                onClick={() => handleCancel(trip.id)}
                              >
                                <FaBan />
                              </button>
                            </>
                          )}
                          {trip.status !== 'DISPATCHED' && (
                            <button 
                              className="btn-action delete" 
                              title="Delete Log"
                              onClick={() => handleDelete(trip.id)}
                            >
                              <FaTrash />
                            </button>
                          )}
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

export default Trips;
