import { useState, useRef } from "react";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { Tabs, Button, Flex, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import classes from "../../../Dashboard/Dashboard.module.css";

// Table components
import ScholarshipTypesTable from "../tables/ScholarshipTypesTable";
import ApplicationsTable from "../tables/ApplicationsTable";
import AwardsTable from "../tables/AwardsTable";
import WithdrawalRequests from "../tables/WithdrawalRequests";
import ManageScholarshipsAwards from "../tables/ManageScholarshipsAwards";

// Form components
import ScholarshipForm from "../forms/ScholarshipForm";
import DirectorGoldForm from "../forms/DirectorGoldForm";
import DirectorSilverForm from "../forms/DirectorSilverForm";
import DMProficiencyForm from "../forms/DMProficiencyForm";

function ScholarshipShell() {
  const user = useSelector((state) => state.user);
  const role = user?.role || "student";
  const isAssistant = role === "spacsassistant";
  const isConvenor = role === "spacsconvenor";

  const [activeTab, setActiveTab] = useState("types");
  const [viewingForm, setViewingForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const tabsListRef = useRef(null);

  const tabItems = [
    { key: "types", label: "Scholarship Types" },
    { key: "applications", label: "Applications" },
    { key: "awards", label: "Awards" },
    ...(isAssistant
      ? [{ key: "withdrawals", label: "Withdrawal Requests" }]
      : []),
    ...(isConvenor ? [{ key: "management", label: "Management" }] : []),
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
    setEditingApplication(null);
    setSelectedScholarship(null);

    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({
        left: direction === "next" ? 50 : -50,
        behavior: "smooth",
      });
    }
  };

  const handleApply = (scholarship) => {
    setSelectedScholarship(scholarship);
    setViewingForm(true);
    setEditingApplication(null);
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
    setSelectedScholarship({ award_name: application.type_name });
    setViewingForm(true);
  };

  const handleFormCancel = () => {
    setViewingForm(false);
    setEditingApplication(null);
    setSelectedScholarship(null);
  };

  const handleFormSubmitted = () => {
    setViewingForm(false);
    setEditingApplication(null);
    setSelectedScholarship(null);
    setActiveTab("applications");
  };

  const renderActiveTab = () => {
    if (viewingForm) {
      const awardName = selectedScholarship?.award_name || "";
      const type = (editingApplication?.type_name || awardName).toLowerCase();

      const formProps = {
        onCancel: handleFormCancel,
        onSubmitted: handleFormSubmitted,
        editData: editingApplication,
      };

      if (type.includes("gold")) {
        return (
          <DirectorGoldForm
            onCancel={formProps.onCancel}
            onSubmitted={formProps.onSubmitted}
            editData={formProps.editData}
          />
        );
      }
      if (type.includes("silver")) {
        return (
          <DirectorSilverForm
            onCancel={formProps.onCancel}
            onSubmitted={formProps.onSubmitted}
            editData={formProps.editData}
          />
        );
      }
      if (type.includes("dm") || type.includes("proficiency")) {
        return (
          <DMProficiencyForm
            onCancel={formProps.onCancel}
            onSubmitted={formProps.onSubmitted}
            editData={formProps.editData}
          />
        );
      }

      return (
        <ScholarshipForm
          onCancel={formProps.onCancel}
          onSubmitted={formProps.onSubmitted}
          editData={formProps.editData}
          initialType={awardName}
        />
      );
    }

    switch (activeTab) {
      case "types":
        return <ScholarshipTypesTable onApply={handleApply} />;
      case "applications":
        return <ApplicationsTable onApply={handleApply} onEdit={handleEdit} />;
      case "awards":
        return <AwardsTable />;
      case "withdrawals":
        return <WithdrawalRequests />;
      case "management":
        return <ManageScholarshipsAwards />;
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
              setEditingApplication(null);
              setSelectedScholarship(null);
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
                    whiteSpace: "nowrap",
                  }}
                >
                  <Text size="sm" fw={activeTab === item.key ? 700 : 400}>
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
