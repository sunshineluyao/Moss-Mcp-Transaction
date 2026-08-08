export default function Slide3TwoModes() {
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 7vw", position: "relative", zIndex: 10 }}>

        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
          <div style={{ backgroundColor: "#3D5AF1", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 02</div>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", textTransform: "uppercase" }}>Solution Overview</div>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.4vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
          Two Modes, <span style={{ color: "#3D5AF1" }}>One Goal</span>
        </h2>
        <div style={{ fontSize: "1.6vw", color: "#A0A0B5", marginBottom: "1.2vh", fontFamily: "'Space Grotesk', sans-serif" }}>两种模式，一个目标</div>
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "3vh" }} />

        {/* Two columns */}
        <div style={{ display: "flex", gap: "3vw", flex: 1, paddingBottom: "2vh" }}>

          {/* Mode 1 */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.8)", border: "1px solid #4A4A5A", padding: "3vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#4A4A5A", transform: "rotate(45deg)" }} />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.2em", color: "#8A8A9E" }}>MODE 1</div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>Mock Simulation</div>
            <div style={{ fontSize: "1.2vw", color: "#8B1A2B", marginBottom: "2vh" }}>模拟仿真</div>
            <div style={{ width: "4vw", height: "2px", backgroundColor: "#4A4A5A", marginBottom: "2.5vh" }} />
            <div style={{ fontSize: "1.15vw", color: "#A0A0B5", lineHeight: 1.7 }}>
              No network required — local mock engine only.
            </div>
            <div style={{ fontSize: "1.05vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2vh" }}>
              无需网络，本地模拟引擎。
            </div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7 }}>
              Learn transaction structure, ERC-20 lifecycles, and risk labels across Success / Rejected / Reverted / System Error scenarios.
            </div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6 }}>
              学习交易结构、ERC-20 生命周期、风险标签。
            </div>
          </div>

          {/* Mode 2 */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.8)", border: "1px solid #3D5AF1", padding: "3vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#3D5AF1", transform: "rotate(45deg)" }} />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.2em", color: "#3D5AF1" }}>MODE 2 — LIVE</div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>Monad Testnet Preview</div>
            <div style={{ fontSize: "1.2vw", color: "#3D5AF1", marginBottom: "2vh" }}>Monad 测试网实时预览</div>
            <div style={{ width: "4vw", height: "2px", backgroundColor: "#3D5AF1", marginBottom: "2.5vh" }} />
            <div style={{ fontSize: "1.15vw", color: "#A0A0B5", lineHeight: 1.7 }}>
              Real on-chain data via A2A + MCP. Returns READY_FOR_WALLET_REVIEW or BLOCKED.
            </div>
            <div style={{ fontSize: "1.05vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2vh" }}>
              通过 A2A + MCP 获取真实链上数据。
            </div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7 }}>
              Show users exactly what a transaction will do before they tap Confirm.
            </div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6 }}>
              在用户点击确认前，清晰展示交易效果。
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 03</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
