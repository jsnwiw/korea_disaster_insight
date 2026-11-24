"""NDVM local server — Python standard library only."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser
os.chdir(Path(__file__).resolve().parent)
try:
    server = ThreadingHTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler)
except OSError:
    server = ThreadingHTTPServer(("127.0.0.1", 0), SimpleHTTPRequestHandler)
url = f"http://127.0.0.1:{server.server_port}/#demo-1"
print("NDVM 실행 주소:", url)
print("종료하려면 Ctrl+C를 누르세요.")
webbrowser.open_new_tab(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("서버를 종료합니다.")
finally:
    server.server_close()
