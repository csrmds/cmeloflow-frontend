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
  whatsapp_number: string | null;
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
}

export interface Lead {
  id: number;
  client_id: number;
  instagram_scoped_userid: string | null;
  instagram_username: string | null;
  name: string | null;
  whatsapp_number: string | null;
  first_message: string | null;
  last_message: string | null;
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
  active: number | boolean;
  keywords: string | null;
  created_at: string | null;
  updated_at: string | null;
  client_name?: string | null;
  whatsapp_number?: string | null;
}
