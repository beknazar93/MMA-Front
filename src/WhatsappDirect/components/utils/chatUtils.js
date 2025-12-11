// убираем хвосты WhatsApp'а
export const stripWhatsAppSuffix = (chatId = "") =>
  chatId
    .replace(/@c\.us$/i, "")
    .replace(/@s\.whatsapp\.net$/i, "")
    .replace(/@g\.us$/i, "");

// простое форматирование номера
export const formatPhone = (chatIdOrPhone = "") => {
  const raw = stripWhatsAppSuffix(chatIdOrPhone).replace(/[^\d+]/g, "");
  if (!raw) return "";

  let digits = raw.startsWith("+") ? raw.slice(1) : raw;

  // Кыргызстан: 996 XXX XXX XXX
  if (digits.length === 12 && digits.startsWith("996")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      9
    )} ${digits.slice(9)}`;
  }

  // типа +7 XXX XXX XX XX
  if (digits.length === 11) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(
      4,
      7
    )} ${digits.slice(7)}`;
  }

  return raw.startsWith("+") ? raw : `+${digits}`;
};

const isTechnicalName = (name, chatId) => {
  if (!name) return false;
  if (name === chatId) return true;
  return /@(c\.us|s\.whatsapp\.net|g\.us)$/i.test(name);
};

// что показывать в заголовке/списке
export const displayNameForDialog = (dialog) => {
  if (!dialog) return "";
  const { name, chatId } = dialog;

  // если имя нормальное (не техническое) — показываем его
  if (name && !isTechnicalName(name, chatId)) {
    return name;
  }

  // иначе форматируем номер
  const base = chatId || name || "";
  return formatPhone(base);
};
