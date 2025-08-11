export const isToday = (dateString: string): boolean => {
  const entryDate = new Date(dateString).toDateString();
  const today = new Date().toDateString();
  return entryDate === today;
};

export const isPastDate = (dateString: string): boolean => {
  const entryDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day
  return entryDate < today;
};

export const formatEntryDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};