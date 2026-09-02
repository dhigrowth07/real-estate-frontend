export type UserRole = 'ADMIN' | 'AGENT';

export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'DIRECT_CALL' | 'PORTAL' | 'WALK_IN' | 'OTHER';

export type LeadPurpose = 'BUY' | 'RENT' | 'INVESTMENT';

export type LeadUrgency = 'IMMEDIATE' | 'WITHIN_1_MONTH' | 'WITHIN_3_MONTHS' | 'EXPLORING';

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'REQUIREMENT_GATHERED'
  | 'SITE_VISIT_SCHEDULED'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'INDEPENDENT_HOUSE';

export type PossessionStatus =
  'READY_TO_MOVE' | 'UNDER_CONSTRUCTION' | 'WITHIN_3_MONTHS' | 'WITHIN_6_MONTHS';

export type PropertyStatus = 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD' | 'INACTIVE';

export type MatchStatus = 'NEW' | 'NOTIFIED' | 'VIEWED' | 'DISMISSED';

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
  createdAt: string;
  updatedAt?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: PropertyType;
  bhk?: string;
  sqft?: number;
  possessionStatus: PossessionStatus;
  amenities: string[];
  ownerContact: string;
  images: string[];
  status: PropertyStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Match {
  id: string;
  leadId: string;
  lead?: Lead;
  propertyId: string;
  property?: Property;
  score: number; // 0 - 100
  status: MatchStatus;
  breakdown?: {
    budgetScore: number;
    locationScore: number;
    propertyTypeScore: number;
    bhkScore: number;
    possessionScore: number;
  };
  createdAt: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  channel: InteractionChannel;
  type: InteractionType;
  notes: string;
  timestamp: string;
  agentId: string;
  agent?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface AuthSession {
  user: User;
  accessToken: string;
}
