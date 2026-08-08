export default function Slide5Protocols() {
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
          <div style={{ backgroundColor: "#3D5AF1", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>MODULE 04</div>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", textTransform: "uppercase" }}>Protocol Layer</div>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.2vw", margin: "0 0 0.3vh 0", fontWeight: 700, textTransform: "uppercase" }}>
          A2A + <span style={{ color: "#3D5AF1" }}>MCP</span>
        </h2>
        <div style={{ fontSize: "1.5vw", color: "#A0A0B5", marginBottom: "1vh", fontFamily: "'Space Grotesk', sans-serif" }}>协议层</div>
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "3vh" }} />

        <div style={{ display: "flex", gap: "3vw", flex: 1 }}>

          {/* A2A */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.8)", borderLeft: "3px solid #3D5AF1", padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.6vw", fontWeight: 700, color: "#3D5AF1", marginBottom: "0.5vh" }}>A2A Protocol</div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", marginBottom: "2vh" }}>Agent-to-Agent · by Google</div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7, marginBottom: "1vh" }}>
              Open protocol defining how AI agents communicate. Agent Card at /.well-known/agent-card.json — structured task to artifact flow.
            </div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2vh" }}>
              开放的 Agent 间通信协议 · Agent Card 位于 /.well-known/agent-card.json · 结构化任务→artifact 流。
            </div>
            <div style={{ backgroundColor: "rgba(61,90,241,0.1)", border: "1px solid rgba(61,90,241,0.3)", padding: "1.5vh 1.5vw" }}>
              <div style={{ fontSize: "0.85vw", color: "#8A8A9E", marginBottom: "0.5vh", letterSpacing: "0.1em" }}>AGENT CARD ENDPOINT</div>
              <div style={{ fontSize: "1vw", color: "#3D5AF1", fontFamily: "'DM Mono', monospace" }}>/agent-gateway/.well-known/agent-card.json</div>
            </div>
          </div>

          {/* MCP */}
          <div style={{ flex: 1, backgroundColor: "rgba(21,21,28,0.8)", borderLeft: "3px solid #8B1A2B", padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.6vw", fontWeight: 700, color: "#8B1A2B", marginBottom: "0.5vh" }}>MCP Protocol</div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", marginBottom: "2vh" }}>Model Context Protocol · by Anthropic</div>
            <div style={{ fontSize: "1.1vw", color: "#A0A0B5", lineHeight: 1.7, marginBottom: "1vh" }}>
              Tool interface for agents. 4 tools called in sequence via stdio transport.
            </div>
            <div style={{ fontSize: "1vw", color: "#8A8A9E", lineHeight: 1.6, marginBottom: "2vh" }}>
              Agent 工具调用接口 · 4 个工具通过 stdio 传输按序调用。
            </div>
            {/* Tool sequence */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1vh" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ backgroundColor: "#8B1A2B", color: "#fff", padding: "0.3vh 0.8vw", fontSize: "0.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>01</div>
                <div style={{ fontSize: "1vw", color: "#FFFFFF" }}>preview_discover</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ backgroundColor: "#8B1A2B", color: "#fff", padding: "0.3vh 0.8vw", fontSize: "0.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>02</div>
                <div style={{ fontSize: "1vw", color: "#FFFFFF" }}>preview_load</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ backgroundColor: "#8B1A2B", color: "#fff", padding: "0.3vh 0.8vw", fontSize: "0.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>03</div>
                <div style={{ fontSize: "1vw", color: "#FFFFFF" }}>preview_action</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ backgroundColor: "#3D5AF1", color: "#fff", padding: "0.3vh 0.8vw", fontSize: "0.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>04</div>
                <div style={{ fontSize: "1vw", color: "#3D5AF1" }}>preview_simulate</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 05</div>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#8B1A2B" }} />
        </div>
        <div style={{ fontSize: "0.8vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>V.1.0 // COMPETITION</div>
      </div>
    </div>
  );
}
