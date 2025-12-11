// import React from "react";
// import unknownAvatar from "../img/unknown.png";
// import { formatTime } from "../utils/dateUtils";
// import { displayNameForDialog } from "../utils/chatUtils";

// const SidebarItem = ({ dialog, isActive, onSelect }) => {
//   if (!dialog || typeof dialog !== "object") {
//     return null;
//   }

//   const unreadRaw = dialog?.unread;
//   const unread =
//     typeof unreadRaw === "number" && unreadRaw > 0 ? unreadRaw : 0;
//   const hasUnread = unread > 0;

//   const title = displayNameForDialog(dialog);
//   const lastMessage = dialog.lastMessage || "";
//   const time = dialog.lastTime ? formatTime(dialog.lastTime) : "";

//   const handleClick = () => {
//     if (onSelect) {
//       onSelect(dialog);
//     }
//   };

//   return (
//     <button
//       type="button"
//       className={
//         "whatsapp-sidebar__item" +
//         (isActive ? " whatsapp-sidebar__item--active" : "")
//       }
//       onClick={handleClick}
//     >
//       <img
//         src={unknownAvatar}
//         alt=""
//         className="whatsapp-sidebar__avatar"
//       />

//       <div className="whatsapp-sidebar__item-main">
//         <div className="whatsapp-sidebar__item-header">
//           <div className="whatsapp-sidebar__name">{title}</div>
//           <div
//             className={
//               "whatsapp-sidebar__time" +
//               (hasUnread ? " whatsapp-sidebar__time--unread" : "")
//             }
//           >
//             {time}
//           </div>
//         </div>

//         <div className="whatsapp-sidebar__item-bottom">
//           <div className="whatsapp-sidebar__preview">
//             {lastMessage || "\u00a0"}
//           </div>
//           {hasUnread && (
//             <div className="whatsapp-sidebar__badge">
//               {unread > 99 ? "99+" : unread}
//             </div>
//           )}
//         </div>
//       </div>
//     </button>
//   );
// };

// export default SidebarItem;



import React from "react";
import unknownAvatar from "../img/unknown.png";
import { formatTime } from "../utils/dateUtils";
import { displayNameForDialog } from "../utils/chatUtils";

const SidebarItem = ({ dialog, isActive, onSelect, onContextMenu }) => {
  if (!dialog || typeof dialog !== "object") {
    return null;
  }

  const unreadRaw = dialog?.unread;
  const unread =
    typeof unreadRaw === "number" && unreadRaw > 0 ? unreadRaw : 0;
  const hasUnread = unread > 0;

  const title = displayNameForDialog(dialog);
  const lastMessage = dialog.lastMessage || "";
  const time = dialog.lastTime ? formatTime(dialog.lastTime) : "";

  const handleClick = () => {
    if (onSelect) {
      onSelect(dialog);
    }
  };

  const handleContextMenu = (event) => {
    if (onContextMenu) {
      onContextMenu(event, dialog);
    }
  };

  return (
    <button
      type="button"
      className={
        "whatsapp-sidebar__item" +
        (isActive ? " whatsapp-sidebar__item--active" : "")
      }
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <img
        src={unknownAvatar}
        alt=""
        className="whatsapp-sidebar__avatar"
      />

      <div className="whatsapp-sidebar__item-main">
        <div className="whatsapp-sidebar__item-header">
          <div className="whatsapp-sidebar__name">{title}</div>
          <div
            className={
              "whatsapp-sidebar__time" +
              (hasUnread ? " whatsapp-sidebar__time--unread" : "")
            }
          >
            {time}
          </div>
        </div>

        <div className="whatsapp-sidebar__item-bottom">
          <div className="whatsapp-sidebar__preview">
            {lastMessage || "\u00a0"}
          </div>
          {hasUnread && (
            <div className="whatsapp-sidebar__badge">
              {unread > 99 ? "99+" : unread}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default SidebarItem;
