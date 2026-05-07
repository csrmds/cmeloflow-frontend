import { api } from "@/lib/api";
import type { Client, Product } from "@/lib/types";

// TODO: O endpoint GET /products no backend, para o role "admin", faz JOIN com
// clients exigindo `client_whatsapp` no req.body — não retorna todos os produtos
// de todos os clientes em uma única chamada. Enquanto o backend não expõe um
// endpoint adequado (ex.: GET /products/all), agregamos resultados por cliente.

export interface AdminProductRow extends Product {
  client_name?: string | null;
}

export async function listAllProducts(): Promise<AdminProductRow[]> {
  try {
    const clientsRes = await api.get<Client[]>("/clients");
    const clients = clientsRes.data;

    const all: AdminProductRow[] = [];
    for (const client of clients) {
      if (!client.whatsapp_number) continue;
      try {
        const res = await api.get<Product[]>("/products", {
          data: { client_whatsapp: client.whatsapp_number },
        });
        for (const p of res.data) {
          all.push({ ...p, client_name: client.name });
        }
      } catch {
        // silencioso por cliente — segue tentando os demais
      }
    }
    return all;
  } catch {
    // Fallback mock para não bloquear UI em ambientes sem backend
    return [];
  }
}
