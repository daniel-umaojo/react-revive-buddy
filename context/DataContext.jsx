import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import { getDefaultFluidDatabase } from "../constants/fluidConstants";

const DataContext = createContext(undefined);

export function DataProvider({ children }) {
  const [tankSettings, setTankSettings] = useState({});
  const [fluidDatabase, setFluidDatabase] = useState(getDefaultFluidDatabase());
  const [tankData, setTankData] = useState([]);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    setSupabaseClient(supabase);
  }, []);

  useEffect(() => {
    const storedSettings = localStorage.getItem("glence_tank_settings");
    if (storedSettings) {
      setTankSettings(JSON.parse(storedSettings));
    }

    const storedFluids = localStorage.getItem("glence_fluid_database");
    if (storedFluids) {
      setFluidDatabase(JSON.parse(storedFluids));
    } else {
      // Initialize with default fluids if none exist in storage
      const defaultFluids = getDefaultFluidDatabase();
      setFluidDatabase(defaultFluids);
      localStorage.setItem(
        "glence_fluid_database",
        JSON.stringify(defaultFluids)
      );
    }

    const storedData = localStorage.getItem("glence_tank_data");
    if (storedData) {
      setTankData(JSON.parse(storedData));
    }
  }, []);

  const saveTankSettings = (email, settings) => {
    const updatedSettings = { ...tankSettings, [email]: settings };
    setTankSettings(updatedSettings);
    localStorage.setItem(
      "glence_tank_settings",
      JSON.stringify(updatedSettings)
    );
  };

  const updateFluidDatabase = (fluids) => {
    setFluidDatabase(fluids);
    localStorage.setItem("glence_fluid_database", JSON.stringify(fluids));
  };

  const addTankData = (data) => {
    const newData = {
      ...data,
      id: Date.now().toString(),
    };
    const updatedData = [...tankData, newData];
    setTankData(updatedData);
    localStorage.setItem("glence_tank_data", JSON.stringify(updatedData));
  };

  const syncToCloud = async () => {
    if (!supabaseClient) return;

    try {
      // Sync tank data to Supabase
      const { error } = await supabaseClient.from("tank_data").upsert(
        tankData.map((data) => ({
          ...data,
          user_email: currentUser,
        }))
      );

      if (error) throw error;
      console.log("Data synced to cloud successfully");
    } catch (error) {
      console.error("Failed to sync to cloud:", error);
    }
  };

  const getTankSettingsForUser = (email) => {
    return tankSettings[email] || [];
  };

  const detectFluid = (density) => {
    for (const [fluid, range] of Object.entries(fluidDatabase)) {
      if (density >= range.min && density <= range.max) {
        return fluid;
      }
    }
    return "Unknown Fluid";
  };

  const calculateFillStatus = (percentage, thresholds) => {
    if (
      percentage >= thresholds.overflowThreshold.min &&
      percentage <= thresholds.overflowThreshold.max
    ) {
      return { status: "Overflowing", color: "#ef4444" };
    }
    if (
      percentage >= thresholds.highFillThreshold.min &&
      percentage <= thresholds.highFillThreshold.max
    ) {
      return { status: "Overfull", color: "#f97316" };
    }
    if (
      percentage >= thresholds.halfFillThreshold.min &&
      percentage <= thresholds.halfFillThreshold.max
    ) {
      return { status: "Half Filled", color: "#10b981" };
    }
    if (
      percentage >= thresholds.lowFillThreshold.min &&
      percentage <= thresholds.lowFillThreshold.max
    ) {
      return { status: "Low", color: "#f59e0b" };
    }
    return { status: "Very Low", color: "#6b7280" };
  };

  return (
    <DataContext.Provider
      value={{
        tankSettings,
        fluidDatabase,
        tankData,
        supabaseClient,
        saveTankSettings,
        updateFluidDatabase,
        addTankData,
        syncToCloud,
        getTankSettingsForUser,
        detectFluid,
        calculateFillStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
