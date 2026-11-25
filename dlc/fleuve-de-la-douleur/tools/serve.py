#!/usr/bin/env python3
"""Optional local HTTP server, bound only to loopback. No external dependency."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
p=argparse.ArgumentParser(description="Servir le DLC sur cette machine uniquement")
p.add_argument('--port',type=int,default=8765)
a=p.parse_args()
if not 1024 <= a.port <= 65535: p.error("Le port doit être compris entre 1024 et 65535")
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',a.port),partial(SimpleHTTPRequestHandler,directory=str(root)))
print(f'Ouvrez http://127.0.0.1:{a.port}/JOUER.html — Ctrl+C pour arrêter')
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
