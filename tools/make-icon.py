# Relay icon: three signal lines (a stylised R), yellow (#F2B33D) on charcoal (#1C1E22). Same as the site logo.
# Geometry is in the 72-unit window Android shows (the adaptive icon's visible area); the lines run off the left and bottom edges.
import math
from PIL import Image, ImageDraw
YEL = (242, 179, 61, 255); BG = (28, 30, 34, 255)
W, CY, CX, RADII = 10, 58, 14, [46, 30, 14]   # stroke, arc centre y and x, radii: same numbers as the site's SVG paths

def band(r, off, scale):
    """one line as a filled shape: along the top, round the quarter turn, down the side (no stroke joins to go wrong)"""
    ro, ri = r + W / 2, r - W / 2
    arc = lambda rr, rev: [(CX + rr * math.cos(a), CY + rr * math.sin(a)) for a in ([-math.pi / 2 + (math.pi / 2) * k / 90 for k in range(91)][::-1 if rev else 1])]
    pts = [(-200, CY - ro)] + arc(ro, False) + [(CX + ro, 300), (CX + ri, 300)] + arc(ri, True) + [(-200, CY - ri)]
    return [((x + off) * scale, (y + off) * scale) for x, y in pts]

def icon(size, units, off, bg=None, shape=None):
    """units: how many icon units the image spans (108 for an adaptive foreground, 72 for a full-bleed icon); off: where the 72 window starts."""
    S = size * 4; sc = S / units
    im = Image.new("RGBA", (S, S), bg or (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for r in RADII: d.polygon(band(r, off, sc), fill=YEL)
    if shape == "circle":
        m = Image.new("L", (S, S), 0); ImageDraw.Draw(m).ellipse([0, 0, S - 1, S - 1], fill=255)
        out = Image.new("RGBA", (S, S), (0, 0, 0, 0)); out.paste(im, (0, 0), m); im = out
    return im.resize((size, size), Image.LANCZOS)

dens = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
R = "android/app/src/main/res/mipmap-"
for k, f in dens.items():
    icon(int(108 * f), 108, 18).save(f"{R}{k}/ic_launcher_foreground.png")
    icon(int(48 * f), 72, 0, BG).save(f"{R}{k}/ic_launcher.png")
    icon(int(48 * f), 72, 0, BG, "circle").save(f"{R}{k}/ic_launcher_round.png")
icon(192, 72, 0, BG).save("www/icons/icon-192.png"); icon(512, 72, 0, BG).save("www/icons/icon-512.png")
icon(512, 108, 18, BG).save("www/icons/maskable-512.png"); icon(432, 108, 18).save("www/icons/fg-432.png")
# preview: square, circle (as on a Pixel), small sizes
p = Image.new("RGBA", (900, 320), (240, 240, 236, 255))
p.paste(icon(256, 72, 0, BG), (24, 32)); c = icon(256, 72, 0, BG, "circle"); p.paste(c, (312, 32), c)
for i, s in enumerate([96, 48]): im = icon(s, 72, 0, BG, "circle"); p.paste(im, (600 + i * 130, 32), im)
p.save("/tmp/claude-0/-home-claude/dc1edf1b-fb78-5c42-80d8-456691558370/scratchpad/shots/icon-preview.png")
