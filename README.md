# 🚁 Raksha AI

### AI-Powered Autonomous Raksha System for Disaster Search & Rescue

> **Detect • Locate • Assess • Prioritize • Alert • Respond**

Raksha AI is an AI-powered autonomous raksha-based disaster response platform designed to assist emergency response teams in locating survivors, detecting hazards, and generating real-time situational awareness in disaster-affected areas.

The system combines **RGB and thermal vision, edge AI, GPS, IMU, autonomous navigation, sensor fusion, geo-tagged mapping, and real-time cloud communication** to improve victim discovery time while reducing the exposure of human responders to dangerous environments.

---

## 📌 Problem Statement

Natural disasters such as **floods, cyclones, earthquakes, landslides, flash floods, fires, and structural failures** can make affected regions difficult and dangerous to access.

Traditional ground-based search operations can be:

* Time-consuming
* Resource-intensive
* Difficult in inaccessible terrain
* Dangerous for rescue personnel
* Dependent on communication infrastructure

During the first critical hours after a disaster, responders need rapid information about:

* Where survivors are located
* Which areas are dangerous
* Which victims should be prioritized
* Which routes are safe
* Where rescue resources should be deployed

**Raksha AI** addresses this challenge through autonomous aerial monitoring and on-device AI-based detection.

---

# 🎯 Objectives

The primary objectives of Raksha AI are to:

* Detect survivors using RGB and thermal cameras.
* Identify disaster-related hazards.
* Provide real-time raksha telemetry.
* Create geo-tagged survivor and hazard maps.
* Prioritize potential rescue targets.
* Generate automatic emergency alerts.
* Support autonomous mission planning.
* Enable operation in communication-constrained environments.
* Reduce unnecessary exposure of rescue personnel.
* Provide emergency teams with actionable situational awareness.

---

# 🧠 System Concept

```text
                 ┌───────────────────────┐
                 │      RGB Camera       │
                 └───────────┬───────────┘
                             │
                 ┌───────────▼───────────┐
                 │    Thermal Camera     │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Image Processing    │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │     Edge AI Model     │
                 │ Person + Hazard       │
                 │ Detection             │
                 └───────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          GPS / IMU        SLAM        Sensor Fusion
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                 ┌───────────────────────┐
                 │   Raksha Data Gateway  │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Firebase Backend    │
                 │ Auth / Firestore /    │
                 │ Storage / Functions   │
                 └───────────┬───────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │   Raksha AI Dashboard   │
              └─────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Live Map       Alerts        Rescue Priority
```

---

# 🚨 Key Features

## 1. 🛰️ Autonomous Raksha Monitoring

The system is designed to monitor disaster-affected regions using autonomous rakshas.

The raksha can provide:

* GPS position
* Altitude
* Speed
* Heading
* Battery status
* Signal strength
* Flight status
* Camera status
* Mission status

---

## 2. 🤖 Edge AI Detection

AI inference is designed to run **locally on the raksha/edge computing device** rather than depending entirely on cloud processing.

The system can be designed to detect:

### People

* Survivors
* Individuals
* Groups of people
* Possible survivors

### Hazards

* 🔥 Fire
* 💨 Smoke
* 🌊 Floodwater
* 🏚️ Damaged structures
* 🪨 Landslides
* ⚡ Exposed electrical lines
* 🧱 Debris
* ☣️ Chemical hazards
* ⚠️ Unstable structures

---

# 🌡️ RGB + Thermal Vision

Raksha AI uses two complementary vision sources.

### RGB Camera

Useful for:

* Visible person detection
* Structural damage
* Fire
* Smoke
* Debris
* Flood assessment

### Thermal Camera

Useful for:

* Detecting human thermal signatures
* Searching during low visibility
* Night-time operations
* Identifying people partially obscured by debris

Combining RGB and thermal information can improve detection reliability in challenging environments.

---

# 🗺️ Geo-Tagged Disaster Mapping

The command dashboard provides a map containing:

* Raksha locations
* Raksha flight paths
* Survivor locations
* Hazard locations
* Search areas
* Waypoints
* Flood zones
* Fire zones
* Landslide zones
* Damaged structures
* Safe routes
* Restricted areas

Every detection can contain:

```text
Latitude
Longitude
Timestamp
Raksha ID
Mission ID
Detection Type
Confidence
Severity
Verification Status
```

