# RENDER: manim -qh animations/concepts.py ConceptsOverview -o concepts.mp4
"""
ConceptsOverview — four-quadrant layout explaining the protocol stack.
Duration: ~50 seconds
"""

from manim import *

NAVY = "#040d1a"
TEAL = "#00ccaa"
VIOLET = "#7c3aed"
AMBER = "#f59e0b"
WHITE = "#e2e8f0"
GRAY = "#334155"


def make_quadrant(title, color, content_lines, pos, w=5.8, h=2.9):
    rect = RoundedRectangle(
        corner_radius=0.18, width=w, height=h,
        color=color, fill_color=color, fill_opacity=0.10, stroke_width=2,
    )
    rect.move_to(pos)

    title_lbl = Text(title, font_size=15, color=color, weight=BOLD)
    title_lbl.move_to(pos + UP * (h / 2 - 0.28))

    sep = Line(
        pos + LEFT * (w / 2 - 0.15) + UP * (h / 2 - 0.52),
        pos + RIGHT * (w / 2 - 0.15) + UP * (h / 2 - 0.52),
        color=color, stroke_width=0.8,
    )

    body_items = []
    for j, line in enumerate(content_lines):
        t = Text(line, font_size=10, color=WHITE, line_spacing=0.85)
        t.move_to(pos + UP * (h / 2 - 0.78 - j * 0.44))
        body_items.append(t)

    return VGroup(rect, title_lbl, sep, *body_items)


class ConceptsOverview(Scene):
    def construct(self):
        self.camera.background_color = NAVY

        # Title
        title = Text("Protocol Stack — Four Core Concepts", font_size=30, color=TEAL)
        title.to_edge(UP, buff=0.25)
        self.play(Write(title), run_time=0.8)
        self.wait(0.2)

        # Quadrant positions
        positions = [
            [-3.3, 1.2, 0],   # TL
            [3.3, 1.2, 0],    # TR
            [-3.3, -2.0, 0],  # BL
            [3.3, -2.0, 0],   # BR
        ]

        quads_data = [
            (
                "A2A — Agent-to-Agent Protocol",
                VIOLET,
                [
                    "Open Google protocol for agent communication",
                    "Agent Card advertises skills + endpoints",
                    "Task lifecycle: submitted → working → completed",
                    "Artifact carries structured preview result",
                    "Any external agent can discover & call this gateway",
                ],
            ),
            (
                "MCP — Model Context Protocol",
                AMBER,
                [
                    "Anthropic standard for tool invocation",
                    "Stdio transport: gateway spawns MCP subprocess",
                    "4 tools: discover → load → action → simulate",
                    "Each tool is narrowly scoped to one RPC concern",
                    "Tool results flow back as structured JSON",
                ],
            ),
            (
                "Agent Skills — SKILL.md",
                TEAL,
                [
                    "Version-controlled markdown rule file",
                    "9 rules: NO_SIGNING, TESTNET_ONLY, etc.",
                    "SHA-256 hashed at startup",
                    "Hash embedded in every preview artifact",
                    "Reviewers can verify exact rule set applied",
                ],
            ),
            (
                "Agent Stack — BeeAI",
                "#60a5fa",
                [
                    "Framework for discovering A2A-compatible agents",
                    "Registration: agentstack add <agent-card-url>",
                    "Unmanaged agent pattern — runs on Replit",
                    "Agent Stack calls externally via HTTP",
                    "No Agent Stack runtime embedded in app",
                ],
            ),
        ]

        quad_groups = []
        for i, (qtitle, color, lines) in enumerate(quads_data):
            grp = make_quadrant(qtitle, color, lines, positions[i])
            quad_groups.append(grp)

        # Animate quadrants
        for i, grp in enumerate(quad_groups):
            direction = [LEFT, RIGHT, LEFT, RIGHT][i]
            self.play(FadeIn(grp, shift=direction * 0.3), run_time=0.7)
            self.wait(0.25)

        # Centre divider lines
        h_line = DashedLine(
            [-6.8, -0.45, 0], [6.8, -0.45, 0],
            color=GRAY, stroke_width=0.7,
        )
        v_line = DashedLine(
            [0, 3.2, 0], [0, -3.8, 0],
            color=GRAY, stroke_width=0.7,
        )
        self.play(Create(h_line), Create(v_line), run_time=0.5)

        # Centre label
        centre = Text("Moss MCP\nTransaction Preview", font_size=11, color=GRAY, line_spacing=0.9)
        centre.move_to([0, -0.45, 0])
        self.play(FadeIn(centre), run_time=0.4)
        self.wait(2.0)
