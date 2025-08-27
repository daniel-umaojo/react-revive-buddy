
"use client"


import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, MapPin, Calendar, DollarSign, Shield, Activity, User, CreditCard } from "lucide-react"
import { useState } from "react";


export function UserAlertDetail({ userId }) {

    
  // Alert data from DataContext
  const alertsData = [
    {
      "_id": "68859fc3a7a71ad9a9ddfde9",
      "id": "68859fc3a7a71ad9a9ddfde9",
      "type": "Crypto Conversion",
      "severity": "High",
      "customer": "Elena Rodriguez",
      "customerId": "CUST-04425",
      "userId": "6885972f358cd4b6a9ee00a0",
      "amount": "151093",
      "timestamp": "7/22/2025",
      "location": "Andorra",
      "accountType": "PEP",
      "monitoringType": "Post-transaction",
      "riskScore": 71,
      "riskFactors": [
        "Conversion to privacy coins detected",
        "Cryptocurrency mixer usage identified",
        "Anonymous wallet transactions flagged",
        "Digital asset regulatory concerns"
      ],
      "description": "Cryptocurrency transactions involving privacy coins, mixers, or anonymous wallets.",
      "status": "Open",
      "aiScore": 9,
      "deviceFingerprint": "DEV-tpu2wdryh",
      "geoLocation": "Andorra",
      "relatedAlerts": 4,
      "escalationLevel": "Senior Analyst",
      "transactionReference": "TXN-00042278",
      "transactionDetails": "SWIFT: DEUTGB2L"
    },
    {
      "_id": "68859fc3a7a71ad9a9ddfdeb",
      "id": "68859fc3a7a71ad9a9ddfdeb",
      "type": "Unusual Transaction Size",
      "severity": "Low",
      "customer": "Michael Chen",
      "customerId": "CUST-46681",
      "userId": "6885972f358cd4b6a9ee00a1",
      "amount": "244801",
      "timestamp": "7/21/2025",
      "location": "Miami, FL",
      "accountType": "Business",
      "monitoringType": "Batch",
      "riskScore": 34,
      "riskFactors": [
        "Transaction amount 500% above customer average",
        "Single transaction exceeds annual income declared",
        "Amount inconsistent with business type",
        "Sudden spike in transaction values"
      ],
      "description": "Transaction amount significantly deviates from customer's established pattern and risk profile.",
      "status": "Open",
      "aiScore": 77,
      "deviceFingerprint": "DEV-o49utvai4",
      "geoLocation": "Miami, FL",
      "relatedAlerts": 0,
      "escalationLevel": "Junior Analyst",
      "transactionReference": "TXN-00052695",
      "transactionDetails": "SWIFT: DEUTGB2L"
    },
    {
      "_id": "68859fc3a7a71ad9a9ddfdea",
      "id": "68859fc3a7a71ad9a9ddfdea",
      "type": "Third-Party Payment Systems",
      "severity": "High",
      "customer": "James Wilson",
      "customerId": "CUST-65025",
      "userId": "6885972f358cd4b6a9ee00a3",
      "amount": "183622",
      "timestamp": "7/23/2025",
      "location": "Hong Kong",
      "accountType": "PEP",
      "monitoringType": "Real-time",
      "riskScore": 92,
      "riskFactors": [
        "Transactions through unregulated fintech",
        "E-wallet transfers to high-risk entities",
        "Payment aggregator red flags",
        "Non-bank payment service concerns"
      ],
      "description": "Transactions through unregulated fintech or e-wallet systems raising oversight concerns.",
      "status": "Open",
      "aiScore": 36,
      "deviceFingerprint": "DEV-vjwtntcpy",
      "geoLocation": "Hong Kong",
      "relatedAlerts": 3,
      "escalationLevel": "Senior Analyst",
      "transactionReference": "TXN-00063760",
      "transactionDetails": "SWIFT: DEUTGB2L"
    },
    {
      "_id": "68859fc3a7a71ad9a9ddfdec",
      "id": "68859fc3a7a71ad9a9ddfdec",
      "type": "Crypto Conversion",
      "severity": "Medium",
      "customer": "Priya Patel",
      "customerId": "CUST-71611",
      "userId": "6885972f358cd4b6a9ee009e",
      "amount": "239837",
      "timestamp": "7/20/2025",
      "location": "Luxembourg",
      "accountType": "High-Risk",
      "monitoringType": "Post-transaction",
      "riskScore": 61,
      "riskFactors": [
        "Conversion to privacy coins detected",
        "Cryptocurrency mixer usage identified",
        "Anonymous wallet transactions flagged",
        "Digital asset regulatory concerns"
      ],
      "description": "Cryptocurrency transactions involving privacy coins, mixers, or anonymous wallets.",
      "status": "Open",
      "aiScore": 95,
      "deviceFingerprint": "DEV-w0h5x08gl",
      "geoLocation": "Luxembourg",
      "relatedAlerts": 2,
      "escalationLevel": "Analyst",
      "transactionReference": "TXN-00051826",
      "transactionDetails": "SWIFT: DEUTGB2L"
    },
    {
      "_id": "68859fc3a7a71ad9a9ddfded",
      "id": "68859fc3a7a71ad9a9ddfded",
      "type": "Device Anomaly",
      "severity": "Medium",
      "customer": "Lisa Anderson",
      "customerId": "CUST-46583",
      "userId": "6885972f358cd4b6a9ee009c",
      "amount": "197038",
      "timestamp": "7/23/2025",
      "location": "Monaco",
      "accountType": "High-Risk",
      "monitoringType": "Post-transaction",
      "riskScore": 88,
      "riskFactors": [
        "Multiple transactions just under £10,000",
        "Systematic deposit splitting detected",
        "Pattern consistent with threshold avoidance",
        "Coordinated transactions across locations"
      ],
      "description": "Suspicious activity detected requiring investigation.",
      "status": "Open",
      "aiScore": 61,
      "deviceFingerprint": "DEV-d64ih1xm8",
      "geoLocation": "Monaco",
      "relatedAlerts": 0,
      "escalationLevel": "Analyst",
      "transactionReference": "TXN-00060679",
      "transactionDetails": "SWIFT: DEUTGB2L"
    }
  ];

  // Find all alerts that match the userId
  const userAlerts = alertsData.filter(alert => alert.userId === userId);

  // If no alerts found for the userId
  if (!userAlerts || userAlerts.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-600">No alerts exist for User ID: {userId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-orange-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {userAlerts.map((userAlert, alertIndex) => (
        <div key={userAlert._id || alertIndex} className="space-y-6">
          {userAlerts.length > 1 && (
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                Alert {alertIndex + 1} of {userAlerts.length}
              </Badge>
            </div>
          )}
          
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{userAlert.customer}</CardTitle>
                    <CardDescription className="text-lg">
                      {userAlert.customerId} • {userAlert.type}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getSeverityColor(userAlert.severity)}>
                    {userAlert.severity} Risk
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(userAlert.status)}>
                    {userAlert.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Alert Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaction Amount</p>
                    <p className="text-2xl font-bold">${Number(userAlert.amount).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Score</p>
                    <p className={`text-2xl font-bold ${getRiskScoreColor(userAlert.riskScore)}`}>
                      {userAlert.riskScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Score</p>
                    <p className="text-2xl font-bold text-blue-600">{userAlert.aiScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Related Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{userAlert.relatedAlerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer ID</p>
                    <p className="font-mono text-blue-600">{userAlert.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">User ID</p>
                    <p className="font-mono text-gray-800">{userAlert.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Type</p>
                    <p className="capitalize">{userAlert.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Escalation Level</p>
                    <p>{userAlert.escalationLevel}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Location:</span>
                  <span>{userAlert.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Timestamp:</span>
                  <span>{userAlert.timestamp}</span>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Transaction Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transaction Reference</p>
                  <p className="font-mono text-blue-600">{userAlert.transactionReference}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Transaction Details</p>
                  <p className="font-mono">{userAlert.transactionDetails}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Device Fingerprint</p>
                  <p className="font-mono">{userAlert.deviceFingerprint}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Monitoring Type</p>
                  <p>{userAlert.monitoringType}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Risk Factors</span>
              </CardTitle>
              <CardDescription>{userAlert.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userAlert.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{factor}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Investigate Alert
                </Button>
                <Button variant="outline">
                  Add Investigation Note
                </Button>
                <Button variant="outline">
                  Escalate Case
                </Button>
                <Button variant="outline">
                  View Transaction History
                </Button>
                {userAlert.status === 'Open' && (
                  <Button variant="destructive">
                    Close Alert
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Separator for multiple alerts */}
          {alertIndex < userAlerts.length - 1 && (
            <div className="border-t-2 border-gray-200 my-8"></div>
          )}
        </div>
      ))}
    </div>
  );
}

// Example usage with different userIds
export default function UserAlertDetailDemo() {
  const [selectedUserId, setSelectedUserId] = useState("6885972f358cd4b6a9ee00a0");
  
  const userIds = [
    "6885972f358cd4b6a9ee00a0", // Elena Rodriguez
    "6885972f358cd4b6a9ee00a1", // Michael Chen
    "6885972f358cd4b6a9ee00a3", // James Wilson
    "6885972f358cd4b6a9ee009e", // Priya Patel
    "6885972f358cd4b6a9ee009c"  // Lisa Anderson
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">User Alert Detail Demo</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {userIds.map(userId => (
            <Button
              key={userId}
              variant={selectedUserId === userId ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUserId(userId)}
            >
              {userId.slice(-4)}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedUserId("nonexistent")}
          >
            No Match
          </Button>
        </div>
      </div>
      
      <UserAlertDetail userId={selectedUserId} />
    </div>
  );
}