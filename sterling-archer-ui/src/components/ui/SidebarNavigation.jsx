import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const SidebarNavigation = ({ isCollapsed = false, userRole = 'customer' }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/citizen-dashboard',
      icon: 'LayoutDashboard',
      roles: ['customer', 'admin']
    },
    {
      label: 'Crypto Exchange',
      path: '/crypto-exchange',
      icon: 'TrendingUp',
      roles: ['customer', 'admin']
    },
    {
      label: 'Verification',
      path: '/kyc-center',
      icon: 'ShieldCheck',
      roles: ['customer', 'admin']
    },
    {
      label: 'Support',
      path: '/live-support',
      icon: 'MessageCircle',
      roles: ['customer', 'admin']
    },
    {
      label: 'Administration',
      path: '/admin-dashboard',
      icon: 'Settings',
      roles: ['admin']
    }
  ];

  const filteredNavigation = navigationItems?.filter(item => 
    item?.roles?.includes(userRole)
  );

  const isActive = (path) => location?.pathname === path;

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-card rounded-xl shadow-warm border border-border hover:bg-muted transition-smooth"
        aria-label="Toggle navigation menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-smooth ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-60'}`}
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header flex items-center justify-center h-20 border-b border-border px-6">
            <div className={`sidebar-logo flex items-center justify-center rounded-xl bg-primary transition-smooth ${
              isCollapsed ? 'w-12 h-12' : 'w-14 h-14'
            }`}>
              <span className={`font-heading font-bold text-primary-foreground transition-smooth ${
                isCollapsed ? 'text-lg' : 'text-2xl'
              }`}>
                SA
              </span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h2 className="text-sm font-heading font-semibold text-foreground leading-tight">
                  Sterling-Archer
                </h2>
                <p className="text-xs text-muted-foreground caption">Trust</p>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <ul className="space-y-2">
              {filteredNavigation?.map((item) => (
                <li key={item?.path}>
                  <Link
                    to={item?.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth ${
                      isActive(item?.path)
                        ? 'bg-accent text-accent-foreground shadow-warm-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon
                      name={item?.icon}
                      size={20}
                      color={isActive(item?.path) ? 'var(--color-accent-foreground)' : 'currentColor'}
                    />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item?.label}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border p-4">
            <button
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Icon name="LogOut" size={20} color="currentColor" />
              {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;