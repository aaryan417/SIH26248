export type Role = 'INSTRUCTOR' | 'TRAINEE';

export interface User {
  id: string;
  name: string;
  role: Role;
  callsign: string;
  unit: string;
  avatarUrl?: string;
}

export type DomainType = 'LAND' | 'AIR' | 'CYBER' | 'ELECTRONIC_WARFARE';

export type CommunicationEventType =
  | 'NORMAL'
  | 'DELAY'
  | 'DROPOUT'
  | 'CONFLICT'
  | 'DEGRADATION'
  | 'RESTORED';

export type DegradationState =
  | 'NORMAL'
  | 'DEGRADED'
  | 'SEVERELY_DEGRADED'
  | 'DISCONNECTED'
  | 'RECOVERING';

export type ScenarioEventType =
  | 'MISSION_UPDATE'
  | 'COMMUNICATION_MESSAGE'
  | 'COMMUNICATION_DELAY'
  | 'COMMUNICATION_DROPOUT'
  | 'COMMUNICATION_CONFLICT'
  | 'EW_DEGRADATION'
  | 'CYBER_ALERT'
  | 'NETWORK_RECOVERY'
  | 'DECISION_REQUIRED'
  | 'TEAM_UPDATE'
  | 'SCENARIO_END';

export interface ScenarioEvent {
  id: string;
  timestamp: string; // ISO or relative T+ format
  timeMs: number; // millisecond offset in scenario
  type: ScenarioEventType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetParticipants: string[]; // ['ALL'] or specific participant IDs
  payload: Record<string, any>;
}

export interface ScenarioMedia {
  video360Url: string;
  audioBriefingUrl?: string;
  mapImageUrl?: string;
}

export interface Scenario {
  id: string;
  name: string;
  codeName: string;
  description: string;
  domains: DomainType[];
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'CLASSIFIED_SIM';
  durationMinutes: number;
  maxParticipants: number;
  degradationLevel: 'LOW' | 'MODERATE' | 'SEVERE' | 'EXTREME';
  learningObjectives: string[];
  media: ScenarioMedia;
  events: ScenarioEvent[];
}

export type MessageStatus =
  | 'GENERATED'
  | 'QUEUED'
  | 'DELAYED'
  | 'DELIVERED'
  | 'DROPPED'
  | 'CONFLICTING';

export interface CommunicationMessage {
  id: string;
  sender: string;
  recipient: string;
  generatedAtMs: number;
  deliveredAtMs?: number;
  delayMs?: number;
  status: MessageStatus;
  confidence: number; // 0 to 100%
  channel: 'HF_RADIO' | 'SATCOM' | 'DATA_LINK' | 'CYBER_FEED';
  domain: DomainType;
  subject: string;
  content: string;
  isConflicting?: boolean;
  conflictReportPairId?: string;
  originalReport?: string;
}

export interface CommunicationStatus {
  state: DegradationState;
  signalStrength: number; // 0-100%
  networkHealth: number; // 0-100%
  artificialDelaySec: number;
  messageLossRate: number; // 0-100%
  confidenceScore: number; // 0-100%
  activeOutage: boolean;
  activeJammingDomain?: DomainType;
  lastUpdatedMs: number;
}

export interface DegradationEvent {
  id: string;
  timestamp: string;
  timeMs: number;
  state: DegradationState;
  signalStrength: number;
  networkHealth: number;
  latencySec: number;
  lossProbability: number;
  triggeredBy: 'SCHEDULED' | 'INSTRUCTOR_INJECT';
  description: string;
}

export interface DecisionOption {
  id: string;
  code: string;
  label: string;
  description: string;
  riskAssessment: string;
  domainFocus: DomainType;
}

export interface DecisionPrompt {
  id: string;
  timeMs: number;
  title: string;
  context: string;
  domain: DomainType;
  options: DecisionOption[];
  timeLimitSec: number;
  requiredRationale: boolean;
  impactPreview?: string;
}

export interface DecisionRationale {
  text: string;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  assumedFactors: string[];
}

export interface Decision {
  id: string;
  promptId: string;
  sessionId: string;
  participantId: string;
  selectedOptionId: string;
  rationale: DecisionRationale;
  presentedAtMs: number;
  submittedAtMs: number;
  responseTimeSec: number;
  informationAvailableAtDecision: {
    messagesReceived: string[]; // message IDs
    commStatusState: DegradationState;
    signalStrength: number;
    conflictsPresent: boolean;
    missingCriticalMessages: string[];
  };
}

export type ParticipantConnectionStatus = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';

export interface Participant {
  id: string;
  userId: string;
  name: string;
  callsign: string;
  role: string;
  assignedDomain: DomainType;
  connectionStatus: ParticipantConnectionStatus;
  signalStrength: number;
  messagesReceivedCount: number;
  messagesMissedCount: number;
  pendingDecisionId?: string;
  lastAction: string;
  informationState: {
    receivedMessageIds: string[];
    droppedMessageIds: string[];
    delayedMessageIds: string[];
    conflictingMessageIds: string[];
  };
}

export interface TeamStatus {
  sessionId: string;
  participants: Participant[];
  coordinationIndex: number; // 0-100%
  sharedReportsCount: number;
  acknowledgedReportsCount: number;
  pendingRequestsCount: number;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  participantId?: string;
  type: ScenarioEventType | string;
  timestamp: string;
  scenarioTimeMs: number;
  payload: Record<string, any>;
}

export type ExerciseSessionState = 'SETUP' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';

export interface ExerciseSession {
  id: string;
  scenarioId: string;
  scenarioName: string;
  codeName: string;
  state: ExerciseSessionState;
  startedAt?: string;
  endedAt?: string;
  elapsedTimeMs: number;
  currentScenarioTimeMs: number;
  instructorId: string;
  participants: Participant[];
  commStatus: CommunicationStatus;
}

export interface InstructorCommand {
  type:
    | 'START'
    | 'PAUSE'
    | 'RESUME'
    | 'END'
    | 'RESET'
    | 'SET_DELAY'
    | 'SET_DROPOUT'
    | 'DROP_NEXT'
    | 'INJECT_CONFLICT'
    | 'TRIGGER_DEGRADATION'
    | 'RESTORE_COMMUNICATION'
    | 'INJECT_CUSTOM_EVENT';
  payload?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number | string;
  unit?: string;
  benchmark?: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'CRITICAL';
  description: string;
}

export interface AARReport {
  sessionId: string;
  scenarioName: string;
  codeName: string;
  durationMs: number;
  startedAt: string;
  endedAt: string;
  participants: Participant[];
  metrics: {
    avgResponseTimeSec: number;
    messagesGenerated: number;
    messagesDelivered: number;
    messagesDelayed: number;
    messagesDropped: number;
    commReliabilityPercent: number;
    infoAvailabilityPercent: number;
    coordinationAttempts: number;
    acknowledgementRatePercent: number;
  };
  timelineEvents: SessionEvent[];
  decisionsEvaluated: Array<{
    decision: Decision;
    prompt: DecisionPrompt;
    participant: Participant;
    qualityAssessment: {
      score: number; // 0-100
      informationAwareness: 'FULL' | 'PARTIAL' | 'SEVERE_DEPRIVATION';
      rationaleDepth: 'STRONG' | 'ADEQUATE' | 'POOR';
      keyInsight: string;
    };
  }>;
  teamAnalytics: {
    asymmetryGapPercent: number;
    unacknowledgedCriticalAlerts: number;
    domainSyncScore: number;
  };
}
