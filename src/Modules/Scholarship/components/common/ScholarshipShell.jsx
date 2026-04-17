import { useState, useMemo } from "react";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { Tabs, Button, Flex, Text, Container } from "@mantine/core";
import ScholarshipBreadcrumbs from "./ScholarshipBreadcrumbs";

// Consolidated Page Components
import ScholarshipTypesTable from "../tables/ScholarshipTypesTable";
import ApplicationsTable from "../tables/ApplicationsTable";
import AwardsTable from "../tables/AwardsTable";
import NewApplicationForm from "../forms/NewApplicationForm";

function ScholarshipShell() {
  const [activeTab, setActiveTab] = useState("types");
  const [viewingForm, setViewingForm] = useState(false);

  // Tabs are consistent across roles as per ref images
  const tabItems = useMemo(
    () => [
      { key: "types", label: "Scholarship Types" },
      { key: "applications", label: "Applications" },
      { key: "awards", label: "Awards" },
      { key: "merit_lists", label: "Merit Lists" },
    ],
    [],
  );

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
  };

  const breadcrumbItems = [
    {
      title: tabItems.find((t) => t.key === activeTab)?.label || "Types",
      path: "#",
    },
  ];

  const renderActiveTab = () => {
    if (viewingForm) {
      return <NewApplicationForm onCancel={() => setViewingForm(false)} />;
    }

    switch (activeTab) {
      case "types":
        return <ScholarshipTypesTable onApply={() => setViewingForm(true)} />;
      case "applications":
        return <ApplicationsTable onApply={() => setViewingForm(true)} />;
      case "awards":
        return <AwardsTable />;
      case "merit_lists":
        return (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            <Text c="dimmed">
              Merit lists will be displayed here once generated.
            </Text>
          </div>
        );
      default:
        return <ScholarshipTypesTable />;
    }
  };

  return (
    <Container
      size="xl"
      py="lg"
      style={{ backgroundColor: "#F8F9FA", minHeight: "100vh" }}
    >
      <ScholarshipBreadcrumbs items={breadcrumbItems} />

      <Flex align="center" gap="md" mt="xl" mb="xl">
        <Button
          onClick={() => handleTabChange("prev")}
          variant="subtle"
          p={0}
          hiddenFrom="md"
        >
          <CaretCircleLeft size={32} weight="light" />
        </Button>

        <div style={{ borderBottom: "1px solid #E0E0E0", width: "100%" }}>
          <Tabs
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setViewingForm(false);
            }}
            variant="pills"
          >
            <Tabs.List style={{ gap: "0" }}>
              {tabItems.map((item) => (
                <Tabs.Tab
                  value={item.key}
                  key={item.key}
                  px="xl"
                  py="md"
                  style={{
                    backgroundColor:
                      activeTab === item.key ? "#EDF7FF" : "transparent",
                    color: activeTab === item.key ? "#1971C2" : "#666",
                    borderBottom:
                      activeTab === item.key ? "3px solid #1971C2" : "none",
                    borderRadius: "0",
                    transition: "all 0.2s ease",
                    fontWeight: activeTab === item.key ? 700 : 500,
                    fontSize: "1rem",
                  }}
                >
                  {item.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </div>

        <Button
          onClick={() => handleTabChange("next")}
          variant="subtle"
          p={0}
          hiddenFrom="md"
        >
          <CaretCircleRight size={32} weight="light" />
        </Button>
      </Flex>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #EEE",
          padding: "1rem",
        }}
      >
        {renderActiveTab()}
      </div>
    </Container>
  );
}

export default ScholarshipShell;
