# Generate narration WAVs + step durations for each lesson.  usage: tts.py lessons.json outdir
import json, sys, wave, os
from piper import PiperVoice
from piper.config import SynthesisConfig
lessons = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
voice = PiperVoice.load(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voices', 'en_US-lessac-medium.onnx'))
cfg = SynthesisConfig(length_scale=0.97, noise_scale=0.6, noise_w_scale=0.7)
only = sys.argv[3:] 
for L in lessons:
    if only and L['id'] not in only: continue
    durs = []
    for i, st in enumerate(L['steps']):
        fn = f"{out}/{L['id']}_{i:02d}.wav"
        with wave.open(fn, 'wb') as wf: voice.synthesize_wav(st['say'], wf, syn_config=cfg)
        w = wave.open(fn); a = w.getnframes() / w.getframerate(); w.close()
        d = a + 0.55
        if st.get('intro'): d = max(d + 0.6, 3.6)
        durs.append(round(d, 3))
    json.dump({'durs': durs}, open(f"{out}/{L['id']}.json", 'w'))
    print(L['id'], len(durs), 'steps', round(sum(durs), 1), 's')
