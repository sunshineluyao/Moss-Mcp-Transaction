export default function Slide4Architecture() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0D0D12", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", position: "relative", color: "#FFFFFF" }}>

      <div style={{ position: "absolute", top: 0, left: 0, width: "30vw", height: "100vh", backgroundColor: "#15151C", clipPath: "polygon(0 0, 100% 0, 60% 100%, 0% 100%)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-10vh", right: "-10vw", width: "60vw", height: "60vh", borderTop: "2px solid #8B1A2B", borderLeft: "2px solid #8B1A2B", transform: "rotate(-15deg)", opacity: 0.3, zIndex: 0 }} />
      <div style={{ position: "absolute", top: "3vh", left: "3vw", width: "5vw", height: "5vh", borderTop: "2px solid #3D5AF1", borderLeft: "2px solid #3D5AF1", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: "3vh", right: "3vw", width: "5vw", height: "5vh", borderBottom: "2px solid #8B1A2B", borderRight: "2px solid #8B1A2B", zIndex: 1 }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5vh 6vw", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3vw", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>MOSS.MCP</div>
          <div style={{ width: "2px", height: "2vh", backgroundColor: "#4A4A5A" }} />
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8B1A2B" }}>[ SYS.ONLINE ]</div>
        </div>
        <div style={{ fontSize: "0.85vw", letterSpacing: "0.12em", color: "#8A8A9E" }}>2026 // COMPETITION</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", gap: "4vw", padding: "0 7vw 2vh", position: "relative", zIndex: 10 }}>

        {/* Left: title */}
        <div style={{ width: "24vw", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
            <div style={{ backgroundColor: "#3D5AF1", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 03</div>
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.2vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
            <span style={{ color: "#3D5AF1" }}>Architecture</span>
          </h2>
          <div style={{ fontSize: "1.5vw", color: "#A0A0B5", marginBottom: "1.5vh", fontFamily: "'Space Grotesk', sans-serif" }}>技术架构</div>
          <div style={{ width: "6vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "3vh" }} />
          <div style={{ fontSize: "1.05vw", color: "#8A8A9E", lineHeight: 1.8 }}>
            SKILL.md (9 safety rules) loaded at startup, SHA-256 verified.
          </div>
          <div style={{ fontSize: "1vw", color: "#6A6A7E", lineHeight: 1.7 }}>
            SKILL.md（9 条安全规则）启动时加载，SHA-256 验证。
          </div>
        </div>

        {/* Right: pipeline flow */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "0" }}>

          {/* Node 1 */}
          <div style={{ backgroundColor: "rgba(61,90,241,0.12)", border: "1px solid #3D5AF1", padding: "1.5vh 2vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3vw", fontWeight: 700, color: "#3D5AF1" }}>React UI</div>
              <div style={{ fontSize: "0.9vw", color: "#8A8A9E" }}>moss-mcp frontend</div>
            </div>
            <div style={{ fontSize: "0.8vw", color: "#4A4A5A", letterSpacing: "0.1em" }}>USER INTERFACE</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "0 2vw" }}>
            <div style={{ width: "1px", height: "2.5vh", backgroundColor: "#3D5AF1", marginLeft: "1.5vw" }} />
            <div style={{ fontSize: "0.75vw", color: "#4A4A5A", marginLeft: "1vw", letterSpacing: "0.08em" }}>POST /agent-gateway/api/preview</div>
          </div>

          {/* Node 2 */}
          <div style={{ backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "1.5vh 2vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF" }}>Agent Gateway</div>
              <div style={{ fontSize: "0.9vw", color: "#8A8A9E" }}>Express + A2A SDK</div>
            </div>
            <div style={{ fontSize: "0.8vw", color: "#4A4A5A", letterSpacing: "0.1em" }}>ORCHESTRATION</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "0 2vw" }}>
            <div style={{ width: "1px", height: "2.5vh", backgroundColor: "#8B1A2B", marginLeft: "1.5vw" }} />
            <div style={{ fontSize: "0.75vw", color: "#4A4A5A", marginLeft: "1vw", letterSpacing: "0.08em" }}>A2A JSON-RPC task → artifact</div>
          </div>

          {/* Node 3 */}
          <div style={{ backgroundColor: "rgba(139,26,43,0.12)", border: "1px solid #8B1A2B", padding: "1.5vh 2vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3vw", fontWeight: 700, color: "#8B1A2B" }}>MCP stdio Server</div>
              <div style={{ fontSize: "0.9vw", color: "#8A8A9E" }}>4 tools: discover → load → action → simulate</div>
            </div>
            <div style={{ fontSize: "0.8vw", color: "#4A4A5A", letterSpacing: "0.1em" }}>TOOL LAYER</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "0 2vw" }}>
            <div style={{ width: "1px", height: "2.5vh", backgroundColor: "#3D5AF1", marginLeft: "1.5vw" }} />
            <div style={{ fontSize: "0.75vw", color: "#4A4A5A", marginLeft: "1vw", letterSpacing: "0.08em" }}>eth_getBalance · eth_estimateGas · eth_chainId</div>
          </div>

          {/* Node 4 */}
          <div style={{ backgroundColor: "rgba(61,90,241,0.08)", border: "1px solid #3D5AF1", padding: "1.5vh 2vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3vw", fontWeight: 700, color: "#3D5AF1" }}>Monad Testnet RPC</div>
              <div style={{ fontSize: "0.9vw", color: "#8A8A9E" }}>testnet-rpc.monad.xyz · chain 10143</div>
            </div>
            <div style={{ fontSize: "0.8vw", color: "#4A4A5A", letterSpacing: "0.1em" }}>LIVE CHAIN</div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 04</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
