const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0D0D12", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", position: "relative", color: "#FFFFFF" }}>

      {/* Hero background image */}
      <img src={`${base}hero.jpg`} crossOrigin="anonymous" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.25, zIndex: 0 }} />

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0D0D12 40%, rgba(13,13,18,0.7) 100%)", zIndex: 1 }} />

      {/* Left angular panel */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "32vw", height: "100vh", backgroundColor: "rgba(21,21,28,0.85)", clipPath: "polygon(0 0, 100% 0, 62% 100%, 0% 100%)", zIndex: 2 }} />

      {/* Crimson rotated frame */}
      <div style={{ position: "absolute", bottom: "-8vh", right: "-8vw", width: "55vw", height: "55vh", borderTop: "2px solid #8B1A2B", borderLeft: "2px solid #8B1A2B", transform: "rotate(-15deg)", opacity: 0.25, zIndex: 2 }} />

      {/* Blue accent cross */}
      <div style={{ position: "absolute", top: "22vh", right: "16vw", width: "18vw", height: "1px", backgroundColor: "#3D5AF1", opacity: 0.5, zIndex: 2 }} />
      <div style={{ position: "absolute", top: "22vh", right: "16vw", width: "1px", height: "9vh", backgroundColor: "#3D5AF1", opacity: 0.5, zIndex: 2 }} />

      {/* HUD corners */}
      <div style={{ position: "absolute", top: "3vh", left: "3vw", width: "5vw", height: "5vh", borderTop: "2px solid #3D5AF1", borderLeft: "2px solid #3D5AF1", zIndex: 10 }} />
      <div style={{ position: "absolute", bottom: "3vh", right: "3vw", width: "5vw", height: "5vh", borderBottom: "2px solid #8B1A2B", borderRight: "2px solid #8B1A2B", zIndex: 10 }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5vh 6vw", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3vw", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>MOSS.MCP</div>
          <div style={{ width: "2px", height: "2vh", backgroundColor: "#4A4A5A" }} />
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8B1A2B" }}>[ SYS.ONLINE ]</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#3D5AF1" }} />
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.12em", color: "#8A8A9E" }}>2026 // COMPETITION</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 9vw", position: "relative", zIndex: 10 }}>

        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "2.5vh" }}>
          <div style={{ backgroundColor: "#8B1A2B", color: "#FFFFFF", padding: "0.5vh 1.2vw", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.15em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}>
            WEB3 HACKATHON
          </div>
          <div style={{ fontSize: "0.85vw", letterSpacing: "0.2em", color: "#8A8A9E", textTransform: "uppercase" }}>Competition Submission</div>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "6.5vw", margin: "0 0 0.5vh 0", fontWeight: 700, lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#FFFFFF" }}>Moss MCP</span><br />
          <span style={{ color: "#3D5AF1" }}>Transaction</span><br />
          <span style={{ color: "#FFFFFF" }}>Preview</span>
        </h1>

        {/* Chinese title */}
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2vw", color: "#A0A0B5", marginBottom: "2.5vh", letterSpacing: "0.04em" }}>
          Moss MCP 交易预览
        </div>

        {/* Divider */}
        <div style={{ width: "8vw", height: "4px", backgroundColor: "#8B1A2B", marginBottom: "3vh" }} />

        {/* Subtitle */}
        <p style={{ fontSize: "1.4vw", margin: "0 0 4vh 0", lineHeight: 1.6, color: "#A0A0B5", maxWidth: "42vw" }}>
          Understand before you sign.<br />
          <span style={{ color: "#8A8A9E", fontSize: "1.2vw" }}>签名前先了解。</span>
        </p>

        {/* Info row */}
        <div style={{ display: "flex", alignItems: "center", gap: "2vw", backgroundColor: "rgba(21,21,28,0.85)", padding: "2vh 2.5vw", borderLeft: "4px solid #3D5AF1", width: "fit-content" }}>
          <div>
            <div style={{ fontSize: "0.75vw", letterSpacing: "0.15em", color: "#8A8A9E", marginBottom: "0.5vh" }}>LIVE DEMO</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1vw", fontWeight: 600, color: "#3D5AF1" }}>moss-mcp-transaction.replit.app</div>
          </div>
          <div style={{ width: "1px", height: "5vh", backgroundColor: "#4A4A5A" }} />
          <div>
            <div style={{ fontSize: "0.75vw", letterSpacing: "0.15em", color: "#8A8A9E", marginBottom: "0.5vh" }}>GITHUB</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>sunshineluyao/Moss-Mcp-Transaction</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5vh 6vw", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", gap: "0.5vw" }}>
          <div style={{ width: "2vw", height: "4px", backgroundColor: "#3D5AF1" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
          <div style={{ width: "0.5vw", height: "4px", backgroundColor: "#4A4A5A" }} />
        </div>
        <div style={{ fontSize: "0.75vw", letterSpacing: "0.2em", color: "#4A4A5A" }}>PAGE // 01</div>
      </div>
    </div>
  );
}
