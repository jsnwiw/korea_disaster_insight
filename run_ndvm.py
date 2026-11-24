"""NDVM local server — Python standard library only."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser

# Change working directory to frontend folder
base_dir = Path(__file__).resolve().parent
if (base_dir / "frontend").exists():
    frontend_dir = base_dir / "frontend"
elif (base_dir / "새 폴더 (2)" / "frontend").exists():
    frontend_dir = base_dir / "새 폴더 (2)" / "frontend"
else:
    frontend_dir = base_dir
os.chdir(frontend_dir)

try:
    server = ThreadingHTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler)
except OSError:
    server = ThreadingHTTPServer(("127.0.0.1", 0), SimpleHTTPRequestHandler)

url = f"http://127.0.0.1:{server.server_port}/#demo-1"
print("=======================================================")
print("NDVM 자연재해 취약지역 지도 & 안전동행 통합 시스템")
print("접속 주소:", url)
print("종료하려면 Ctrl+C를 누르세요.")
print("=======================================================")
webbrowser.open_new_tab(url)

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n서버를 종료합니다.")
finally:
    server.server_close()
