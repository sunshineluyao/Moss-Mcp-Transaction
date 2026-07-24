import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Activity, 
  Loader2, 
  Copy, 
  Check, 
  ShieldAlert,
  ServerCrash,
  CheckCircle2
} from "lucide-react";
import { simulateMCP } from "@/lib/mockMcp";
import { MCPSimulationResult, SimulationFormParams, OperationType, ScenarioType } from "@/types/mcp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper to truncate addresses
function truncateAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Reusable Address Display component
function AddressDisplay({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 group">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono text-sm bg-background/50 px-2 py-1 rounded border cursor-help">
              {truncateAddress(address)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{address}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button 
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
        aria-label="Copy address"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Status Timeline Component
function StatusTimeline({ currentStatus }: { currentStatus: MCPSimulationResult["status"] }) {
  const allStates = ["IDLE", "AWAITING_SIGNATURE", "PENDING", "CONFIRMING", "CONFIRMED"];
  
  // Failure states replace everything after AWAITING_SIGNATURE in a real app,
  // but for the visual timeline, we'll map them appropriately.
  let activeIndex = allStates.indexOf(currentStatus);
  let isFailure = false;
  let failureLabel = "";

  if (currentStatus === "REJECTED" || currentStatus === "REVERTED" || currentStatus === "SYSTEM_ERROR") {
    activeIndex = 2; // Override the step after awaiting signature
    isFailure = true;
    failureLabel = currentStatus.replace("_", " ");
  }

  if (activeIndex === -1) activeIndex = 0;

  const steps = [
    { label: "Generated", icon: Activity, desc: "Simulation run" },
    { label: "Awaiting", icon: ShieldCheck, desc: "User signature" },
    isFailure 
      ? { 
          label: failureLabel, 
          icon: currentStatus === "SYSTEM_ERROR" ? ServerCrash : (currentStatus === "REJECTED" ? XCircle : AlertTriangle),
          desc: "Terminal state",
          failed: true
        }
      : { label: "Pending", icon: Loader2, desc: "Submitted to chain" },
    { label: "Confirming", icon: Activity, desc: "Waiting for blocks" },
    { label: "Confirmed", icon: CheckCircle, desc: "Success" }
  ];

  // Trim the timeline if failed
  const visibleSteps = isFailure ? steps.slice(0, 3) : steps;

  return (
    <div className="mt-6 flex flex-col md:flex-row justify-between w-full relative">
      {visibleSteps.map((step, idx) => {
        const isActive = idx <= activeIndex;
        const isCurrent = idx === activeIndex;
        const Icon = step.icon;
        
        let colorClass = isActive ? "text-primary border-primary" : "text-muted-foreground border-border";
        let bgClass = isActive ? "bg-primary/10" : "bg-card";
        
        if (step.failed && isCurrent) {
          colorClass = "text-destructive border-destructive";
          bgClass = "bg-destructive/10";
        } else if (isCurrent && step.label !== "Confirmed" && !step.failed) {
          colorClass = "text-amber-400 border-amber-500/50";
          bgClass = "bg-amber-500/10";
        }

        return (
          <div key={idx} className="flex flex-col items-center relative z-10 flex-1 mb-4 md:mb-0">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${colorClass} ${bgClass} transition-colors duration-500`}>
              <Icon className={`w-5 h-5 ${isCurrent && step.label === "Pending" ? "animate-spin" : ""}`} />
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 text-center max-w-[80px] leading-tight">
              {step.desc}
            </div>
            {/* Connecting Line */}
            {idx < visibleSteps.length - 1 && (
              <div className="hidden md:block absolute top-5 left-[50%] w-full h-[2px] -z-10 bg-border">
                <div 
                  className={`h-full transition-all duration-700 ${isActive && idx < activeIndex ? (step.failed ? "bg-destructive" : "bg-primary") : "bg-transparent"}`}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<SimulationFormParams>({
    accountAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    operationType: "ERC20 Transfer",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC mock
    recipientAddress: "0x111122223333444455556666777788889999aAaa",
    amount: 100,
    scenario: "Success"
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<MCPSimulationResult | null>(null);
  
  // Safety checks
  const [checks, setChecks] = useState({
    recipient: false,
    effect: false,
    amount: false,
    simulation: false,
    verify: false
  });

  const allChecked = Object.values(checks).every(Boolean);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setResult(null);
    setChecks({ recipient: false, effect: false, amount: false, simulation: false, verify: false });
    
    try {
      const res = await simulateMCP(form);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const isTerminal = result?.status === "REJECTED" || result?.status === "REVERTED" || result?.status === "SYSTEM_ERROR";

  return (
    <div className="min-h-screen bg-background w-full text-foreground pb-20 selection:bg-primary/30">
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight tracking-tight">Moss MCP Transaction Preview</h1>
              <p className="text-xs text-muted-foreground font-mono">Understand before you sign.</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono bg-background">DEV_MOCK_ENV</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT ZONE */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Simulation Parameters</h2>
            <p className="text-sm text-muted-foreground">Configure the mock transaction intent to see how the MCP decodes and assesses it.</p>
          </div>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Account Address</Label>
                <Input 
                  id="account" 
                  className="font-mono text-xs" 
                  value={form.accountAddress} 
                  onChange={(e) => setForm({ ...form, accountAddress: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>Operation Type</Label>
                <Select value={form.operationType} onValueChange={(v: OperationType) => setForm({ ...form, operationType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC20 Transfer">ERC20 Transfer</SelectItem>
                    <SelectItem value="ERC20 Approve">ERC20 Approve</SelectItem>
                    <SelectItem value="Mock Swap Preview">Mock Swap Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Token Address</Label>
                <Input 
                  id="token" 
                  className="font-mono text-xs" 
                  value={form.tokenAddress} 
                  onChange={(e) => setForm({ ...form, tokenAddress: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">{form.operationType === "ERC20 Approve" ? "Spender Address" : "Recipient Address"}</Label>
                <Input 
                  id="recipient" 
                  className="font-mono text-xs" 
                  value={form.recipientAddress} 
                  onChange={(e) => setForm({ ...form, recipientAddress: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    className="font-mono text-xs" 
                    value={form.amount} 
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mock Scenario</Label>
                  <Select value={form.scenario} onValueChange={(v: ScenarioType) => setForm({ ...form, scenario: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="User Rejected">User Rejected</SelectItem>
                      <SelectItem value="On-chain Reverted">On-chain Reverted</SelectItem>
                      <SelectItem value="System Error">System Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSimulate} 
                className="w-full mt-4 font-semibold shadow-lg shadow-primary/20" 
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  "Generate Preview"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* OUTPUT ZONE */}
        <div className="lg:col-span-8">
          {!result && !isSimulating && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl text-muted-foreground p-8 text-center bg-card/10">
              <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Simulation Active</h3>
              <p className="max-w-sm text-sm">Configure your parameters on the left and generate a preview to see the Moss MCP output.</p>
            </div>
          )}

          {isSimulating && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-border rounded-xl bg-card p-8 animate-in fade-in duration-500">
              <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-accent animate-[spin_1.5s_linear_reverse_infinite]"></div>
                <Activity className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-medium mb-2">Analyzing Intent...</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm font-mono">
                Tracing contract logic • Evaluating risk heuristics • Formatting receipt
              </p>
            </div>
          )}

          {result && !isSimulating && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              
              <Card className="overflow-hidden border-border shadow-2xl">
                {/* Status bar top edge */}
                <div className={`h-1 w-full ${isTerminal ? 'bg-destructive' : 'bg-primary'}`}></div>
                
                <CardHeader className="bg-card/50 border-b border-border/50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-[10px] bg-background">
                          {result.protocol}
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {result.method}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{result.intent}</CardTitle>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Confidence</div>
                      {result.confidenceLevel === "HIGH" && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 flex gap-1 items-center">
                          <CheckCircle2 className="w-3 h-3" /> HIGH
                        </Badge>
                      )}
                      {result.confidenceLevel === "MEDIUM" && (
                        <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 flex gap-1 items-center">
                          <AlertTriangle className="w-3 h-3" /> MEDIUM
                        </Badge>
                      )}
                      {result.confidenceLevel === "LOW" && (
                        <Badge variant="destructive" className="flex gap-1 items-center bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                          <ShieldAlert className="w-3 h-3" /> LOW
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    
                    {/* Left Col: Details & Params */}
                    <div className="p-6 space-y-6 bg-card/30">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Decoded Parameters
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(result.params).map(([key, val]) => (
                            <div key={key} className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground font-mono">{key}:</span>
                              {key === 'to' || key === 'token' ? (
                                <AddressDisplay address={val} />
                              ) : (
                                <span className="font-mono text-sm">{val}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {result.receiptTexts.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Simulated Outcome
                          </h4>
                          <ul className="space-y-2">
                            {result.receiptTexts.map((text, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="opacity-90">{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right Col: Risks & Warnings */}
                    <div className="p-6 space-y-6">
                      
                      {/* Risk Labels */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Assessment</h4>
                        {result.riskLabels.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.riskLabels.map(label => {
                              // Simple color logic based on keywords
                              let variant: "destructive" | "warning" | "success" | "outline" = "outline";
                              if (label.includes("UNLIMITED") || label.includes("UNVERIFIED") || label.includes("REVERT")) variant = "destructive";
                              else if (label.includes("LARGE") || label.includes("SLIPPAGE")) variant = "warning";
                              else if (label.includes("VERIFIED")) variant = "success";

                              return (
                                <Badge key={label} variant={variant} className="font-mono text-[10px]">
                                  {label}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-400 flex items-center gap-2 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" /> No specific risk labels triggered.
                          </div>
                        )}
                      </div>

                      {/* Warnings */}
                      {result.warnings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Important Warnings
                          </h4>
                          <div className="space-y-2">
                            {result.warnings.map((warning, i) => (
                              <div key={i} className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive-foreground">
                                {warning}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Safety Checklist Footer */}
                <CardFooter className="bg-background/50 border-t border-border/50 p-6 flex flex-col items-start gap-4">
                  <h4 className="text-sm font-semibold text-foreground">Pre-signature Safety Checklist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {[
                      { id: "recipient", label: "I verified the recipient address" },
                      { id: "effect", label: "I understand this operation's effect" },
                      { id: "amount", label: "I reviewed the amount and token" },
                      { id: "simulation", label: "I am aware this is a simulation only" },
                      { id: "verify", label: "I will verify again in my actual wallet" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={item.id} 
                          checked={checks[item.id as keyof typeof checks]}
                          onCheckedChange={(c) => setChecks(prev => ({ ...prev, [item.id]: !!c }))}
                          disabled={isTerminal}
                        />
                        <Label 
                          htmlFor={item.id} 
                          className={`text-sm font-normal cursor-pointer transition-opacity ${isTerminal ? "opacity-50" : ""}`}
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {!isTerminal && (
                    <div className="w-full mt-4 flex justify-end">
                      <Button 
                        disabled={!allChecked} 
                        className="font-semibold transition-all relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Proceed to Wallet <ShieldCheck className="w-4 h-4" />
                        </span>
                        {allChecked && (
                          <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        )}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>

              {/* Status Timeline */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transaction Lifecycle</h3>
                <StatusTimeline currentStatus={result.status} />
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Safety Notice Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-amber-500/10 border-t border-amber-500/20 text-amber-500/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-2 text-[10px] md:text-xs text-center font-medium">
          This demo is for transaction preview and learning only. It does not sign transactions, broadcast transactions, store private keys, or provide financial advice.
        </div>
      </div>
    </div>
  );
}
