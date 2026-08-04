export type UserRole = "client" | "service" | "admin";

export interface JwtPayload {
	user_id: number;
	user_role: UserRole;
	client_id: number;
	iat?: number;
	exp?: number;
}

export interface Client {
	id: number;
	name: string | null;
	email: string | null;
	instagram_id: string | null;
	instagram_username: string | null;
	instagram_name: string | null;
	instagram_photo: string | null;
	// whatsapp_number: string | null;
	status: string | null;
	about: string | null;
	created_at: string | null;
	update_at: string | null;
}

export interface ClientPhone {
	id: number;
	client_id: number;
	phone_number: string;
	label: string | null;
	role: "ai" | "human";
	is_primary: number | boolean;
	active: number | boolean;
	created_at: string | null;
	updated_at: string | null;
}

export interface Lead {
	id: number;
	client_id: number;
	instagram_scoped_userid: string | null;
	instagram_username: string | null;
	name: string | null;
	whatsapp_number: string | null;
	email: string | null;
	source: string | null;
	status: string | null;
	human_handover: number;
	notes: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface ClientLeadView {
	client_id: number;
	client_name: string | null;
	client_instagram_id: string | null;
	client_instagram_username: string | null;
	client_whatsapp_number: string | null;
	lead_id: number;
	lead_name: string | null;
	lead_instagram_scoped_userid: string | null;
	lead_instagram_username: string | null;
	lead_whatsapp_number: string | null;
	lead_email: string | null;
	lead_status: string | null;
	lead_source: string | null;
	lead_human_handover: string | number | null;
	lead_updated_at: string | null;
	lead_created_at: string | null;
}

export type ProductType = "produto" | "servico";

export interface Product {
	id: number;
	client_id: number;
	name: string;
	description: string | null;
	price: number | string | null;
	type: ProductType | string | null;
	requires_scheduling: number | null;
	duration_minutes: number | null;
	active: number | boolean;
	keywords: string | null;
	created_at: string | null;
	updated_at: string | null;
	client_name?: string | null;
	//whatsapp_number?: string | null;
}


export interface Workflow {
	id: string
	name: string | null
	description: string | null
	active: string | null
	isArchived: string | null
	tags: TagWorkflow | string | null
	status: string | null
	updatedAt: string | null
	createdAt: string | null
}

export interface TagWorkflow {
	id: string
	name: string | null
	updatedAt: string | null
	createdAt: string | null
}

export interface ApiResponse<Type> {
  success: boolean;
  message: string;
  data: Type;
  error: string | null;
}


//Google Calendar Types
export interface GoogleCalendarDateTime {
	dateTime?: string; // ISO 8601 — presente em eventos com horário definido
	date?: string;      // yyyy-mm-dd — presente em eventos de dia inteiro
	timeZone?: string;
}

export interface GoogleCalendarAttendee {
	email: string;
	displayName?: string;
	responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
	organizer?: boolean;
	self?: boolean;
}

export interface GoogleCalendarEvent {
	id: string;
	status?: "confirmed" | "tentative" | "cancelled";
	htmlLink?: string;
	summary: string;
	description?: string | null;
	location?: string | null;
	start: GoogleCalendarDateTime;
	end: GoogleCalendarDateTime;
	attendees?: GoogleCalendarAttendee[];
	organizer?: GoogleCalendarOrganizer;
	created?: string;
	updated?: string;
}

// Payload enviado pro backend ao criar/editar (start/end como string, não objeto)
export interface GoogleCalendarEventInput {
	summary: string;
	description?: string;
	start: string; // ISO 8601
	end: string;   // ISO 8601
	attendeeEmail?: string;
	calendarId?: string;
}

export interface GoogleCalendar {
	id: string;
	summary: string;
	primary: boolean;
	accessRole: "owner" | "writer" | "reader" | "freeBusyReader";
	backgroundColor?: string;
}

export interface GoogleCalendarOrganizer {
	email?: string;
	displayName?: string;
	self?: boolean;
}

export interface CalendarStatus {
	connected: boolean;
	status: "not_connected" | "connected" | "error";
	email: string | null;
	error_message?: string;
	default_calendar_id?: string;
}