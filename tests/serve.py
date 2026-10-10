#!/usr/bin/env python3
"""Local-only preview with existing extensionless production routes."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import os
ROOT=Path(__file__).resolve().parents[1]
os.chdir(ROOT)
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path=urlsplit(self.path).path
        file=ROOT / path.lstrip('/')
        if path!='/' and not Path(path).suffix and file.with_suffix('.html').is_file():
            self.path=path+'.html'
        return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
