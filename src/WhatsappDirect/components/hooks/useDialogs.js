// src/WhatsappDirect/hooks/useDialogs.js
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/whatsappApi";
import { formatPhoneId } from "../utils/dateUtils";

const LS_KEY = "wa_dialogs_cache";
const LAST_IDS_KEY = "wa_last_ids";

const sortDialogs = (list) =>
  list.slice().sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

const normalizeDialog = (raw) => {
  if (!raw || !raw.chatId) return null;

  const chatId = raw.chatId;
  const rawName = raw.name || "";
  const phone = formatPhoneId(chatId);
  const name =
    !rawName || rawName === chatId || rawName.includes("@")
      ? phone
      : rawName;

  return {
    chatId,
    name,
    phone,
    lastMessage: raw.lastMessage || "",
    lastTime: raw.lastTime || null,
    unread: raw.unread || 0,
  };
};

export default function useDialogs(activeChatId) {
  const [dialogs, setDialogs] = useState([]);
  const lastIdsRef = useRef(
    JSON.parse(localStorage.getItem(LAST_IDS_KEY) || "{}")
  );

  // начальная загрузка
  const refreshDialogs = useCallback(async () => {
    const r = await api.get("/dialogs");
    const data = (r.data || []).map(normalizeDialog).filter(Boolean);
    const sorted = sortDialogs(data);
    setDialogs(sorted);
    localStorage.setItem(LS_KEY, JSON.stringify(sorted));
  }, []);

  useEffect(() => {
    refreshDialogs();
  }, [refreshDialogs]);

  // ✅ ПРАВИЛЬНЫЙ POLLING БЕЗ НАКРУТКИ
  useEffect(() => {
    if (!dialogs.length) return;

    const id = setInterval(async () => {
      const updated = await Promise.all(
        dialogs.map(async (d) => {
          const r = await api.get(`/poll-dialog/${d.chatId}`);
          const last = r.data;
          if (!last) return d;

          const prevId = lastIdsRef.current[d.chatId];
          const isNew = prevId !== last.id;

          if (!isNew) return d;

          lastIdsRef.current[d.chatId] = last.id;
          localStorage.setItem(LAST_IDS_KEY, JSON.stringify(lastIdsRef.current));

          return {
            ...d,
            lastMessage: last.text,
            lastTime: last.timestamp,
            unread:
              last.from === "client" && d.chatId !== activeChatId
                ? d.unread + 1
                : d.unread,
          };
        })
      );

      setDialogs(sortDialogs(updated));
    }, 3000);

    return () => clearInterval(id);
  }, [dialogs, activeChatId]);

  // ✅ ReadChat (жёсткий сброс)
  const markAsRead = useCallback((chatId) => {
    setDialogs((prev) =>
      prev.map((d) =>
        d.chatId === chatId ? { ...d, unread: 0 } : d
      )
    );
    api.post("/read-chat", { chatId }).catch(() => {});
  }, []);

  return { dialogs, refreshDialogs, markAsRead };
}
