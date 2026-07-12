import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaLock } from 'react-icons/fa';

const Expenses = () => {
  const { user } = useContext(AuthContext);
  const { formatCurrency } = useContext(CurrencyContext);
  // Fleet Manager and Financial Analyst can write OTHER expenses.
  const canWrite = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(user?.role);

  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesRes, totalRes, vehiclesRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/expenses/total'),
        api.get('/api/vehicles')
      ]);

      setExpenses(expensesRes.data);
      setTotalCost(totalRes.data.operationalCost);
      setVehicles(vehiclesRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading expense registry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedVehicle('');
    setAmount('');
    setDate('');
    setDescription('');
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setSelectedVehicle(expense.vehicleId || '');
    setAmount(expense.amount);
    setDate(expense.date);
    setDescription(expense.description);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this manual expense record?')) {
      try {
        await api.delete(`/api/expenses/${id}`);
        setExpenses(expenses.filter(e => e.id !== id));
        loadData(); // reload total
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete expense log');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!amount || !date || !description) {
      setFormError('Amount, Date, and Description are required');
      return;
    }

    if (Number(amount) <= 0) {
      setFormError('Amount must be a positive value');
      return;
    }

    const expensePayload = {
      vehicleId: selectedVehicle ? Number(selectedVehicle) : null,
      category: 'OTHER',
      amount: Number(amount),
      date,
      description
    };

    try {
      if (editingId) {
        await api.put(`/api/expenses/${editingId}`, expensePayload);
      } else {
        await api.post('/api/expenses', expensePayload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save expense log');
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'MAINTENANCE': return 'role-badge fleet_manager';
      case 'FUEL': return 'role-badge financial_analyst';
      default: return 'role-badge dispatcher';
    }
  };

  return (
    <div className="expenses-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div className="card-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '320px', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="card-icon icon-red">💵</div>
          <div className="card-info">
            <span className="label">Total Operational Cost</span>
            <span className="value">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>

      <div className="table-header" style={{ borderBottom: 'none', marginBottom: '20px', padding: 0 }}>
        <h2>Expense Ledger</h2>
        {canWrite && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Log Other Expense
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Manual Expense' : 'Log Standalone Expense'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {formError && <div className="login-error-alert" style={{ marginBottom: '20px' }}>{formError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Related Vehicle (Optional)</label>
                <select 
                  className="form-input"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  <option value="">-- Generic Expense (No Vehicle) --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} - {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expense Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expense Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="e.g. 50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Expense Description</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Highway toll bills, Driver dinner allowances, software subscriptions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaCheck /> {editingId ? 'Save Changes' : 'Log Expense'}
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
                <th>Expense Type / Date</th>
                <th>Vehicle Link</th>
                <th>Description</th>
                <th>Amount</th>
                {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 5 : 4} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No expense logs saved in the platform ledger.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => {
                  const isLinked = expense.referenceId !== null;
                  return (
                    <tr key={expense.id}>
                      <td>
                        <span className={getCategoryBadgeClass(expense.category)}>
                          {expense.category}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{expense.date}</div>
                      </td>
                      <td>
                        {expense.vehicleRegistration ? (
                          <>
                            <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{expense.vehicleRegistration}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{expense.vehicleModel}</div>
                          </>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px' }}>Generic Fleet Expense</span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px' }}>{expense.description}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {formatCurrency(expense.amount)}
                      </td>
                      {canWrite && (
                        <td style={{ textAlign: 'right' }}>
                          {isLinked ? (
                            <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <FaLock /> Linked
                            </span>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                className="btn-action edit" 
                                title="Edit Expense Log"
                                onClick={() => handleEdit(expense)}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-action delete" 
                                title="Delete Expense Log"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
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

export default Expenses;
