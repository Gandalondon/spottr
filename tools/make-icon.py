# Spottr icon: five-bar soundwave (rest shape 0.42/0.7/1/0.7/0.42), amber on navy. Same shape as the site header.
from PIL import Image, ImageDraw
AMBER=(242,179,61,255); NAVY=(15,18,24,255); REST=[.42,.7,1,.7,.42]
def bars(size, group_w, bg=None, shape=None):
    S=size*4; im=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    if bg:
        if shape=="circle": d.ellipse([0,0,S-1,S-1],fill=bg)
        else: d.rectangle([0,0,S,S],fill=bg)
    gw=group_w*S; unit=gw/28.0; bw=4*unit; H=26*unit; x=(S-gw)/2
    for i,h in enumerate(REST):
        bh=H*h; y=(S-bh)/2; d.rounded_rectangle([x,y,x+bw,y+bh],radius=bw/2,fill=AMBER); x+=6*unit
    return im.resize((size,size),Image.LANCZOS)
dens={"mdpi":1,"hdpi":1.5,"xhdpi":2,"xxhdpi":3,"xxxhdpi":4}
R="android/app/src/main/res/mipmap-"
for k,f in dens.items():
    bars(int(108*f),40/108).save(f"{R}{k}/ic_launcher_foreground.png")
    bars(int(48*f),.56,NAVY).save(f"{R}{k}/ic_launcher.png")
    bars(int(48*f),.5,NAVY,"circle").save(f"{R}{k}/ic_launcher_round.png")
bars(192,.56,NAVY).save("www/icons/icon-192.png"); bars(512,.56,NAVY).save("www/icons/icon-512.png")
bars(512,.42,NAVY).save("www/icons/maskable-512.png"); bars(432,40/108).save("www/icons/fg-432.png")
# preview
p=Image.new("RGBA",(900,320),(240,240,236,255))
p.paste(bars(256,.56,NAVY),(24,32)); c=bars(256,.5,NAVY,"circle"); p.paste(c,(312,32),c)
for i,s in enumerate([96,48]): im=bars(s,.56,NAVY); p.paste(im,(600+i*130,32))
p.save("/tmp/claude-0/-home-claude/dc1edf1b-fb78-5c42-80d8-456691558370/scratchpad/shots/icon-preview.png")
