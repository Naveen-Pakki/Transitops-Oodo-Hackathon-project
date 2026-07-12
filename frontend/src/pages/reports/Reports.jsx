import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { CurrencyContext } from '../../context/CurrencyContext';
import { FaFileCsv, FaChartLine, FaGasPump, FaWrench, FaCoins } from 'react-icons/fa';

const Reports = () => {
  const { formatCurrency } = useContext(CurrencyContext);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [expRes, vehRes, fuelRes, tripsRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/vehicles'),
        api.get('/api/fuel'),
        api.get('/api/trips')
      ]);

      setExpenses(expRes.data);
      setVehicles(vehRes.data);
      setFuelLogs(fuelRes.data);
      setTrips(tripsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error compiling reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Fleet Utilization Calculation
  const totalVehicles = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'ACTIVE').length;
  const deploymentRate = totalVehicles > 0 ? ((activeVehiclesCount / totalVehicles) * 100).toFixed(1) : 0;

  // 2. Category Expense Breakdown
  const maintenanceTotal = expenses.filter(e => e.category === 'MAINTENANCE').reduce((acc, e) => acc + e.amount, 0);
  const fuelTotal = expenses.filter(e => e.category === 'FUEL').reduce((acc, e) => acc + e.amount, 0);
  const otherTotal = expenses.filter(e => e.category === 'OTHER').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = maintenanceTotal + fuelTotal + otherTotal;

  // 3. Vehicle Aggregate Costs
  const getVehicleAggregateCosts = () => {
    return vehicles.map(v => {
      const vehicleExpenses = expenses.filter(e => e.vehicleId === v.id);
      const maintCost = vehicleExpenses.filter(e => e.category === 'MAINTENANCE').reduce((acc, e) => acc + e.amount, 0);
      const fuelCost = vehicleExpenses.filter(e => e.category === 'FUEL').reduce((acc, e) => acc + e.amount, 0);
      
      const avgEfficiency = fuelLogs.filter(f => f.vehicleId === v.id && f.fuelEfficiency > 0);
      const avgEffVal = avgEfficiency.length > 0 
        ? (avgEfficiency.reduce((acc, f) => acc + f.fuelEfficiency, 0) / avgEfficiency.length).toFixed(2) + ' km/L'
        : 'No data';

      return {
        id: v.id,
        registration: v.registrationNumber,
        model: v.model,
        purchaseCost: v.purchaseCost,
        maintCost,
        fuelCost,
        totalOpCost: maintCost + fuelCost,
        efficiency: avgEffVal
      };
    });
  };

  // 4. CSV Export Trigger
  const exportToCSV = () => {
    if (expenses.length === 0) {
      alert("No expense records available to export");
      return;
    }

    const headers = ['Expense ID', 'Category', 'Vehicle Reference', 'Service Date', 'Description', 'Amount ($)'];
    const rows = expenses.map(e => [
      e.id,
      e.category,
      e.vehicleRegistration || 'Generic Fleet',
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TransitOps_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {error && <div className="login-error-alert">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Analytical Performance Summary</h2>
        <button className="btn btn-primary" onClick={exportToCSV}>
          <FaFileCsv style={{ marginRight: '8px' }} /> Export Financials CSV
        </button>
      </div>

      {/* Reports Metrics Grid */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        
        <div className="stat-card">
          <div className="card-icon icon-green"><FaChartLine /></div>
          <div className="card-info">
            <span className="label">Fleet Deployment Rate</span>
            <span className="value">{deploymentRate}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-yellow"><FaGasPump /></div>
          <div className="card-info">
            <span className="label">Fuel Expenses</span>
            <span className="value">{formatCurrency(fuelTotal)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-purple"><FaWrench /></div>
          <div className="card-info">
            <span className="label">Maintenance Cost</span>
            <span className="value">{formatCurrency(maintenanceTotal)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-blue"><FaCoins /></div>
          <div className="card-info">
            <span className="label">Other Expenses</span>
            <span className="value">{formatCurrency(otherTotal)}</span>
          </div>
        </div>

      </div>

      {/* Vehicle Costs Report Table */}
      <div className="table-container" style={{ marginTop: '30px' }}>
        <div className="table-header">
          <h3>Asset-wise Cost Analysis</h3>
        </div>
        <table className="ops-table">
          <thead>
            <tr>
              <th>Vehicle Plate</th>
              <th>Purchase Cost</th>
              <th>Fuel Incurred</th>
              <th>Maintenance Incurred</th>
              <th>Total Operational Cost</th>
              <th>Avg Fuel Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {getVehicleAggregateCosts().map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                  {item.registration}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.model}</div>
                </td>
                <td>{formatCurrency(item.purchaseCost)}</td>
                <td>{formatCurrency(item.fuelCost)}</td>
                <td>{formatCurrency(item.maintCost)}</td>
                <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                  {formatCurrency(item.totalOpCost)}
                </td>
                <td style={{ fontWeight: '600', color: item.efficiency !== 'No data' ? 'var(--success)' : 'inherit' }}>
                  {item.efficiency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
