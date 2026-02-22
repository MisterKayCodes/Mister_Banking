import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios'; // Mister, your custom sentry with the token!
import Icon from '../AppIcon';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      // Mister, hitting your /notifications/ endpoint directly
      const response = await api.get('/notifications/');
      const data = response.data;

      setNotifications(data);
      // Mister, note the 'is_read' check to match your SQLAlchemy model!
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Mister, the alert system is down:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Mister, polling every 30 seconds to keep the vault updated
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ## -------------------- THE CLICK OUTSIDE GUARD --------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (id) => {
    try {
      // Mister, calling your PUT /{id}/read route
      await api.put(`/notifications/${id}/read`);
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mister, failed to silence the alert:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      // Mister, calling your DELETE /clear-all route for a fresh start
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Mister, the wipe failed:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="relative p-2 rounded-xl hover:bg-muted transition-smooth">
        <Icon name="Bell" size={20} color="var(--color-foreground)" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full border-2 border-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-popover border border-border rounded-2xl shadow-warm-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-heading font-semibold text-foreground">Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={handleClearAll} className="text-xs text-error hover:underline transition-smooth caption">
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Icon name="Bell" size={40} color="var(--color-muted-foreground)" className="mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground caption">Mister, your tray is empty.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-6 py-4 border-b border-border hover:bg-muted transition-smooth cursor-pointer ${!n.is_read ? 'bg-accent/5' : ''}`}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${n.type === 'success' ? 'text-success' : n.type === 'warning' ? 'text-warning' : 'text-accent'}`}>
                        <Icon name={getNotificationIcon(n.type)} size={18} color="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">{n.title}</h4>
                          {!n.is_read && <span className="w-2 h-2 bg-accent rounded-full" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{n.message}</p>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50">
                          {formatTimestamp(n.created_at || n.timestamp)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;