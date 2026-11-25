# PinSketch video maker

Developer tool, **not needed on the website**. You can leave this folder out when you upload.

It records the narrated tutorial videos in `../../videos/` by running the real simulator in headless Chrome:
1. `lessons.js`: the script for each lesson (narration text plus actions such as placing parts, drawing wires and clicking switches).
2. `tts.py`: turns the narration into speech offline with the Piper voice `en_US-lessac-medium`.
3. `rec.js`: opens `tutor.html` (the simulator plus `tutor.js`, which animates the cursor and captions) and captures the frames.
4. `assemble.py`: lines the speech up with the frames and encodes an MP4 (H.264/AAC) and a poster JPG.
5. `gen_videos.js`: writes `js/videos.js`, the list of videos the website shows.

Setup (once):
```
python3 -m venv venv && venv/bin/pip install piper-tts imageio-ffmpeg
venv/bin/python -m piper.download_voices --download-dir voices en_US-lessac-medium
```
Run: `PY=venv/bin/python ./make_all.sh` (all lessons) or `PY=venv/bin/python ./make_all.sh u-blink` (one lesson).
