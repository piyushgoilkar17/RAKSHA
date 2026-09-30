# Disaster Response Autonomous Drone System

> **Status:** Active development / validated prototype  
> **Primary goal:** Build an autonomous disaster-response drone platform that can detect people/survivors, preserve visual evidence with geospatial metadata, execute safe waypoint missions, and present mission intelligence through a web dashboard.

---

## 1. Project Overview

This project combines **edge AI, computer vision, autonomous flight, geospatial storage, reliable evidence transfer, and a command dashboard** into one disaster-response drone platform.

The intended real-world system uses a **Raspberry Pi 5 as the companion computer** and a **Pixhawk/PX4 flight controller** for flight-critical control. The Raspberry Pi performs high-level perception and application logic; PX4 remains responsible for stabilization, motor control, flight modes, navigation primitives, and failsafes.

Two major end-to-end paths have already been demonstrated:

1. **Real edge-AI pipeline:** Hawkeye USB camera -> Raspberry Pi 5 -> YOLO11n/ONNX Runtime -> person detection -> JPEG evidence + metadata -> Node.js/Express -> PostgreSQL/PostGIS.
2. **Simulated autonomous-flight pipeline:** Next.js Mission Console -> Express API -> PostgreSQL/PostGIS -> Python mission worker -> MAVSDK/MAVLink -> PX4 SITL -> Gazebo X500 -> 3-waypoint autonomous mission -> completion/RTL state.

Physical Pixhawk flight, GPS hardware integration, thermal-camera integration, and real-airframe autonomous testing are **not yet completed**.

---

## 2. Why This Project Exists

During floods, earthquakes, landslides, fires, collapsed-building incidents, and other disasters, responders may need to inspect dangerous or inaccessible areas quickly. A drone can reduce the time required to search an area, but a useful response system needs more than a camera.

This project is designed around four capabilities:

- **Perception:** detect people/survivors and later other hazards using onboard AI.
- **Evidence:** preserve the image and detection metadata rather than only drawing a bounding box on a screen.
- **Location awareness:** associate observations with GPS/telemetry when hardware is available.
- **Autonomy:** safely execute high-level search/inspection missions through PX4 while retaining flight-controller failsafes.

---

## 3. Current Project Status

| Capability | Status | Notes |
|---|---|---|
| Raspberry Pi 5 companion computer | ✅ Working | Raspberry Pi OS 64-bit |
| Hawkeye RGB USB camera | ✅ Working | Real frames captured from `/dev/video0` |
| YOLO person detection on Pi | ✅ Working | YOLO11n ONNX + ONNX Runtime CPU |
| Detection evidence JPEG capture | ✅ Working | Stored locally and uploaded |
| Detection JSON metadata | ✅ Working | Person count, confidence, bbox, timestamps |
| Reliable SQLite outbox | ✅ Working | Retry/backoff implemented |
| Invalid evidence quarantine fix | 🧪 Implemented/tested in branch | Needs final real-Pi validation/merge |
| Node.js/Express backend | ✅ Working | REST APIs |
| PostgreSQL database | ✅ Working | Docker-based local development |
| PostGIS geospatial support | ✅ Working | Spatial data support |
| Detection/evidence ingestion | ✅ Working | Real Pi -> backend validated |
| Next.js dashboard | ✅ Working | Multiple operational pages |
| Mission Console | ✅ Working | Draft/queue/cancel/monitor |
| PX4 SITL | ✅ Working | Ubuntu/WSL2 |
| Gazebo X500 simulation | ✅ Working | Headless SITL validated |
| MAVLink/MAVSDK telemetry | ✅ Working | PX4 SITL telemetry validated |
| Autonomous waypoint mission | ✅ Working in SITL | 3/3 waypoint mission completed |
| Cancel -> RTL flow | ✅ Working in SITL | Manually validated |
| Pixhawk physical integration | ⏳ Not completed | Planned hardware phase |
| u-blox NEO-M8N GPS | ⏳ Not integrated | GPS fields currently nullable |
| Thermal camera | ⏳ Not integrated | Planned |
| Physical motors/airframe flight | ⏳ Not completed | Must be tested safely after FC integration |
| Real autonomous disaster mission | ⏳ Not completed | Requires hardware integration and field validation |
| pgvector semantic/report layer | 📋 Planned | Not a completed core dependency |
| Production authentication | ⚠️ Not completed | Mission endpoints are development/demo oriented |

Legend: ✅ validated/working, 🧪 implemented but pending final deployment validation, ⏳ hardware/future work, 📋 planned, ⚠️ known limitation.

---

## 4. High-Level Architecture

