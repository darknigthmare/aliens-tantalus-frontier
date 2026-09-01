from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('assets/openai/sprites/frames/v66/batch-003/enemy-036-deacon-line')
clips = ['idle', 'move', 'attack', 'death']
boards = [Image.open(ROOT / f'{clip}.png').convert('RGB') for clip in clips]
thumbs = [board.resize((887, 444), Image.Resampling.LANCZOS) for board in boards]
sheet = Image.new('RGB', (1774, 928), (18, 18, 18))
draw = ImageDraw.Draw(sheet)
for index, (clip, thumb) in enumerate(zip(clips, thumbs)):
    x = (index % 2) * 887
    y = (index // 2) * 464 + 20
    sheet.paste(thumb, (x, y))
    draw.text((x + 8, y - 18), clip.upper(), fill=(255, 255, 255))
sheet.save('.tmp-deacon-036-contact.jpg', quality=72, optimize=True)

selected = []
for clip, board in zip(clips, boards):
    for frame in (0, 1, 2):
        col, row = frame % 4, frame // 4
        x0, x1 = round(col * board.width / 4), round((col + 1) * board.width / 4)
        y0, y1 = round(row * board.height / 2), round((row + 1) * board.height / 2)
        crop = board.crop((x0, y0, x1, y1))
        selected.append((clip, frame, crop))
grid = Image.new('RGB', (4 * 444, 3 * 484), (20, 20, 20))
for index, (clip, frame, crop) in enumerate(selected):
    x = (index % 4) * 444
    y = (index // 4) * 484 + 40
    grid.paste(crop, (x, y))
    g = ImageDraw.Draw(grid)
    g.text((x + 6, y - 34), f'{clip} f{frame}', fill=(255, 255, 255))
    for tick in range(0, 444, 50):
        g.line((x + tick, y, x + tick, y + 443), fill=(160, 0, 160), width=1)
        g.line((x, y + tick, x + 443, y + tick), fill=(160, 0, 160), width=1)
        g.text((x + tick + 2, y + 2), str(tick), fill=(255, 255, 255))
        g.text((x + 2, y + tick + 2), str(tick), fill=(255, 255, 255))
grid.save('.tmp-deacon-036-measure-grid.jpg', quality=82, optimize=True)

review_dir = Path('docs/references/v66-worklot-001-deacon-line-review/enemy-036-deacon-line')
review_dir.mkdir(parents=True, exist_ok=True)
measurements = {
    'idle': {0: ((177, 65), (281, 114)), 1: ((131, 66), (249, 107)), 2: ((176, 96), (285, 139))},
    'move': {0: ((142, 57), (254, 105)), 1: ((117, 66), (220, 112)), 2: ((132, 81), (226, 123))},
    'attack': {0: ((152, 74), (255, 118)), 1: ((99, 105), (216, 145)), 2: ((209, 147), (311, 190))},
    'death': {0: ((171, 75), (266, 111)), 1: ((18, 102), (138, 119)), 2: ((14, 208), (129, 184))},
}
roots = {
    'idle': [(221,316,431),(194,316,431),(222,318,431),(206,318,431),(206,326,431),(189,324,431),(213,330,431),(205,318,431)],
    'move': [(201,321,431),(184,294,431),(184,292,431),(178,293,431),(190,310,431),(182,300,431),(183,325,431),(171,315,431)],
    'attack': [(202,318,430),(176,299,430),(144,287,429),(148,286,430),(152,290,430),(170,300,430),(190,321,430),(135,320,430)],
    'death': [(204,314,429),(183,285,427),(207,288,427),(183,305,429),(235,361,429),(213,372,429),(225,390,429),(225,397,429)],
}
for clip, board in zip(clips, boards):
    scale_overlay = board.copy()
    anchor_overlay = board.copy()
    scale_draw = ImageDraw.Draw(scale_overlay)
    anchor_draw = ImageDraw.Draw(anchor_overlay)
    for frame, (a, b) in measurements[clip].items():
        col, row = frame % 4, frame // 4
        x0, y0 = round(col * board.width / 4), round(row * board.height / 2)
        ga, gb = (x0 + a[0], y0 + a[1]), (x0 + b[0], y0 + b[1])
        scale_draw.line((*ga, *gb), fill=(255, 230, 0), width=4)
        scale_draw.ellipse((ga[0]-6, ga[1]-6, ga[0]+6, ga[1]+6), fill=(0, 255, 255), outline=(0,0,0), width=2)
        scale_draw.ellipse((gb[0]-6, gb[1]-6, gb[0]+6, gb[1]+6), fill=(255, 128, 0), outline=(0,0,0), width=2)
        scale_draw.text((ga[0]+8, ga[1]-18), f'f{frame}', fill=(255,255,255), stroke_width=2, stroke_fill=(0,0,0))
    for frame, (x, landmark_y, anchor_y) in enumerate(roots[clip]):
        col, row = frame % 4, frame // 4
        x0, y0 = round(col * board.width / 4), round(row * board.height / 2)
        gx, gy, ay = x0 + x, y0 + landmark_y, y0 + anchor_y
        anchor_draw.line((gx, gy, gx, ay), fill=(0, 255, 128), width=3)
        anchor_draw.ellipse((gx-5, gy-5, gx+5, gy+5), fill=(0, 192, 255), outline=(0,0,0), width=2)
        anchor_draw.ellipse((gx-5, ay-5, gx+5, ay+5), fill=(255, 240, 0), outline=(0,0,0), width=2)
        anchor_draw.text((gx+7, gy-15), f'f{frame}', fill=(255,255,255), stroke_width=2, stroke_fill=(0,0,0))
    scale_overlay.save(review_dir / f'{clip}-scale-overlay.png')
    anchor_overlay.save(review_dir / f'{clip}-anchor-overlay.png')

for kind in ('scale', 'anchor'):
    evidence_contact = Image.new('RGB', (1774, 888), (18,18,18))
    for index, clip in enumerate(clips):
        overlay = Image.open(review_dir / f'{clip}-{kind}-overlay.png').convert('RGB').resize((887,444), Image.Resampling.LANCZOS)
        evidence_contact.paste(overlay, ((index % 2) * 887, (index // 2) * 444))
    evidence_contact.save(f'.tmp-deacon-036-{kind}-contact.jpg', quality=76, optimize=True)
