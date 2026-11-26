import { useEffect, useState } from 'react';
// Recompute opening information without repeating API requests or tracking users.
export default function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
