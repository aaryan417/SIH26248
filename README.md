# SIH26248 — Immersive Multi-Domain Decision-Making Trainer

Frontend prototype for Smart India Hackathon 2026 Problem Statement **SIH26248**, proposed by the Ministry of Defence (MoD), Defence Services Staff College.

## Local 360° Media Setup

For local 360° VR video development, place an equirectangular MP4 video at:

```text
public/videos/training360.mp4
```

Alternatively, configure an external object storage / CDN URL in `.env`:

```env
VITE_DEFAULT_360_VIDEO_URL=https://cdn.example.com/training360.mp4
```

## Running Locally

```bash
npm install
npm run dev
```

App will run at `http://localhost:3000`.

## Testing & Verification

```bash
npm test
npm run lint
npm run build
```

# SIH26248 — Immersive Multi-Domain Decision-Making Trainer

### Architecture & Design Diagram Pack

**Project:** Browser-based VR trainer where an instructor degrades communications (delay, loss, conflicting intel) and trainees make timed decisions inside a 360° scene. Output is an After Action Review (AAR).

**Stack (from code):** React 18, TypeScript, Vite, Zustand, Tailwind, Recharts, A-Frame (360° + WebXR), Vitest. **Target backend (contract only):** Django REST + Channels + Redis + PostgreSQL.

> **Status legend:** diagrams 1–2 show what exists today (client-side prototype). Diagrams 3 and 5 mark target-only parts with *(planned)*.

---

## 1. System Architecture (current prototype and target backend)

```mermaid
flowchart TB
  subgraph Users["Actors"]
    I["Instructor - CONTROL-1"]
    T1["Alpha-1 Land"]
    T2["Alpha-2 Air"]
    T3["Alpha-3 Cyber/EW"]
  end

  subgraph FE["Frontend SPA - React + TS + Vite"]
    direction TB
    UI["Presentation: Landing, Scenarios, Instructor Dashboard, Trainee Mission, Team Matrix, AAR, Settings"]
    VR["VR Layer: A-Frame videosphere, gyro/mouse look, split-eye phone VR, gaze dwell"]
    ST["State: Zustand stores - Session, Auth, VR"]
    SV["Service Layer - interfaces: ScenarioService, SessionService, RealtimeService"]
    EN["Simulation Engine: ScenarioEngine, EventScheduler, DegradationEngine, ScoringEngine"]
    LS[("localStorage")]
  end

  subgraph BE["Backend (planned) - Django"]
    API["Django REST API /api/v1"]
    WS["Django Channels WebSocket /ws/sessions/id"]
    RD[("Redis channel layer")]
    DB[("PostgreSQL")]
    OBJ[("Object storage / CDN - 360 video")]
  end

  I --> UI
  T1 --> UI
  T2 --> UI
  T3 --> UI
  UI --> VR
  UI <--> ST
  ST --> SV
  ST --> EN
  SV --> EN
  EN --> LS
  SV -. "VITE_USE_MOCK_API=false" .-> API
  SV -. "WebSocketRealtimeService" .-> WS
  WS <--> RD
  API --> DB
  WS --> DB
  VR -. "video360Url" .-> OBJ
```

## 2. Frontend Module / Component Diagram

```mermaid
flowchart LR
  main["main.tsx"] --> AP["AppProvider"] --> RT["AppRouter + MainLayout (Navbar, Footer)"]
  RT --> F1["features/landing"]
  RT --> F2["features/auth: Login, RoleSelection"]
  RT --> F3["features/scenarios: List, Detail"]
  RT --> F4["features/instructor: Dashboard"]
  RT --> F5["features/trainee: MissionPage"]
  RT --> F6["features/team: Coordination"]
  RT --> F7["features/aar: AARPage"]
  RT --> F8["features/settings + help"]
  F5 --> VRV["features/vr: VRMissionView"]
  F5 --> DM["features/decisions: DecisionModal"]
  VRV --> DM
  VRV --> G["hooks/useGazeInteraction"]
  F4 & F5 & F6 --> H["hooks/useScenarioEngine"]
  H --> S1["useSessionStore"]
  F2 --> S2["useAuthStore"]
  VRV --> S3["useVRStore"]
  G --> S3
  F8 --> S3
  F3 --> SS["scenarioService"]
  S1 --> SES["sessionService"]
  F7 --> SES
  SES --> ENG["engine/*"]
  SS --> FX["mocks/fixtures"]
  SES --> FX
  S2 --> FX
  ENG --> TY["types/index.ts"]
```

