// Camada fina de acesso à API. Centraliza o fetch e o tratamento de erro,
// pra cada tela não repetir a mesma lógica.

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao comunicar com o servidor.");
  }

  // DELETE pode retornar { ok: true }; o cast genérico cobre todos os casos.
  return res.json().catch(() => ({})) as Promise<T>;
}

export const api = {
  list: <T>(entity: string) => request<T[]>(`/api/${entity}`),
  get: <T>(entity: string, id: number) => request<T>(`/api/${entity}/${id}`),
  create: <T>(entity: string, body: unknown) =>
    request<T>(`/api/${entity}`, { method: "POST", body: JSON.stringify(body) }),
  update: <T>(entity: string, id: number, body: unknown) =>
    request<T>(`/api/${entity}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (entity: string, id: number) =>
    request<{ ok: boolean }>(`/api/${entity}/${id}`, { method: "DELETE" }),
};
