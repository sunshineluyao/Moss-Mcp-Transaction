export default function Slide7MossMonad() {
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 7vw 2vh", position: "relative", zIndex: 10 }}>

        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
          <div style={{ backgroundColor: "#3D5AF1", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 06</div>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", textTransform: "uppercase" }}>Safety Model</div>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.2vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
          Moss <span style={{ color: "#3D5AF1" }}>×</span> Monad
        </h2>
        <div style={{ fontSize: "1.5vw", color: "#A0A0B5", marginBottom: "1vh", fontFamily: "'Space Grotesk', sans-serif" }}>安全模型</div>
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "3vh" }} />

        <div style={{ display: "flex", gap: "3vw", flex: 1, alignItems: "stretch" }}>

          {/* Moss mainnet */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "1vh" }}>OFFICIAL MOSS</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.7vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>Monad Mainnet</div>
            <div style={{ fontSize: "1.1vw", color: "#8A8A9E", marginBottom: "2vh" }}>chain 143 · docs.moss.ag</div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7, marginBottom: "1vh" }}>
              DeFi safety layer built on Monad. Full production suite — approvals, swaps, transfers.
            </div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2vh" }}>
              构建在 Monad 上的 DeFi 安全层。生产级全套功能——授权、兑换、转账。
            </div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.6 }}>
              Exposes: discover → load → action → simulate
            </div>
          </div>

          {/* Arrow / inspiration */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5vh" }}>
            <div style={{ width: "1px", height: "8vh", backgroundColor: "#3D5AF1", opacity: 0.6 }} />
            <div style={{ fontSize: "0.8vw", color: "#3D5AF1", letterSpacing: "0.1em", textAlign: "center", writingMode: "horizontal-tb" }}>INSPIRES</div>
            <div style={{ width: "0", height: "0", borderLeft: "0.8vw solid transparent", borderRight: "0.8vw solid transparent", borderTop: "1.2vh solid #3D5AF1" }} />
          </div>

          {/* This project */}
          <div style={{ flex: 1, backgroundColor: "rgba(61,90,241,0.08)", border: "1px solid #3D5AF1", padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#3D5AF1", marginBottom: "1vh" }}>THIS PROJECT</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.7vw", fontWeight: 700, color: "#3D5AF1", marginBottom: "0.5vh" }}>Monad Testnet Adapter</div>
            <div style={{ fontSize: "1.1vw", color: "#8A8A9E", marginBottom: "2vh" }}>chain 10143 · viem-based · custom MCP</div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7, marginBottom: "1vh" }}>
              Same design pattern — adapted for Testnet. Native MON transfer preview only. Not official Moss execution.
            </div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2vh" }}>
              相同设计模式——适配测试网。仅限 MON 转账预览。非官方 Moss 执行引擎。
            </div>
            <div style={{ fontSize: "1.1vw", color: "#3D5AF1", lineHeight: 1.6 }}>
              Same: discover → load → action → simulate
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 07</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
