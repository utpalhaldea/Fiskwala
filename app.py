import secrets, sqlite3
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, abort, url_for
from werkzeug.utils import secure_filename

BASE=Path(__file__).resolve().parent
UPLOADS=BASE/"uploads"
DB=BASE/"diskwala.db"
UPLOADS.mkdir(exist_ok=True)

app=Flask(__name__)
app.config["MAX_CONTENT_LENGTH"]=1024*1024*1024

ALLOWED={"jpg","jpeg","png","gif","webp","svg","mp4","webm","mov","mkv",
"mp3","wav","ogg","m4a","pdf","txt","zip","rar","7z","doc","docx","xls",
"xlsx","ppt","pptx","csv"}

def conn():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c

def init_db():
    c=conn()
    c.execute("""CREATE TABLE IF NOT EXISTS files(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT UNIQUE NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)""")
    c.commit(); c.close()

def allowed(name):
    return "." in name and name.rsplit(".",1)[1].lower() in ALLOWED

def pretty(n):
    units=["B","KB","MB","GB","TB"]; x=float(n); i=0
    while x>=1024 and i<4: x/=1024; i+=1
    return f"{x:.1f} {units[i]}" if i else f"{int(x)} B"

@app.errorhandler(413)
def too_large(e): return jsonify(ok=False,message="File is larger than 1 GB."),413

@app.get("/")
def home(): return render_template("index.html")

@app.post("/api/upload")
def upload():
    files=request.files.getlist("files")
    if not files: return jsonify(ok=False,message="No file selected."),400
    out=[]; c=conn()
    try:
        for f in files:
            if not f or not f.filename: continue
            name=secure_filename(f.filename)
            if not name or not allowed(name): continue
            token=secrets.token_urlsafe(18)
            stored=secrets.token_hex(20)+Path(name).suffix.lower()
            path=UPLOADS/stored
            f.save(path)
            size=path.stat().st_size
            mime=f.mimetype or "application/octet-stream"
            c.execute("INSERT INTO files(token,original_name,stored_name,mime_type,size) VALUES(?,?,?,?,?)",
                      (token,name,stored,mime,size))
            out.append({"name":name,"size":pretty(size),
                        "share_url":url_for("share",token=token,_external=True),
                        "download_url":url_for("download",token=token,_external=True)})
        c.commit()
    except Exception:
        c.rollback(); raise
    finally: c.close()
    if not out: return jsonify(ok=False,message="No supported files."),400
    return jsonify(ok=True,files=out)

@app.get("/share/<token>")
def share(token):
    c=conn(); f=c.execute("SELECT * FROM files WHERE token=?",(token,)).fetchone(); c.close()
    if not f: abort(404)
    return render_template("share.html",file=f,
                           download_url=url_for("download",token=token))

@app.get("/download/<token>")
def download(token):
    c=conn(); f=c.execute("SELECT * FROM files WHERE token=?",(token,)).fetchone(); c.close()
    if not f: abort(404)
    p=UPLOADS/f["stored_name"]
    if not p.is_file(): abort(404)
    return send_file(p,mimetype=f["mime_type"],as_attachment=True,download_name=f["original_name"])

@app.get("/raw/<token>")
def raw(token):
    c=conn(); f=c.execute("SELECT * FROM files WHERE token=?",(token,)).fetchone(); c.close()
    if not f: abort(404)
    p=UPLOADS/f["stored_name"]
    if not p.is_file(): abort(404)
    mime = f["mime_type"]
    if not mime or mime == "application/octet-stream":
        ext = p.suffix.lower()
        mime = {
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mov": "video/quicktime",
            ".mkv": "video/x-matroska",
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg",
            ".m4a": "audio/mp4",
        }.get(ext, "application/octet-stream")
    return send_file(
        p,
        mimetype=mime,
        as_attachment=False,
        conditional=True,
        max_age=3600
    )

init_db()
if __name__=="__main__": app.run(host="0.0.0.0",port=5000,debug=False)
