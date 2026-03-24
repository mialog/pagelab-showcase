#!/usr/bin/env python3
"""
PageLab Dev Server
.html 확장자 없는 URL도 자동으로 처리합니다.
예: /sections/intro/type-d-product-split → type-d-product-split.html
"""
import http.server
import os

class HTMLFallbackHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]

        # 확장자가 없고 .html 파일이 존재하면 리다이렉트
        if '.' not in os.path.basename(path) and path != '/':
            html_path = path.rstrip('/') + '.html'
            full_path = self.translate_path(html_path)
            if os.path.isfile(full_path):
                self.send_response(301)
                self.send_header('Location', html_path)
                self.end_headers()
                return

        super().do_GET()

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.HTTPServer(('', port), HTMLFallbackHandler) as httpd:
        print(f"PageLab Dev Server: http://localhost:{port}/")
        httpd.serve_forever()