---

# 🚨 Intelligent Emergency Alerts

The platform automatically generates alerts based on detected conditions.

Example:

```text
🚨 CRITICAL

Possible survivor detected near unstable structure.

Raksha: RAKSHA-02
Confidence: 94%
Location: 13.xxxx, 80.xxxx
Status: AI DETECTED
```

Alert severity levels:

* 🔴 Critical
* 🟠 High
* 🟡 Medium
* 🟢 Low

Responders can:

* Acknowledge alerts
* Assign response
* Verify detections
* Resolve alerts

---

# 🧑‍🚒 Survivor Prioritization

Raksha AI provides an AI-assisted rescue priority score.

The priority can consider:

* Detection confidence
* Environmental hazards
* Nearby risks
* Accessibility
* Isolation
* Distance from safe routes
* Number of people detected

Example:

```text
SURVIVOR S-014

Priority Score: 94/100
Priority Level: CRITICAL

Nearby Hazard:
Structural instability

Recommended Action:
Immediate human verification and rescue assessment
```

> AI-generated priorities are intended as decision support and should be verified by trained responders.

---

# 🛩️ Raksha Fleet Management

The dashboard supports multiple rakshas.

Example fleet:

| Raksha    | Mission        | Status  | Battery |
| -------- | -------------- | ------- | ------: |
| RAKSHA-01 | Search Zone A  | Active  |     78% |
| RAKSHA-02 | Search Zone B  | Active  |     64% |
| RAKSHA-03 | Thermal Search | Standby |     91% |

Possible raksha states:

* Active
* Standby
* Returning
* Charging
* Offline
* Emergency

---

# 🧭 Autonomous Navigation

The system is designed to support:

### GPS Navigation

Standard outdoor navigation using GPS.

### GPS-Denied Navigation

Navigation using:

* Computer vision
* IMU
* SLAM
* Sensor fusion

### Obstacle Avoidance

The raksha can be designed to identify and avoid obstacles such as:

* Buildings
* Trees
* Debris
* Structures
* Other obstacles

---

# 📡 Offline-Resilient Architecture

A major design principle is that **AI inference should not depend on continuous internet connectivity**.

```text
             Disaster Area
                   │
                   ▼
          ┌─────────────────┐
          │ Autonomous Raksha│
          └────────┬────────┘
                   │
          ┌────────▼────────┐
          │    Edge AI      │
          │    Inference    │
          └────────┬────────┘
                   │
              Detection
                   │
                   ▼
          Local / Edge Storage
                   │
             Connectivity
                   │
          ┌────────▼────────┐
          │    Firebase     │
          └────────┬────────┘
                   │
                   ▼
             Command Center
```

When communication is restored, stored information can be synchronized with the command center.

---

# ☁️ Firebase Architecture

The web application uses Firebase as the cloud backend.

### Firebase Authentication

Used for secure user authentication and role-based access.

### Cloud Firestore

Stores:

* Raksha information
* Telemetry
* Missions
* Detections
* Survivors
* Hazards
* Alerts
* Waypoints
* Reports

### Firebase Storage

Stores:

* RGB images
* Thermal images
* Mission images
* Generated reports

### Cloud Functions

Used for backend automation such as:

* Detection processing
* Alert generation
* Rescue priority calculation
* Mission statistics
* Report generation

---

# 🖥️ Command Center Dashboard

The dashboard provides:

### Overview

* Active rakshas
* Survivors detected
* Critical survivors
* Hazards detected
* Surveyed area
* Active alerts

### Live Map

Real-time visualization of:

* Rakshas
* Survivors
* Hazards
* Routes
* Search areas

### AI Detection Center

Displays:

* Detection type
* Confidence
* Location
* Timestamp
* Raksha
* Image
* Severity

### Mission Management

Allows operators to:

* Create missions
* Assign rakshas
* Define search areas
* Generate waypoints
* Monitor mission progress

### Alerts

Provides real-time emergency notifications.

### Analytics

Displays mission and detection statistics.

---

# 🧪 Simulation Mode

Since the prototype may initially operate without physical rakshas, Raksha AI includes a **Simulation Mode**.

The simulation provides:

* 3 virtual rakshas
* Moving raksha locations
* Simulated telemetry
* Survivor detections
* Hazard detections
* Emergency alerts
* Flight paths
* Mission progress

Controls:

