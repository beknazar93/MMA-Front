const pad2 = (n) => (n < 10 ? "0" + n : "" + n);

// формат времени HH:MM
export const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// подпись "СЕГОДНЯ / ВЧЕРА / 28.11.2025" для дат в чате
export const formatDayLabel = (ts) => {
  if (!ts) return "";
  let d = new Date(ts);
  if (Number.isNaN(d.getTime())) d = new Date();

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "СЕГОДНЯ";
  if (sameDay(d, yesterday)) return "ВЧЕРА";

  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
};

// группируем сообщения по дню
export const groupByDay = (messages) => {
  const groups = [];
  let current = null;

  for (const m of messages) {
    const ts = m.timestamp || Date.now();
    const d = new Date(ts);
    const key = d.toDateString();

    if (!current || current.key !== key) {
      current = { key, ts, items: [] };
      groups.push(current);
    }
    current.items.push(m);
  }

  return groups;
};

// +996 701 111 544 из chatId
export const formatPhoneId = (chatId) => {
  if (!chatId) return "";
  if (!chatId.endsWith("@c.us") && !chatId.endsWith("@s.whatsapp.net")) {
    return chatId;
  }
  const raw = chatId.split("@")[0];
  if (!raw || raw === "0") return chatId;

  const s = raw.replace(/[^\d]/g, "");
  if (!s) return chatId;

  if (s.length <= 3) return "+" + s;
  if (s.length <= 6) return "+" + s.slice(0, 3) + " " + s.slice(3);
  if (s.length <= 9) {
    return "+" + s.slice(0, 3) + " " + s.slice(3, 6) + " " + s.slice(6);
  }

  return (
    "+" +
    s.slice(0, 3) +
    " " +
    s.slice(3, 6) +
    " " +
    s.slice(6, 9) +
    " " +
    s.slice(9)
  );
};
