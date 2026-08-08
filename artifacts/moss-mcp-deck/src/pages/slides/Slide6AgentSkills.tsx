export default function Slide6AgentSkills() {
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

        {/* Left */}
        <div style={{ width: "28vw", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
            <div style={{ backgroundColor: "#8B1A2B", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 05</div>
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
            Agent <span style={{ color: "#8B1A2B" }}>Skills</span>
          </h2>
          <div style={{ fontSize: "1.4vw", color: "#A0A0B5", marginBottom: "1.2vh", fontFamily: "'Space Grotesk', sans-serif" }}>安全规则引擎</div>
          <div style={{ width: "6vw", height: "4px", backgroundColor: "#3D5AF1", marginBottom: "2.5vh" }} />

          <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7, marginBottom: "1vh" }}>
            SKILL.md: a version-controlled markdown file encoding 9 safety rules. SHA-256 hash embedded in every preview artifact.
          </div>
          <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2.5vh" }}>
            版本控制的 Markdown 文件，9 条安全规则。SHA-256 哈希嵌入每个预览 artifact。
          </div>

          {/* Hash callout */}
          <div style={{ backgroundColor: "rgba(61,90,241,0.1)", border: "1px solid rgba(61,90,241,0.4)", padding: "1.5vh 1.5vw" }}>
            <div style={{ fontSize: "0.75vw", color: "#8A8A9E", letterSpacing: "0.12em", marginBottom: "0.5vh" }}>SHA-256 VERIFIED AT STARTUP</div>
            <div style={{ fontSize: "0.9vw", color: "#3D5AF1", fontFamily: "'DM Mono', monospace" }}>skills/monad-safe-transfer-preview/SKILL.md</div>
          </div>
        </div>

        {/* Right: 9 rules grid */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.2vh" }}>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", marginBottom: "0.5vh" }}>9 ENFORCED RULES · 9 条执行规则</div>

          <div style={{ display: "flex", gap: "1.5vw" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #3D5AF1", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.05em" }}>RECORD_INTENT</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>记录转账意图</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #3D5AF1", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>TESTNET_ONLY</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>仅限测试网</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #3D5AF1", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>DECIMAL_STRINGS</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>使用十进制字符串</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #8B1A2B", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>NO_PRIVATE_KEYS</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>不存储私钥</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #8B1A2B", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>NO_SIGNING</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>不签署交易</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #8B1A2B", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>NO_BROADCAST</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>不广播交易</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #3D5AF1", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>SIMULATION_REQUIRED</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>必须模拟预检</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #3D5AF1", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#FFFFFF" }}>STOP_ON_WARNING</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>警告时停止</div>
              </div>
              <div style={{ backgroundColor: "rgba(21,21,28,0.9)", borderLeft: "2px solid #3D5AF1", padding: "1.2vh 1.5vw" }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#3D5AF1" }}>PRESENT_BEFORE_SIGNING</div>
                <div style={{ fontSize: "0.85vw", color: "#8A8A9E" }}>签名前展示预览</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 06</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#8B1A2B" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
