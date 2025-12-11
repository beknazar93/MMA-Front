// import React from "react";
// import SidebarItem from "./SidebarItem";

// const SidebarList = ({ dialogs, activeChatId, onSelect }) => {
//   const safeDialogs = Array.isArray(dialogs)
//     ? dialogs.filter((d) => d && d.chatId)
//     : [];

//   return (
//     <div className="whatsapp-sidebar__list">
//       {safeDialogs.map((dialog) => (
//         <SidebarItem
//           key={dialog.chatId}
//           dialog={dialog}
//           isActive={dialog.chatId === activeChatId}
//           onSelect={onSelect}
//         />
//       ))}
//     </div>
//   );
// };

// export default SidebarList;



import React from "react";
import SidebarItem from "./SidebarItem";

const SidebarList = ({
  dialogs,
  activeChatId,
  onSelect,
  onContextMenu,
}) => {
  const safeDialogs = Array.isArray(dialogs)
    ? dialogs.filter((d) => d && d.chatId)
    : [];

  return (
    <div className="whatsapp-sidebar__list">
      {safeDialogs.map((dialog) => (
        <SidebarItem
          key={dialog.chatId}
          dialog={dialog}
          isActive={dialog.chatId === activeChatId}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
};

export default SidebarList;
