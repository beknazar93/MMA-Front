import React, { useState } from "react";
import ClientIncome from "./ClientIncome";
import TrainerAnalytics from "./Trainer/TrainerAnalytics";
import Sport from "./Sport";
import StudentsComparison from "./StudentsComparison";

function Analitic() {
  const [activeTab, setActiveTab] = useState("ClientIncome"); 

  const tabs = [
    { name: "ClientIncome", label: "Общий доход", component: <ClientIncome /> },
    { name: "Sport", label: "Доход по спорту", component: <Sport /> },
    {
      name: "StudentsComparison",
      label: "Сравнение учеников",
      component: <StudentsComparison />,
    },
    {
      name: "TrainerAnalytics",
      label: "Доход тренеров",
      component: <TrainerAnalytics />,
    },
  ];

  const renderContent = () => {
    const activeTabConfig = tabs.find((tab) => tab.name === activeTab);
    return activeTabConfig ? activeTabConfig.component : null;
  };

  return (
    <div className="analitic">
      <div className="analitic__tabs">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`analitic__tab ${
              activeTab === tab.name ? "analitic__tab--active" : ""
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="analitic__content">{renderContent()}</div>
    </div>
  );
}

export default Analitic;
