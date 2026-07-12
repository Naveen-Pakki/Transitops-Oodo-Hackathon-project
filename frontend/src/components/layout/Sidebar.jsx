import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaThLarge, 
  FaTruck, 
  FaUserTie, 
  FaRoute, 
  FaWrench, 
  FaGasPump, 
  FaDollarSign, 
  FaFileAlt,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  // Define sidebar links based on roles
  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaThLarge />, roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { path: '/vehicles', label: 'Vehicles', icon: <FaTruck />, roles: ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'] },
    { path: '/drivers', label: 'Drivers', icon: <FaUserTie />, roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { path: '/trips', label: 'Trips', icon: <FaRoute />, roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { path: '/maintenance', label: 'Maintenance', icon: <FaWrench />, roles: ['FLEET_MANAGER'] },
    { path: '/fuel', label: 'Fuel Logs', icon: <FaGasPump />, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    { path: '/expenses', label: 'Expenses', icon: <FaDollarSign />, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    { path: '/reports', label: 'Reports', icon: <FaFileAlt />, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Transit<span>Ops</span></h2>
      </div>
      
      <nav className="sidebar-nav">
        {links.map((link) => {
          if (link.roles.includes(user.role)) {
            return (
              <NavLink 
                key={link.path} 
                to={link.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-label">{link.label}</span>
              </NavLink>
            );
          }
          return null;
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
