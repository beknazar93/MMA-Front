import React from "react";

const SidebarSearch = ({ value, onChange }) => (
  <div className="whatsapp-sidebar__search">
    <input
      placeholder="Поиск или новый чат"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

export default SidebarSearch;