```mermaid
flowchart LR
    CAM[Hawkeye RGB Camera] --> PI[Raspberry Pi 5]
    THERMAL[Thermal Camera - Planned] -.-> PI
    GPS[u-blox GPS - Planned] -.-> PI

    PI --> CV[OpenCV]
    CV --> YOLO[YOLO11n ONNX]
    YOLO --> DET[Detection + Evidence]
    DET --> OUTBOX[SQLite Reliable Outbox]

    OUTBOX --> API[Node.js / Express API]
    API --> DB[(PostgreSQL + PostGIS)]
    API --> DASH[Next.js Dashboard]
    DB --> DASH

    DASH --> MISSION[Mission API]
    MISSION --> DB
    DB --> WORKER[Python Mission Worker]
    WORKER --> MAVSDK[MAVSDK gRPC]
    MAVSDK --> MAVLINK[MAVLink]
    MAVLINK --> PX4[PX4]

    PX4 --> SITL[Gazebo X500 / PX4 SITL]
    PX4 -. Physical phase .-> PIXHAWK[Pixhawk + Real Airframe]
```

### Safety boundary

```mermaid
flowchart TB
    HIGH[High-level autonomy<br/>AI, mission planning, evidence, dashboard] --> PI[Raspberry Pi / Application Layer]
    PI --> CMD[MAVSDK / MAVLink Commands]
    CMD --> FC[PX4 Flight Controller]
    FC --> LOW[Low-level flight control<br/>attitude, stabilization, motors, failsafes]

    style FC stroke-width:3px
```

**Important design rule:** the Raspberry Pi is **not** intended to directly drive motors for flight. Pixhawk/PX4 owns the safety-critical control loop.

---

## 5. Complete Technology Stack

### Hardware

| Component | Role |
|---|---|
| Raspberry Pi 5 | Companion computer / edge AI |
| Thumb 2 Hawkeye RGB USB camera | Real-time RGB imagery |
| Pixhawk flight controller | Planned physical autopilot |
| u-blox NEO-M8N GPS | Planned real-world positioning |
| Thermal camera | Planned heat/survivor sensing |
| Drone frame, ESCs, motors, power system | Physical flight platform, not yet integrated |

### Edge AI / Computer Vision

- Python
- OpenCV 4.x
- YOLO11n
- ONNX
- ONNX Runtime CPU
- NumPy
- OpenCV NMS
- Local JPEG evidence capture

### Flight / Robotics

- PX4 Autopilot
- PX4 SITL
- Gazebo
- MAVLink
- MAVSDK gRPC (`mavsdk_grpc`)
- Python mission worker
- Python telemetry service

### Backend

- Node.js
- Express.js
- REST APIs
- Multipart JPEG evidence upload
- SHA-256 evidence handling
- Validation and idempotency/conflict handling

### Data

- PostgreSQL
- PostGIS
- SQLite on Raspberry Pi for durable delivery queue
- pgvector planned for future semantic/report functionality

### Frontend

- Next.js
- React
- TypeScript
- Interactive mapping UI
- Mission Console
- Detection, telemetry, system-status, mission and report pages

### Infrastructure / Development

- Docker
- Docker Compose
- Git
- GitHub
- Windows development host
- WSL2 Ubuntu 24.04
- Raspberry Pi OS 64-bit
- PowerShell
- Bash

---

## 6. Repository Responsibilities

A simplified logical repository layout is:

```text
Disaster/
├── ai/
│   ├── person_detection.py
│   ├── missions/
│   ├── transport/
│   ├── vehicle/
│   └── tests/
├── backend/
│   ├── src/
│   └── tests/
├── dashboard/
│   └── src/
├── database/
│   └── migrations/
├── docs/
├── logs/
│   ├── detections.jsonl
│   ├── evidence/
│   └── outbox.sqlite3
├── models/
│   └── yolo11n.onnx
├── scripts/
│   ├── deliver_outbox.py
│   ├── mission_worker.py
│   └── vehicle_telemetry.py
├── docker-compose.yml
└── README.md
```

The exact repository may evolve; this diagram describes the current functional separation.

---

## 7. Person Detection Pipeline

### Data flow

```mermaid
flowchart TD
    A[Hawkeye USB Camera] --> B[OpenCV frame capture]
    B --> C[Resize to 640 x 640]
    C --> D[BGR -> RGB]
    D --> E[float32 / 255]
    E --> F[CHW + batch dimension]
    F --> G[YOLO11n ONNX Runtime]
    G --> H[Decode boxes and class scores]
    H --> I[Confidence threshold]
    I --> J[OpenCV NMS]
    J --> K{Person detected?}
    K -- Yes --> L[Save evidence JPEG]
    L --> M[Create detection event]
    M --> N[Write JSONL / SQLite outbox]
    N --> O[Deliver metadata]
    O --> P[Deliver evidence]
    P --> Q[Express API]
    Q --> R[(PostgreSQL/PostGIS)]
    K -- No --> B
```

