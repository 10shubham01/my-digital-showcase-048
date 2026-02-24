import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getFingerprint = (): string => {
  const nav = navigator;
  const raw = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export const useVisitorCount = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const track = async () => {
      const fingerprint = getFingerprint();

      // Try insert (will fail silently if duplicate)
      await supabase
        .from("visitors")
        .upsert({ fingerprint }, { onConflict: "fingerprint", ignoreDuplicates: true });

      // Get count
      const { count: total } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true });

      setCount(total ?? 0);
    };

    track();
  }, []);

  return count;
};
