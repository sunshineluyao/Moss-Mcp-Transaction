export default function Slide10TryIt() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0D0D12", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", position: "relative", color: "#FFFFFF" }}>

      <div style={{ position: "absolute", top: 0, left: 0, width: "30vw", height: "100vh", backgroundColor: "#15151C", clipPath: "polygon(0 0, 100% 0, 60% 100%, 0% 100%)", zIndex: 0 }} />

      {/* Concentric reticles */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "40vw", height: "40vw", border: "1px dashed rgba(61,90,241,0.15)", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "20vw", height: "20vw", border: "1px solid rgba(139,26,43,0.25)", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "2vw", height: "2vw", border: "2px solid #3D5AF1", zIndex: 0 }} />

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

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 8vw", position: "relative", zIndex: 10, textAlign: "center" }}>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "1vw", marginBottom: "2.5vh" }}>
          <div style={{ width: "2vw", height: "2px", backgroundColor: "#3D5AF1" }} />
          <div style={{ fontSize: "0.9vw", letterSpacing: "0.3em", color: "#3D5AF1", textTransform: "uppercase" }}>SEQUENCE COMPLETE · 任务完成</div>
          <div style={{ width: "2vw", height: "2px", backgroundColor: "#3D5AF1" }} />
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "5.5vw", margin: "0 0 1.5vh 0", fontWeight: 700, lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          Try It <span style={{ color: "#3D5AF1" }}>Now</span>
        </h1>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2vw", color: "#A0A0B5", marginBottom: "2vh" }}>立即体验</div>
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "5vh" }} />

        {/* Links grid */}
        <div style={{ display: "flex", gap: "2vw" }}>

          <div style={{ backgroundColor: "rgba(61,90,241,0.1)", border: "1px solid rgba(61,90,241,0.4)", padding: "2.5vh 2vw", textAlign: "left", minWidth: "20vw" }}>
            <div style={{ fontSize: "0.75vw", letterSpacing: "0.2em", color: "#3D5AF1", marginBottom: "1vh" }}>LIVE DEMO · 在线演示</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>moss-mcp-transaction.replit.app</div>
          </div>

          <div style={{ backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "2.5vh 2vw", textAlign: "left", minWidth: "20vw" }}>
            <div style={{ fontSize: "0.75vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "1vh" }}>AGENT CARD</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1vw", fontWeight: 600, color: "#FFFFFF" }}>/agent-gateway/.well-known/agent-card.json</div>
          </div>

          <div style={{ backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "2.5vh 2vw", textAlign: "left", minWidth: "18vw" }}>
            <div style={{ fontSize: "0.75vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "1vh" }}>GITHUB · 代码仓库</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1vw", fontWeight: 600, color: "#FFFFFF" }}>sunshineluyao/Moss-Mcp-Transaction</div>
          </div>

          <div style={{ backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid rgba(139,26,43,0.4)", padding: "2.5vh 2vw", textAlign: "left", minWidth: "14vw" }}>
            <div style={{ fontSize: "0.75vw", letterSpacing: "0.2em", color: "#8B1A2B", marginBottom: "1vh" }}>DOI</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1vw", fontWeight: 600, color: "#FFFFFF" }}>10.5281/zenodo.21539761</div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 10</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
