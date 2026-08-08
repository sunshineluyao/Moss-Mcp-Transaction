# RENDER: manim -qh animations/transaction_lifecycle.py TransactionLifecycle -o transaction_lifecycle.mp4
"""
TransactionLifecycle — animates the lifecycle of a single transfer preview.
Duration: ~55 seconds
"""

from manim import *

NAVY = "#040d1a"
TEAL = "#00ccaa"
VIOLET = "#7c3aed"
AMBER = "#f59e0b"
WHITE = "#e2e8f0"
GRAY = "#334155"
GREEN = "#22c55e"
RED = "#ef4444"


class TransactionLifecycle(Scene):
    def construct(self):
        self.camera.background_color = NAVY

        # ── Title ──────────────────────────────────────────────────────────
        title = Text("Transaction Preview Lifecycle", font_size=32, color=TEAL)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title), run_time=0.8)
        self.wait(0.2)

        # ── User intent box ────────────────────────────────────────────────
        intent_rect = RoundedRectangle(
            corner_radius=0.15, width=5.5, height=1.1,
            color=VIOLET, fill_color=VIOLET, fill_opacity=0.18, stroke_width=2,
        )
        intent_rect.move_to([-2.5, 2.5, 0])
        intent_title = Text("User Intent", font_size=15, color=VIOLET, weight=BOLD)
        intent_title.move_to(intent_rect.get_center() + UP * 0.22)
        intent_body = Text(
            "sender: 0xf39F…  →  recipient: 0x7099…  amount: 0.5 MON",
            font_size=10, color=WHITE,
        )
        intent_body.move_to(intent_rect.get_center() - UP * 0.2)

        self.play(FadeIn(intent_rect), Write(intent_title), FadeIn(intent_body), run_time=0.7)
        self.wait(0.3)

        # ── Four MCP tools ─────────────────────────────────────────────────
        tools = [
            ("preview_discover", "Lists available actions:\n['transfer_native_mon']"),
            ("preview_load", "Returns action schema:\nfields, validation rules"),
            ("preview_action", "Builds unsigned tx:\n{to, value, gas, chainId}"),
            ("preview_simulate", "Fetches live data:\nbalance, block, gas estimate"),
        ]
        tool_rects = []
        tool_groups = []
        y_positions = [1.4, 0.3, -0.8, -1.9]

        tool_label = Text("MCP Tool Calls (stdio)", font_size=13, color=AMBER)
        tool_label.move_to([2.8, 2.1, 0])
        self.play(FadeIn(tool_label), run_time=0.4)

        for i, (name, desc) in enumerate(tools):
            rect = RoundedRectangle(
                corner_radius=0.12, width=5.0, height=0.85,
                color=AMBER, fill_color=AMBER, fill_opacity=0.12, stroke_width=1.8,
            )
            rect.move_to([2.8, y_positions[i], 0])

            n_lbl = Text(name, font_size=13, color=AMBER, weight=BOLD)
            n_lbl.move_to(rect.get_center() + UP * 0.18)
            d_lbl = Text(desc, font_size=10, color=WHITE, line_spacing=0.8)
            d_lbl.move_to(rect.get_center() - UP * 0.17)

            grp = VGroup(rect, n_lbl, d_lbl)
            tool_rects.append(rect)
            tool_groups.append(grp)

            self.play(FadeIn(grp, shift=LEFT * 0.2), run_time=0.45)

            # Connecting arrow from intent box after first tool
            if i == 0:
                arr = Arrow(
                    intent_rect.get_right(),
                    rect.get_left(),
                    buff=0.08, color=WHITE, stroke_width=1.5, tip_length=0.15,
                )
                self.play(Create(arr), run_time=0.3)
            elif i > 0:
                arr = Arrow(
                    tool_rects[i - 1].get_bottom() + DOWN * 0,
                    rect.get_top(),
                    buff=0.05, color=GRAY, stroke_width=1.2, tip_length=0.13,
                )
                self.play(Create(arr), run_time=0.25)

            self.wait(0.2)

        # ── Live data box ──────────────────────────────────────────────────
        data_rect = RoundedRectangle(
            corner_radius=0.12, width=5.5, height=1.2,
            color=TEAL, fill_color=TEAL, fill_opacity=0.12, stroke_width=2,
        )
        data_rect.move_to([-2.5, 0.6, 0])
        data_title = Text("Live Testnet Data", font_size=14, color=TEAL, weight=BOLD)
        data_title.move_to(data_rect.get_center() + UP * 0.3)

        data_fields = VGroup(
            Text("block: 4,521,307", font_size=10, color=WHITE),
            Text("balance: 12.34 MON", font_size=10, color=WHITE),
            Text("gas: 21,000 units ≈ 0.00042 MON", font_size=10, color=WHITE),
        ).arrange(DOWN, buff=0.05)
        data_fields.move_to(data_rect.get_center() - UP * 0.15)

        arr_live = Arrow(
            tool_rects[3].get_left(),
            data_rect.get_right(),
            buff=0.08, color=TEAL, stroke_width=1.5, tip_length=0.15,
        )
        self.play(FadeIn(data_rect), Write(data_title), Create(arr_live), run_time=0.5)
        self.play(FadeIn(data_fields, shift=UP * 0.1), run_time=0.5)
        self.wait(0.3)

        # ── Safety rules checklist ─────────────────────────────────────────
        rules = [
            "RECORD_INTENT", "TESTNET_ONLY", "DECIMAL_STRINGS",
            "NO_PRIVATE_KEYS", "NO_SIGNING", "NO_BROADCAST",
            "SIMULATION_REQUIRED", "STOP_ON_WARNING", "PRESENT_BEFORE_SIGNING",
        ]
        rules_title = Text("Safety Rules (SKILL.md)", font_size=13, color=VIOLET)
        rules_title.move_to([-2.5, -0.8, 0])
        self.play(FadeIn(rules_title), run_time=0.3)

        check_items = []
        cols = [[-4.2, None, 0], [-2.5, None, 0], [-0.8, None, 0]]
        for i, rule in enumerate(rules):
            col = i % 3
            row = i // 3
            x = cols[col][0]
            y = -1.25 - row * 0.38

            dot = Dot(radius=0.07, color=GRAY)
            dot.move_to([x - 0.25, y, 0])
            lbl = Text(rule, font_size=9, color=GRAY)
            lbl.move_to([x + 0.35, y, 0])
            check_items.append((dot, lbl))
            self.add(dot, lbl)

        self.wait(0.2)

        # Animate rules turning green
        for i, (dot, lbl) in enumerate(check_items):
            check = Text("✓", font_size=11, color=GREEN)
            check.move_to(dot.get_center())
            self.play(
                FadeOut(dot),
                FadeIn(check),
                lbl.animate.set_color(GREEN),
                run_time=0.18,
            )

        self.wait(0.3)

        # ── Decision badge ──────────────────────────────────────────────────
        badge = RoundedRectangle(
            corner_radius=0.2, width=5.0, height=0.7,
            color=GREEN, fill_color=GREEN, fill_opacity=0.2, stroke_width=2.5,
        )
        badge.move_to([-2.5, -2.9, 0])
        badge_lbl = Text("✓  READY_FOR_WALLET_REVIEW", font_size=19, color=GREEN, weight=BOLD)
        badge_lbl.move_to(badge.get_center())
        self.play(FadeIn(badge), Write(badge_lbl), run_time=0.8)
        self.wait(1.5)
