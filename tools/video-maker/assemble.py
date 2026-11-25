# Build MP4: python assemble.py <id> <outdir>
import json, sys, os, wave, struct, subprocess, imageio_ffmpeg, array
lid, outdir = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__)); fdir = os.path.join(here, 'frames', lid)
meta = json.load(open(os.path.join(fdir, 'meta.json'))); res = meta['res']; frames = meta['frames']
t0, end = res['t0'], res['end']
# ---- audio: place each step's narration at its real start time
rate = 22050; total = int((end + 0.2) * rate); buf = array.array('h', bytes(total * 2))
for i, st in enumerate(res['starts']):
    w = wave.open(os.path.join(here, 'audio', f'{lid}_{i:02d}.wav')); assert w.getframerate() == rate and w.getsampwidth() == 2
    data = array.array('h', w.readframes(w.getnframes())); w.close()
    off = int((st + 0.12) * rate)
    for k, v in enumerate(data):
        if off + k < total: buf[off + k] = v
wav = os.path.join(fdir, 'audio.wav')
with wave.open(wav, 'wb') as wf: wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(rate); wf.writeframes(buf.tobytes())
# ---- video: concat list with per-frame durations on the same timeline
frames.sort(key=lambda f: f['t'])
first = max([i for i, f in enumerate(frames) if f['t'] <= t0] or [0])
seq = frames[first:]
lines = []
for i, f in enumerate(seq):
    a = max(f['t'], t0) - t0
    b = (seq[i + 1]['t'] - t0) if i + 1 < len(seq) else end
    b = min(b, end)
    if b - a <= 0.0005: continue
    lines.append(f"file '{os.path.join(fdir, f['f'])}'\nduration {b - a:.4f}")
lines.append(f"file '{os.path.join(fdir, seq[-1]['f'])}'")
lst = os.path.join(fdir, 'list.txt'); open(lst, 'w').write('\n'.join(lines) + '\n')
os.makedirs(outdir, exist_ok=True)
mp4 = os.path.join(outdir, lid + '.mp4'); ff = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ff, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', wav,
  '-vf', 'fps=25,scale=1366:768:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-preset', 'medium', '-crf', '24', '-tune', 'stillimage',
  '-c:a', 'aac', '-b:a', '96k', '-ar', '44100', '-shortest', '-movflags', '+faststart', mp4], check=True)
# poster: frame ~65% through
pf = seq[int(len(seq) * 0.65)]['f']
subprocess.run([ff, '-y', '-loglevel', 'error', '-i', os.path.join(fdir, pf), '-vf', 'scale=960:-2', '-q:v', '4', os.path.join(outdir, lid + '.jpg')], check=True)
print(lid, 'ok', round(end, 1), 's', os.path.getsize(mp4) // 1024, 'KB')