### Proven YOLO preprocessing

The current person detector uses:

- Input: `640 x 640`
- Direct image resize
- BGR -> RGB
- `float32`
- Divide by `255`
- HWC -> CHW
- Add batch dimension
- Person class: COCO class `0`
- Confidence threshold: approximately `0.40`
- NMS threshold: approximately `0.45`
- Bounding boxes scaled back to the original frame

The model currently used on the Pi is:

```text
models/yolo11n.onnx
```

The Pi uses **ONNX Runtime CPU**, avoiding unnecessary CUDA/NVIDIA packages on ARM.

---

## 8. Detection Event Model

A detection event is conceptually shaped like:

```json
{
  "detection_id": "unique-detection-id",
  "timestamp": "ISO-8601 timestamp",
  "source": "hawkeye_rgb",
  "camera": "/dev/video0",
  "detections": [
    {
      "type": "person",
      "confidence": 0.91,
      "bbox": {
        "x": 100,
        "y": 120,
        "width": 200,
        "height": 350
      }
    }
  ],
  "person_count": 1,
  "latitude": null,
  "longitude": null,
  "altitude": null,
  "evidence_image": "example.jpg"
}
```

GPS values are currently allowed to be `null` because physical GPS integration has not yet been completed.

---

## 9. Reliable Evidence Delivery

A disaster-response system should not silently lose evidence when Wi-Fi temporarily disappears. The Pi therefore uses a **SQLite outbox**.

### Delivery flow

```mermaid
sequenceDiagram
    participant AI as Pi Detection Service
    participant SQ as SQLite Outbox
    participant API as Express API
    participant DB as PostgreSQL
    participant FS as Evidence Storage

    AI->>SQ: Save detection + evidence reference
    SQ->>API: POST detection metadata
    API->>DB: Store detection
    API-->>SQ: Metadata acknowledged
    SQ->>API: PUT multipart JPEG evidence
    API->>FS: Validate/store evidence
    API-->>SQ: Evidence acknowledged
    SQ->>SQ: Mark evidence delivered
```

Metadata and evidence have independent retry behavior so a network failure does not require re-running inference.

### Evidence validation

The backend protects the upload path with checks such as:

- Safe `.jpg` / `.jpeg` filename
- No path traversal
- `image/jpeg` MIME expectation
- JPEG signature validation
- Maximum evidence size
- SHA-256 handling
- One multipart file
- Duplicate matching upload accepted/idempotent
- Conflicting same-name upload rejected

### Known zero-byte evidence issue

Two historical evidence files were found to be zero bytes. The backend correctly returned HTTP `415 Unsupported Media Type`, but the original Pi outbox treated the error as retryable forever.

A reliability fix has been implemented on branch:

```text
fix/evidence-permanent-failures
```

Commit:

```text
1778580 fix: quarantine permanently invalid evidence
```

The fix introduces evidence states:

```text
pending -> delivered
pending -> quarantined
```

It validates that evidence:

- exists,
- is a regular file,
- has non-zero size,
- starts with JPEG `FF D8`,
- ends with JPEG `FF D9`.

Invalid evidence is quarantined with an error reason instead of being fabricated, deleted, or marked successfully uploaded. At the time of this README snapshot, automated tests passed, but final real-Pi validation/merge should still be completed.

---

## 10. Backend Architecture

```mermaid
flowchart LR
    PI[Raspberry Pi] -->|REST| EXPRESS[Express API]
    UI[Next.js Dashboard] -->|REST| EXPRESS
    WORKER[Mission Worker] -->|REST| EXPRESS
    TELEMETRY[Telemetry Service] -->|REST| EXPRESS

    EXPRESS --> REPO[Repository Layer]
    REPO --> PG[(PostgreSQL)]
    PG --> GIS[PostGIS]

    EXPRESS --> EVIDENCE[Evidence Upload/Storage]
```

The backend supports development-memory storage but **PostgreSQL should be used for real integration testing**. Always check `/api/health` before draining a real Pi outbox.

Example health characteristics:

```json
{
  "status": "online",
  "service": "Disaster Drone Backend",
  "storage": "postgres",
  "database": "online",
  "mission_execution_environment": "px4_sitl"
}
```

---

## 11. Database / Geospatial Layer

PostgreSQL is the authoritative application database, with **PostGIS** for geographic data.

Current database responsibilities include:

- Detection records
- Evidence references
- Vehicle telemetry
- Mission records
- Mission state
- Ordered mission waypoints
- Geographic points
- Execution/cancellation metadata

Mission migration `003_sitl_missions.sql` added the SITL mission model and constraints.

Future work may add **pgvector** for embeddings, semantic search, and richer incident/report retrieval. This is planned rather than a required validated component today.

