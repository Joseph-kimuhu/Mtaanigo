const STORAGE_KEY = 'mtaanigo_notifications';

export const notificationService = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  getUnreadCount() {
    return this.getAll().filter((n) => !n.read).length;
  },

  markAsRead(id) {
    const items = this.getAll();
    const item = items.find((n) => n.id === id);
    if (item) {
      item.read = true;
      item.read_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    return item;
  },

  markAllAsRead() {
    const items = this.getAll().map((n) => ({ ...n, read: true, read_at: new Date().toISOString() }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  add(notification) {
    const items = this.getAll();
    items.unshift({ id: Date.now(), read: false, created_at: new Date().toISOString(), ...notification });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
};

if (typeof window !== 'undefined') {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const seed = [
      { id: 1, type: 'booking_confirmed', title: 'Booking confirmed', message: 'Your cleaning service with Mary Wanjiku is confirmed for Friday, 2:00 PM.', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, type: 'provider_arrived', title: 'Provider arrived', message: 'John Kamau has arrived at your location.', read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 3, type: 'payment_success', title: 'Payment successful', message: 'KSh 2,500 paid successfully for plumbing service.', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 4, type: 'promotion', title: '20% off this weekend', message: 'Use code WEEKEND20 for 20% off any home cleaning service.', read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 5, type: 'message', title: 'New message', message: 'Peter Mwangi sent you a message about your booking.', read: false, created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 6, type: 'system', title: 'Profile updated', message: 'Your profile information was successfully updated.', read: true, created_at: new Date(Date.now() - 259200000).toISOString() },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
}
