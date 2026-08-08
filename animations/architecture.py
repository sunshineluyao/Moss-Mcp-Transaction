# RENDER: manim -qh animations/architecture.py ArchitectureFlow -o architecture.mp4
"""
ArchitectureFlow — animates the live preview data flow step by step.
Duration: ~45 seconds
"""

from manim import *

# Palette
NAVY = "#040d1a"
TEAL = "#00ccaa"
VIOLET = "#7c3aed"
AMBER = "#f59e0b"
WHITE = "#e2e8f0"
GRAY = "#334155"


class ArchitectureFlow(Scene):
    def construct(self):
        self.camera.background_color = NAVY

        # Title
        title = Text("Moss MCP — Live Preview Data Flow", font_size=32, color=TEAL)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title), run_time=1.0)
        self.wait(0.3)

        # Node definitions: (label, sublabel, color)
        nodes_data = [
            ("React UI", "moss-mcp frontend", TEAL),
            ("Agent Gateway", "Express + A2A SDK", VIOLET),
            ("A2A JSON-RPC", "/a2a endpoint", VIOLET),
            ("MCP stdio server", "4 tools", AMBER),
            ("Monad Testnet RPC", "chain 10143", TEAL),
        ]

        # Build node rectangles
        rects = []
        labels = []
        sub_labels = []
        x_positions = [-5.5, -2.8, 0, 2.8, 5.5]

        for i, (label, sub, color) in enumerate(nodes_data):
            rect = RoundedRectangle(
                corner_radius=0.15,
                width=2.3,
                height=1.1,
                color=color,
                fill_color=color,
                fill_opacity=0.15,
                stroke_width=2,
            )
            rect.move_to([x_positions[i], 0.5, 0])

            lbl = Text(label, font_size=16, color=color, weight=BOLD)
            lbl.move_to(rect.get_center() + UP * 0.15)

            sub_lbl = Text(sub, font_size=11, color=WHITE)
            sub_lbl.move_to(rect.get_center() - UP * 0.22)

            rects.append(rect)
            labels.append(lbl)
            sub_labels.append(sub_lbl)

        # Arrow labels
        arrow_labels_text = [
            "POST /api/preview",
            "A2A task",
            "tool calls",
            "eth_getBalance\neth_estimateGas\neth_blockNumber",
        ]

        # Animate nodes one by one
        for i in range(len(rects)):
            self.play(
                FadeIn(rects[i], shift=DOWN * 0.2),
                Write(labels[i]),
                FadeIn(sub_labels[i]),
                run_time=0.5,
            )

            # Draw arrow to next node
            if i < len(rects) - 1:
                arrow = Arrow(
                    rects[i].get_right(),
                    rects[i + 1].get_left(),
                    buff=0.05,
                    color=WHITE,
                    stroke_width=2,
                    tip_length=0.18,
                )
                albl = Text(arrow_labels_text[i], font_size=9, color=GRAY)
                albl.next_to(arrow, UP, buff=0.08)
                self.play(Create(arrow), FadeIn(albl), run_time=0.5)

            self.wait(0.2)

        # Annotation row
        annotations = [
            "Renders the\npreview form",
            "Orchestrates\nthe A2A task",
            "Validates skill\nhash, enforces\n9 safety rules",
            "Calls Testnet\nRPC; returns\nunsigned tx",
            "Source of truth\nfor live data",
        ]
        ann_objects = []
        for i, ann in enumerate(annotations):
            box = RoundedRectangle(
                corner_radius=0.1,
                width=2.2,
                height=1.05,
                color=GRAY,
                fill_color=GRAY,
                fill_opacity=0.18,
                stroke_width=1,
            )
            box.move_to([x_positions[i], -1.3, 0])
            t = Text(ann, font_size=10, color=WHITE, line_spacing=0.8)
            t.move_to(box.get_center())
            ann_objects.append(VGroup(box, t))

        self.play(
            *[FadeIn(a, shift=UP * 0.15) for a in ann_objects],
            run_time=0.8,
        )
        self.wait(0.5)

        # SKILL.md dashed arrow
        skill_box = RoundedRectangle(
            corner_radius=0.12,
            width=2.0,
            height=0.6,
            color=AMBER,
            fill_color=AMBER,
            fill_opacity=0.12,
            stroke_width=1.5,
        )
        skill_box.move_to([0, 2.1, 0])
        skill_lbl = Text("SKILL.md\n9 safety rules", font_size=12, color=AMBER)
        skill_lbl.move_to(skill_box.get_center())
        skill_grp = VGroup(skill_box, skill_lbl)

        dashed_arrow = DashedLine(
            skill_box.get_bottom(),
            rects[2].get_top(),
            color=AMBER,
            stroke_width=1.5,
        )
        skill_note = Text("loaded at startup", font_size=9, color=AMBER)
        skill_note.next_to(dashed_arrow, RIGHT, buff=0.08)

        self.play(FadeIn(skill_grp), run_time=0.4)
        self.play(Create(dashed_arrow), FadeIn(skill_note), run_time=0.5)
        self.wait(0.4)

        # Final badge
        badge = RoundedRectangle(
            corner_radius=0.2,
            width=4.5,
            height=0.65,
            color=TEAL,
            fill_color=TEAL,
            fill_opacity=0.22,
            stroke_width=2,
        )
        badge.move_to([0, -2.7, 0])
        badge_lbl = Text("✓  READY_FOR_WALLET_REVIEW", font_size=18, color=TEAL, weight=BOLD)
        badge_lbl.move_to(badge.get_center())
        self.play(FadeIn(badge), Write(badge_lbl), run_time=0.8)
        self.wait(1.5)