---

## 12. Dashboard

Current dashboard routes include:

```text
/
├── /live
├── /detections
├── /detections/[id]
├── /map
├── /missions
├── /telemetry
├── /reports
└── /status
```

### Dashboard responsibilities

- View survivor/person detections
- Inspect detection details/evidence
- Display geographic data
- Display vehicle telemetry
- Show system/backend status
- Create and monitor SITL missions
- Visualize mission paths
- Distinguish simulation data from real detection/survivor data

A critical UI rule is that **PX4 SITL aircraft coordinates are not presented as survivor coordinates**.

---

## 13. PX4 SITL Telemetry

### Telemetry flow

```mermaid
flowchart LR
    PX4[PX4 SITL] -->|UDP MAVLink| MAV[MAVSDK gRPC]
    MAV --> PY[Python Telemetry Provider]
    PY --> OUT[Telemetry Outbox/API Client]
    OUT --> API[Express]
    API --> DB[(PostgreSQL/PostGIS)]
    DB --> DASH[Dashboard]
```

A real PX4 SITL connection has been validated with telemetry including:

- Connection state
- Latitude
- Longitude
- Absolute altitude
- Relative altitude
- Heading
- Velocity
- Armed state
- Flight mode
- GPS fix

Example simulated home area observed during validation:

```text
Latitude:  ~47.39797
Longitude: ~8.54616
```

These are **simulation coordinates**, not a physical disaster location.

---

## 14. Autonomous Mission System

### Mission architecture

```mermaid
flowchart TD
    USER[Operator] --> UI[Mission Console]
    UI --> API[Express Mission API]
    API --> DB[(Mission + Waypoints)]
    DB --> CLAIM[Atomic Mission Claim]
    CLAIM --> WORKER[Python Mission Worker]
    WORKER --> SAFE{SITL safety checks}
    SAFE -- Pass --> SDK[MAVSDK Mission API]
    SAFE -- Fail --> REJECT[Reject execution]
    SDK --> PX4[PX4 SITL]
    PX4 --> GZ[Gazebo X500]
    PX4 --> PROGRESS[Mission progress]
    PROGRESS --> WORKER
    WORKER --> API
    API --> DB
    DB --> UI
```

### Mission lifecycle

Conceptually:

```text
DRAFT
  |
  v
READY / QUEUED
  |
  v
UPLOADING
  |
  v
UPLOADED
  |
  v
STARTING
  |
  v
ACTIVE
  |
  +-----------> CANCEL REQUEST -> PAUSE -> RTL -> CANCELLED
  |
  v
COMPLETED -> RTL
```

### Safety controls

The current mission implementation intentionally restricts autonomous execution to simulation.

Backend:

```text
MISSION_EXECUTION_ENVIRONMENT=px4_sitl
```

Worker:

```text
VEHICLE_PROVIDER=mavsdk
VEHICLE_SOURCE=px4_sitl
```

The implementation rejects a `px4_hardware` source before creating/arming the MAVSDK system. This prevents the current development mission worker from being accidentally treated as production physical-flight software.

Additional design properties:

- One active claimed mission at a time
- Execution token/claim behavior
- Ordered waypoint storage
- Completion policy includes RTL
- Cancellation triggers pause/RTL behavior
- Survivor/detection coordinates are **not automatically converted into flight waypoints**
- PX4 retains stabilization and flight failsafes

---

## 15. Validated SITL Mission

A manual mission was successfully tested using a small triangle near the PX4 SITL home position.

Validated waypoints:

| WP | Latitude | Longitude | Relative Altitude | Acceptance Radius | Speed |
|---|---:|---:|---:|---:|---:|
| 1 | 47.398061 | 8.546164 | 10 m | 2 m | 5 m/s |
| 2 | 47.398061 | 8.546284 | 10 m | 2 m | 5 m/s |
| 3 | 47.397971 | 8.546284 | 10 m | 2 m | 5 m/s |

Result:

```text
COMPLETED
3 / 3 COMPLETE
```

A separate incorrect test mission was safely cancelled, validating the **Cancel -> RTL -> CANCELLED** flow.

This milestone was merged into `main` with:

```text
a9719a4 feat: integrate PX4 SITL waypoint missions
```

The earlier PX4 SITL telemetry milestone was:

```text
5f4c7bf feat: integrate PX4 SITL MAVLink telemetry
```

---

## 16. End-to-End Workflows

### A. Real survivor/person detection

