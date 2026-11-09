# NEXUS Blender Bridge
# Run from Blender: blender --python nexus_blender_bridge.py
# Local-only HTTP bridge for the NEXUS 3D Studio browser module.

import bpy
import json
import os
import queue
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8765
EXPORT_DIR = Path.home() / "NEXUS-Exports"
TASKS = queue.Queue()

def apply_scene(data):
    for obj in list(bpy.context.scene.objects):
        if obj.type in {"MESH", "EMPTY", "LIGHT", "CAMERA"} and obj.name.startswith("NEXUS_"):
            bpy.data.objects.remove(obj, do_unlink=True)
    for item in data.get("objects", []):
        kind = item.get("type", "cube")
        name = "NEXUS_" + str(item.get("name", kind))[:48]
        if kind == "sphere":
            bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16)
        elif kind == "cylinder":
            bpy.ops.mesh.primitive_cylinder_add(vertices=32)
        elif kind == "plane":
            bpy.ops.mesh.primitive_plane_add()
        else:
            bpy.ops.mesh.primitive_cube_add()
        obj = bpy.context.object
        obj.name = name
        obj.location = item.get("position", [0, 0, 0])
        obj.rotation_euler = item.get("rotation", [0, 0, 0])
        obj.scale = item.get("scale", [1, 1, 1])
        color = str(item.get("color", "#729cff")).lstrip("#")
        try:
            rgb = tuple(int(color[i:i+2], 16) / 255 for i in (0, 2, 4))
        except Exception:
            rgb = (0.28, 0.48, 0.95)
        mat = bpy.data.materials.new(name=name + "_Material")
        mat.diffuse_color = (*rgb, 1.0)
        obj.data.materials.append(mat)
    return len(data.get("objects", []))

def process_tasks():
    try:
        while True:
            task = TASKS.get_nowait()
            try:
                if task["action"] == "save":
                    count = apply_scene(task["data"])
                    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
                    filename = os.path.basename(task["data"].get("filename", "nexus-scene.blend"))
                    if not filename.lower().endswith(".blend"):
                        filename += ".blend"
                    path = EXPORT_DIR / filename
                    bpy.ops.wm.save_as_mainfile(filepath=str(path))
                    task["result"] = {"ok": True, "path": str(path), "objects": count}
                else:
                    task["result"] = {"ok": False, "error": "Unknown action"}
            except Exception as exc:
                task["result"] = {"ok": False, "error": str(exc)}
            finally:
                task["done"].set()
    except queue.Empty:
        pass
    return 0.2

class Handler(BaseHTTPRequestHandler):
    def _headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._headers(204)

    def do_GET(self):
        if self.path != "/health":
            self._headers(404)
            self.wfile.write(b'{"ok":false,"error":"Not found"}')
            return
        self._headers()
        self.wfile.write(json.dumps({"ok": True, "blender": bpy.app.version_string}).encode())

    def do_POST(self):
        if self.path != "/save-blend":
            self._headers(404)
            self.wfile.write(b'{"ok":false,"error":"Not found"}')
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 2 or length > 2_000_000:
                raise ValueError("Invalid request size")
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            task = {"action": "save", "data": data, "done": threading.Event(), "result": None}
            TASKS.put(task)
            if not task["done"].wait(30):
                raise TimeoutError("Blender did not finish the export in time")
            result = task["result"]
            self._headers(200 if result.get("ok") else 500)
            self.wfile.write(json.dumps(result).encode())
        except Exception as exc:
            self._headers(400)
            self.wfile.write(json.dumps({"ok": False, "error": str(exc)}).encode())

    def log_message(self, *_args):
        pass

def start_server():
    bpy.app.timers.register(process_tasks, first_interval=0.2, persistent=True)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    print("[NEXUS Blender Bridge] Listening on http://%s:%s" % (HOST, PORT))
    print("[NEXUS Blender Bridge] .blend exports: %s" % EXPORT_DIR)

start_server()
