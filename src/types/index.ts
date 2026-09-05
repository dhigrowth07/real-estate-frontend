export type UserRole = 'ADMIN' | 'AGENT';

export type AgentVisibilityMode = 'ASSIGNED_ONLY' | 'ALL';

export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'DIRECT_CALL' | 'PORTAL' | 'WALK_IN' | 'OTHER';

export type LeadPurpose = 'BUY' | 'RENT' | 'INVESTMENT' | 'INVEST';

export type LeadUrgency = 'IMMEDIATE' | 'WITHIN_1_MONTH' | 'WITHIN_3_MONTHS' | 'EXPLORING';

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'REQUIREMENT_GATHERED'
  | 'SITE_VISIT_SCHEDULED'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type PropertyType =
  'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'INDEPENDENT_HOUSE' | 'PENTHOUSE';

export type PossessionStatus =
  'READY_TO_MOVE' | 'UNDER_CONSTRUCTION' | 'WITHIN_3_MONTHS' | 'WITHIN_6_MONTHS';

export type PropertyStatus = 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD' | 'INACTIVE';

export type MatchStatus = 'NEW' | 'NOTIFIED' | 'VIEWED' | 'DISMISSED';

export type NotificationType = 'MATCH_ALERT' | 'SYSTEM';

export type InteractionChannel = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'SMS' | 'NOTE';

export type InteractionType =
  'INITIAL_CONTACT' | 'FOLLOW_UP' | 'SITE_VISIT' | 'PROPOSAL' | 'FEEDBACK' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AgencySetting {
  id: string;
  agentVisibilityMode: AgentVisibilityMode;
  matchingWeights?: {
    budgetFullMatch: number;
    budgetPartialMatch: number;
    locationMatch: number;
    propertyTypeMatch: number;
    bhkMatch: number;
    possessionMatch: number;
  };
  minAlertScore: number;
  updatedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  token: string;
  role: UserRole;
  expiresAt: string;
  usedAt?: string | null;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  propertyType: PropertyType;
  bhk?: string;
  purpose: LeadPurpose;
  urgency: LeadUrgency;
  stage: LeadStage;
  assignedAgentId?: string;
  assignedAgent?: User;
  matches?: Match[];
  interactions?: Interaction[];
  createdAt: string;
  updatedAt?: string;
  _count?: {
    matches: number;
    interactions: number;
  };
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: PropertyType;
  bhk?: string;
  sqft?: number;
  possessionStatus?: PossessionStatus;
  amenities?: string[];
  ownerContact?: string;
  images?: string[];
  status: PropertyStatus;
  matches?: Match[];
  createdAt: string;
  updatedAt?: string;
  _count?: {
    matches: number;
  };
}

export interface Match {
  id: string;
  leadId: string;
  lead?: Lead;
  propertyId: string;
  property?: Property;
  score: number;
  status: MatchStatus;
  isExplicit?: boolean;
  breakdown?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface PostPropertyMapping {
  id: string;
  instagramMediaId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  lead?: Lead;
  agentId: string;
  agent?: User;
  channel: InteractionChannel;
  type: InteractionType;
  notes: string;
  timestamp: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  kpis: {
    totalActiveLeads: number;
    totalProperties: number;
    hotMatchesToday: number;
    dealsClosedThisMonth: number;
  };
  distributions: {
    leadsBySource: { source: string; count: number }[];
    leadsByStage: { stage: string; count: number }[];
  };
  recentLeads: Lead[];
  agingInventory: Property[];
}

export interface AuthSession {
  user: User;
  token?: string;
  accessToken?: string;
}
