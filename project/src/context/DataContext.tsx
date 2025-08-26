import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { getDefaultFluidDatabase, FluidDatabase, FluidRange } from '../constants/fluidConstants';
import {
  saveTankSettingsToSupabase,
  getTankSettingsFromSupabase,
  saveTankDataToSupabase,
  getTankDataFromSupabase,
  saveFluidDatabaseToSupabase,
  getFluidDatabaseFromSupabase
} from '../lib/supabaseService';
import { testSupabaseConnection, runDiagnostics } from '../lib/testConnection';

export interface TankSettings {
  vesselName: string;
  tankName: string;
  shape: 'Cylindrical' | 'Rectangular' | 'Spherical';
  maxLevel: number;
  area: number;
  height: number;
  radius?: number;
  length?: number;
  breadth?: number;
  lowFillThreshold: { min: number; max: number };
  halfFillThreshold: { min: number; max: number };
  highFillThreshold: { min: number; max: number };
  overflowThreshold: { min: number; max: number };
}

// Re-export these for backward compatibility
export type { FluidRange, FluidDatabase };

export interface TankData {
  id: string;
  vessel: string;
  tank: string;
  date: string;
  volume: number;
  density: number;
  fluid: string;
  temperature: number;
  pressure: number;
  fuelLevel: number;
  operatorName?: string;
  vesselName: string;
  tankName: string;
  area: number;
  fillPercentage: number;
  fillStatus: string;
  detectedFluid: string;
}

