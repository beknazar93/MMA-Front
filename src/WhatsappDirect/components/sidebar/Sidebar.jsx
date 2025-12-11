// import React, { useMemo, useState } from "react";
// import useDialogs from "../hooks/useDialogs";
// import SidebarHeader from "./SidebarHeader";
// import SidebarSearch from "./SidebarSearch";
// import SidebarList from "./SidebarList";
// import { api } from "../../api/whatsappApi";

// const Sidebar = ({ activeChatId, onSelect }) => {
//   // ПЕРЕДАЁМ activeChatId в хук
//   const { dialogs, refreshDialogs, markAsRead } = useDialogs(activeChatId);
//   const [search, setSearch] = useState("");

//   const filteredDialogs = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return dialogs;

//     return dialogs.filter((dialog) => {
//       const name = (dialog.name || "").toLowerCase();
//       const phone = (dialog.phone || "").toLowerCase();
//       const id = (dialog.chatId || "").toLowerCase();
//       return (
//         name.includes(query) || phone.includes(query) || id.includes(query)
//       );
//     });
//   }, [dialogs, search]);

//   const handleSelect = (dialog) => {
//     if (!dialog || !dialog.chatId) return;

//     // локально снимаем badge
//     if (markAsRead) {
//       markAsRead(dialog.chatId);
//     }

//     // дергаем бэкенд -> ReadChat
//     api.post("/read-chat", { chatId: dialog.chatId }).catch(() => {});

//     if (onSelect) {
//       onSelect(dialog);
//     }
//   };

//   return (
//     <div className="whatsapp-sidebar">
//       <SidebarHeader onRefresh={refreshDialogs} />
//       <SidebarSearch value={search} onChange={setSearch} />
//       <SidebarList
//         dialogs={filteredDialogs}
//         activeChatId={activeChatId}
//         onSelect={handleSelect}
//       />
//     </div>
//   );
// };

// export default Sidebar;



// src/WhatsappDirect/sidebar/Sidebar.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import useDialogs from "../hooks/useDialogs";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import SidebarList from "./SidebarList";
import { api } from "../../api/whatsappApi";
import axios from "axios";

const LEADS_API = axios.create({
  baseURL: "https://rasu0101.pythonanywhere.com",
});

// нормализация номера для ключа (как в другом проекте)
const normalizePhoneKey = (raw) => {
  const d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";

  if (d.length === 10 && d.startsWith("0")) {
    return "996" + d.slice(1); // 0XXXXXXXXX -> 996XXXXXXXXX
  }
  if (d.length === 9) {
    return "996" + d; // XXXXXXXXX -> 996XXXXXXXXX
  }
  if (d.length === 12 && d.startsWith("996")) {
    return d; // уже нормальный
  }
  return d;
};

const Sidebar = ({ activeChatId, onSelect }) => {
  const { dialogs, refreshDialogs, markAsRead } = useDialogs(activeChatId);
  const [search, setSearch] = useState("");

  // контекст-меню
  const [menu, setMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    dialog: null,
  });
  const menuRef = useRef(null);

  // уже существующие заявки по телефонам
  const requestPhonesRef = useRef(new Set());

  // тост
  const [notice, setNotice] = useState(null); // {type, text}

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(id);
  }, [notice]);

  // грузим телефоны, по которым уже есть заявки
  useEffect(() => {
    const loadPhones = async () => {
      try {
        const res = await LEADS_API.get("/api/requests/");
        const arr = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];
        const set = new Set();
        arr.forEach((r) => {
          const key = normalizePhoneKey(r.phone);
          if (key) set.add(key);
        });
        requestPhonesRef.current = set;
      } catch (e) {
        // тихо, просто не будет защиты от дублей
      }
    };
    loadPhones();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menu.open) return;
      if (!menuRef.current || !menuRef.current.contains(e.target)) {
        setMenu({ open: false, x: 0, y: 0, dialog: null });
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenu({ open: false, x: 0, y: 0, dialog: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menu.open]);

  const filteredDialogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dialogs;

    return dialogs.filter((dialog) => {
      const name = (dialog.name || "").toLowerCase();
      const phone = (dialog.phone || "").toLowerCase();
      const id = (dialog.chatId || "").toLowerCase();
      return (
        name.includes(query) || phone.includes(query) || id.includes(query)
      );
    });
  }, [dialogs, search]);

  const handleSelect = (dialog) => {
    if (!dialog || !dialog.chatId) return;

    if (markAsRead) markAsRead(dialog.chatId);
    api.post("/read-chat", { chatId: dialog.chatId }).catch(() => {});

    if (onSelect) onSelect(dialog);
  };

  const handleContextMenu = (event, dialog) => {
    event.preventDefault();
    if (!dialog) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mw = 200;
    const mh = 60;
    const pad = 8;

    const x = Math.max(pad, Math.min(event.clientX, vw - mw - pad));
    const y = Math.max(pad, Math.min(event.clientY, vh - mh - pad));

    setMenu({ open: true, x, y, dialog });
  };

  const handleSendToRequests = async () => {
    const dialog = menu.dialog;
    if (!dialog) return;

    const raw = dialog.phone || dialog.chatId || dialog.name || "";
    const digits = String(raw).replace(/[^\d]/g, "");
    const key = normalizePhoneKey(digits);

    if (!key) {
      setNotice({ type: "error", text: "Не удалось определить номер" });
      setMenu({ open: false, x: 0, y: 0, dialog: null });
      return;
    }

    // 🔒 защита от дублей
    if (requestPhonesRef.current.has(key)) {
      setNotice({ type: "error", text: "Заявка уже существует" });
      setMenu({ open: false, x: 0, y: 0, dialog: null });
      return;
    }

    const phoneForBackend = "+" + key;
    const payload = {
      name: "whatsapp",
      phone: phoneForBackend,
      channel: "whatsapp",
      status: "new",
    };

    try {
      await LEADS_API.post("/api/requests/", payload);
      requestPhonesRef.current.add(key); // заносим в set
      setNotice({ type: "success", text: "Заявка создана" });
    } catch (_e) {
      setNotice({
        type: "error",
        text: "Ошибка при создании заявки",
      });
    }

    setMenu({ open: false, x: 0, y: 0, dialog: null });
  };

  return (
    <div className="whatsapp-sidebar">
      <SidebarHeader onRefresh={refreshDialogs} />
      <SidebarSearch value={search} onChange={setSearch} />

      {notice && (
        <div
          className={
            "whatsapp-sidebar__notice " +
            (notice.type === "success"
              ? "whatsapp-sidebar__notice--success"
              : "whatsapp-sidebar__notice--error")
          }
        >
          {notice.text}
        </div>
      )}

      <SidebarList
        dialogs={filteredDialogs}
        activeChatId={activeChatId}
        onSelect={handleSelect}
        onContextMenu={handleContextMenu}
      />

      {menu.open && (
        <div
          ref={menuRef}
          className="whatsapp-sidebar__menu"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            type="button"
            className="whatsapp-sidebar__menu-item"
            onClick={handleSendToRequests}
          >
            Отправить в заявки
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
