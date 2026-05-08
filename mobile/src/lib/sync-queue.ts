import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { supabase } from "./supabase";

const QUEUE_KEY = "loanpal-sync-queue";

interface QueuedOperation {
  id: string;
  table: string;
  type: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  matchColumn?: string;
  matchValue?: string;
  createdAt: string;
}

export async function enqueue(op: Omit<QueuedOperation, "id" | "createdAt">) {
  const queue = await getQueue();
  queue.push({
    ...op,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedOperation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected) return { processed: 0, failed: 0 };

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { processed: 0, failed: 0 };

  const queue = await getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    try {
      if (op.type === "insert") {
        await supabase.from(op.table).insert(op.data);
      } else if (op.type === "update" && op.matchColumn && op.matchValue) {
        await supabase.from(op.table).update(op.data).eq(op.matchColumn, op.matchValue);
      } else if (op.type === "delete" && op.matchColumn && op.matchValue) {
        await supabase.from(op.table).delete().eq(op.matchColumn, op.matchValue);
      }
      processed++;
    } catch {
      remaining.push(op);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { processed, failed: remaining.length };
}

export function startSyncListener(onSync?: (result: { processed: number; failed: number }) => void) {
  const interval = setInterval(async () => {
    const state = await Network.getNetworkStateAsync();
    if (state.isConnected) {
      const result = await processQueue();
      if (result.processed > 0 && onSync) {
        onSync(result);
      }
    }
  }, 30000);

  return () => clearInterval(interval);
}