interface DataContextType {
  tankSettings: Record<string, TankSettings[]>;
  fluidDatabase: FluidDatabase;
  tankData: TankData[];
  supabaseClient: any;
  saveTankSettings: (email: string, settings: TankSettings[]) => Promise<void>;
  updateFluidDatabase: (fluids: FluidDatabase) => Promise<void>;
  addTankData: (data: Omit<TankData, 'id'>) => Promise<void>;
  syncToCloud: () => Promise<void>;
  fetchUserData: (email: string) => Promise<void>;
  getTankSettingsForUser: (email: string) => TankSettings[];
  detectFluid: (density: number) => string;
  calculateFillStatus: (
    percentage: number,
    thresholds: Pick<TankSettings, 'lowFillThreshold' | 'halfFillThreshold' | 'highFillThreshold' | 'overflowThreshold'>
  ) => { status: string; color: string };
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tankSettings, setTankSettings] = useState<Record<string, TankSettings[]>>({});
  const [fluidDatabase, setFluidDatabase] = useState<FluidDatabase>(getDefaultFluidDatabase());
  const [tankData, setTankData] = useState<TankData[]>([]);
  const [supabaseClient, setSupabaseClient] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    setSupabaseClient(supabase);
    
    // Test Supabase connection on initialization
    const testConnection = async () => {
      console.log('🔍 Testing Supabase connection on app start...');
      const result = await testSupabaseConnection();
      if (!result.success) {
        console.error('❌ Supabase connection test failed:', result.message);
        setError(result.message);
      } else {
        console.log('✅ Supabase connection test passed!');
        // Run diagnostics to check all tables
        await runDiagnostics();
      }
    };
    
    testConnection();
  }, []);

  // Initialize data from localStorage for offline functionality
  useEffect(() => {
    const storedSettings = localStorage.getItem('glence_tank_settings');
    if (storedSettings) {
      setTankSettings(JSON.parse(storedSettings));
    }

    const storedFluids = localStorage.getItem('glence_fluid_database');
    if (storedFluids) {
      setFluidDatabase(JSON.parse(storedFluids));
    } else {
      // Initialize with default fluids if none exist in storage
      const defaultFluids = getDefaultFluidDatabase();
      setFluidDatabase(defaultFluids);
      localStorage.setItem('glence_fluid_database', JSON.stringify(defaultFluids));
    }

    const storedData = localStorage.getItem('glence_tank_data');
    if (storedData) {
      setTankData(JSON.parse(storedData));
    }
  }, []);

  // Fetch user data when logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUserData(currentUser);
    }
  }, [isAuthenticated, currentUser]);

  const fetchUserData = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch tank settings
      const { data: tankSettingsData, error: settingsError } = await getTankSettingsFromSupabase(email);
      if (settingsError) {
        console.error('Error fetching tank settings:', settingsError);
      } else if (tankSettingsData) {
        const updatedSettings = { ...tankSettings, [email]: tankSettingsData };
        setTankSettings(updatedSettings);
        localStorage.setItem('glence_tank_settings', JSON.stringify(updatedSettings));
      }

      // Fetch tank data
      const { data: tankDataResult, error: dataError } = await getTankDataFromSupabase(email);
      if (dataError) {
        console.error('Error fetching tank data:', dataError);
      } else if (tankDataResult) {
        setTankData(tankDataResult);
        localStorage.setItem('glence_tank_data', JSON.stringify(tankDataResult));
      }

      // Fetch fluid database
      const { data: fluidData, error: fluidError } = await getFluidDatabaseFromSupabase(email);
      if (fluidError) {
        console.error('Error fetching fluid database:', fluidError);
      } else if (fluidData && Object.keys(fluidData).length > 0) {
        setFluidDatabase(fluidData);
        localStorage.setItem('glence_fluid_database', JSON.stringify(fluidData));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const saveTankSettings = async (email: string, settings: TankSettings[]) => {
    setLoading(true);
    setError(null);
    try {
      // Save to Supabase
      const { error: supabaseError } = await saveTankSettingsToSupabase(email, settings);
      if (supabaseError) {
        throw supabaseError;
      }

      // Update local state and localStorage
      const updatedSettings = { ...tankSettings, [email]: settings };
      setTankSettings(updatedSettings);
      localStorage.setItem('glence_tank_settings', JSON.stringify(updatedSettings));
    } catch (err) {
      console.error('Error saving tank settings:', err);
      setError('Failed to save tank settings');
      // Still update local storage for offline functionality
      const updatedSettings = { ...tankSettings, [email]: settings };
      setTankSettings(updatedSettings);
      localStorage.setItem('glence_tank_settings', JSON.stringify(updatedSettings));
    } finally {
      setLoading(false);
    }
  };

  const updateFluidDatabase = async (fluids: FluidDatabase) => {
    setLoading(true);
    setError(null);
    try {
      if (currentUser) {
        // Save to Supabase
        const { error: supabaseError } = await saveFluidDatabaseToSupabase(currentUser, fluids);
        if (supabaseError) {
          throw supabaseError;
        }
      }

      // Update local state and localStorage
      setFluidDatabase(fluids);
      localStorage.setItem('glence_fluid_database', JSON.stringify(fluids));
    } catch (err) {
      console.error('Error updating fluid database:', err);
      setError('Failed to update fluid database');
      // Still update local storage for offline functionality
      setFluidDatabase(fluids);
      localStorage.setItem('glence_fluid_database', JSON.stringify(fluids));
    } finally {
      setLoading(false);
    }
  };

  const addTankData = async (data: Omit<TankData, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newData: TankData = {
        ...data,
        id: Date.now().toString(),
      };

      if (currentUser) {
        // Save to Supabase
        const { error: supabaseError } = await saveTankDataToSupabase(currentUser, newData);
        if (supabaseError) {
          throw supabaseError;
        }
      }

      // Update local state and localStorage
      const updatedData = [...tankData, newData];
      setTankData(updatedData);
      localStorage.setItem('glence_tank_data', JSON.stringify(updatedData));
    } catch (err) {
      console.error('Error adding tank data:', err);
      setError('Failed to add tank data');
      // Still update local storage for offline functionality
      const newData: TankData = {
        ...data,
        id: Date.now().toString(),
      };
      const updatedData = [...tankData, newData];
      setTankData(updatedData);
      localStorage.setItem('glence_tank_data', JSON.stringify(updatedData));
    } finally {
      setLoading(false);
    }
  };

  const syncToCloud = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      // Sync tank settings
      const userSettings = tankSettings[currentUser] || [];
      if (userSettings.length > 0) {
        await saveTankSettingsToSupabase(currentUser, userSettings);
      }

      // Sync fluid database
      if (Object.keys(fluidDatabase).length > 0) {
        await saveFluidDatabaseToSupabase(currentUser, fluidDatabase);
      }

      // Sync tank data (this would be done individually when adding data)
      console.log('Data synced to cloud successfully');
    } catch (err) {
      console.error('Failed to sync to cloud:', err);
      setError('Failed to sync data to cloud');
    } finally {
      setLoading(false);
    }
  };

  const getTankSettingsForUser = (email: string): TankSettings[] => {
    return tankSettings[email] || [];
  };

  const detectFluid = (density: number): string => {
    for (const [fluid, range] of Object.entries(fluidDatabase)) {
      if (density >= range.min && density <= range.max) {
        return fluid;
      }
    }
    return 'Unknown Fluid';
  };

  const calculateFillStatus = (
    percentage: number,
    thresholds: Pick<
      TankSettings,
      'lowFillThreshold' | 'halfFillThreshold' | 'highFillThreshold' | 'overflowThreshold'
    >
  ): { status: string; color: string } => {
    if (percentage >= thresholds.overflowThreshold.min && percentage <= thresholds.overflowThreshold.max) {
      return { status: 'Overflowing', color: '#ef4444' };
    }
    if (percentage >= thresholds.highFillThreshold.min && percentage <= thresholds.highFillThreshold.max) {
      return { status: 'Overfull', color: '#f97316' };
    }
    if (percentage >= thresholds.halfFillThreshold.min && percentage <= thresholds.halfFillThreshold.max) {
      return { status: 'Half Filled', color: '#10b981' };
    }
    if (percentage >= thresholds.lowFillThreshold.min && percentage <= thresholds.lowFillThreshold.max) {
      return { status: 'Low', color: '#f59e0b' };
    }
    return { status: 'Very Low', color: '#6b7280' };
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
        fetchUserData,
        getTankSettingsForUser,
        detectFluid,
        calculateFillStatus,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
