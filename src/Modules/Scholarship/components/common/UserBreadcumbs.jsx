import { useState, useRef } from "react";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { Tabs, Button, Flex, Text } from "@mantine/core";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import classes from "../../../Dashboard/Dashboard.module.css";
import BrowseApplicationPage from "../../pages/BrowseApplicationPage";
import ScholarshipStatusPage from "../../pages/ScholarshipStatusPage";
import ScholarshipCatalogPage from "../../pages/ScholarshipCatalogPage";

function UserBreadcumbs() {
  const [activeTab, setActiveTab] = useState("catalog");
  const tabsListRef = useRef(null);

  const tabItems = [
    { key: "catalog", label: "Catalog" },
    { key: "browseApplication", label: "Browse Application" },
    { key: "scholarshipStatus", label: "Scholarship Status" },
  ];

  const handleTabChange = (direction) => {
    const currentIndex = tabItems.findIndex((item) => item.key === activeTab);
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % tabItems.length;
    } else {
      newIndex = (currentIndex - 1 + tabItems.length) % tabItems.length;
    }

    const newKey = tabItems[newIndex].key;
    setActiveTab(newKey);

    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
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
          onClick={() => handleTabChange("prev")}
          variant="default"
          p={0}
          style={{ border: "none" }}
        >
          <CaretCircleLeft
            className={classes.fusionCaretCircleIcon}
            weight="light"
            size={32}
          />
        </Button>

        <div className={classes.fusionTabsContainer} ref={tabsListRef}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
              {tabItems.map((item) => (
                <Tabs.Tab
                  value={item.key}
                  key={item.key}
                  className={
                    activeTab === item.key ? classes.fusionActiveRecentTab : ""
                  }
                  style={{
                    padding: "1rem 1.5rem",
                    color: activeTab === item.key ? "#17ABFF" : "black",
                    transition: "#17ABFF",
                  }}
                >
                  <Text size="lg" fw={activeTab === item.key ? 700 : 500}>
                    {item.label}
                  </Text>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </div>

        <Button
          onClick={() => handleTabChange("next")}
          variant="default"
          p={0}
          style={{ border: "none" }}
        >
          <CaretCircleRight
            className={classes.fusionCaretCircleIcon}
            weight="light"
            size={32}
          />
        </Button>
      </Flex>

      {activeTab === "catalog" && <ScholarshipCatalogPage />}
      {activeTab === "browseApplication" && <BrowseApplicationPage />}
      {activeTab === "scholarshipStatus" && <ScholarshipStatusPage />}
    </>
  );
}

export default UserBreadcumbs;
