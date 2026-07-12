import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { CurrencyContext } from '../../context/CurrencyContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { FaTruck, FaUserTie, FaRoute, FaWrench, FaDollarSign } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { formatCurrency } = useContext(CurrencyContext);
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, driversRes, tripsRes, expensesRes, costRes] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/drivers'),
        api.get('/api/trips'),
        api.get('/api/expenses'),
        api.get('/api/expenses/total')
      ]);

      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setTrips(tripsRes.data);
      setExpenses(expensesRes.data);
      setTotalCost(costRes.data.operationalCost);
    } catch (err) {
      console.error("Error loading dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Calculations
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const inShopVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length;
  const outOfServiceVehicles = vehicles.filter(v => v.status === 'OUT_OF_SERVICE').length;

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'ON_TRIP').length;
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;

  const activeTrips = trips.filter(t => t.status === 'DISPATCHED').length;
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const draftTrips = trips.filter(t => t.status === 'DRAFT').length;

  // Chart 1: Fleet Utilization (Doughnut) using semantic SaaS colors
  // Available -> Emerald (#10B981)
  // In Shop -> Amber (#F59E0B)
  // Retired -> Red (#EF4444)
  const fleetData = {
    labels: ['Available', 'In Shop', 'Out of Service'],
    datasets: [
      {
        data: [activeVehicles, inShopVehicles, outOfServiceVehicles],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 1,
        borderColor: '#1e293b',
      },
    ],
  };

  // Chart 2: Trip Statuses (Pie) using semantic SaaS colors
  // Completed -> Emerald (#10B981)
  // Dispatched / On Trip -> Blue (#3B82F6)
  // Draft -> Gray (#94A3B8)
  const tripData = {
    labels: ['Completed', 'Dispatched', 'Drafts'],
    datasets: [
      {
        data: [completedTrips, activeTrips, draftTrips],
        backgroundColor: ['#10B981', '#3B82F6', '#94A3B8'],
        borderWidth: 1,
        borderColor: '#1e293b',
      },
    ],
  };

  // Chart 3: Fuel Cost breakdown by vehicle (Bar chart)
  const fuelExpenses = expenses.filter(e => e.category === 'FUEL');
  const fuelCostsByVehicle = {};
  fuelExpenses.forEach(exp => {
    const reg = exp.vehicleRegistration || 'Other';
    fuelCostsByVehicle[reg] = (fuelCostsByVehicle[reg] || 0) + exp.amount;
  });

  const fuelCostData = {
    labels: Object.keys(fuelCostsByVehicle),
    datasets: [
      {
        label: 'Fuel Expenditures',
        data: Object.values(fuelCostsByVehicle),
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 11 }
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Stat Cards Row */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="card-icon icon-blue"><FaTruck /></div>
          <div className="card-info">
            <span className="label">Total Fleet Size</span>
            <span className="value">{vehicles.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-green"><FaUserTie /></div>
          <div className="card-info">
            <span className="label">Active Drivers</span>
            <span className="value">{activeDrivers} / {totalDrivers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-yellow"><FaRoute /></div>
          <div className="card-info">
            <span className="label">Dispatched Trips</span>
            <span className="value">{activeTrips}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-purple"><FaWrench /></div>
          <div className="card-info">
            <span className="label">Fleet In Shop</span>
            <span className="value">{inShopVehicles}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon icon-red">💵</div>
          <div className="card-info">
            <span className="label">Operational Costs</span>
            <span className="value">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '30px' }}>
        
        {/* Fleet Chart */}
        <div className="form-container" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3>Fleet Status Distribution</h3>
          <div style={{ flex: 1, position: 'relative', marginTop: '20px' }}>
            <Doughnut data={fleetData} options={chartOptions} />
          </div>
        </div>

        {/* Trips Chart */}
        <div className="form-container" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3>Dispatches Status Breakdown</h3>
          <div style={{ flex: 1, position: 'relative', marginTop: '20px' }}>
            <Pie data={tripData} options={chartOptions} />
          </div>
        </div>

        {/* Fuel Costs Chart */}
        <div className="form-container" style={{ height: '360px', display: 'flex', flexDirection: 'column', gridColumn: 'span 1' }}>
          <h3>Fuel Expense per Vehicle</h3>
          <div style={{ flex: 1, position: 'relative', marginTop: '20px' }}>
            <Bar 
              data={fuelCostData} 
              options={{
                ...chartOptions,
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94A3B8' } },
                  y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94A3B8' } }
                }
              }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
