"use client";
import { useState, useEffect } from "react";
import { AuthPage } from "@/components/AuthPage";
import { Dashboard } from "@/components/Dashboard";
import { SettingsPage } from "@/components/SettingsPage";
import { InputVolumePage } from "@/components/InputVolumePage";
import { PredictionPage } from "@/components/PredictionPage";
import { ChartsPage } from "@/components/ChartsPage";
import { Sidebar } from "@/components/Sidebar";
import { TankSetupModal } from "@/components/TankSetupModal";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider, useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const { getTankSettingsForUser } = useData();
  const { currentTheme } = useTheme();
  const [currentSection, setCurrentSection] = useState("Input and Volume");
  const [showTankSetup, setShowTankSetup] = useState(false);

  // Mapping object to convert URL tab parameters to section names
  const tabToSectionMap = {
    "input-and-volume": "Input and Volume",
    "prediction-tools": "Prediction Tool", 
    "volume-chart": "Volume Chart",
    "settings": "Settings"
  };

  // Valid tab parameters that we accept
  const validTabs = Object.keys(tabToSectionMap);

  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    
    // Set current section based on tab parameter if valid
    if (tabParam && validTabs.includes(tabParam)) {
      setCurrentSection(tabToSectionMap[tabParam]);
    }
  }, [validTabs]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const userTankSettings = getTankSettingsForUser(currentUser);
      if (userTankSettings.length === 0) {
        setShowTankSetup(true);
      }
    }
  }, [isAuthenticated, currentUser, getTankSettingsForUser]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }


  const renderCurrentSection = () => {
    switch (currentSection) {
      case "Settings":
        return <SettingsPage />;
      case "Input and Volume":
        return <InputVolumePage />;
      case "Prediction Tool":
        return <PredictionPage />;
      case "Volume Chart":
        return <ChartsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className="flex min-h-screen transition-all duration-300"
      style={{
        backgroundColor: currentTheme.colors.background,
      }}
    >
      {/* <Sidebar
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      /> */}
      <main
        className="flex-1 p-6"
        style={{
          backgroundColor: currentTheme.colors.background,
        }}
      >
        {renderCurrentSection()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


  // if (showTankSetup && currentUser) {
  //   return (
  //     <TankSetupModal
  //       email={currentUser}
  //       onComplete={() => setShowTankSetup(false)}
  //     />
  //   );
  // }
