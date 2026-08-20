/**
 * PanelV2 — client for the industry-standard SMM panel API v2.
 * The Owlet, JustAnotherPanel (JAP) and most wholesale providers all speak
 * this exact protocol: POST form fields {key, action, ...} → JSON.
 *
 * This is what powers CLOUTMERCHANT's automatic fulfilment:
 *   - services():  pull the provider's live catalogue (names, rates, limits)
 *   - addOrder():  forward a customer order to the provider automatically
 *   - status():    poll delivery progress and update our orders table
 *   - balance():   check our float with the provider
 *
 * Keys are SERVER-ONLY env vars (spec §9.2 — never in client code).
 */

export type PanelService = {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string; // price per 1000, in the provider's currency
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
  dripfeed?: boolean;
};

export type PanelOrderStatus = {
  status: string; // Pending | In progress | Processing | Completed | Partial | Canceled | Refunded
  charge?: string;
  start_count?: string;
  remains?: string;
};

export class PanelV2 {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs = 30_000,
  ) {
    if (!apiKey) throw new Error("panel_api_key_missing");
  }

  private async call<T>(params: Record<string, string>): Promise<T> {
    const body = new URLSearchParams({ key: this.apiKey, ...params });
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) throw new Error(`panel_http_${res.status}`);
    if (data && typeof data === "object" && "error" in data) {
      throw new Error(`panel_error:${String(data.error)}`);
    }
    return data as T;
  }

  services() {
    return this.call<PanelService[]>({ action: "services" });
  }

  balance() {
    return this.call<{ balance: string; currency: string }>({ action: "balance" });
  }

  addOrder(serviceId: number, link: string, quantity: number) {
    return this.call<{ order: number }>({
      action: "add",
      service: String(serviceId),
      link,
      quantity: String(quantity),
    });
  }

  orderStatus(orderId: string | number) {
    return this.call<PanelOrderStatus>({ action: "status", order: String(orderId) });
  }

  refill(orderId: string | number) {
    return this.call<{ refill: number }>({ action: "refill", order: String(orderId) });
  }

  cancel(orderId: string | number) {
    return this.call<{ cancel: number }>({ action: "cancel", order: String(orderId) });
  }
}

/** The Owlet — primary provider (Nigerian, NGN pricing, SABI real-human engagement). */
export function owlet(): PanelV2 {
  return new PanelV2("https://theowlet.com/api/v2", process.env.OWLET_API_KEY ?? "");
}

/** JustAnotherPanel — secondary provider (cheap wholesale, international). */
export function jap(): PanelV2 {
  return new PanelV2("https://justanotherpanel.com/api/v2", process.env.JAP_API_KEY ?? "");
}
