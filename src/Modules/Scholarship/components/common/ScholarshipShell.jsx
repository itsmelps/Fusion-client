import { useState, useRef } from "react";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { Tabs, Button, Flex, Text } from "@mantine/core";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import classes from "../../../Dashboard/Dashboard.module.css";

// Table components
import ScholarshipTypesTable from "../tables/ScholarshipTypesTable";
import ApplicationsTable from "../tables/ApplicationsTable";
import AwardsTable from "../tables/AwardsTable";

// Form components
import NewApplicationForm from "../forms/NewApplicationForm";
import EditScholarshipForm from "../forms/EditScholarshipForm";

function ScholarshipShell() {
  const [activeTab, setActiveTab] = useState("types");
  const [viewingForm, setViewingForm] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const tabsListRef = useRef(null);

  const tabItems = [
    { key: "types", label: "Scholarship Types" },
    { key: "applications", label: "Applications" },
    { key: "awards", label: "Awards" },
    { key: "merit_lists", label: "Merit Lists" },
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
    setViewingForm(false);
    setEditingScholarship(null);

    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({
        left: direction === "next" ? 50 : -50,
        behavior: "smooth",
      });
    }
  };

  const renderActiveTab = () => {
    // Student apply form
    if (viewingForm) {
      return <NewApplicationForm onCancel={() => setViewingForm(false)} />;
    }

    // Convenor edit scholarship form
    if (editingScholarship) {
      return (
        <EditScholarshipForm
          scholarship={editingScholarship}
          onCancel={() => setEditingScholarship(null)}
          onSaved={() => {
            setEditingScholarship(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case "types":
        return (
          <ScholarshipTypesTable
            onApply={() => setViewingForm(true)}
            onEdit={(award) => setEditingScholarship(award)}
          />
        );
      case "applications":
        return <ApplicationsTable onApply={() => setViewingForm(true)} />;
      case "awards":
        return <AwardsTable />;
      case "merit_lists":
        return (
          <Text c="dimmed" ta="center" py="xl">
            Merit lists will be displayed here once generated.
          </Text>
        );
      default:
        return <ScholarshipTypesTable />;
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
          <Tabs
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setViewingForm(false);
              setEditingScholarship(null);
            }}
          >
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

      {renderActiveTab()}
    </>
  );
}

export default ScholarshipShell;
