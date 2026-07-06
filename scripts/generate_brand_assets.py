from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "liberty-tree-five-lanterns-v2.png"
BRAND = ROOT / "public" / "brand"

NAVY = "#17375e"
NAVY_SOFT = "#214a76"
INK = "#20242a"
MUTED = "#5c6672"
BUFF = "#d9c6a3"
BUFF_LIGHT = "#e6d8b8"
IVORY = "#fbfaf6"
BRASS = "#8a6f43"


def load_source() -> np.ndarray:
    image = cv2.imread(str(SOURCE), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Could not load {SOURCE}")
    return image


def dark_mask(image: np.ndarray) -> np.ndarray:
    b, g, r = cv2.split(image)
    # Capture the navy/charcoal engraving and lantern outlines while ignoring the warm paper wash.
    mask = ((r < 158) & (g < 165) & (b < 180)).astype(np.uint8) * 255
    mask = cv2.medianBlur(mask, 3)
    return mask


def bbox_from_mask(mask: np.ndarray, pad: int = 28) -> tuple[int, int, int, int]:
    points = cv2.findNonZero(mask)
    if points is None:
        raise RuntimeError("No source artwork found")
    x, y, w, h = cv2.boundingRect(points)
    x = max(x - pad, 0)
    y = max(y - pad, 0)
    w = min(w + pad * 2, mask.shape[1] - x)
    h = min(h + pad * 2, mask.shape[0] - y)
    return x, y, w, h


def contours_to_path(mask: np.ndarray, epsilon: float, min_area: float, *, preserve_holes: bool = True) -> str:
    retrieval = cv2.RETR_LIST if preserve_holes else cv2.RETR_EXTERNAL
    contours, _ = cv2.findContours(mask, retrieval, cv2.CHAIN_APPROX_TC89_KCOS)
    paths: list[str] = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if len(approx) < 3:
            continue
        points = approx[:, 0, :]
        first = points[0]
        commands = [f"M{first[0]:.1f},{first[1]:.1f}"]
        commands.extend(f"L{point[0]:.1f},{point[1]:.1f}" for point in points[1:])
        commands.append("Z")
        paths.append(" ".join(commands))
    return " ".join(paths)


def traced_mark(
    image: np.ndarray,
    *,
    target_width: int,
    simplify: float = 0.9,
    min_area: float = 3.0,
    threshold: int = 142,
    compact: bool = False,
) -> tuple[str, float, float]:
    mask = dark_mask(image)
    x, y, w, h = bbox_from_mask(mask)
    crop = mask[y : y + h, x : x + w]
    scale = target_width / w
    target_height = int(round(h * scale))
    resized = cv2.resize(crop, (target_width, target_height), interpolation=cv2.INTER_AREA)
    _, resized = cv2.threshold(resized, threshold, 255, cv2.THRESH_BINARY)

    if compact:
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        resized = cv2.dilate(resized, kernel, iterations=1)
        resized = cv2.morphologyEx(resized, cv2.MORPH_CLOSE, kernel, iterations=1)
        # Remove tiny lantern/noise details that do not survive small sizes.
        contours, _ = cv2.findContours(resized, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        clean = np.zeros_like(resized)
        for contour in contours:
            if cv2.contourArea(contour) > 32:
                cv2.drawContours(clean, [contour], -1, 255, -1)
        resized = clean
    else:
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        resized = cv2.morphologyEx(resized, cv2.MORPH_OPEN, kernel, iterations=1)

    path = contours_to_path(resized, simplify, min_area, preserve_holes=not compact)
    return path, float(target_width), float(target_height)


def svg_document(width: int, height: int, body: str, title: str, desc: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
  <title id="title">{title}</title>
  <desc id="desc">{desc}</desc>
{body}
</svg>
"""


def lantern_paths(offset_x: float = 0, offset_y: float = 0, scale: float = 1) -> str:
    positions = [(43, 122), (94, 137), (145, 135), (197, 143), (247, 147)]
    parts = []
    for cx, top in positions:
        x = offset_x + cx * scale
        y = offset_y + top * scale
        parts.append(
            f'<path d="M{x:.1f},{y:.1f}v{36*scale:.1f}M{x-14*scale:.1f},{y+36*scale:.1f}h{28*scale:.1f}l{4*scale:.1f},{7*scale:.1f}v{31*scale:.1f}h{-36*scale:.1f}v{-31*scale:.1f}zM{x-12*scale:.1f},{y+48*scale:.1f}h{29*scale:.1f}M{x-11*scale:.1f},{y+71*scale:.1f}h{26*scale:.1f}" />'
        )
    return "\n".join(parts)


def small_tree_icon(
    *,
    stroke: str,
    accent: str | None = None,
    stroke_scale: float = 1.0,
    transform: str = "",
) -> str:
    accent_color = accent or stroke
    return f"""  <g{f' transform="{transform}"' if transform else ''} fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M64 108c4-24 3-47-2-70" stroke="{stroke}" stroke-width="{6.8 * stroke_scale:.2f}"/>
    <path d="M62 47c-17-11-36-13-54-7" stroke="{stroke}" stroke-width="{5.4 * stroke_scale:.2f}"/>
    <path d="M63 47c20-14 42-17 62-8" stroke="{stroke}" stroke-width="{5.4 * stroke_scale:.2f}"/>
    <path d="M64 64c-23-1-41 6-57 20" stroke="{stroke}" stroke-width="{4.8 * stroke_scale:.2f}"/>
    <path d="M65 64c24-5 43 1 58 15" stroke="{stroke}" stroke-width="{4.8 * stroke_scale:.2f}"/>
    <path d="M24 39c12-14 35-17 51-6" stroke="{accent_color}" stroke-width="{3.0 * stroke_scale:.2f}"/>
    <path d="M76 33c17-8 38-4 51 10" stroke="{accent_color}" stroke-width="{3.0 * stroke_scale:.2f}"/>
    <path d="M13 84c15-10 35-12 51-4" stroke="{accent_color}" stroke-width="{2.8 * stroke_scale:.2f}"/>
    <path d="M68 80c18-9 41-5 55 9" stroke="{accent_color}" stroke-width="{2.8 * stroke_scale:.2f}"/>
    <path d="M40 108c15 6 40 6 57 0" stroke="{stroke}" stroke-width="{3.2 * stroke_scale:.2f}"/>
  </g>"""


def make_primary(image: np.ndarray) -> str:
    path, mark_w, mark_h = traced_mark(image, target_width=430, simplify=0.78, min_area=2.0)
    body = f"""  <g transform="translate(54 42)">
    <path d="{path}" fill="{NAVY}" fill-rule="evenodd"/>
  </g>
  <g transform="translate(570 112)">
    <text x="0" y="72" fill="{NAVY}" font-family="Georgia, Cambria, 'Times New Roman', serif" font-size="74">Liberty Tree</text>
    <text x="2" y="126" fill="{INK}" font-family="Inter, Arial, sans-serif" font-size="30">Compliance</text>
    <path d="M4 158h404" stroke="{BUFF}" stroke-width="3"/>
    <text x="4" y="209" fill="{MUTED}" font-family="Inter, Arial, sans-serif" font-size="22">Source-indexed compliance evidence</text>
  </g>
"""
    return svg_document(
        1200,
        430,
        body,
        "Liberty Tree Compliance Primary Logo",
        "Vectorized engraved Liberty Tree mark with five lower lanterns and full Liberty Tree Compliance wordmark.",
    )


def make_horizontal(image: np.ndarray) -> str:
    path, mark_w, mark_h = traced_mark(image, target_width=250, simplify=0.9, min_area=2.5)
    body = f"""  <g transform="translate(38 24)">
    <path d="{path}" fill="{NAVY}" fill-rule="evenodd"/>
  </g>
  <g transform="translate(336 58)">
    <text x="0" y="61" fill="{NAVY}" font-family="Georgia, Cambria, 'Times New Roman', serif" font-size="61">Liberty Tree</text>
    <text x="2" y="106" fill="{INK}" font-family="Inter, Arial, sans-serif" font-size="25">Compliance</text>
    <path d="M3 132h330" stroke="{BUFF}" stroke-width="2.5"/>
  </g>
"""
    return svg_document(
        900,
        220,
        body,
        "Liberty Tree Compliance Horizontal Logo",
        "Horizontal Liberty Tree Compliance logo with a simplified vectorized engraved tree.",
    )


def make_compact(image: np.ndarray) -> str:
    body = small_tree_icon(stroke=NAVY, accent=NAVY_SOFT, stroke_scale=1.0)
    return svg_document(
        128,
        128,
        body,
        "Liberty Tree Compact Logo",
        "Simplified tree-only vector Liberty Tree mark optimized for 32 to 64 pixel rendering.",
    )


def make_favicon(image: np.ndarray) -> str:
    body = f"""  <rect width="64" height="64" fill="{NAVY}"/>
{small_tree_icon(stroke=BUFF_LIGHT, accent=BUFF, stroke_scale=1.0, transform="translate(2.5 6) scale(.46)")}
"""
    return svg_document(
        64,
        64,
        body,
        "Liberty Tree Icon",
        "Small-size Liberty Tree icon optimized for favicon and app icon use.",
    )


def make_seal(image: np.ndarray) -> str:
    path, mark_w, mark_h = traced_mark(image, target_width=230, simplify=0.95, min_area=2.5)
    body = f"""  <circle cx="260" cy="260" r="232" fill="{IVORY}" stroke="{NAVY}" stroke-width="8"/>
  <circle cx="260" cy="260" r="212" fill="none" stroke="{BUFF}" stroke-width="4"/>
  <circle cx="260" cy="260" r="166" fill="none" stroke="{BUFF}" stroke-width="2"/>
  <path id="sealTop" d="M86 267a174 174 0 0 1 348 0" fill="none"/>
  <text fill="{NAVY}" font-family="Georgia, Cambria, 'Times New Roman', serif" font-size="25" letter-spacing="1.4">
    <textPath href="#sealTop" startOffset="50%" text-anchor="middle">LIBERTY TREE COMPLIANCE</textPath>
  </text>
  <g transform="translate(145 147)">
    <path d="{path}" fill="{NAVY}" fill-rule="evenodd"/>
  </g>
  <text x="260" y="390" text-anchor="middle" fill="{NAVY}" font-family="Inter, Arial, sans-serif" font-size="16" letter-spacing=".5">PFAS EVIDENCE PACKETS</text>
  <path d="M202 413h116" stroke="{BUFF}" stroke-width="2.4"/>
  <text x="260" y="438" text-anchor="middle" fill="{MUTED}" font-family="Inter, Arial, sans-serif" font-size="10.5" letter-spacing=".7">SOURCE-INDEXED EVIDENCE RECORDS</text>
"""
    return svg_document(
        520,
        520,
        body,
        "Liberty Tree Compliance Report Seal",
        "Circular Liberty Tree Compliance seal for evidence packets, binders, and proposal covers.",
    )


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    image = load_source()
    outputs = {
        "primary-logo.svg": make_primary(image),
        "horizontal-logo.svg": make_horizontal(image),
        "compact-logo.svg": make_compact(image),
        "favicon.svg": make_favicon(image),
        "report-seal.svg": make_seal(image),
    }
    for filename, content in outputs.items():
        (BRAND / filename).write_text(content, encoding="utf-8")
    (ROOT / "app" / "icon.svg").write_text(outputs["favicon.svg"], encoding="utf-8")


if __name__ == "__main__":
    main()
