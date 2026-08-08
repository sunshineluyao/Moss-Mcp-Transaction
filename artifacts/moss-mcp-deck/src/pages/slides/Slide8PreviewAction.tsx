export default function Slide8PreviewAction() {
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
          <div style={{ backgroundColor: "#8B1A2B", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 07</div>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", textTransform: "uppercase" }}>Live Demo</div>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.2vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
          Preview <span style={{ color: "#3D5AF1" }}>in Action</span>
        </h2>
        <div style={{ fontSize: "1.5vw", color: "#A0A0B5", marginBottom: "1vh", fontFamily: "'Space Grotesk', sans-serif" }}>实时预览效果</div>
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "3vh" }} />

        {/* 3-step flow */}
        <div style={{ display: "flex", gap: "2vw", flex: 1, alignItems: "stretch" }}>

          {/* Input */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "2.5vh 2vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "1.5vh" }}>INPUT · 输入</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
              <div style={{ backgroundColor: "rgba(61,90,241,0.1)", border: "1px solid rgba(61,90,241,0.3)", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "0.8vw", color: "#3D5AF1", marginBottom: "0.4vh", letterSpacing: "0.1em" }}>SENDER ADDRESS · 发送方</div>
                <div style={{ fontSize: "1vw", color: "#FFFFFF", fontFamily: "'DM Mono'" }}>0xf39F...2266</div>
              </div>
              <div style={{ backgroundColor: "rgba(61,90,241,0.1)", border: "1px solid rgba(61,90,241,0.3)", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "0.8vw", color: "#3D5AF1", marginBottom: "0.4vh", letterSpacing: "0.1em" }}>RECIPIENT ADDRESS · 接收方</div>
                <div style={{ fontSize: "1vw", color: "#FFFFFF", fontFamily: "'DM Mono'" }}>0x7099...79C8</div>
              </div>
              <div style={{ backgroundColor: "rgba(61,90,241,0.1)", border: "1px solid rgba(61,90,241,0.3)", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "0.8vw", color: "#3D5AF1", marginBottom: "0.4vh", letterSpacing: "0.1em" }}>AMOUNT · 金额</div>
                <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontFamily: "'Space Grotesk'", fontWeight: 700 }}>0.1 MON</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "3vw", height: "2px", backgroundColor: "#3D5AF1" }} />
            <div style={{ width: "0", height: "0", borderTop: "1vh solid transparent", borderBottom: "1vh solid transparent", borderLeft: "1.5vw solid #3D5AF1" }} />
          </div>

          {/* Evidence */}
          <div style={{ flex: 1.2, backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "2.5vh 2vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "1.5vh" }}>LIVE EVIDENCE · 实时证据</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1vw" }}>
                <span style={{ color: "#8A8A9E" }}>Chain ID</span>
                <span style={{ color: "#3D5AF1", fontWeight: 700 }}>10143 ✓</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1vw" }}>
                <span style={{ color: "#8A8A9E" }}>Block number</span>
                <span style={{ color: "#FFFFFF" }}>4,821,337</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1vw" }}>
                <span style={{ color: "#8A8A9E" }}>Sender balance</span>
                <span style={{ color: "#FFFFFF" }}>2.41 MON</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1vw" }}>
                <span style={{ color: "#8A8A9E" }}>Gas estimate</span>
                <span style={{ color: "#FFFFFF" }}>21,000 units</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1vw" }}>
                <span style={{ color: "#8A8A9E" }}>Recipient contract</span>
                <span style={{ color: "#FFFFFF" }}>No (EOA)</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "3vw", height: "2px", backgroundColor: "#3D5AF1" }} />
            <div style={{ width: "0", height: "0", borderTop: "1vh solid transparent", borderBottom: "1vh solid transparent", borderLeft: "1.5vw solid #3D5AF1" }} />
          </div>

          {/* Decision */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.9)", border: "1px solid #4A4A5A", padding: "2.5vh 2vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "2vh" }}>OUTPUT · 输出</div>
            <div style={{ backgroundColor: "rgba(61,90,241,0.15)", border: "1px solid #3D5AF1", padding: "2vh 1.5vw", textAlign: "center", marginBottom: "1.5vh", width: "100%" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1vw", fontWeight: 700, color: "#3D5AF1", letterSpacing: "0.08em" }}>READY_FOR_WALLET_REVIEW</div>
            </div>
            <div style={{ fontSize: "0.85vw", color: "#8A8A9E", textAlign: "center", marginBottom: "2vh" }}>or</div>
            <div style={{ backgroundColor: "rgba(139,26,43,0.15)", border: "1px solid #8B1A2B", padding: "2vh 1.5vw", textAlign: "center", marginBottom: "1.5vh", width: "100%" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.2vw", fontWeight: 700, color: "#8B1A2B", letterSpacing: "0.15em" }}>BLOCKED</div>
            </div>
            <div style={{ fontSize: "0.9vw", color: "#8A8A9E", textAlign: "center", lineHeight: 1.5 }}>
              + 9 safety flags
            </div>
            <div style={{ fontSize: "0.85vw", color: "#6A6A7E", textAlign: "center" }}>
              + unsigned tx + A2A provenance
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 08</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#8B1A2B" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
