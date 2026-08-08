import React, { useState, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Info,
  Activity,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
  ServerCrash,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SquareCheck,
  Zap,
  Network,
  Bot,
  Cpu,
  Lock,
  CircleDot,
  RotateCcw,
  Square,
  Droplets,
} from "lucide-react";

// ── Mock simulation (original) ────────────────────────────────────────────────
import { simulateMCP } from "@/lib/mockMcp";
import { MCPSimulationResult, SimulationFormParams, OperationType, ScenarioType } from "@/types/mcp";

// ── Live Monad preview (new) ──────────────────────────────────────────────────
import { usePreview } from "@/lib/api";
import type { PreviewArtifact, McpTraceEntry } from "@/types/preview";

// ── Shared UI components ──────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Constants ─────────────────────────────────────────────────────────────────
const MOSS_MCP_GITHUB = "https://github.com/nishuzumi/moss/tree/main/packages/mcp-server";
const MONAD_EXPLORER  = "https://testnet.monadexplorer.com";
const MOSS_DOCS_URL   = "https://docs.moss.ag";

const SAFETY_TEXT =
  "This demo is for transaction preview and learning only. It does not sign transactions, broadcast transactions, store private keys, or provide financial advice.";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function truncateAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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
          <TooltipContent><p className="font-mono text-xs">{address}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Copy address">
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground mt-1 leading-snug">{children}</p>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL MOCK SIMULATION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatusTimeline({ currentStatus }: { currentStatus: MCPSimulationResult["status"] }) {
  type StepDef = { label: string; icon: React.ElementType; desc: string; failed?: boolean };
  let steps: StepDef[];
  let activeIndex: number;

  if (currentStatus === "SYSTEM_ERROR") {
    steps = [
      { label: "Generated", icon: Activity, desc: "Simulation run" },
      { label: "System Error", icon: ServerCrash, desc: "RPC / integration failure — not an on-chain event", failed: true },
    ];
    activeIndex = 1;
  } else if (currentStatus === "REJECTED") {
    steps = [
      { label: "Generated", icon: Activity, desc: "Simulation run" },
      { label: "Awaiting", icon: ShieldCheck, desc: "User signature" },
      { label: "Rejected", icon: XCircle, desc: "Rejected — nothing submitted on-chain", failed: true },
    ];
    activeIndex = 2;
  } else if (currentStatus === "REVERTED") {
    steps = [
      { label: "Generated", icon: Activity, desc: "Simulation run" },
      { label: "Awaiting", icon: ShieldCheck, desc: "User signature" },
      { label: "Pending", icon: Loader2, desc: "Submitted to chain" },
      { label: "Confirming", icon: Activity, desc: "Waiting for blocks" },
      { label: "Reverted", icon: AlertTriangle, desc: "Reverted — tx submitted but failed on-chain", failed: true },
    ];
    activeIndex = 4;
  } else {
    const normalStates = ["IDLE", "AWAITING_SIGNATURE", "PENDING", "CONFIRMING", "CONFIRMED"];
    steps = [
      { label: "Generated", icon: Activity, desc: "Simulation run" },
      { label: "Awaiting", icon: ShieldCheck, desc: "User signature" },
      { label: "Pending", icon: Loader2, desc: "Submitted to chain" },
      { label: "Confirming", icon: Activity, desc: "Waiting for blocks" },
      { label: "Confirmed", icon: CheckCircle, desc: "Success" },
    ];
    activeIndex = normalStates.indexOf(currentStatus);
    if (activeIndex === -1) activeIndex = 0;
  }

  return (
    <div className="mt-6 flex flex-col md:flex-row justify-between w-full relative">
      {steps.map((step, idx) => {
        const isActive = idx <= activeIndex;
        const isCurrent = idx === activeIndex;
        const Icon = step.icon;
        let colorClass = isActive ? "text-primary border-primary" : "text-muted-foreground border-border";
        let bgClass = isActive ? "bg-primary/10" : "bg-card";
        if (step.failed && isCurrent) { colorClass = "text-destructive border-destructive"; bgClass = "bg-destructive/10"; }
        else if (isCurrent && step.label === "Confirmed") { colorClass = "text-emerald-400 border-emerald-500/50"; bgClass = "bg-emerald-500/10"; }
        else if (isCurrent && !step.failed) { colorClass = "text-amber-400 border-amber-500/50"; bgClass = "bg-amber-500/10"; }
        return (
          <div key={idx} className="flex flex-col items-center relative z-10 flex-1 mb-4 md:mb-0">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${colorClass} ${bgClass} transition-colors duration-500`}>
              <Icon className={`w-5 h-5 ${isCurrent && step.label === "Pending" ? "animate-spin" : ""}`} />
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</div>
            <div className="text-[10px] text-muted-foreground mt-1 text-center max-w-[90px] leading-tight">{step.desc}</div>
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-5 left-[50%] w-full h-[2px] -z-10 bg-border">
                <div className={`h-full transition-all duration-700 ${isActive && idx < activeIndex ? (step.failed ? "bg-destructive" : "bg-primary") : "bg-transparent"}`} style={{ width: "100%" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusLegend() {
  const states = [
    { name: "Idle", def: "Simulation has been configured but not yet run." },
    { name: "Awaiting Signature", def: "Preview generated; waiting for the user to approve in their wallet." },
    { name: "Pending", def: "Transaction submitted to the chain; awaiting inclusion in a block." },
    { name: "Confirming", def: "Transaction is in a block; waiting for enough block confirmations." },
    { name: "Confirmed", def: "Transaction fully settled on-chain — success." },
    { name: "Rejected", def: "User or wallet declined to sign; nothing was submitted on-chain." },
    { name: "Reverted", def: "Transaction was submitted but the EVM execution failed on-chain." },
    { name: "System Error", def: "MCP/RPC/integration failure — not an on-chain event." },
  ];
  return (
    <div className="mt-6 border-t border-border/40 pt-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Info className="w-3.5 h-3.5" /> Status Legend
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {states.map((s) => (
          <div key={s.name} className="flex gap-2 text-xs">
            <span className="font-semibold text-foreground whitespace-nowrap">{s.name}:</span>
            <span className="text-muted-foreground">{s.def}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BilingualBox({ enTitle, enBody, zhTitle, zhBody }: { enTitle: string; enBody: string; zhTitle: string; zhBody: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider">{enTitle}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{enBody}</div>
        </div>
        <div className="p-4 space-y-1 bg-card/20">
          <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider">{zhTitle}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{zhBody}</div>
        </div>
      </div>
    </div>
  );
}

function WhatIsMossMCP() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border/60 bg-card/40">
      <button className="w-full text-left" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> What is Moss MCP?
            </CardTitle>
            <div className="flex items-center gap-2">
              <a href={MOSS_MCP_GITHUB} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-mono"
                onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-3 h-3" /> mcp-server
              </a>
              {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
          <CardDescription className="text-sm leading-relaxed mt-1">
            A Model Context Protocol server that decodes and risk-scores blockchain transactions — not an auto-trading bot.
          </CardDescription>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="pt-0 pb-5 px-6 space-y-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground leading-relaxed pt-4">
            <strong className="text-foreground">Moss MCP</strong> sits between your dApp and a Monad RPC node. It exposes a four-step lifecycle that a dApp or AI agent can call to understand a transaction before the user ever sees a signature prompt:
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground list-none">
            {[
              { step: "discover", desc: "Finds available on-chain actions for a wallet address." },
              { step: "load", desc: "Fetches the action manifest and resolves the ABI." },
              { step: "action", desc: "Constructs the unsigned transaction from user parameters." },
              { step: "simulate", desc: "Dry-runs the transaction and returns a structured risk report." },
            ].map((item) => (
              <li key={item.step} className="flex gap-3">
                <code className="font-mono text-primary text-xs px-1.5 py-0.5 bg-primary/10 rounded shrink-0 h-fit">{item.step}</code>
                <span>{item.desc}</span>
              </li>
            ))}
          </ol>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-md p-3 text-xs text-amber-400 leading-relaxed">
            <strong>Important:</strong> Moss MCP is a preview and risk-analysis tool. It does not automatically execute trades, approve transactions, or move funds on your behalf.
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function HowToReadPreview() {
  const fields = [
    { name: "Protocol", def: "The token standard or DeFi protocol the transaction targets (e.g. ERC20, Uniswap V3)." },
    { name: "Method", def: "The specific smart-contract function being called (e.g. transfer, approve)." },
    { name: "Intent", def: "A plain-English summary of what the transaction will do if signed." },
    { name: "Parameters", def: "The decoded input values passed to the contract function (addresses, amounts, etc.)." },
    { name: "Risk Labels", def: "Heuristic flags raised during simulation — red means high concern, amber means caution, green means low risk." },
    { name: "Warnings", def: "Specific advisories generated by the simulation engine explaining detected risks." },
    { name: "Confidence", def: "How certain the MCP is about its decoding — HIGH means well-known ABI, LOW means unverified contract." },
    { name: "Receipt Texts", def: "The predicted state changes on-chain if the transaction succeeds — treat as a simulated outcome, not a guarantee." },
  ];
  return (
    <Card className="border-border/60 bg-card/30">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <Info className="w-4 h-4" /> How to read this preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {fields.map((f) => (
            <div key={f.name} className="flex gap-2 text-xs">
              <span className="font-semibold text-foreground whitespace-nowrap shrink-0">{f.name}:</span>
              <span className="text-muted-foreground">{f.def}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Mock simulation tab ───────────────────────────────────────────────────────

function MockSimulationTab() {
  const [form, setForm] = useState<SimulationFormParams>({
    accountAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    operationType: "ERC20 Transfer",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    recipientAddress: "0x111122223333444455556666777788889999aAaa",
    amount: 100,
    scenario: "Success",
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<MCPSimulationResult | null>(null);
  const [checks, setChecks] = useState({ recipient: false, effect: false, amount: false, simulation: false, verify: false });
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
  const recipientOrSpenderHelper =
    form.operationType === "ERC20 Approve"
      ? "Spender is allowed to use tokens after the approval is signed."
      : "Recipient receives tokens; spender is allowed to use tokens after approval.";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Mock Simulation Parameters</h2>
        <p className="text-sm text-muted-foreground">Configure the mock transaction intent to see how the MCP decodes and assesses it.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input */}
        <div className="lg:col-span-4 space-y-6">
          <WhatIsMossMCP />
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-5 space-y-4">
              {/* Operation Type */}
              <div className="space-y-1">
                <Label>Operation Type</Label>
                <Select value={form.operationType} onValueChange={(v: OperationType) => setForm({ ...form, operationType: v })}>
                  <SelectTrigger data-testid="operation-select-trigger"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC20 Transfer">ERC20 Transfer</SelectItem>
                    <SelectItem value="ERC20 Approve">ERC20 Approve</SelectItem>
                    <SelectItem value="Mock Swap Preview">Mock Swap Preview</SelectItem>
                  </SelectContent>
                </Select>
                <FieldHint>Choose the type of Web3 operation you want to preview.</FieldHint>
              </div>

              {/* Account Address */}
              <div className="space-y-1">
                <Label htmlFor="mock-account">Account Address</Label>
                <Input id="mock-account" className="font-mono text-xs" value={form.accountAddress}
                  onChange={(e) => setForm({ ...form, accountAddress: e.target.value })} />
                <FieldHint>Use a test address only. Do not enter private keys or seed phrases.</FieldHint>
              </div>

              {/* Token Address */}
              <div className="space-y-1">
                <Label htmlFor="mock-token">Token Address</Label>
                <Input id="mock-token" className="font-mono text-xs" value={form.tokenAddress}
                  onChange={(e) => setForm({ ...form, tokenAddress: e.target.value })} />
                <FieldHint>The token contract involved in the mock operation.</FieldHint>
              </div>

              {/* Recipient / Spender */}
              <div className="space-y-1">
                <Label htmlFor="mock-recipient">{form.operationType === "ERC20 Approve" ? "Spender Address" : "Recipient Address"}</Label>
                <Input id="mock-recipient" className="font-mono text-xs" value={form.recipientAddress}
                  onChange={(e) => setForm({ ...form, recipientAddress: e.target.value })} />
                <FieldHint>{recipientOrSpenderHelper}</FieldHint>
              </div>

              {/* Amount + Scenario */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="mock-amount">Amount</Label>
                  <Input id="mock-amount" type="number" className="font-mono text-xs" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                  <FieldHint>The mock token amount used for preview.</FieldHint>
                </div>
                <div className="space-y-1">
                  <Label>Mock Scenario</Label>
                  <Select value={form.scenario} onValueChange={(v: ScenarioType) => setForm({ ...form, scenario: v })}>
                    <SelectTrigger data-testid="scenario-select-trigger"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="User Rejected">User Rejected</SelectItem>
                      <SelectItem value="On-chain Reverted">On-chain Reverted</SelectItem>
                      <SelectItem value="System Error">System Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldHint>Choose how the simulated transaction lifecycle should behave.</FieldHint>
                </div>
              </div>

              {/* Before you generate checklist */}
              <div className="mt-2 rounded-md border border-border/50 bg-card/30 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <SquareCheck className="w-3.5 h-3.5" /> Before you generate
                </p>
                <ul className="space-y-1.5">
                  {[
                    "You are using a test or mock address — not a live funded wallet.",
                    "You understand this is a simulation only; nothing will be signed or broadcast.",
                    "You will verify all details again inside your real wallet before signing.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={handleSimulate} className="w-full mt-2 font-semibold shadow-lg shadow-primary/20"
                disabled={isSimulating} data-testid="generate-preview-button">
                {isSimulating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Simulating...</>
                ) : "Generate Preview"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
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
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500" data-testid="simulation-result-zone">
              <HowToReadPreview />

              <Card className="overflow-hidden border-border shadow-2xl" data-testid="preview-result-card">
                <div className={`h-1 w-full ${isTerminal ? "bg-destructive" : result.status === "CONFIRMED" ? "bg-emerald-500" : "bg-primary"}`}></div>
                <CardHeader className="bg-card/50 border-b border-border/50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-[10px] bg-background">{result.protocol}</Badge>
                        <Badge variant="secondary" className="font-mono text-[10px]">{result.method}</Badge>
                      </div>
                      <CardTitle className="text-2xl">{result.intent}</CardTitle>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Confidence</div>
                      {result.confidenceLevel === "HIGH" && <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 flex gap-1 items-center"><CheckCircle2 className="w-3 h-3" /> HIGH</Badge>}
                      {result.confidenceLevel === "MEDIUM" && <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 flex gap-1 items-center"><AlertTriangle className="w-3 h-3" /> MEDIUM</Badge>}
                      {result.confidenceLevel === "LOW" && <Badge variant="destructive" className="flex gap-1 items-center bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"><ShieldAlert className="w-3 h-3" /> LOW</Badge>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    <div className="p-6 space-y-6 bg-card/30">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Decoded Parameters
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(result.params).map(([key, val]) => (
                            <div key={key} className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground font-mono">{key}:</span>
                              {key === "to" || key === "token" ? (
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

                    <div className="p-6 space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Assessment</h4>
                        {result.riskLabels.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.riskLabels.map((label) => {
                              let cls = "font-mono text-[10px] border";
                              if (label.includes("UNLIMITED") || label.includes("UNVERIFIED") || label.includes("REVERT")) cls += " bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20";
                              else if (label.includes("LARGE") || label.includes("SLIPPAGE")) cls += " bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20";
                              else if (label.includes("VERIFIED")) cls += " bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20";
                              else cls += " bg-secondary text-secondary-foreground border-border";
                              return <Badge key={label} className={cls}>{label}</Badge>;
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-400 flex items-center gap-2 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" /> No specific risk labels triggered.
                          </div>
                        )}
                      </div>
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
                        <Checkbox id={`mock-${item.id}`} checked={checks[item.id as keyof typeof checks]}
                          onCheckedChange={(c) => setChecks((prev) => ({ ...prev, [item.id]: !!c }))}
                          disabled={isTerminal} />
                        <Label htmlFor={`mock-${item.id}`} className={`text-sm font-normal cursor-pointer transition-opacity ${isTerminal ? "opacity-50" : ""}`}>
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {!isTerminal && (
                    <div className="w-full mt-4 flex justify-end">
                      <Button disabled={!allChecked} className="font-semibold transition-all relative overflow-hidden group">
                        <span className="relative z-10 flex items-center gap-2">
                          Proceed to Wallet <ShieldCheck className="w-4 h-4" />
                        </span>
                        {allChecked && <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm" data-testid="status-lifecycle-panel">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transaction Lifecycle</h3>
                <StatusTimeline currentStatus={result.status} />
                <StatusLegend />
              </div>

              {/* Moss MCP Integration Explainer */}
              <Card className="border-border/60 bg-card/40 shadow-sm">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Moss MCP Integration
                    </CardTitle>
                    <a href={MOSS_MCP_GITHUB} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-mono">
                      <ExternalLink className="w-3 h-3" /> mcp-server on GitHub
                    </a>
                  </div>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    The <strong className="text-foreground">Moss MCP server</strong> exposes a four-step lifecycle —{" "}
                    <code className="font-mono text-primary text-xs px-1 py-0.5 bg-primary/10 rounded">discover</code>,{" "}
                    <code className="font-mono text-primary text-xs px-1 py-0.5 bg-primary/10 rounded">load</code>,{" "}
                    <code className="font-mono text-primary text-xs px-1 py-0.5 bg-primary/10 rounded">action</code>, and{" "}
                    <code className="font-mono text-primary text-xs px-1 py-0.5 bg-primary/10 rounded">simulate</code>{" "}
                    — that decodes raw transaction intent, runs an off-chain simulation against a Monad RPC node, and returns a structured risk report.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Swap stub → real SDK</div>
                    <pre className="text-xs font-mono bg-background border border-border/60 rounded-lg p-4 overflow-x-auto leading-relaxed text-muted-foreground">
{`import { MossClient } from "@moss/mcp-server";

async function simulateMCP(params: SimulationFormParams) {
  const client  = new MossClient({ rpcUrl: process.env.MONAD_RPC_URL });
  const actions = await client.discover(params.accountAddress);
  const manifest = await client.load(actions[0].id, params);
  const tx       = await client.action(manifest, params);
  return          await client.simulate(tx);  // returns MCPSimulationResult
}`}
                    </pre>
                  </div>
                  <div className="space-y-3">
                    <BilingualBox
                      enTitle="What is Moss MCP?"
                      enBody="Moss MCP is a Model Context Protocol server that sits between your dApp and a Monad RPC node. It decodes raw transaction calldata into human-readable intent, runs simulation, and scores risk — before the user ever sees a signature prompt."
                      zhTitle="什么是 Moss MCP？"
                      zhBody="Moss MCP 是一个模型上下文协议（MCP）服务器，位于 dApp 与 Monad RPC 节点之间。它将原始交易 calldata 解码为可读意图，执行模拟并进行风险评分——所有这些都在用户看到签名提示之前完成。"
                    />
                    <BilingualBox
                      enTitle="Transaction Simulation"
                      enBody="The simulate() call dry-runs the transaction against the current chain state without broadcasting. It returns predicted state changes, token balance deltas, and revert reasons — giving users certainty about what will happen before they sign."
                      zhTitle="交易模拟"
                      zhBody="simulate() 调用会在不广播的情况下针对当前链状态对交易进行预执行（dry-run）。它返回预测的状态变化、代币余额增量和回滚原因，让用户在签名前就能确定交易结果。"
                    />
                    <BilingualBox
                      enTitle="Intent Decoding"
                      enBody="Raw Ethereum calldata is opaque hex. Moss MCP's load() step resolves the ABI, matches function selectors, and renders the operation as a structured intent object — the protocol, method name, and decoded parameters shown in this preview."
                      zhTitle="意图解析"
                      zhBody="原始以太坊 calldata 是不透明的十六进制数据。Moss MCP 的 load() 步骤会解析 ABI、匹配函数选择器，并将操作渲染为结构化意图对象——即本预览中显示的协议名称、方法名和已解码参数。"
                    />
                    <BilingualBox
                      enTitle="Safety Model"
                      enBody="Risk labels (LARGE_AMOUNT, WILL_REVERT, VERIFIED_CONTRACT, etc.) are heuristics scored during simulation. They are advisory — not a guarantee. Always verify the full transaction in your wallet before signing."
                      zhTitle="安全模型"
                      zhBody="风险标签（如 LARGE_AMOUNT、WILL_REVERT、VERIFIED_CONTRACT 等）是在模拟过程中评分的启发式指标，仅供参考，不构成保证。在签名前，请务必在钱包中再次核实完整的交易内容。"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONAD TESTNET LIVE PREVIEW COMPONENTS  (new)
// ─────────────────────────────────────────────────────────────────────────────

function isValidAddress(v: string) { return /^0x[0-9a-fA-F]{40}$/.test(v); }
function isValidAmount(v: string) { return /^\d+(\.\d+)?$/.test(v) && parseFloat(v) > 0; }

interface FieldErrors { sender?: string; recipient?: string; amount?: string; }
function validate(f: { sender: string; recipient: string; amount: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!f.sender) errors.sender = "Sender address is required.";
  else if (!isValidAddress(f.sender)) errors.sender = "Must be a valid 0x Ethereum address (42 chars).";
  if (!f.recipient) errors.recipient = "Recipient address is required.";
  else if (!isValidAddress(f.recipient)) errors.recipient = "Must be a valid 0x Ethereum address (42 chars).";
  if (!f.amount) errors.amount = "Amount is required.";
  else if (!isValidAmount(f.amount)) errors.amount = 'Enter a positive decimal, e.g. "0.5" or "1".';
  return errors;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function LiveAddressDisplay({ address }: { address: string }) {
  const short = address.length >= 10 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="bg-background/50 px-1.5 py-0.5 rounded border border-border/40 cursor-help">{short}</span>
          </TooltipTrigger>
          <TooltipContent side="top"><p className="font-mono text-xs break-all max-w-xs">{address}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CopyBtn text={address} />
    </span>
  );
}

const PIPELINE_STAGES = [
  { label: "Intent Recorded", icon: CircleDot },
  { label: "Skill Applied",   icon: Bot },
  { label: "A2A Task Created",icon: Network },
  { label: "MCP Tools Called",icon: Cpu },
  { label: "Testnet Checked", icon: Zap },
  { label: "Ready or Blocked",icon: ShieldCheck },
] as const;

function PipelineStages({ status }: { status: "idle" | "loading" | "ready" | "error" }) {
  const active = status === "idle" ? -1 : status === "loading" ? 2 : 5;
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Preview Pipeline</p>
      <div className="flex items-start justify-between gap-1">
        {PIPELINE_STAGES.map((s, i) => {
          const done    = i < active;
          const current = i === active && status === "loading";
          const failed  = status === "error" && i === active;
          const Icon    = s.icon;
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0 relative">
              {i < PIPELINE_STAGES.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-px ${done ? "bg-primary/60" : "bg-border/50"}`} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-all
                ${done    ? "border-primary/60 bg-primary/10 text-primary"
                : current ? "border-amber-400/70 bg-amber-400/10 text-amber-400 animate-pulse"
                : failed  ? "border-destructive/60 bg-destructive/10 text-destructive"
                :           "border-border/50 bg-card/20 text-muted-foreground/40"}`}>
                {current
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : done ? <Check className="w-4 h-4" />
                  : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[9px] mt-1.5 text-center leading-tight font-medium px-0.5 truncate w-full
                ${done || current ? "text-foreground/80" : "text-muted-foreground/40"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: "READY_FOR_WALLET_REVIEW" | "BLOCKED" }) {
  return decision === "READY_FOR_WALLET_REVIEW"
    ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/30">
        <CheckCircle2 className="w-4 h-4" /> READY FOR WALLET REVIEW
      </span>
    : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-4 h-4" /> BLOCKED
      </span>;
}

function KV({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-muted-foreground shrink-0 min-w-[110px]">{k}</span>
      <span className={mono ? "font-mono text-foreground break-all" : "text-foreground"}>{v}</span>
    </div>
  );
}

function AgentSkillPanel({ skill }: { skill: PreviewArtifact["skill"] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors" onClick={() => setOpen((v) => !v)}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5" /> Agent Skill Applied
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/40 p-3 space-y-1.5 text-xs">
          <KV k="Skill" v={skill.name} />
          <KV k="Trigger" v="Native MON transfer on Monad Testnet" />
          <KV k="Rules applied" v={skill.appliedRuleIds.join(", ")} />
          <KV k="Source" v={<a href={skill.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">{skill.sourceUrl}<ExternalLink className="w-3 h-3" /></a>} />
          <KV k="Status" v={<span className="text-teal-400 font-semibold">loaded and enforced</span>} />
        </div>
      )}
    </div>
  );
}

function McpTracePanel({ trace }: { trace: McpTraceEntry[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors" onClick={() => setOpen((v) => !v)}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" /> MCP Trace ({trace.length} calls)
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/40 divide-y divide-border/30">
          {trace.map((entry, i) => (
            <div key={i} className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono text-primary">{entry.tool}</code>
                <span className={`text-[10px] font-semibold ${entry.success ? "text-teal-400" : "text-destructive"}`}>{entry.success ? "ok" : "err"} · {entry.durationMs}ms</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{entry.inputSummary}</p>
              <p className="text-[10px] text-muted-foreground">source: {entry.dataSource}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewResult({ artifact }: { artifact: PreviewArtifact }) {
  const ne = artifact.networkEvidence;
  const tx = artifact.unsignedTx;
  const [copiedTx, setCopiedTx] = useState(false);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
      {/* Decision */}
      <div className="flex items-center gap-3 flex-wrap">
        <DecisionBadge decision={artifact.decision} />
        <span className="text-xs text-muted-foreground font-mono">{artifact.a2aTaskId.slice(0, 8)}…</span>
      </div>

      {/* Intent */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Human-readable intent</p>
        <p className="text-sm">
          Transfer <strong className="text-foreground font-semibold">{artifact.amount} MON</strong> from{" "}
          <LiveAddressDisplay address={artifact.sender} /> to <LiveAddressDisplay address={artifact.recipient} />
        </p>
      </div>

      {/* Warnings */}
      {artifact.warnings.length > 0 && (
        <div className="space-y-1.5">
          {artifact.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="break-words">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Faucet callout — shown when BLOCKED so user can top up and retry */}
      {artifact.decision === "BLOCKED" && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm">
            <Droplets className="w-4 h-4 shrink-0" />
            Need test MON to run a real transfer?
          </div>
          <p className="text-xs text-violet-200/80 leading-relaxed">
            The preview is blocked because the sender address has no testnet balance. Grab free MON from
            the Monad Testnet Faucet, paste your sender address, and re-run the preview.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://faucet.monad.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-500/20"
            >
              <Droplets className="w-3.5 h-3.5" />
              Open Monad Faucet
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <div className="flex items-center gap-1.5 bg-background/50 border border-border/50 rounded-lg px-2.5 py-1.5 min-w-0">
              <span className="text-[10px] text-muted-foreground shrink-0">Sender:</span>
              <code className="font-mono text-[10px] text-foreground/80 truncate max-w-[180px]">{artifact.sender}</code>
              <CopyBtn text={artifact.sender} />
            </div>
          </div>
          <p className="text-[10px] text-violet-300/50">
            Faucet credits ~1 MON per request · Monad Testnet only · No mainnet value
          </p>
        </div>
      )}

      {/* Network evidence */}
      {ne && (
        <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Live Network Evidence
          </p>
          <KV k="Chain ID" v={`${ne.chainId}${ne.chainIdVerified ? " ✓" : " ✗"}`} mono />
          <KV k="Block" v={ne.blockNumber} mono />
          <KV k="Timestamp" v={new Date(ne.blockTimestamp * 1000).toUTCString()} />
          <KV k="Sender balance" v={`${ne.senderBalanceEth} MON`} mono />
          <KV k="Gas estimate" v={`${ne.estimatedGas} units · ${ne.gasCostEth} MON`} mono />
          <KV k="Recipient contract" v={ne.recipientIsContract ? "Yes" : "No"} />
          <KV k="RPC" v={<a href={ne.rpcUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-[10px]">{ne.rpcUrl}</a>} />
        </div>
      )}

      {/* Unsigned tx */}
      {tx && (
        <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Unsigned Transaction</p>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(tx, null, 2)); setCopiedTx(true); setTimeout(() => setCopiedTx(false), 2000); }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {copiedTx ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre className="text-[10px] font-mono bg-background/50 rounded p-2 overflow-x-auto text-muted-foreground leading-relaxed">
            {JSON.stringify(tx, null, 2)}
          </pre>
        </div>
      )}

      {/* Safety flags */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3 h-3" /> Safety Rules Applied
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(artifact.safetyFlags).map(([rule, passed]) => (
            <div key={rule} className="flex items-center gap-1.5 text-[10px]">
              {passed
                ? <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                : <XCircle className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
              <span className={`font-mono ${passed ? "text-foreground/80" : "text-muted-foreground/40"}`}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skill + trace */}
      <AgentSkillPanel skill={artifact.skill} />
      <McpTracePanel trace={artifact.mcpTrace} />

      {/* A2A metadata */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Provenance</p>
        <KV k="A2A task" v={artifact.a2aTaskId} mono />
        <KV k="Context" v={artifact.a2aContextId} mono />
        <KV k="Artifact" v={artifact.a2aArtifactId} mono />
        <KV k="Created" v={new Date(artifact.createdAt).toUTCString()} />
        <KV k="Skill hash" v={artifact.skill.contentHash.slice(0, 16) + "…"} mono />
      </div>
    </div>
  );
}

// ── Live preview tab ──────────────────────────────────────────────────────────

const LIVE_STATUS_CHIPS = [
  { label: "Monad Testnet", color: "text-violet-400 border-violet-500/40 bg-violet-500/10" },
  { label: "Chain 10143",   color: "text-sky-400 border-sky-500/40 bg-sky-500/10" },
  { label: "Live RPC",      color: "text-teal-400 border-teal-500/40 bg-teal-500/10" },
  { label: "A2A v1",        color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  { label: "MCP stdio",     color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  { label: "Unsigned only", color: "text-rose-400 border-rose-500/40 bg-rose-500/10" },
] as const;

const DEFAULT_LIVE_FORM = {
  sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  amount: "0.01",
};

function LivePreviewTab() {
  const [form, setForm] = useState(DEFAULT_LIVE_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const { state, submit, reset } = usePreview();

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const handleField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ sender: true, recipient: true, amount: true });
    if (hasErrors) return;
    await submit(form);
  }, [form, hasErrors, submit]);

  const handleEdit = () => { reset(); setSubmitted(false); };
  const handleStop = () => { reset(); setForm(DEFAULT_LIVE_FORM); setTouched({}); setSubmitted(false); };

  const showError = (field: string) => (touched[field] || submitted) && errors[field as keyof FieldErrors];

  const pipelineStatus: "idle" | "loading" | "ready" | "error" =
    state.stage === "idle" ? "idle"
    : state.stage === "loading" ? "loading"
    : state.stage === "ready" ? "ready"
    : "error";

  return (
    <div className="space-y-6">
      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {LIVE_STATUS_CHIPS.map((chip) => (
          <span key={chip.label} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${chip.color}`}>
            {chip.label}
          </span>
        ))}
      </div>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Enter a Monad Testnet sender address, recipient address, and amount. The agent fetches live on-chain
        data, applies nine safety rules, and returns a structured preview —{" "}
        <strong className="text-foreground">no signing, no broadcast</strong>.
      </p>

      {/* Pipeline */}
      <PipelineStages status={pipelineStatus} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Preview parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sender */}
                <div className="space-y-1">
                  <Label htmlFor="live-sender">Sender address</Label>
                  <Input id="live-sender" placeholder="0x…" value={form.sender} onChange={handleField("sender")}
                    onBlur={() => setTouched((t) => ({ ...t, sender: true }))}
                    className={showError("sender") ? "border-destructive" : ""} />
                  {showError("sender")
                    ? <p className="text-xs text-destructive">{errors.sender}</p>
                    : <FieldHint>Wallet sending MON. Use a test address — no private keys needed.</FieldHint>}
                </div>

                {/* Recipient */}
                <div className="space-y-1">
                  <Label htmlFor="live-recipient">Recipient address</Label>
                  <Input id="live-recipient" placeholder="0x…" value={form.recipient} onChange={handleField("recipient")}
                    onBlur={() => setTouched((t) => ({ ...t, recipient: true }))}
                    className={showError("recipient") ? "border-destructive" : ""} />
                  {showError("recipient")
                    ? <p className="text-xs text-destructive">{errors.recipient}</p>
                    : <FieldHint>Address receiving the MON transfer.</FieldHint>}
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <Label htmlFor="live-amount">Amount (MON)</Label>
                  <Input id="live-amount" placeholder='e.g. "0.5" or "1.25"' value={form.amount}
                    onChange={handleField("amount")}
                    onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                    className={showError("amount") ? "border-destructive" : ""} />
                  {showError("amount")
                    ? <p className="text-xs text-destructive">{errors.amount}</p>
                    : <FieldHint>Decimal string. Whole amounts like "1" are fine.</FieldHint>}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  {state.stage === "loading" ? (
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={handleStop}>
                      <Square className="w-3.5 h-3.5 mr-1.5" /> Stop
                    </Button>
                  ) : state.stage === "ready" || state.stage === "error" ? (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={handleEdit} className="flex-1">
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Edit request
                      </Button>
                      <Button type="submit" size="sm" className="flex-1 font-semibold shadow-lg shadow-primary/20">
                        Preview on Monad Testnet
                      </Button>
                    </>
                  ) : (
                    <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20">
                      Preview on Monad Testnet
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Explorer link */}
            <a href={MONAD_EXPLORER} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="w-3 h-3" /> Monad Testnet Explorer
            </a>
          </form>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-8">
          {state.stage === "idle" && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl text-muted-foreground p-8 text-center bg-card/10">
              <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">Fill in the form and click <strong>Preview on Monad Testnet</strong>.</h3>
              <p className="max-w-sm text-sm">Live results from the Monad Testnet RPC will appear here.</p>
            </div>
          )}

          {state.stage === "loading" && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-border rounded-xl bg-card p-8 animate-in fade-in duration-500">
              <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-accent animate-[spin_1.5s_linear_reverse_infinite]"></div>
                <Activity className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-medium mb-2">Calling Monad Testnet…</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm font-mono">
                A2A task · MCP tools · Live RPC · Safety rules
              </p>
            </div>
          )}

          {state.stage === "ready" && state.artifact && (
            <PreviewResult artifact={state.artifact} />
          )}

          {state.stage === "error" && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Preview failed</h3>
              </div>
              <p className="text-sm text-muted-foreground">{state.message}</p>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "mock" | "live";

export default function Home() {
  const [tab, setTab] = useState<Tab>("mock");

  return (
    <div className="min-h-screen bg-background w-full text-foreground pb-24 selection:bg-primary/30">

      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-base leading-tight tracking-tight truncate">
                Moss MCP Transaction Preview
              </h1>
              <p className="text-xs text-muted-foreground font-mono truncate">
                Understand before you sign.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-4">
            <Badge variant="outline" className="font-mono bg-background hidden sm:flex">DEV_MOCK_ENV</Badge>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex gap-0 border-t border-border/30">
          <button
            onClick={() => setTab("mock")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "mock"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Mock Simulation
          </button>
          <button
            onClick={() => setTab("live")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "live"
                ? "border-teal-400 text-teal-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Monad Testnet Preview
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 ml-0.5">LIVE</span>
          </button>
        </div>
      </header>

      {/* Intro */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {tab === "mock"
              ? "Moss MCP Transaction Preview"
              : "Understand an unsigned MON transfer before signing."}
          </h2>
          {tab === "mock" && (
            <>
              <p className="text-muted-foreground font-mono text-sm mt-1">Understand before you sign.</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-2xl">
                This demo shows you exactly what a blockchain transaction will do — in plain English — before you ever tap "Confirm" in your wallet.
                Configure a mock operation, click <strong className="text-foreground">Generate Preview</strong>, and see the decoded intent, risk labels, and simulated outcome.
                <span className="text-muted-foreground/70"> All data is mocked; nothing is broadcast to any network.</span>
              </p>
            </>
          )}
        </div>

        {/* Safety notice */}
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-400 leading-relaxed">{SAFETY_TEXT}</p>
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        {tab === "mock"  ? <MockSimulationTab /> : <LivePreviewTab />}
      </main>

      {/* Disclaimer banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-amber-500/10 border-t border-amber-500/20 text-amber-500/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-2 text-[10px] md:text-xs text-center font-medium">
          {tab === "live"
            ? "Educational preview only. No financial advice. No signing or broadcast. RPC preflight is not a future-execution guarantee."
            : SAFETY_TEXT}
        </div>
      </div>
    </div>
  );
}
