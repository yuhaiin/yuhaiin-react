import { useState, useEffect, useCallback } from "react";

// returns the current hash location (minus the # symbol)
const currentLocation = () => {
  let path = window.location.hash.replace(/^#/, "") || "/";
  // Keep hash query parameters available to the page (for example, the home
  // page uses `focus=map` to scroll to a section), but do not let them turn
  // the query string into a different wouter route.
  path = path.split("?")[0] || "/";
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
};

export const useHashLocation = () => {
  const [loc, setLoc] = useState(currentLocation());

  useEffect(() => {
    // handler for when the hash changes
    const handler = () => setLoc(currentLocation());

    // subscribe to hash changes
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return [loc, navigate] as const;
};