```mermaid
sequenceDiagram
    participant C as Hawkeye Camera
    participant P as Raspberry Pi
    participant Y as YOLO
    participant O as SQLite Outbox
    participant B as Backend
    participant D as PostgreSQL
    participant U as Dashboard

    C->>P: RGB frame
    P->>Y: Preprocessed tensor
    Y-->>P: Person boxes + confidence
    P->>P: NMS + save JPEG
    P->>O: Queue metadata/evidence
    O->>B: Detection metadata
    B->>D: Persist
    O->>B: JPEG evidence
    B->>D: Associate evidence
    D-->>U: Detection data
```

### B. Autonomous simulated mission

```mermaid
sequenceDiagram
    participant U as Operator
    participant UI as Mission Console
    participant B as Express
    participant D as PostgreSQL
    participant W as Mission Worker
    participant M as MAVSDK
    participant P as PX4 SITL
    participant G as Gazebo

    U->>UI: Enter waypoints
    UI->>B: Save mission
    B->>D: Store ordered waypoints
    U->>UI: Queue SITL flight
    W->>B: Claim mission
    B->>D: Mark claimed
    W->>M: Upload mission
    M->>P: MAVLink mission
    P->>G: Fly X500
    P-->>M: Mission progress
    M-->>W: Progress
    W->>B: Update state
    B->>D: Persist progress
    D-->>UI: ACTIVE / COMPLETED
    P->>G: RTL
```

---

## 17. Development Environments

### Raspberry Pi

Typical project location:

```bash
cd ~/Disaster
```

Key responsibilities:

- Camera capture
- YOLO inference
- Evidence generation
- Local outbox
- Delivery to backend

### Windows

Typical project location:

```powershell
C:\Users\paltr\OneDrive\Dokumen\New project\Disaster
```

Responsibilities:

- Backend
- PostgreSQL/PostGIS via Docker
- Dashboard
- Git development

### Ubuntu 24.04 / WSL2

Responsibilities:

- PX4 SITL
- Gazebo
- MAVSDK mission/telemetry processes

Typical PX4 location:

```bash
cd ~/PX4-Autopilot
```

---

## 18. Running the Backend

### Windows PowerShell

```powershell
cd "C:\Users\paltr\OneDrive\Dokumen\New project\Disaster"

docker compose up -d database

$env:DATABASE_URL='postgresql://disaster:local-development-only@127.0.0.1:55432/disaster'
$env:MAX_EVIDENCE_BYTES='10485760'
$env:MISSION_EXECUTION_ENVIRONMENT='px4_sitl'

npm.cmd --prefix backend start
```

Health check:

```powershell
curl.exe http://127.0.0.1:3000/api/health
```

**Do not drain the Pi outbox unless the health response confirms `storage: postgres` and `database: online`.**

---

## 19. Running the Dashboard

### Windows PowerShell

```powershell
cd "C:\Users\paltr\OneDrive\Dokumen\New project\Disaster"

$env:NEXT_PUBLIC_API_BASE_URL='http://127.0.0.1:3000/api'

npm.cmd --prefix dashboard run dev -- --port 3001
```

Open:

```text
http://localhost:3001
```

Mission Console:

```text
http://localhost:3001/missions
```

---

## 20. Running PX4 SITL

### Ubuntu / WSL Terminal 1

```bash
cd ~/PX4-Autopilot
HEADLESS=1 make px4_sitl gz_x500
```

A useful PX4-shell diagnostic is:

```text
mavlink status
```

The validated onboard stream used:

```text
local UDP port: 14580
remote UDP port: 14540
```

If needed in the PX4 `pxh>` shell:

```text
mavlink stop -u 14580
mavlink start -x -u 14580 -r 4000000 -m onboard -o 14540 -t 127.0.0.1
```

---

## 21. Running SITL Telemetry

### Ubuntu / WSL Terminal 2

```bash
cd '/mnt/c/Users/paltr/OneDrive/Dokumen/New project/Disaster'
source .venv-sitl/bin/activate

export WINDOWS_HOST="$(ip route show default | awk '{print $3; exit}')"
export BACKEND_URL="http://${WINDOWS_HOST}:3000/api/detections"
export VEHICLE_PROVIDER=mavsdk
export VEHICLE_SOURCE=px4_sitl
export MAVSDK_SYSTEM_ADDRESS="udpin://0.0.0.0:14540"

python scripts/vehicle_telemetry.py --count 1
```

A successful sample should report:

```json
{
  "vehicle_source": "px4_sitl",
  "connected": true
}
```

**Port note:** do not run the telemetry process and mission worker simultaneously if both are trying to bind the same UDP `14540` endpoint. Use separate PX4 streams if simultaneous operation is required.

---

## 22. Running the Mission Worker

After releasing the telemetry listener:

