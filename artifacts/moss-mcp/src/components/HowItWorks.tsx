import { Layers, Repeat, BookOpen, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL;

interface AnimationItem {
  file: string;
  title: string;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // tailwind text color class
  badge: string;
}

const ANIMATIONS: AnimationItem[] = [
  {
    file: "architecture.mp4",
    title: "Protocol Architecture",
    caption:
      "How the pieces fit together: your AI agent talks to the Moss MCP server, which decodes and simulates transactions against the Monad blockchain — before anything is signed.",
    icon: Layers,
    accent: "text-primary",
    badge: "ARCHITECTURE",
  },
  {
    file: "transaction_lifecycle.mp4",
    title: "Transaction Lifecycle",
    caption:
      "Follow a transaction from raw calldata to a human-readable preview: decode → simulate → risk-label → explain. Nothing is broadcast until you decide.",
    icon: Repeat,
    accent: "text-teal-400",
    badge: "LIFECYCLE",
  },
  {
    file: "concepts.mp4",
    title: "Core Concepts",
    caption:
      "The key ideas behind transaction previews: unsigned transactions, simulation, decoded intent, and why 'understand before you sign' matters for wallet safety.",
    icon: BookOpen,
    accent: "text-violet-400",
    badge: "CONCEPTS",
  },
  {
    file: "moss_monad.mp4",
    title: "Moss × Monad",
    caption:
      "How Moss MCP leverages Monad's high-throughput testnet for fast, low-cost preflight simulation — making real-time previews practical.",
    icon: Link2,
    accent: "text-teal-400",
    badge: "INTEGRATION",
  },
];

export default function HowItWorks() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {ANIMATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.file} className="overflow-hidden bg-card/50 border-border/60">
              <div className="relative bg-black/60 border-b border-border/40">
                <video
                  className="w-full aspect-video"
                  controls
                  preload="metadata"
                  playsInline
                  src={`${BASE}videos/${item.file}`}
                >
                  Your browser does not support embedded videos.
                </video>
              </div>
              <CardContent className="pt-4 pb-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${item.accent}`} />
                    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[9px] shrink-0 ${item.accent}`}>
                    {item.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.caption}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/70 text-center font-mono">
        Animations rendered from the project's protocol documentation. Watch them in any order.
      </p>
    </div>
  );
}
