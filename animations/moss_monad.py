# RENDER: manim -qh animations/moss_monad.py MossMonadRelation -o moss_monad.mp4
"""
MossMonadRelation — side-by-side comparison of official Moss and this adapter.
Duration: ~40 seconds
"""

from manim import *

NAVY = "#040d1a"
TEAL = "#00ccaa"
VIOLET = "#7c3aed"
AMBER = "#f59e0b"
WHITE = "#e2e8f0"
GRAY = "#334155"
GREEN = "#22c55e"

CAPTION_COLOR = "#cbd5e1"
CAPTION_Y = -3.6


def make_caption(text, font_size=13):
    return Text(text, font_size=font_size, color=CAPTION_COLOR, line_spacing=0.85)


class MossMonadRelation(Scene):
    def construct(self):
        self.camera.background_color = NAVY

        # ── Subtitle bar background ────────────────────────────────────────
        cap_bg = Rectangle(
            width=14.2, height=0.72,
            fill_color="#000000", fill_opacity=0.55, stroke_width=0,
        )
        cap_bg.move_to([0, CAPTION_Y, 0])
        self.add(cap_bg)

        current_cap = [None]

        def set_caption(new_text, rt=0.25):
            new_mob = make_caption(new_text)
            new_mob.move_to([0, CAPTION_Y, 0])
            if current_cap[0] is None:
                self.play(FadeIn(new_mob), run_time=rt)
            else:
                self.play(
                    FadeOut(current_cap[0], run_time=rt * 0.6),
                    FadeIn(new_mob, run_time=rt),
                )
            current_cap[0] = new_mob

        def clear_caption(rt=0.2):
            if current_cap[0] is not None:
                self.play(FadeOut(current_cap[0]), run_time=rt)
                current_cap[0] = None

        # ── Title ──────────────────────────────────────────────────────────
        title = Text("Official Moss vs. This Testnet Adapter", font_size=30, color=TEAL)
        title.to_edge(UP, buff=0.3)
        set_caption("How does this open-source adapter relate to the official Moss protocol on Monad?")
        self.play(Write(title), run_time=0.8)
        self.wait(0.3)

        # ── Left: Official Moss ────────────────────────────────────────────
        moss_rect = RoundedRectangle(
            corner_radius=0.2, width=5.2, height=5.8,
            color=VIOLET, fill_color=VIOLET, fill_opacity=0.12, stroke_width=2.5,
        )
        moss_rect.move_to([-3.2, -0.3, 0])

        moss_title = Text("Official Moss", font_size=20, color=VIOLET, weight=BOLD)
        moss_title.move_to(moss_rect.get_center() + UP * 2.4)

        moss_badge = RoundedRectangle(
            corner_radius=0.12, width=2.4, height=0.45,
            color=VIOLET, fill_color=VIOLET, fill_opacity=0.3, stroke_width=1.5,
        )
        moss_badge.next_to(moss_title, DOWN, buff=0.15)
        moss_badge_lbl = Text("docs.moss.ag", font_size=11, color=WHITE)
        moss_badge_lbl.move_to(moss_badge.get_center())

        moss_items = [
            "Network:   Monad Mainnet",
            "Chain ID:  143",
            "Scope:     Full DeFi suite",
            "Tokens:    MON + ERC-20s",
            "Actions:   Transfer, Swap,",
            "           Approve, Stake…",
            "Status:    Production",
        ]
        moss_texts = VGroup(*[
            Text(item, font_size=12, color=WHITE)
            for item in moss_items
        ]).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        moss_texts.move_to(moss_rect.get_center() + DOWN * 0.55)

        moss_grp = VGroup(moss_rect, moss_title, moss_badge, moss_badge_lbl, moss_texts)

        # ── Right: This adapter ────────────────────────────────────────────
        app_rect = RoundedRectangle(
            corner_radius=0.2, width=5.2, height=5.8,
            color=TEAL, fill_color=TEAL, fill_opacity=0.12, stroke_width=2.5,
        )
        app_rect.move_to([3.2, -0.3, 0])

        app_title = Text("Moss MCP\nTransaction Preview", font_size=18, color=TEAL, weight=BOLD, line_spacing=0.9)
        app_title.move_to(app_rect.get_center() + UP * 2.25)

        app_badge = RoundedRectangle(
            corner_radius=0.12, width=2.4, height=0.45,
            color=TEAL, fill_color=TEAL, fill_opacity=0.3, stroke_width=1.5,
        )
        app_badge.next_to(app_title, DOWN, buff=0.1)
        app_badge_lbl = Text("Replit / Open Source", font_size=11, color=WHITE)
        app_badge_lbl.move_to(app_badge.get_center())

        app_items = [
            "Network:   Monad Testnet",
            "Chain ID:  10143",
            "Scope:     MON transfer preview",
            "Tokens:    Native MON only",
            "Actions:   Preview only",
            "           (no signing)",
            "Status:    Prototype / Demo",
        ]
        app_texts = VGroup(*[
            Text(item, font_size=12, color=WHITE)
            for item in app_items
        ]).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        app_texts.move_to(app_rect.get_center() + DOWN * 0.55)

        app_grp = VGroup(app_rect, app_title, app_badge, app_badge_lbl, app_texts)

        # Animate sides
        set_caption("Official Moss runs on Monad Mainnet with a full DeFi suite — transfers, swaps, staking, and more.")
        self.play(FadeIn(moss_grp, shift=RIGHT * 0.3), run_time=0.8)
        self.wait(0.2)
        set_caption("This adapter targets Monad Testnet — scoped to native MON transfers with preview only, no signing.")
        self.play(FadeIn(app_grp, shift=LEFT * 0.3), run_time=0.8)
        self.wait(0.3)

        # ── Inspiration arrow ──────────────────────────────────────────────
        insp_arrow = CurvedArrow(
            moss_rect.get_right() + UP * 0.5,
            app_rect.get_left() + UP * 0.5,
            color=AMBER,
            stroke_width=2.5,
            angle=-TAU / 6,
        )
        insp_lbl = Text("Safety model inspiration", font_size=13, color=AMBER, weight=BOLD)
        insp_lbl.move_to([0, 1.6, 0])

        set_caption("The adapter's safety model is directly inspired by Moss — the same principles, applied to Testnet.")
        self.play(Create(insp_arrow), Write(insp_lbl), run_time=0.8)
        self.wait(0.3)

        # ── Highlight shared patterns ──────────────────────────────────────
        shared_title = Text(
            "Shared pattern:  discover → load → action → simulate",
            font_size=13, color=AMBER,
        )
        shared_title.move_to([0, 0.2, 0])
        set_caption("Both systems share the same four-step pattern: discover, load, action, simulate.")
        self.play(FadeIn(shared_title), run_time=0.5)
        self.wait(0.4)

        # ── Disclaimer ─────────────────────────────────────────────────────
        disc = RoundedRectangle(
            corner_radius=0.15, width=10.5, height=0.55,
            color=GRAY, fill_color=GRAY, fill_opacity=0.25, stroke_width=1,
        )
        disc.move_to([0, -3.5, 0])
        disc_lbl = Text(
            "Not official Moss execution — custom Testnet adapter for educational & competition use",
            font_size=11, color=WHITE,
        )
        disc_lbl.move_to(disc.get_center())
        set_caption("This is not official Moss — it's an open-source educational adapter built for competition.")
        self.play(FadeIn(disc), FadeIn(disc_lbl), run_time=0.6)
        self.wait(1.8)
        clear_caption()
