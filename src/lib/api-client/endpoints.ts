export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  LEADS: {
    LIST: '/leads',
    DETAIL: (id: string) => `/leads/${id}`,
    CREATE: '/leads',
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
    MATCHES: (id: string) => `/leads/${id}/matches`,
    INTERACTIONS: (id: string) => `/leads/${id}/interactions`,
  },
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: (id: string) => `/properties/${id}`,
    CREATE: '/properties',
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    MATCHES: (id: string) => `/properties/${id}/matches`,
  },
  MATCHES: {
    LIST: '/matches',
    DETAIL: (id: string) => `/matches/${id}`,
    UPDATE_STATUS: (id: string) => `/matches/${id}/status`,
    RECALCULATE: '/matches/recalculate',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
} as const;
