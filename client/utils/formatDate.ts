/**
 * Format dates consistently across the app
 * @param date - Date string, timestamp, or Date object
 * @param format - 'relative' | 'short' | 'long'
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date,
  format: 'relative' | 'short' | 'long' = 'short'
): string {
  const d = new Date(date);
  const now = new Date();
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  if (format === 'relative') {
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  
  // Long format
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "Ends in 3d")
 * @param date - End date
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | number | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Ended';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return `${diffMins}m left`;
  if (diffHours < 24) return `${diffHours}h left`;
  if (diffDays < 7) return `${diffDays}d left`;
  
  return formatDate(d, 'short');
}
