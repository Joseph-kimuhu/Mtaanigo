const STORAGE_KEY = 'mtaanigo_settings';

export const settingsService = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return this.getDefaults();
    }
  },

  getDefaults() {
    return {
      darkMode: false,
      language: 'en',
      notificationsEnabled: true,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      privacyProfile: 'public',
      twoFactorEnabled: false,
    };
  },

  update(newSettings) {
    const current = this.getAll();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.getDefaults()));
  },
};
