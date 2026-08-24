export type UserRole = "customer" | "agent" | "admin";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "critical" | "high" | "medium" | "low";
export type CommentVisibility = "internal" | "public";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_id: string;
  assigned_agent_id: string | null;
  created_at: string;
  deadline_at: string;
  sla_breached: boolean;
  customer?: User;
  assigned_agent?: User | null;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  ticket_id: string;
  author_id: string;
  visibility: CommentVisibility;
  content: string;
  created_at: string;
  author?: User;
}

export interface Attachment {
  id: string;
  ticket_id: string;
  uploaded_by: string;
  filename: string;
  url: string;
  size_bytes: number;
  created_at: string;
  uploader?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  ticket_id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  ticket_id: string;
  actor_id: string;
  action: string;
  timestamp: string;
  details?: string | null;
  actor?: User;
}

export interface ApiError {
  detail: string;
}
