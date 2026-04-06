import React, { useState } from "react";
import { Tabs, Text } from "@mantine/core";
import AwardsAndScholarshipCatalogConvenor from "../components/tables/AwardsAndScholarshipCatalogConvenor";
import SpacsMembersConvenor from "../components/tables/SpacsMembersConvenor";
import PreviousWinnersConvenor from "../components/tables/PreviousWinnersConvenor";
import styles from "../styles/Convenor.module.css";

function ConvenorPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabItems = [
    {
      label: "Awards and Scholarship Catalogue",
      component: <AwardsAndScholarshipCatalogConvenor />,
    },
    { label: "SPACS Members and Details", component: <SpacsMembersConvenor /> },
    { label: "Previous Winners", component: <PreviousWinnersConvenor /> },
  ];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.wrapper}>
        <div className={styles.tabsContainer}>
          <Tabs value={activeTab.toString()}>
            <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
              {tabItems.map((tab, index) => (
                <Tabs.Tab
                  key={tab.label}
                  value={index.toString()}
                  onClick={() => setActiveTab(index)}
                  className={
                    activeTab === index ? styles.activeTab : styles.inactiveTab
                  }
                >
                  <Text size="lg">{tab.label}</Text>
                  {activeTab === index && <div className={styles.underline} />}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </div>

        <div>{tabItems[activeTab].component}</div>
      </div>
    </div>
  );
}

export default ConvenorPage;
