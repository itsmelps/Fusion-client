/* eslint-disable no-unused-vars, import/no-unresolved */
import React, { useState, useRef } from "react";
import { Tabs, Button, Flex, Text } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import CustomBreadcrumbs from "../../../components/Breadcrumbs";
import classes from "../../Dashboard/Dashboard.module.css";
import AwardsAndScholarshipCatalog from "../components/tables/AwardsAndScholarshipCatalogC";
import SpacsMembers from "../components/tables/spacsMembersC";
import PreviousWinners from "../components/tables/previousWinnerC";
import ConvenerApplications from "../convenor/components/ConvenerApplications";
import InviteApplications from "../components/forms/InviteApplications";

function ConvenorPage() {
  const [activeTab, setActiveTab] = useState("catalog");
  const tabsListRef = useRef(null);

  const tabItems = [
    { key: "catalog", label: "Awards & Scholarship Catalogue" },
    { key: "applications", label: "Manage Applications" },
    { key: "invite", label: "Invite Applications" },
    { key: "members", label: "SPACS Members" },
    { key: "winners", label: "Previous Winners" },
  ];

  const breadcrumbItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Scholarships", path: "/scholarships" },
    { title: "Convenor Portal", path: "/scholarships/convenor" },
  ];

  const handleTabChange = (direction) => {
    const currentIndex = tabItems.findIndex((item) => item.key === activeTab);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % tabItems.length;
    } else {
      newIndex = (currentIndex - 1 + tabItems.length) % tabItems.length;
    }
    setActiveTab(tabItems[newIndex].key);
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({
        left: direction === "next" ? 50 : -50,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <Flex
        justify="flex-start"
        align="center"
        gap={{ base: "0.75rem", md: "1.25rem" }}
        mt={{ base: "1.5rem", md: "2rem" }}
        ml={{ md: "lg" }}
        style={{ fontSize: "1.5rem" }}
      >
        <Button
          variant="subtle"
          size="sm"
          onClick={() => handleTabChange("prev")}
          style={{ padding: "0.25rem" }}
        >
          <CaretCircleLeft size={20} />
        </Button>
        <Text fw={600}>Scholarship Management</Text>
        <Button
          variant="subtle"
          size="sm"
          onClick={() => handleTabChange("next")}
          style={{ padding: "0.25rem" }}
        >
          <CaretCircleRight size={20} />
        </Button>
      </Flex>

      <div className={classes.tabsContainer}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List ref={tabsListRef} className={classes.tabsList}>
            {tabItems.map((tab) => (
              <Tabs.Tab key={tab.key} value={tab.key} className={classes.tab}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value="catalog" className={classes.tabPanel}>
            <AwardsAndScholarshipCatalog />
          </Tabs.Panel>

          <Tabs.Panel value="applications" className={classes.tabPanel}>
            <ConvenerApplications />
          </Tabs.Panel>

          <Tabs.Panel value="invite" className={classes.tabPanel}>
            <InviteApplications />
          </Tabs.Panel>

          <Tabs.Panel value="members" className={classes.tabPanel}>
            <SpacsMembers />
          </Tabs.Panel>

          <Tabs.Panel value="winners" className={classes.tabPanel}>
            <PreviousWinners />
          </Tabs.Panel>
        </Tabs>
      </div>
    </>
  );
}

export default ConvenorPage;