```bash
cd '/mnt/c/Users/paltr/OneDrive/Dokumen/New project/Disaster'
source .venv-sitl/bin/activate

export WINDOWS_HOST="$(ip route show default | awk '{print $3; exit}')"
export BACKEND_URL="http://${WINDOWS_HOST}:3000/api/detections"
export VEHICLE_PROVIDER=mavsdk
export VEHICLE_SOURCE=px4_sitl
export MAVSDK_SYSTEM_ADDRESS="udpin://0.0.0.0:14540"

unset MISSION_MAVSDK_SYSTEM_ADDRESS

python scripts/mission_worker.py
```

The worker waits for a queued SITL mission from the backend.

---

## 23. Running Person Detection on the Raspberry Pi

```bash
cd ~/Disaster
source .venv/bin/activate
python ai/person_detection.py
```

The camera currently uses:

```text
/dev/video0
```

The Hawkeye device has been observed supporting H.264/MJPEG modes including 1920x1080, 1280x720, 640x480, and 320x240.

Example camera test:

```bash
v4l2-ctl -d /dev/video0 --stream-mmap --stream-count=30 --stream-to=/dev/null
```

---

## 24. Pi Backend URL

Because the Windows host IP can change when Wi-Fi changes, always verify it before a Pi integration test.

### Windows PowerShell

```powershell
Get-NetIPConfiguration |
  Where-Object {$_.IPv4DefaultGateway -ne $null} |
  Select InterfaceAlias,IPv4Address,IPv4DefaultGateway
```

Then from the Pi:

```bash
curl --connect-timeout 5 http://<WINDOWS_IP>:3000/api/health
```

Only after that succeeds should the Pi `BACKEND_URL` be updated.

Example:

```bash
export BACKEND_URL="http://192.168.1.9:3000/api/detections"
```

---

## 25. Power Reliability

A previous Raspberry Pi instability issue was traced to undervoltage. Kernel logs reported repeated:

```text
Undervoltage detected!
Voltage normalised
```

After correcting the power setup, the Pi reported:

```text
throttled=0x0
```

Check with:

```bash
vcgencmd get_throttled
```

For Pi 5 workloads involving USB camera + inference, use a high-quality Pi 5-capable USB-C supply/cable. Power instability can cause USB/camera/storage behavior that looks like a software bug.

---

## 26. Storage Reliability

An earlier 64 GB SD card developed MMC I/O errors/corruption and was abandoned. The system was moved to another card.

Operational recommendations:

- Use reputable storage.
- Avoid abrupt power loss.
- Use:

```bash
sudo poweroff
```

before disconnecting power when practical.
- Keep sufficient free disk space for evidence images/logs.
- Monitor filesystem/kernel errors if unexplained failures appear.

---

## 27. Testing

The project contains tests across several layers.

Validated milestones have included:

- Backend API tests
- PostgreSQL/PostGIS integration tests
- Python AI/transport tests
- Mission-worker tests
- Dashboard lint/build/type checking
- Manual real-camera inference
- Manual real Pi -> backend evidence transfer
- Manual PX4 SITL telemetry
- Manual autonomous 3-waypoint flight
- Manual mission cancellation/RTL

For the mission feature implementation, automated results reported:

```text
Python: 47 passed
Backend API: 21 passed
PostGIS integration: 12 passed
Dashboard build/typecheck: passed
git diff --check: passed
```

For the permanent-evidence-failure reliability fix:

```text
Focused evidence/outbox tests: 14 passed
Complete Python suite: 51 passed, 0 failed, 0 skipped
git diff --check: passed
```

The latter still needs final validation against the real Pi outbox before being considered fully deployed.

---

## 28. Important Safety Rules

### Never bypass the flight controller

Do not use Raspberry Pi GPIO to directly control propulsion as a substitute for a flight controller. Use Pixhawk/PX4 for:

- motor output,
- attitude stabilization,
- sensor fusion,
- flight modes,
- navigation,
- arming checks,
- failsafes.

### Simulation first

Every new autonomous behavior should progress through:

```text
Unit tests
    ->
PX4 SITL
    ->
Gazebo mission
    ->
Hardware-in-the-loop / bench testing where appropriate
    ->
Propellers-off physical integration
    ->
Controlled real-flight testing
```

### Survivor detections are not automatically flight commands

Detection coordinates and mission waypoints are intentionally separate. An AI detection should not cause an aircraft to immediately fly toward a person without explicit mission/safety logic.

### Physical flight requires additional work

The current successful autonomous mission is a **simulation result**. It must not be represented as proof that the physical aircraft is ready for autonomous deployment.

---

## 29. Known Limitations

