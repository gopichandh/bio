import sys
from rembg import remove, new_session
from PIL import Image, ImageFilter

session = new_session("u2net")


def process(src, dst, max_dim=1400, feather=14, erode=5, pad=60):
    img = Image.open(src).convert("RGBA")
    cut = remove(
        img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    # crop to content
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)

    # resize down to a sensible max dimension
    w, h = cut.size
    scale = min(max_dim / w, max_dim / h, 1.0)
    if scale < 1.0:
        cut = cut.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # Pad a transparent margin so a strong blur has room to fade all the way
    # to zero instead of clipping at the image edge (which reads as a border).
    canvas = Image.new(
        "RGBA", (cut.size[0] + pad * 2, cut.size[1] + pad * 2), (0, 0, 0, 0)
    )
    canvas.paste(cut, (pad, pad), cut)

    # --- Feather the alpha HARD so the portrait dissolves into the page
    # background with no perceptible cutout border / halo anywhere ---
    r, g, b, a = canvas.split()
    # erode alpha inward to eat the light matte halo rembg leaves behind
    a = a.filter(ImageFilter.MinFilter(erode * 2 + 1))
    # strong gaussian feather -> soft, borderless edge that blends into bg
    a = a.filter(ImageFilter.GaussianBlur(feather))
    out = Image.merge("RGBA", (r, g, b, a))

    out.save(dst)
    print(f"{dst} -> {out.size}")


# The new suited portrait is the single source for both the hero and the
# About section. We generate both cutout filenames the app expects from it so
# the background is fully removed and the edges feather into the page.
process(
    "public/images/vilas.jpg",
    "public/images/vilas-cutout.png",
)
process(
    "public/images/vilas.jpg",
    "public/images/vilas1-cutout.png",
    max_dim=1100,
)
print("done")
