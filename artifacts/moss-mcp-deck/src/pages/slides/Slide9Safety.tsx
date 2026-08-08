export default function Slide9Safety() {
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
          <div style={{ backgroundColor: "#8B1A2B", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 08</div>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", textTransform: "uppercase" }}>Safety Boundary</div>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.2vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
          Safety <span style={{ color: "#8B1A2B" }}>Boundary</span>
        </h2>
        <div style={{ fontSize: "1.5vw", color: "#A0A0B5", marginBottom: "1vh", fontFamily: "'Space Grotesk', sans-serif" }}>安全边界</div>
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#3D5AF1", marginBottom: "3vh" }} />

        <div style={{ display: "flex", gap: "3vw", flex: 1 }}>

          {/* NEVER */}
          <div style={{ flex: 1, backgroundColor: "rgba(139,26,43,0.08)", border: "1px solid rgba(139,26,43,0.5)", padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5vw", fontWeight: 700, color: "#8B1A2B", marginBottom: "0.5vh", letterSpacing: "0.1em" }}>NEVER · 绝不</div>
            <div style={{ width: "4vw", height: "2px", backgroundColor: "#8B1A2B", marginBottom: "2.5vh" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh" }}>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Store private keys</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>存储私钥</div>
              </div>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Sign transactions</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>签署交易</div>
              </div>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Broadcast to network</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>广播到网络</div>
              </div>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Provide financial advice</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>提供投资建议</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", backgroundColor: "#4A4A5A", alignSelf: "stretch" }} />

          {/* ALWAYS */}
          <div style={{ flex: 1, backgroundColor: "rgba(61,90,241,0.08)", border: "1px solid rgba(61,90,241,0.5)", padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5vw", fontWeight: 700, color: "#3D5AF1", marginBottom: "0.5vh", letterSpacing: "0.1em" }}>ALWAYS · 始终</div>
            <div style={{ width: "4vw", height: "2px", backgroundColor: "#3D5AF1", marginBottom: "2.5vh" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh" }}>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Return unsigned tx for display only</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>仅返回未签名交易供展示</div>
              </div>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Enforce all 9 rules server-side</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>服务端强制执行全部 9 条规则</div>
              </div>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Log every rule in the artifact</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>在 artifact 中记录每条规则</div>
              </div>
              <div>
                <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 700 }}>Use Testnet addresses only</div>
                <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>仅使用测试网地址</div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ backgroundColor: "rgba(21,21,28,0.8)", border: "1px solid #4A4A5A", padding: "1.5vh 2vw", marginTop: "2vh" }}>
          <div style={{ fontSize: "1vw", color: "#8A8A9E" }}>
            RPC preflight is not a guarantee of future execution success. · RPC 预检不保证未来执行成功。
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 09</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#8B1A2B" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