1. Physical Pixhawk integration is not complete.
2. Physical GPS integration is not complete.
3. Thermal imaging is not complete.
4. Real motors/ESC/airframe autonomous flight is not validated.
5. Mission endpoints require production-grade authentication/authorization before deployment.
6. Telemetry and mission processes currently need separate MAVLink UDP streams for simultaneous operation.
7. Historical invalid/zero-byte evidence requires final deployment of the quarantine fix.
8. GPS fields in real camera detections remain null until GPS integration.
9. SITL vehicle telemetry stored in PostgreSQL can remain visible after the simulator stops; a stored `connected: true` record is not proof that PX4 is currently online.
10. Network configuration can change when Windows/Pi switch Wi-Fi networks.
11. The project is a prototype and is not certified aviation or emergency-response equipment.

---

## 30. What Is Not Built Yet

### Physical flight stack

```mermaid
flowchart LR
    DONE[Software + SITL validated] --> PIX[Connect Pixhawk]
    PIX --> GPS[Integrate GPS]
    GPS --> BENCH[Bench tests - props off]
    BENCH --> AIR[Airframe / ESC / motors]
    AIR --> MANUAL[Controlled manual flight]
    MANUAL --> AUTO[Controlled autonomous flight]
    AUTO --> FIELD[Disaster-style field validation]
```

Still required:

- Pixhawk wiring/configuration
- Airframe integration
- ESC/motor integration
- RC/manual override strategy
- Physical arming/failsafe validation
- GPS hardware validation
- Real telemetry link
- Controlled outdoor flight testing
- Autonomous physical waypoint validation

### Thermal perception

Still required:

- Select/integrate thermal sensor
- Capture synchronized thermal frames
- Thermal calibration
- Fusion or independent detection logic
- Dashboard/evidence representation
- Field validation

### Advanced AI

Possible future capabilities:

- Smoke/fire detection
- Flood/water-region detection
- Rubble/blocked-route detection
- Multi-class victim/hazard models
- RGB + thermal fusion
- Tracking across frames
- Search-grid coverage planning
- Detection deduplication
- Confidence/history aggregation

### Intelligence/reporting

Planned possibilities:

- pgvector embeddings
- Semantic incident search
- Automated mission summaries
- Evidence clustering
- Natural-language incident reports
- Search by geographic/time window

---

## 31. Recommended Next Milestones

### Milestone 1 - Finish evidence quarantine deployment

- Validate `1778580` against the real Pi SQLite outbox.
- Confirm the two historical zero-byte JPEGs become `quarantined`.
- Confirm they disappear from `pending_evidence()`.
- Confirm a new valid JPEG still uploads normally.
- Merge the fix into `main`.

### Milestone 2 - Improve MAVLink process architecture

Create independent PX4 UDP streams so:

```text
Telemetry process -> dedicated port
Mission worker     -> dedicated port
```

can operate concurrently.

### Milestone 3 - Pixhawk bench integration

With propellers removed:

- Connect companion computer/Pixhawk.
- Verify MAVLink.
- Read real telemetry.
- Validate hardware-source safety gates.
- Test mission upload without motor risk.
- Verify RTL/failsafe configuration.

### Milestone 4 - GPS

- Integrate NEO-M8N.
- Validate fix quality.
- Add GPS to detection evidence.
- Display actual survivor/detection coordinates on the map.

### Milestone 5 - Thermal

Add thermal sensing and begin RGB/thermal fusion.

### Milestone 6 - Controlled flight

Only after bench testing:

- manual hover,
- position hold,
- RTL,
- geofence,
- short waypoint mission,
- mission cancellation,
- loss-of-link behavior.

---

## 32. Suggested Final Demonstration

A strong hackathon/college demonstration can show two complementary modes.

### Live physical AI demo

```text
Person stands in camera view
        |
Hawkeye camera
        |
Raspberry Pi YOLO
        |
Person detected
        |
Evidence image + confidence
        |
Backend/database
        |
Dashboard detection appears
```

### Autonomous flight simulation demo

```text
Operator creates 3-waypoint search mission
        |
Mission Console
        |
Backend + PostgreSQL
        |
Mission Worker
        |
MAVSDK / MAVLink
        |
PX4 SITL
        |
Gazebo X500 flies route
        |
3/3 COMPLETE
        |
RTL
```

This demonstrates real edge AI without claiming unvalidated physical autonomous flight, while also demonstrating the complete autonomous software architecture safely in simulation.

---

## 33. Resume / Portfolio Description

### Short version

> Built a disaster-response autonomous drone platform using Raspberry Pi 5, YOLO11n/ONNX Runtime, Node.js/Express, PostgreSQL/PostGIS, Next.js, MAVSDK/MAVLink, PX4 SITL and Gazebo. Implemented real-time person detection with durable evidence delivery and a mission-control dashboard, and validated autonomous multi-waypoint missions and RTL behavior in PX4 simulation.

### Technical version

