#!/usr/bin/env python3
"""Optional localhost server; no third-party dependency and no external access."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse, functools, webbrowser
parser=argparse.ArgumentParser(description='Ouvrir le DLC sur cet ordinateur.')
parser.add_argument('--port',type=int,default=8178)
parser.add_argument('--no-browser',action='store_true')
a=parser.parse_args();root=Path(__file__).resolve().parents[1]
handler=functools.partial(SimpleHTTPRequestHandler,directory=str(root))
with ThreadingHTTPServer(('127.0.0.1',a.port),handler) as server:
    url=f'http://127.0.0.1:{a.port}/'
    print(url,flush=True)
    if not a.no_browser:webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