## 3. Class Diagram — Engine, Services, Stores

```mermaid
classDiagram
  class EventScheduler {
    -timerId
    -elapsedTimeMs
    -isRunning
    -speedMultiplier
    -tickIntervalMs = 500
    +start()
    +pause()
    +resume()
    +reset()
    +setSpeed(m)
    +subscribe(cb) unsubscribe
  }
  class DegradationEngine {
    -status CommunicationStatus
    +getStatus()
    +updateState(state, overrides)
    +setSignalStrength(p)
    +setArtificialDelay(s)
    +setMessageLossRate(r)
    +processOutgoingMessage(msg, nowMs, forceDrop) CommunicationMessage
    -recalculateStateFromMetrics()
  }
  class ScenarioEngine {
    -scenario Scenario
    -session ExerciseSession
    -pendingEventsQueue
    -eventLogs SessionEvent[]
    -activeMessages
    -activeDecisions Map
    -userDecisions
    -forceDropNextMessage
    +start() pause() resume() reset() endExercise()
    +setDegradationState(s)
    +setArtificialDelay(s)
    +setMessageLossRate(r)
    +dropNextMessage()
    +injectConflict(...)
    +submitTraineeDecision(...) Decision
    +subscribeState(cb)
    +subscribeLogs(cb)
    -onTick(ms)
    -dispatchEvent(evt)
    -logEvent(type, payload)
  }
  class ScoringEngine {
    +generateAARReport(session, logs, msgs, decisions, prompts)$ AARReport
    +buildChartData(logs)$ TimelineSample[]
  }
  class SessionService {
    <<interface>>
    +createSession()
    +getSession()
    +startSession()
    +pauseSession()
    +endSession()
    +getAARReport()
    +getEngine()
  }
  class MockSessionAdapter
  class ScenarioService {
    <<interface>>
    +getScenarios()
    +getScenario(id)
  }
  class MockScenarioAdapter
  class HttpScenarioAdapter
  class RealtimeService {
    <<interface>>
    +connect(sessionId)
    +disconnect()
    +subscribe(topic, cb)
    +publish(topic, payload)
    +isConnected()
  }
  class MockRealtimeService
  class WebSocketRealtimeService
  class SessionStore {
    <<zustand>>
    +currentSession
    +commStatus
    +eventLogs
    +activeMessages
    +pendingDecisions
    +initializeSession()
    +submitDecision()
  }
  class AuthStore {
    <<zustand>>
    +currentUser
    +selectedRole
    +loginAsMockUser()
  }
  class VRStore {
    <<zustand>>
    +videoUrl
    +isImmersive
    +isPhoneVRMode
    +gazeProgress
  }

  ScenarioEngine *-- EventScheduler
  ScenarioEngine *-- DegradationEngine
  MockSessionAdapter ..|> SessionService
  MockSessionAdapter o-- ScenarioEngine
  MockSessionAdapter ..> ScoringEngine
  MockScenarioAdapter ..|> ScenarioService
  HttpScenarioAdapter ..|> ScenarioService
  MockRealtimeService ..|> RealtimeService
  WebSocketRealtimeService ..|> RealtimeService
  SessionStore --> SessionService
  SessionStore --> ScenarioEngine
```

## 4. Class Diagram — Domain Model (`types/index.ts`)

