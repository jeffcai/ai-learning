import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import Cookies from 'js-cookie';

// Date utilities
export const formatDate = (dateString: string, formatString: string = 'MMM dd, yyyy') => {
  try {
    return format(parseISO(dateString), formatString);
  } catch {
    return dateString;
  }
};

export const formatDateForInput = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

export const getCurrentWeek = () => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const getPreviousWeek = () => {
  const now = new Date();
  const previousWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const start = startOfWeek(previousWeek, { weekStartsOn: 1 });
  const end = endOfWeek(previousWeek, { weekStartsOn: 1 });
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

// Auth utilities
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false; // Server-side, no cookies available
  }
  return !!Cookies.get('access_token');
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    Cookies.set('access_token', token, { expires: 7 }); // 7 days
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove('access_token');
  }
};

// URL utilities
export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getDomainFromUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
};

// Text utilities
export const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const extractTags = (tagsInput: string | string[]) => {
  if (!tagsInput) return [];
  
  // If it's already an array, return it
  if (Array.isArray(tagsInput)) {
    return tagsInput;
  }
  
  // If it's a string, try to parse as JSON first
  try {
    return JSON.parse(tagsInput);
  } catch {
    // If not JSON, split by comma
    return tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
  }
};

export const tagsToString = (tags: string[]) => {
  return JSON.stringify(tags);
};

// Class name utilities
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Error handling
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
