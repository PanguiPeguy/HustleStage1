import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, PlusCircle,
  UserCircle, LogOut, Zap, Sun, Moon, Globe
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettings } from '../../context/SettingsContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { t, lang, setLang, darkMode, toggleDark } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard',    icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/clients',      icon: Users,            label: t.nav.clients },
    { to: '/factures',     icon: FileText,         label: t.nav.invoices },
    { to: '/newfactures', icon: PlusCircle,       label: t.nav.newInvoice },
    { to: '/profile',      icon: UserCircle,       label: t.nav.profile },
  ];

  const initials = user?.nomEntreprise?.[0]?.toUpperCase() ?? 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="#fff" fill="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">InvoicePro</div>
          <div className="sidebar-logo-sub">SaaS Billing</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to

          return (
            <NavLink
              key={to}
              to={to}
              className={`sidebar-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} className="icon" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {/* Settings panel */}
        <div className="sidebar-settings">
          {/* Language */}
          <div className="sidebar-setting-row">
            <span className="sidebar-setting-label">
              <Globe size={13} /> {t.settings.language}
            </span>
            <div className="lang-toggle">
              <button
                onClick={() => setLang('fr')}
                className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
              >
                FR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`lang-btn${lang === 'en' ? ' active' : ''}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Dark mode */}
          <div className="sidebar-setting-row">
            <span className="sidebar-setting-label">
              {darkMode ? <Moon size={13} /> : <Sun size={13} />}
              {t.settings.darkMode}
            </span>
            <button
              onClick={toggleDark}
              className={`theme-toggle${darkMode ? ' on' : ''}`}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-knob" />
            </button>
          </div>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.nomEntreprise || 'Compte'}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title={t.nav.logout}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