```mermaid
classDiagram
  class User { id; name; role; callsign; unit }
  class Scenario { id; name; codeName; domains; difficulty; durationMinutes; degradationLevel; learningObjectives; media }
  class ScenarioEvent { id; timeMs; type; priority; targetParticipants; payload }
  class DecisionPrompt { id; timeMs; title; domain; timeLimitSec; requiredRationale }
  class DecisionOption { id; code; label; riskAssessment; domainFocus }
  class ExerciseSession { id; state; startedAt; endedAt; currentScenarioTimeMs; instructorId }
  class Participant { id; callsign; assignedDomain; connectionStatus; signalStrength; messagesReceivedCount; messagesMissedCount; informationState }
  class CommunicationStatus { state; signalStrength; networkHealth; artificialDelaySec; messageLossRate; confidenceScore; activeOutage }
  class CommunicationMessage { id; sender; recipient; channel; domain; status; confidence; delayMs; isConflicting }
  class Decision { id; selectedOptionId; rationale; responseTimeSec; informationAvailableAtDecision }
  class SessionEvent { id; type; scenarioTimeMs; payload }
  class AARReport { metrics; teamAnalytics; decisionsEvaluated; timelineEvents }

  Scenario "1" *-- "many" ScenarioEvent
  ScenarioEvent "1" o-- "0..1" DecisionPrompt
  DecisionPrompt "1" *-- "2..many" DecisionOption
  ExerciseSession "many" --> "1" Scenario
  ExerciseSession "many" --> "1" User : instructor
  ExerciseSession "1" *-- "many" Participant
  ExerciseSession "1" *-- "1" CommunicationStatus
  Participant "many" --> "1" User
  ExerciseSession "1" o-- "many" CommunicationMessage
  Participant "1" --> "many" Decision
  Decision "many" --> "1" DecisionPrompt
  ExerciseSession "1" o-- "many" SessionEvent
  ExerciseSession "1" --> "0..1" AARReport
```

## 5. ER Diagram *(planned persistent schema for the Django backend)*

The prototype has no database. This schema is derived from the TypeScript models and the REST contract. `MESSAGE_DELIVERY` normalises the per-participant `informationState` arrays (received / dropped / delayed / conflicting).

```mermaid
erDiagram
  USER ||--o{ EXERCISE_SESSION : instructs
  USER ||--o{ PARTICIPANT : "plays as"
  SCENARIO ||--o{ SCENARIO_EVENT : defines
  SCENARIO ||--o{ EXERCISE_SESSION : "instantiated as"
  SCENARIO_EVENT ||--o| DECISION_PROMPT : carries
  DECISION_PROMPT ||--|{ DECISION_OPTION : offers
  EXERCISE_SESSION ||--|{ PARTICIPANT : has
  EXERCISE_SESSION ||--o{ COMM_MESSAGE : generates
  EXERCISE_SESSION ||--o{ DEGRADATION_EVENT : records
  EXERCISE_SESSION ||--o{ SESSION_EVENT : logs
  EXERCISE_SESSION ||--o| AAR_REPORT : produces
  COMM_MESSAGE ||--o{ MESSAGE_DELIVERY : "delivered per"
  PARTICIPANT ||--o{ MESSAGE_DELIVERY : receives
  PARTICIPANT ||--o{ DECISION : submits
  DECISION_PROMPT ||--o{ DECISION : answers
  DECISION_OPTION ||--o{ DECISION : selected
  DECISION ||--|| DECISION_EVALUATION : scored
  AAR_REPORT ||--o{ DECISION_EVALUATION : contains

  USER { uuid id PK
    string name
    string role "INSTRUCTOR or TRAINEE"
    string callsign
    string unit }
  SCENARIO { uuid id PK
    string name
    string code_name
    string difficulty
    int duration_minutes
    string degradation_level
    json domains
    json learning_objectives
    string video360_url }
  SCENARIO_EVENT { uuid id PK
    uuid scenario_id FK
    int time_ms
    string type
    string priority
    json payload }
  DECISION_PROMPT { uuid id PK
    uuid scenario_event_id FK
    string title
    string domain
    int time_limit_sec
    bool required_rationale }
  DECISION_OPTION { uuid id PK
    uuid prompt_id FK
    string code
    string label
    string risk_assessment }
  EXERCISE_SESSION { uuid id PK
    uuid scenario_id FK
    uuid instructor_id FK
    string state
    datetime started_at
    datetime ended_at
    int current_time_ms }
  PARTICIPANT { uuid id PK
    uuid session_id FK
    uuid user_id FK
    string callsign
    string assigned_domain
    string connection_status
    int signal_strength }
  COMM_MESSAGE { uuid id PK
    uuid session_id FK
    string sender
    string recipient
    string channel
    string domain
    string status
    int confidence
    int generated_at_ms
    int delay_ms
    bool is_conflicting }
  MESSAGE_DELIVERY { uuid id PK
    uuid message_id FK
    uuid participant_id FK
    string outcome "RECEIVED, DROPPED, DELAYED, CONFLICTING"
    int delivered_at_ms }
  DEGRADATION_EVENT { uuid id PK
    uuid session_id FK
    int time_ms
    string state
    int signal_strength
    float loss_probability
    string triggered_by }
  SESSION_EVENT { uuid id PK
    uuid session_id FK
    uuid participant_id FK
    string type
    int scenario_time_ms
    json payload }
  DECISION { uuid id PK
    uuid prompt_id FK
    uuid participant_id FK
    uuid selected_option_id FK
    string rationale_text
    string confidence_level
    int response_time_sec
    json info_snapshot }
  DECISION_EVALUATION { uuid id PK
    uuid decision_id FK
    uuid aar_id FK
    int score
    string info_awareness
    string rationale_depth
    string key_insight }
  AAR_REPORT { uuid id PK
    uuid session_id FK
    json metrics
    json team_analytics
    datetime generated_at }
```

