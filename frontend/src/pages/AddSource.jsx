import React, { useState, useEffect } from "react";
import { TransactionSource } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, CreditCard, ArrowLeft, X, Check, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddSource() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || "bank";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvName, setCsvName] = useState("");
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState(null);
  
  useEffect(() => {
    // Update the tab if the URL changes
    const tab = queryParams.get('tab');
    if (tab && (tab === "bank" || tab === "csv")) {
      setActiveTab(tab);
    }
  }, [location.search]);
  
  const handleTabChange = (value) => {
    setActiveTab(value);
    // Update URL without navigation
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('tab', value);
    window.history.pushState({}, '', newUrl);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setCsvName(file.name.replace(".csv", ""));
      setStep(2);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setCsvName(file.name.replace(".csv", ""));
      setStep(2);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleCancel = () => {
    setCsvFile(null);
    setCsvName("");
    setStep(1);
    setError(null);
  };
  
  const handleSubmit = async () => {
    if (!csvFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would upload and process the CSV
      // For now, we'll just create a source record
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
      
      await TransactionSource.create({
        name: csvName || "CSV Import",
        type: "csv",
        status: "active",
        last_sync: new Date().toISOString()
      });
      
      setStep(3); // Success step
    } catch (error) {
      console.error("Error processing CSV:", error);
      setError(`Error: ${error.message || "File processing failed. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    // This would open the bank's login flow in a real implementation
    // For now, we just show the coming soon message
  };
  
  const renderBankList = () => {
    const uaeBanks = [
      { id: 1, name: "Emirates NBD", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Emirates_NBD_Logo.svg/1200px-Emirates_NBD_Logo.svg.png" },
      { id: 2, name: "Abu Dhabi Commercial Bank", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/ADCB_Logo.svg/1200px-ADCB_Logo.svg.png" },
      { id: 3, name: "Dubai Islamic Bank", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Dubai_Islamic_Bank_logo.svg/1200px-Dubai_Islamic_Bank_logo.svg.png" },
      { id: 4, name: "Mashreq Bank", logo: "https://1000logos.net/wp-content/uploads/2020/04/Mashreq-Logo.png" },
      { id: 5, name: "First Abu Dhabi Bank", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/First_Abu_Dhabi_Bank_logo.svg/1200px-First_Abu_Dhabi_Bank_logo.svg.png" }
    ];
    
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Bank connections are coming soon. Please use CSV import for now.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          {uaeBanks.map(bank => (
            <div
              key={bank.id}
              className="flex items-center p-3 rounded-lg border border-gray-200 cursor-not-allowed opacity-70"
            >
              <div className="w-10 h-10 rounded mr-3 flex items-center justify-center overflow-hidden bg-white">
                <img src={bank.logo} alt={bank.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{bank.name}</p>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-gray-100">
                Coming soon
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderCsvUpload = () => {
    if (step === 1) {
      return (
        <div 
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#006D77] transition-colors cursor-pointer"
          onClick={() => document.getElementById('csv-upload').click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center">
            <div className="bg-[#E7ECEF] p-4 rounded-full mb-4">
              <Upload className="w-8 h-8 text-[#006D77]" />
            </div>
            <h3 className="font-medium text-lg">Drag and drop your CSV file</h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto mt-2">
              Or click to browse your files. We support exports from all major UAE banks
            </p>
          </div>
        </div>
      );
    }
    
    if (step === 2) {
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="sourceName">Source Name</Label>
            <Input
              id="sourceName"
              value={csvName}
              onChange={(e) => setCsvName(e.target.value)}
              placeholder="My Bank CSV"
              className="mt-1 bg-white/50 backdrop-blur-sm border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will help you identify this data source
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#E7ECEF] rounded-lg flex items-center justify-center mr-3">
                <Upload className="w-5 h-5 text-[#006D77]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{csvFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(csvFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={handleCancel}
              className="flex-1 glass-card !border-white/30 text-[var(--text-primary)]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleSubmit}
              className="flex-1 btn-gradient btn-gradient-primary"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload and Process"}
            </Button>
          </div>
        </div>
      );
    }
    
    if (step === 3) {
      return (
        <div className="text-center py-8">
          <div className="bg-[#006D77] p-5 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
          <p className="text-gray-600 mb-6">
            Your CSV file has been uploaded and processed successfully
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Sources"))}
            className="btn-gradient btn-gradient-primary"
          >
            View All Sources
          </Button>
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-[var(--surface)] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Sources"))}
            className="glass-card !p-2 !rounded-lg hover:!shadow-md text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add Account Source</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Connect a bank account or upload a CSV file
            </p>
          </div>
        </div>
        
        {error && (
          <Alert className="mb-4 glass-card !bg-red-500/20 !border-red-500/40 text-red-700 p-4 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid grid-cols-2 mb-6 glass-card !rounded-lg p-1">
            <TabsTrigger value="bank" className="text-sm data-[state=active]:btn-gradient-primary data-[state=active]:text-white data-[state=inactive]:text-[var(--text-secondary)] rounded-md py-2 hover:bg-white/20">
              <CreditCard className="w-4 h-4 mr-2" />
              Connect Bank
            </TabsTrigger>
            <TabsTrigger value="csv" className="text-sm data-[state=active]:btn-gradient-primary data-[state=active]:text-white data-[state=inactive]:text-[var(--text-secondary)] rounded-md py-2 hover:bg-white/20">
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank" className="p-6 glass-card">
            {renderBankList()}
          </TabsContent>
          
          <TabsContent value="csv" className="p-6 glass-card">
            {renderCsvUpload()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}