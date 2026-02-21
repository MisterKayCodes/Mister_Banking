import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const mockNotifications = [
        {
          id: 1,
          title: 'Transaction Completed',
          message: 'Your transfer of $5,000 has been processed successfully.',
          timestamp: '2026-02-21T10:30:00',
          read: false,
          type: 'success'
        },
        {
          id: 2,
          title: 'Security Alert',
          message: 'New login detected from Chrome on Windows.',
          timestamp: '2026-02-21T09:15:00',
          read: false,
          type: 'warning'
        },
        {
          id: 3,
          title: 'Crypto Price Alert',
          message: 'Bitcoin has reached your target price of $45,000.',
          timestamp: '2026-02-21T08:45:00',
          read: true,
          type: 'info'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications?.filter(n => !n?.read)?.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev?.map(notification =>
        notification?.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev?.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Info';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-muted transition-smooth"
        aria-label="Notifications"
      >
        <Icon name="Bell" size={20} color="var(--color-foreground)" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-2xl shadow-warm-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-accent hover:text-accent-foreground transition-smooth caption"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications?.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Icon name="Bell" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                <p className="text-muted-foreground caption">No notifications</p>
              </div>
            ) : (
              <ul>
                {notifications?.map((notification) => (
                  <li
                    key={notification?.id}
                    className={`px-6 py-4 border-b border-border hover:bg-muted transition-smooth cursor-pointer ${
                      !notification?.read ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification?.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-1 ${
                        notification?.type === 'success' ? 'text-success' :
                        notification?.type === 'warning' ? 'text-warning' :
                        notification?.type === 'error'? 'text-error' : 'text-primary'
                      }`}>
                        <Icon name={getNotificationIcon(notification?.type)} size={20} color="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {notification?.title}
                          </h4>
                          {!notification?.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-accent rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground caption line-clamp-2 mb-1">
                          {notification?.message}
                        </p>
                        <span className="text-xs text-muted-foreground caption">
                          {formatTimestamp(notification?.timestamp)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications?.length > 0 && (
            <div className="px-6 py-3 border-t border-border text-center">
              <button className="text-sm text-accent hover:text-accent-foreground transition-smooth caption">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;