## 6. Flowchart — End-to-End User Flow

```mermaid
flowchart TD
  A(["Open app"]) --> B["Landing page"]
  B --> C{"Demo mode or login?"}
  C -->|Demo| D["initializeDemoMode: Operation Silent Horizon"]
  C -->|Login| E["Role selection: Instructor or Trainee"]
  E --> F["Scenario list, then Scenario detail"]
  F --> G["Launch: createSession, new ScenarioEngine"]
  D --> G
  G --> H{"Role"}
  H -->|Instructor| I["Instructor Dashboard: Start / Pause / Inject / Degrade"]
  H -->|Trainee| J["Trainee Mission: 360 VR view + comms feed"]
  I --> K["Engine runs scenario clock"]
  J --> K
  K --> L{"Decision prompt due?"}
  L -->|Yes| M["DecisionModal: option + rationale + confidence, timed"]
  M --> N["submitTraineeDecision: snapshot info state"]
  L -->|No| K
  N --> O{"Scenario ended?"}
  O -->|No| K
  O -->|Yes| P["endExercise: state COMPLETED"]
  P --> Q["ScoringEngine.generateAARReport"]
  Q --> R["AAR page: metrics, charts, timeline"]
  R --> S["Export JSON / Print PDF"]
  S --> T(["End"])
```

## 7. Flowchart — Message Degradation Pipeline (core logic)

```mermaid
flowchart TD
  A["Scheduled COMMUNICATION_MESSAGE fires at timeMs"] --> B["DegradationEngine.processOutgoingMessage"]
  B --> C{"forceDropNext OR activeOutage OR random below lossRate?"}
  C -->|Yes| D["status = DROPPED, confidence x 0.5"]
  D --> E["updateParticipantsForDroppedMessage: missedCount+1, droppedMessageIds"]
  C -->|No| F["delay = artificialDelay + random 2-10s if not NORMAL"]
  F --> G{"delay above 0?"}
  G -->|No| H["status = DELIVERED"]
  G -->|Yes| I["status = DELAYED, deliveredAtMs = now + delay"]
  H --> J["updateParticipantsForMessage: receivedCount+1, receivedMessageIds"]
  I --> K["Held in activeMessages"]
  K --> L{"Each tick: deliveredAtMs reached?"}
  L -->|No| K
  L -->|Yes| H
  E --> M["logEvent to SessionEvent log"]
  J --> M
  M --> N["notifyState: Zustand store, then UI"]
```

## 8. Sequence Diagram — Decision Lifecycle

```mermaid
sequenceDiagram
  actor Ins as Instructor
  actor Tr as Trainee
  participant UI as React UI
  participant Store as SessionStore
  participant Eng as ScenarioEngine
  participant Deg as DegradationEngine
  participant Sc as ScoringEngine

  Ins->>UI: Set state DEGRADED
  UI->>Store: setDegradationState
  Store->>Eng: setDegradationState
  Eng->>Deg: updateState(DEGRADED)
  Deg-->>Eng: signal 55, delay 15s, loss 25%
  Eng-->>Store: notifyState
  Store-->>UI: re-render both views
  Eng->>Eng: onTick dispatches DECISION_REQUIRED
  Eng-->>UI: pendingDecisions updated
  UI->>Tr: DecisionModal with countdown
  Tr->>UI: option + rationale + confidence
  UI->>Store: submitDecision
  Store->>Eng: submitTraineeDecision
  Eng->>Eng: snapshot received / dropped / conflicts / signal
  Eng-->>Store: Decision logged, state notified
  Ins->>UI: End exercise
  UI->>Sc: generateAARReport(session, logs, msgs, decisions, prompts)
  Sc-->>UI: AARReport
```

