#!/bin/bash
# Regenerate all tutorial videos.  Usage: ./make_all.sh  [lesson ids...]
# Needs: google-chrome, node >= 22, and a Python env with:  pip install piper-tts imageio-ffmpeg
#        voice:  python -m piper.download_voices --download-dir voices en_US-lessac-medium
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
OUT=../../videos
node -e "const {LESSONS}=require('./lessons.js'); require('fs').writeFileSync('lessons.json', JSON.stringify(LESSONS.map(l=>({id:l.id,steps:l.steps.map(s=>({say:s.say,intro:!!s.intro}))}))));"
$PY tts.py lessons.json audio "$@"
for spec in $(node -e "const {LESSONS}=require('./lessons.js'); console.log(LESSONS.map(l=>l.id+':'+l.level).join(' '))"); do
  id=${spec%%:*}; lv=${spec##*:}
  if [ $# -gt 0 ] && [[ " $* " != *" $id "* ]]; then continue; fi
  node rec.js $id $lv
  $PY assemble.py $id $OUT && rm -rf frames/$id/*.jpg
done
FFMPEG=$($PY -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") node gen_videos.js
