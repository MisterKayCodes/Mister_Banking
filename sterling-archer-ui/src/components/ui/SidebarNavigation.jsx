import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import api from '../../api/axios';

const SidebarNavigation = ({ isCollapsed = false, userRole = 'customer' }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cryptoId, setCryptoId] = useState(null);

  useEffect(() => {
    const fetchUserVault = async () => {
      try {
        const res = await api.get('/accounts/');
        const cryptoAccount = res.data.find(acc => acc.type === 'Crypto');
        if (cryptoAccount) setCryptoId(cryptoAccount.id);
      } catch (err) {
        console.error("Account synchronization error: Unable to retrieve vault identifiers.");
      }
    };
    if (userRole === 'customer') fetchUserVault();
  }, [userRole]);

  const navigationItems = [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['customer', 'admin']
    },
    {
      id: 'nav-crypto',
      label: 'Crypto Vault',
      path: cryptoId ? `/crypto/${cryptoId}` : '/dashboard',
      icon: 'TrendingUp',
      roles: ['customer', 'admin']
    },
    {
      id: 'nav-kyc',
      label: 'Verification',
      path: '/kyc-center',
      icon: 'ShieldCheck',
      roles: ['customer', 'admin']
    },
    {
      id: 'nav-support',
      label: 'Support',
      path: '/live-support',
      icon: 'MessageCircle',
      roles: ['customer', 'admin']
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['customer', 'admin']
    },
    {
      id: 'nav-admin',
      label: 'Administration',
      path: '/admin-dashboard',
      icon: 'Settings',
      roles: ['admin']
    }
  ];

  const filteredNavigation = navigationItems.filter(item =>
    item.roles.includes(userRole)
  );

  const isActive = (path) => location.pathname === path;
  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={handleMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-card rounded-xl shadow-md border border-border"
        aria-label="Toggle navigation menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Institution Branding */}
          <div className="flex items-center h-20 border-b border-border px-4">
            <div className="flex items-center justify-center rounded-xl bg-primary w-10 h-10 shrink-0">
              <span className="font-heading font-bold text-primary-foreground text-lg">SA</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <h2 className="text-sm font-heading font-semibold text-foreground truncate">
                  Sterling Archer
                </h2>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">
                  Trust & Fiduciary
                </p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <ul className="space-y-1.5">
              {filteredNavigation.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive(item.path)
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      color={isActive(item.path) ? 'var(--color-accent-foreground)' : 'currentColor'}
                    />
                    {!isCollapsed && (
                      <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Session Management */}
          <div className="border-t border-border p-4">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all ${isCollapsed ? 'justify-center' : ''
                }`}
            >
              <Icon name="LogOut" size={20} />
              {!isCollapsed && (
                <span className="font-black text-[11px] uppercase tracking-widest">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;