#!/usr/bin/env python3
"""
Simple HTTP server for testing the X402 Chrome extension.
"""

import http.server
import socketserver
import os
import sys

PORT = 9000

class X402TestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.getcwd(), "test-pages"), **kwargs)
    
    def log_message(self, format, *args):
        print(f"\033[94m[{self.log_date_time_string()}]\033[0m {format % args}")

def run_server():
    with socketserver.TCPServer(("", PORT), X402TestHandler) as httpd:
        print(f"\033[92mX402 Test Server running at http://localhost:{PORT}\033[0m")
        print(f"\033[92mTest pages available:\033[0m")
        print(f"\033[92m- http://localhost:{PORT}/x402-test.html\033[0m")
        print(f"\033[92m- http://localhost:{PORT}/wallet-detection-test.html\033[0m")
        print(f"\033[92m- http://localhost:{PORT}/x402-payment-test.html\033[0m")
        print(f"\033[92mPress Ctrl+C to stop the server\033[0m")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\033[93mShutting down server...\033[0m")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
