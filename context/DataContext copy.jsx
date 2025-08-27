"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// create the context
const DataContext = createContext();

// provider component
export function DataProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  // function to fetch alerts
  async function fetchAlerts(limit = 5) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/alerts?limit=${limit}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error?.message || "Failed to fetch alerts");
      }

      setAlerts(json.data?.data?.docs || []); // Titan puts alerts inside data.data.docs
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // fetch once on mount
  useEffect(() => {
    fetchAlerts();
  }, []);
  useEffect(() => {
    console.log("Updated alerts:", JSON.stringify(alerts, null, 2));
  }, [alerts]);

  return (
    <DataContext.Provider
      value={{
        alerts,
        loading,
        error,
        fetchAlerts,
        selectedUserId,
        setSelectedUserId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// custom hook to use in components
export function useData() {
  return useContext(DataContext);
}
