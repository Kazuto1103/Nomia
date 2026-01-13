import asyncio
import json
import logging
import random
import time
import os
from datetime import datetime
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# --- Configuration ---
SERIAL_PORT = "/dev/ttyUSB0"  
BAUD_RATE = 115200
# Modes: "MOCK" or "LIVE"
RUN_MODE = os.getenv("V1RG_MODE", "LIVE") 

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("V1-RG_BACKEND")

# --- State Management ---
class SystemState:
    def __init__(self):
        self.cpu_temp = 0.0
        self.uptime_start = time.time()
        self.ultra_dist = 0
        self.mode = "INITIALIZING"
        self.run_mode = RUN_MODE
        self.connected_esp32 = False
        self.logs: List[str] = [f"[SYS] BOOT_SEQUENCE_INIT (MODE: {RUN_MODE})"]

state = SystemState()

# --- Models ---
class Command(BaseModel):
    action: str
    value: str = None

# --- Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- Background Tasks ---
# --- Mock Data ---
MOCK_DATA = {
    "PATROL": {"temp": 48.5, "dist": 340, "logs": ["[SYS] PATROL_ACTIVE", "[NAV] PATH_OPTIMIZED"]},
    "ALARM": {"temp": 62.1, "dist": 45, "logs": ["[CRT] OBSTACLE_DETECTED", "[CRT] EMERGENCY_STOP"]},
    "DOCKING": {"temp": 42.0, "dist": 120, "logs": ["[SYS] DOCKING_INIT", "[NAV] ALIGNING_BEACON"]}
}

async def serial_manager_task():
    """Handles communication via Serial or Mock Data."""
    logger.info(f"Starting Serial Manager Task in {state.run_mode} mode...")
    state.logs.append(f"[COM] LINK_ESTABLISHED: {state.run_mode}")
    
    counter = 0
    while True:
        if state.run_mode == "MOCK":
            mock_keys = list(MOCK_DATA.keys())
            current_mock = MOCK_DATA[mock_keys[(counter // 20) % len(mock_keys)]]
            
            state.connected_esp32 = True
            state.ultra_dist = current_mock["dist"] + random.randint(-5, 5)
            state.cpu_temp = current_mock["temp"] + random.random()
            state.mode = mock_keys[(counter // 20) % len(mock_keys)]
            
            if counter % 20 == 0:
                for log in current_mock["logs"]:
                    if log not in state.logs[-5:]:
                        state.logs.append(log)
            
            telemetry = {
                "type": "telemetry",
                "run_mode": state.run_mode,
                "cpu_temp": round(state.cpu_temp, 1),
                "uptime": str(datetime.fromtimestamp(time.time() - state.uptime_start).strftime("%H:%M:%S")),
                "ultra_dist": state.ultra_dist,
                "mode": state.mode,
                "esp32_status": "MOCK_ACTIVE",
                "logs": state.logs[-12:]
            }
            await manager.broadcast(json.dumps(telemetry))
            counter += 1
            
        else: # LIVE MODE
            # Strict "OFFLINE" data for Live Mode if not connected
            telemetry = {
                "type": "telemetry",
                "run_mode": state.run_mode,
                "cpu_temp": "--",
                "uptime": str(datetime.fromtimestamp(time.time() - state.uptime_start).strftime("%H:%M:%S")),
                "ultra_dist": 0,
                "mode": "OFFLINE / SEARCHING",
                "esp32_status": "SEARCHING_SERIAL...",
                "logs": state.logs[-5:]
            }
            await manager.broadcast(json.dumps(telemetry))
            
        await asyncio.sleep(0.5)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    asyncio.create_task(serial_manager_task())
    state.logs.append("[SYS] BOOT_SEQUENCE_COMPLETE")
    yield
    # Shutdown logic (if any)

app = FastAPI(title="V1-RG Interface System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serves decoration assets (videos, images)
# For Vercel, we use absolute paths based on the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: Vercel structure differs, we check for deployment env
IS_VERCEL = os.getenv("VERCEL") == "1"

if IS_VERCEL:
    # On Vercel, the files are in the root of the deployment
    DECORATION_DIR = os.path.join(BASE_DIR, "..", "decoration")
    FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")
else:
    # Point to the centralized public assets in nomia-web
    DECORATION_DIR = os.path.join(BASE_DIR, "..", "..", "nomia-web", "public", "decoration")
    FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

# Mounts (Only active locally, Vercel uses vercel.json rewrites)
if not IS_VERCEL:
    app.mount("/decoration", StaticFiles(directory=DECORATION_DIR), name="decoration")

# --- Endpoints ---
@app.get("/")
async def root():
    from fastapi.responses import FileResponse
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/status")
async def get_status():
    return {"status": "online", "esp32": state.connected_esp32}

@app.post("/command")
async def send_command(cmd: Command):
    logger.info(f"Received Command: {cmd.action} -> {cmd.value}")
    
    if cmd.action == "CMD_MODE":
        state.mode = cmd.value
        state.logs.append(f"[SYS] MODE_SWITCH: {cmd.value}")
    elif cmd.action == "CMD_MOVE":
        state.logs.append(f"[COM] MOVE: {cmd.value}")
    elif cmd.action == "CMD_TERMINATE":
        state.mode = "HALT"
        state.logs.append("[CRT] EMERGENCY_STOP_ACTIVATED")
        # Send zero-speed to ESP32 here
        
    return {"result": "success", "action": cmd.action}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        manager.disconnect(websocket)

# Static File Catch-All (Only locally)
if not IS_VERCEL:
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