## 9. State Diagrams

```mermaid
stateDiagram-v2
  direction LR
  [*] --> NORMAL
  NORMAL --> DEGRADED: signal below 75
  DEGRADED --> SEVERELY_DEGRADED: signal below 40
  SEVERELY_DEGRADED --> DISCONNECTED: signal 5 or less
  DEGRADED --> NORMAL: restore
  SEVERELY_DEGRADED --> RECOVERING: network recovery
  DISCONNECTED --> RECOVERING: network recovery
  RECOVERING --> NORMAL: restore
  RECOVERING --> DEGRADED: re-jam
```

```mermaid
stateDiagram-v2
  direction LR
  [*] --> SETUP
  SETUP --> RUNNING: start
  RUNNING --> PAUSED: pause
  PAUSED --> RUNNING: resume
  RUNNING --> COMPLETED: SCENARIO_END or end
  PAUSED --> COMPLETED: end
  RUNNING --> SETUP: reset
  COMPLETED --> [*]
```

## 10. Methodology

### 10.1 Development methodology

```mermaid
flowchart LR
  A["1 Requirement analysis: PS SIH26248"] --> B["2 Domain modelling: types, scenarios, events"]
  B --> C["3 Engine-first build: Scheduler, Degradation, Scenario, Scoring"]
  C --> D["4 Service contracts: interfaces + mock adapters"]
  D --> E["5 UI: Instructor, Trainee, Team, AAR"]
  E --> F["6 Immersion: 360 video, WebXR, gaze"]
  F --> G["7 Test: Vitest, lint, build"]
  G --> H["8 Backend swap: Django REST + Channels"]
  H --> I["9 Pilot with staff college, iterate scenarios"]
```

### 10.2 Training methodology (how a session teaches)

1. **Brief:** the trainee sees objectives and mission context.
2. **Degrade:** the instructor or scenario timeline lowers signal, adds latency, drops messages and injects conflicting reports.
3. **Decide:** a timed decision prompt requires an option, a written rationale and a confidence level.
4. **Capture:** each decision records exactly what information the trainee had (received, dropped, conflicting, signal).
5. **Review:** the AAR scores decisions and replays the timeline.

### 10.3 Scoring formulas (from `scoringEngine.ts`)

| Metric | Formula |
| --- | --- |
| Decision score | `0.3 x speed + 0.5 x rationale + 0.2 x info` |
| Speed score | `max(0, 100 - 1.6 x responseTimeSec)` |
| Rationale score | `min(100, 2.5 x characters)` (full marks at 40 chars) |
| Info bonus | 100 if no missing critical messages, else 40 |
| Comm reliability % | `delivered / total` |
| Info availability % | `(delivered + 0.5 x delayed) / total` |
| Asymmetry gap % | `(maxReceived - minReceived) / maxReceived` across participants |
| Domain sync score | `100 - 0.6 x asymmetryGap - 8 x droppedCount`, clamped to 0-100 |

### 10.4 Degradation presets (from `degradationEngine.ts`)

| State | Signal | Delay | Loss | Confidence |
| --- | --- | --- | --- | --- |
| NORMAL | 95 | 0s | 0% | 95 |
| DEGRADED | 55 | 15s | 25% | 70 |
| SEVERELY_DEGRADED | 25 | 35s | 55% | 40 |
| DISCONNECTED | 0 | outage | 100% | 10 |
| RECOVERING | 80 | 5s | 8% | 85 |

## 11. Deployment Diagram *(target)*

```mermaid
flowchart LR
  subgraph Client["Client devices"]
    PC["Instructor - desktop browser"]
    PH["Trainee - phone/desktop, WebXR or split-eye VR"]
  end
  subgraph Edge["Edge"]
    CDN["CDN: static SPA + 360 video"]
    LB["Reverse proxy / TLS"]
  end
  subgraph App["Application tier"]
    DJ["Django + DRF (gunicorn)"]
    CH["Channels (daphne/uvicorn)"]
  end
  subgraph Data["Data tier"]
    RDS[("Redis")]
    PG[("PostgreSQL")]
  end
  PC --> CDN
  PH --> CDN
  PC --> LB
  PH --> LB
  LB --> DJ
  LB --> CH
  CH <--> RDS
  DJ --> PG
  CH --> PG
```