```text
START SIMULATION
PAUSE SIMULATION
RESET SIMULATION
```

A visible **SIMULATION MODE** indicator prevents simulated information from being mistaken for live data.

---

# 📊 Analytics

The dashboard provides analytics such as:

* Survivors detected per mission
* Hazards by category
* Hazards by severity
* Detection confidence
* Raksha flight hours
* Area surveyed
* Critical alerts
* Mission completion rate
* Rescue priority distribution

---

# 📝 Situational Reports

The system can generate mission reports containing:

* Mission details
* Disaster type
* Surveyed area
* Raksha information
* Survivor detections
* Hazard summary
* Critical alerts
* Search coverage
* AI recommendations
* Map information
* Timestamp

Reports can be viewed and exported for emergency response documentation.

---

# 👥 User Roles

The system supports role-based access.

| Role              | Access                               |
| ----------------- | ------------------------------------ |
| Admin             | Full system access                   |
| Mission Commander | Missions, rakshas, alerts and reports |
| Responder         | Survivors, hazards and rescue status |
| Viewer            | Read-only dashboard                  |

---

# 🛠️ Technology Stack

### Frontend

* React / Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* Recharts
* Leaflet / Maps

### Backend

* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* Cloud Functions
* Firebase Security Rules

### AI / Edge Computing

Designed for integration with:

* YOLO-based object detection
* Thermal person detection
* Hazard classification
* Sensor fusion
* SLAM

### Potential Edge Hardware

* Raspberry Pi
* NVIDIA Jetson
* Other embedded AI computing platforms

### Raksha Technologies

* GPS
* IMU
* RGB camera
* Thermal camera
* Autonomous navigation
* Obstacle avoidance
* Telemetry

---

# 📂 Project Structure

```text
Raksha-AI/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── functions/
│   ├── src/
│   └── package.json
│
├── public/
│
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── package.json
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/piyushgoilkar17/RAKSHA.git

cd RAKSHA
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create a Firebase Project

Create a Firebase project and enable:

* Authentication
* Cloud Firestore
* Firebase Storage
* Cloud Functions

Configure your Firebase credentials using environment variables.

Example:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> Never commit private credentials or service-account keys to GitHub.

## 4. Run the application

```bash
npm run dev
```

Open the local development URL shown by the application.

---

# 🚀 Future Development

The current platform is designed as an extensible prototype.

Future development can include:

### Hardware Integration

* Real autonomous raksha
* Raspberry Pi / NVIDIA Jetson
* Flight controller integration
* Real-time telemetry
* GPS
* IMU
* LiDAR

### AI

* Custom disaster dataset
* YOLO-based survivor detection
* Thermal AI detection
* Fire/smoke detection
* Structural damage classification
* Flood segmentation
* Landslide detection

### Navigation

* ROS 2
* SLAM
* GPS-denied navigation
* Autonomous waypoint generation
* Advanced obstacle avoidance

### Communication

* MQTT
* WebSocket
* 4G/5G
* Long-range telemetry
* Mesh communication
* Store-and-forward communication

### Advanced Disaster Intelligence

* Automatic disaster severity estimation
* Dynamic rescue route planning
* Multi-raksha coordination
* Victim clustering
* Search-area optimization
* Predictive hazard analysis

---

# 🎯 Expected Impact

Raksha AI aims to improve disaster response by:

* ⏱️ Reducing survivor discovery time
* 🛡️ Improving responder safety
* 🛰️ Providing rapid aerial situational awareness
* 🤖 Automating repetitive search operations
* 📍 Providing precise survivor locations
* 🚨 Prioritizing critical situations
* 🌐 Supporting communication-constrained environments
* 🚁 Enabling scalable multi-raksha operations

---

# ⚠️ Safety & Limitations

Raksha AI is a **decision-support and research prototype**.

AI detections may contain false positives or false negatives. Critical information should therefore be verified by trained emergency personnel before operational decisions are made.

Simulation data must not be interpreted as real disaster information.

The system is intended to assist—not replace—qualified emergency response teams.

---

# 🏆 Project Vision

Our vision is to develop a deployable autonomous aerial intelligence platform capable of rapidly surveying disaster zones, identifying survivors and hazards, and providing emergency teams with reliable, geo-tagged information when every minute matters.

### **Raksha AI**

> **See Faster. Respond Smarter. Save Lives.** 🚁