> Designed an end-to-end edge-AI and autonomous-flight system with Raspberry Pi-based YOLO inference, reliable SQLite-backed evidence delivery, REST APIs, geospatial PostgreSQL/PostGIS storage, a Next.js command dashboard, and a Python MAVSDK mission worker. Validated real Hawkeye-camera person detection/evidence ingestion and a 3-waypoint PX4 SITL/Gazebo mission with cancellation-to-RTL safety behavior.

---

## 34. Troubleshooting Quick Reference

### Backend does not respond from Pi

1. Verify backend locally:

```powershell
curl.exe http://127.0.0.1:3000/api/health
```

2. Find current Windows Wi-Fi IP.
3. Test that IP from Windows.
4. Test it from Pi.
5. Check Windows firewall/network profile.
6. Update `BACKEND_URL` only after connectivity succeeds.

### PX4 reports packets but client does not connect

Check:

```text
mavlink status
```

Then inspect UDP:

```bash
sudo timeout 5 tcpdump -ni lo udp port 14540
```

Validated traffic resembles:

```text
127.0.0.1.14580 > 127.0.0.1.14540
```

### Pi unexpectedly reboots / USB camera behaves strangely

Run:

```bash
vcgencmd get_throttled
dmesg | grep -i voltage
```

Investigate power before assuming an AI/camera bug.

### Evidence returns HTTP 415

Check whether the JPEG:

- exists,
- has non-zero size,
- has valid JPEG signatures,
- is not corrupted.

Do not fake evidence or mark a failed upload as successful.

---

## 35. Git Milestones

Important validated milestones include:

```text
5f4c7bf  feat: integrate PX4 SITL MAVLink telemetry
ac95c34  feat: add PX4 SITL waypoint mission execution
a9719a4  feat: integrate PX4 SITL waypoint missions
1778580  fix: quarantine permanently invalid evidence
```

`1778580` is on the evidence reliability fix branch at the time represented by this document and should be merged only after final real-Pi validation.

---

## 36. Engineering Principles Used

- **Edge-first perception:** run core detection on the drone companion computer.
- **Durability:** queue data locally when the network is unavailable.
- **Evidence integrity:** reject/quarantine invalid evidence rather than pretending delivery succeeded.
- **Separation of concerns:** AI, backend, data, UI and flight control are distinct layers.
- **Simulation before hardware:** validate autonomy in PX4 SITL/Gazebo.
- **Flight-controller authority:** PX4 owns safety-critical flight control.
- **Explicit simulation labeling:** do not confuse SITL telemetry with physical drone/survivor coordinates.
- **Fail safely:** cancellation and mission completion use RTL behavior.
- **Test before milestone claims:** distinguish implemented code from manually validated functionality.
- **No fabricated GPS:** location remains null until a real source is available.

---

## 37. Final System Vision

```mermaid
flowchart TD
    DISASTER[Disaster Area] --> SENSORS[RGB + Thermal + GPS]
    SENSORS --> EDGE[Raspberry Pi 5 Edge AI]
    EDGE --> DETECT[Survivor / Hazard Detection]
    DETECT --> EVIDENCE[Evidence + Coordinates]
    EVIDENCE --> CLOUD[Backend + PostGIS]
    CLOUD --> COMMAND[Responder Dashboard]

    COMMAND --> PLAN[Search / Inspection Mission]
    PLAN --> WORKER[Mission Worker]
    WORKER --> PX4[Pixhawk / PX4]
    PX4 --> DRONE[Autonomous Drone]

    DRONE --> SENSORS
```

The target is a closed-loop response platform in which the drone can safely search an assigned area, detect and document people/hazards, report findings to responders, and execute operator-approved missions while PX4 maintains flight safety.

---

## 38. Disclaimer

This repository is a research/education/prototype system. PX4 SITL success does not certify the physical aircraft for autonomous flight. Physical operation must follow applicable aviation regulations, airframe/manufacturer requirements, safe test procedures, geofencing/failsafe configuration, and responsible human supervision.

---

## 39. Current Snapshot

At the current development snapshot:

**Validated:**

```text
Hawkeye RGB
   -> Raspberry Pi 5
   -> YOLO11n / ONNX Runtime
   -> Person Detection
   -> JPEG + JSON Evidence
   -> Reliable Outbox
   -> Express
   -> PostgreSQL/PostGIS
   -> Dashboard
```

and:

```text
Mission Console
   -> Express
   -> PostgreSQL/PostGIS
   -> Python Mission Worker
   -> MAVSDK / MAVLink
   -> PX4 SITL
   -> Gazebo X500
   -> 3 Waypoints Completed
   -> RTL
```

**Next physical step:**

```text
Pixhawk + GPS bench integration
```

after completing the evidence-quarantine deployment validation.

---

**Project state:** Real edge-AI detection pipeline working; autonomous mission software validated in simulation; physical autonomous flight still intentionally pending.
