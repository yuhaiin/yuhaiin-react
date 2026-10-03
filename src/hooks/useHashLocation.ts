import { allowNavigation } from './navigation-guard';
import { useState, useEffect, useCallback, useRef } from "react";

// returns the current hash location (minus the # symbol)
const currentLocation = () => {
  let path = window.location.hash.replace(/^#/, "") || "/";
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
};

export const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = useState(currentLocation());

  const accepted = useRef<string | null>(null);
  const current = useRef(loc);
  useEffect(() => {
    // handler for when the hash changes
    const handler = () => {
      const next = currentLocation();
      if (next === current.current) return;
      const approved = accepted.current === next;
      accepted.current = null;
      if (!approved && !allowNavigation()) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${current.current}`);
        return;
      }
      current.current = next;
      setLoc(next);
    };

    // subscribe to hash changes
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to: string) => {
    const next = to === '/' ? '/' : to.replace(/\/+$/, '');
    if (next === current.current || !allowNavigation()) return;
    accepted.current = next;
    window.location.hash = next;
  }, []);

  return [loc, navigate];
};
