# DiskWala Pro

Backend-enabled DiskWala-style file sharing.

## Features
- Upload multiple files
- Random share tokens
- Real share page
- Copy Link button
- Download button
- Image/video/audio preview
- SQLite metadata
- No cookies required by this basic implementation

## Run
```bash
python -m venv .venv
pip install -r requirements.txt
python app.py
```
Open `http://127.0.0.1:5000`.

## Important
GitHub Pages cannot run Flask or store uploads. Keep this code in GitHub as the repository, but deploy the Flask app to a backend host/VPS/container with persistent disk. For a real large-scale service, use object storage such as S3-compatible storage/R2 instead of the local `uploads` directory, and a managed database.

Do not put private API keys in frontend JavaScript.


## Video playback note

The share page now serves media with inline responses and proper MIME detection.

For the widest browser compatibility, upload **MP4 video encoded as H.264 video + AAC audio**. Browsers do not universally support every MOV/MKV codec even when the file extension is accepted. Unsupported codecs should still have the Download button.

If you want DiskWala to automatically convert every uploaded video to browser-friendly MP4, the next version can add an FFmpeg processing worker.
