// CustomerAlertsSheet.jsx - Just the sheet content without trigger
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useData } from "@/context/DataContext";

export function CustomerAlertsSheet({ isOpen, onOpenChange }) {
  // Alert data from DataContext
  const { alerts, selectedUserId, setSelectedUserId } = useData(); // Added setSelectedUserId

  // Extract customers from alerts
  const customers = alerts.map((alert) => ({
    id: alert.userId, // Use the alert ID as user ID
    name: alert.customer,
    customerId: alert.customerId,
    severity: alert.severity,
    accountType: alert.accountType,
    location: alert.location,
    riskScore: alert.riskScore,
  }));

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      case "Medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return "text-red-600 font-semibold";
    if (score >= 60) return "text-orange-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  // Handle customer card click
  const handleCustomerClick = (customerId) => {
    setSelectedUserId(customerId);
    // Optionally close the sheet after selection
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">
            Customer Alert List
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Customers with active alerts requiring investigation. Total:{" "}
            {customers.length} customers
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="space-y-4">
            {customers.map((customer, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer ${
                  selectedUserId === customer.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleCustomerClick(customer.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {customer.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                        customer.severity
                      )}`}
                    >
                      {customer.severity}
                    </span>
                    <span
                      className={`text-sm ${getRiskScoreColor(
                        customer.riskScore
                      )}`}
                    >
                      Risk: {customer.riskScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium text-gray-700">
                      Customer ID:
                    </span>
                    <p className="font-mono text-blue-600">
                      {customer.customerId}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Account Type:
                    </span>
                    <p className="capitalize">{customer.accountType}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Location:</span>
                    <p>{customer.location}</p>
                  </div>
                </div>

                {/* Individual Open button for each customer */}
                <div className="flex justify-end">
                  <Link href={`/user-details/${customer.id}`}>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when button is clicked
                        handleCustomerClick(customer.id);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="flex gap-2 pt-4 border-t">
          <Button variant="default" className="bg-green-600 hover:bg-green-700">
            Export All
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// CustomerAlertsButton.jsx - Separate button component
export function CustomerAlertsButton({ onClick, alertCount = 5 }) {
  const { alerts, selectedUserId } = useData(); // Assuming you have a hook to fetch alerts

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
    >
      View Customer Alerts ({alerts.length})
    </Button>
  );
}

// Example usage in your main component:
/* 
import { useState } from 'react'
import { CustomerAlertsSheet, CustomerAlertsButton } from '@/components/CustomerAlerts'

export default function YourPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <div>
      <CustomerAlertsButton 
        onClick={() => setIsSheetOpen(true)} 
        alertCount={5} 
      />
      
      <CustomerAlertsSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </div>
  )
}
*/