"use client";


// In your page component
import { useState } from "react";
import {
  CustomerAlertsSheet,
  CustomerAlertsButton,
} from "@/components/UsersDrawer";
import { UserAlertDetail } from "@/components/UserInfo";
import { useData } from "@/context/DataContext";

export default function YourPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { alerts, selectedUserId } = useData(); // Assuming you have a hook to fetch alerts

  return (
    <div>
      {/* Button can be anywhere */}
      <CustomerAlertsButton
        alerts={alerts}
        onClick={() => setIsSheetOpen(true)}
        alertCount={5}
      />
      {/* Sheet is controlled by state */}
      <CustomerAlertsSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
      <UserAlertDetail userId={selectedUserId} />
    </div>
  );
}
