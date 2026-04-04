import { SupabaseClient } from "@supabase/supabase-js";
import { getRHOverview, getRHHeatmap, getActionQueue } from "../repositories/rh";
import type { Database } from "../generated.types";

export class RHService {
  /**
   * Agrega dados para o dashboard principal de RH,
   * filtrando automaticamente pelo tenant_id do cliente injetado.
   */
  static async getDashboardData(client: SupabaseClient<Database>, tenantId: string) {
    const [overview, heatmap, actionQueue] = await Promise.all([
      getRHOverview(client, tenantId),
      getRHHeatmap(client, tenantId),
      getActionQueue(client, tenantId)
    ]);

    return {
      overview,
      heatmap,
      actionQueue
    };
  }
}
