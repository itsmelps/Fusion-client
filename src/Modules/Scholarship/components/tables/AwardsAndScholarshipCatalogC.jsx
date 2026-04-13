/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  List,
  Title,
  Divider,
  Container,
  Loader,
  Textarea,
  Button,
  Modal,
  Group,
  Badge,
  TextInput,
  NumberInput,
  Select,
  Grid,
  Alert,
} from "@mantine/core";
import { Pencil, Trash } from "@phosphor-icons/react";
import { IconAlertCircle } from "@tabler/icons-react";
import styles from "../../styles/CatalogC.module.css";
import {
  createNewAwardRoute,
  updateCatalogRoute,
  retireAwardRoute,
} from "../../../../routes/SPACSRoutes";

function AwardsAndScholarshipCatalogConvenor() {
  const [selectedAward, setSelectedAward] = useState(null);
  const [awards, setAwards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedText, setUpdatedText] = useState("");

  // T8: Create New Award modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAwardForm, setNewAwardForm] = useState({
    award_name: "",
    catalog: "",
    cpi_cutoff: 0,
    income_ceiling: 0,
    eligible_programme: "all",
  });
  const [creatingAward, setCreatingAward] = useState(false);

  // T8: Edit additional attributes
  const [editCPI, setEditCPI] = useState(0);
  const [editIncomeCeiling, setEditIncomeCeiling] = useState(0);
  const [editProgram, setEditProgram] = useState("all");

  // T8: Publish/Unpublish and Retire
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [retiring, setRetiring] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleAwardSelect = (award) => {
    setSelectedAward(award);
    setEditMode(false);
    setUpdatedText(award.catalog || "");
    setEditCPI(award.cpi_cutoff || 0);
    setEditIncomeCeiling(award.income_ceiling || 0);
    setEditProgram(award.eligible_programme || "all");
  };

  // Fetch awards from backend
  const fetchAwards = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${createNewAwardRoute.replace("/create-award-new", "")}`,
        {
          method: "GET",
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setAwards(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setSelectedAward(data[0]);
          setUpdatedText(data[0].catalog || "");
          setEditCPI(data[0].cpi_cutoff || 0);
          setEditIncomeCeiling(data[0].income_ceiling || 0);
          setEditProgram(data[0].eligible_programme || "all");
        }
      }
    } catch (err) {
      console.error("Error fetching awards:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  // T8: Create New Award
  const handleCreateAward = async () => {
    if (!newAwardForm.award_name.trim()) {
      setNotification({
        title: "Error",
        message: "Award name is required",
        color: "red",
      });
      return;
    }
    if (!newAwardForm.catalog.trim()) {
      setNotification({
        title: "Error",
        message: "Catalog description is required",
        color: "red",
      });
      return;
    }

    setCreatingAward(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(createNewAwardRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          award_name: newAwardForm.award_name,
          catalog: newAwardForm.catalog,
          cpi_cutoff: newAwardForm.cpi_cutoff,
          income_ceiling: newAwardForm.income_ceiling,
          eligible_programme: newAwardForm.eligible_programme,
        }),
      });
      if (res.ok) {
        setNotification({
          title: "Success",
          message: "Award created successfully!",
          color: "green",
        });
        setCreateModalOpen(false);
        setNewAwardForm({
          award_name: "",
          catalog: "",
          cpi_cutoff: 0,
          income_ceiling: 0,
          eligible_programme: "all",
        });
        fetchAwards();
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to create award",
          color: "red",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        title: "Error",
        message: "Network error",
        color: "red",
      });
    } finally {
      setCreatingAward(false);
    }
  };

  // Save catalog changes
  const saveChanges = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(updateCatalogRoute, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedAward.id,
          catalog: updatedText,
          cpi_cutoff: editCPI,
          income_ceiling: editIncomeCeiling,
          eligible_programme: editProgram,
        }),
      });
      if (res.ok) {
        setAwards((prev) =>
          prev.map((a) =>
            a.id === selectedAward.id
              ? {
                  ...a,
                  catalog: updatedText,
                  cpi_cutoff: editCPI,
                  income_ceiling: editIncomeCeiling,
                  eligible_programme: editProgram,
                }
              : a,
          ),
        );
        setSelectedAward((prev) => ({
          ...prev,
          catalog: updatedText,
          cpi_cutoff: editCPI,
          income_ceiling: editIncomeCeiling,
          eligible_programme: editProgram,
        }));
        setEditMode(false);
        setNotification({
          title: "Success",
          message: "Changes saved successfully!",
          color: "green",
        });
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to save",
          color: "red",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        title: "Error",
        message: "Network error",
        color: "red",
      });
    }
  };

  // T8: Toggle Publish/Unpublish
  const handleTogglePublish = async () => {
    if (!selectedAward) return;
    setTogglingPublish(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(updateCatalogRoute, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedAward.id,
          publish_flag: !selectedAward.publish_flag,
        }),
      });
      if (res.ok) {
        const updated = {
          ...selectedAward,
          publish_flag: !selectedAward.publish_flag,
        };
        setSelectedAward(updated);
        setAwards((prev) =>
          prev.map((a) => (a.id === selectedAward.id ? updated : a)),
        );
        setNotification({
          title: "Success",
          message: `Award ${updated.publish_flag ? "published" : "unpublished"} successfully!`,
          color: "green",
        });
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to update",
          color: "red",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        title: "Error",
        message: "Network error",
        color: "red",
      });
    } finally {
      setTogglingPublish(false);
    }
  };

  // T8: Retire award
  const handleRetire = async () => {
    if (!selectedAward) return;
    const confirmed = window.confirm(
      "Are you sure you want to retire this award? This action cannot be undone.",
    );
    if (!confirmed) return;

    setRetiring(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(retireAwardRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ award_id: selectedAward.id }),
      });
      if (res.ok) {
        setAwards((prev) => prev.filter((a) => a.id !== selectedAward.id));
        setSelectedAward(null);
        setNotification({
          title: "Success",
          message: "Award retired successfully!",
          color: "green",
        });
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to retire",
          color: "red",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        title: "Error",
        message: "Network error",
        color: "red",
      });
    } finally {
      setRetiring(false);
    }
  };

  return (
    <Container className={styles.wrapper}>
      {notification && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color={notification.color}
          onClose={() => setNotification(null)}
          mb="md"
        >
          {notification.message}
        </Alert>
      )}

      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <>
          {/* T8: Create New Award Button */}
          <Group mb="md" position="apart">
            <Title order={2}>Awards & Scholarships Catalog</Title>
            <Button onClick={() => setCreateModalOpen(true)} color="green">
              + Create New Award
            </Button>
          </Group>

          <div className={styles.listContainer}>
            <List spacing="sm" size="lg">
              {awards.map((award) => (
                <List.Item
                  key={award.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleAwardSelect(award)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAwardSelect(award);
                    }
                  }}
                  className={`${styles.listItem} ${selectedAward?.id === award.id ? styles.activeItem : ""}`}
                >
                  <Group spacing="xs">
                    {award.award_name}
                    {/* T8: Show publish status badge */}
                    <Badge
                      color={award.publish_flag ? "green" : "gray"}
                      variant="filled"
                      size="sm"
                    >
                      {award.publish_flag ? "Published" : "Unpublished"}
                    </Badge>
                    {award.version && (
                      <Badge variant="outline" size="sm">
                        v{award.version}
                      </Badge>
                    )}
                  </Group>
                </List.Item>
              ))}
            </List>
          </div>

          <div className={styles.contentContainer}>
            {selectedAward && (
              <>
                <div className={styles.header}>
                  <div>
                    <Title order={2}>{selectedAward.award_name}</Title>
                    <Group spacing="sm" mt="xs">
                      {/* T8: Publish/Unpublish toggle */}
                      <Button
                        size="sm"
                        variant="light"
                        color={selectedAward.publish_flag ? "green" : "gray"}
                        loading={togglingPublish}
                        onClick={handleTogglePublish}
                      >
                        {selectedAward.publish_flag ? "Unpublish" : "Publish"}
                      </Button>
                      {/* T8: Retire button */}
                      <Button
                        size="sm"
                        variant="light"
                        color="red"
                        leftIcon={<Trash size={16} />}
                        loading={retiring}
                        onClick={handleRetire}
                      >
                        Retire
                      </Button>
                    </Group>
                  </div>
                  <Button
                    className={styles.editButton}
                    onClick={editMode ? saveChanges : () => setEditMode(true)}
                  >
                    {editMode ? "Save" : "Edit"}
                    <Pencil className={styles.pencilIcon} />
                  </Button>
                </div>
                <Divider my="sm" />

                {editMode ? (
                  <>
                    {/* T8: Edit additional fields */}
                    <Grid mb="md">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <NumberInput
                          label="CPI Cutoff"
                          min={0}
                          max={4}
                          step={0.1}
                          value={editCPI}
                          onChange={(val) => setEditCPI(val || 0)}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <NumberInput
                          label="Income Ceiling (₹)"
                          min={0}
                          value={editIncomeCeiling}
                          onChange={(val) => setEditIncomeCeiling(val || 0)}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Select
                          label="Eligible Programme"
                          value={editProgram}
                          onChange={(val) => setEditProgram(val || "all")}
                          data={[
                            { value: "all", label: "All" },
                            { value: "B.Tech", label: "B.Tech" },
                            { value: "M.Tech", label: "M.Tech" },
                            { value: "M.Des", label: "M.Des" },
                            { value: "PhD", label: "PhD" },
                          ]}
                        />
                      </Grid.Col>
                    </Grid>

                    <Textarea
                      label="Catalog Description"
                      value={updatedText}
                      onChange={(e) => setUpdatedText(e.target.value)}
                      autosize
                      minRows={10}
                      maxRows={20}
                      className={styles.editTextarea}
                    />
                  </>
                ) : (
                  <>
                    {/* Display additional fields */}
                    <Group mb="md">
                      <div>
                        <strong>CPI Cutoff:</strong>{" "}
                        {selectedAward.cpi_cutoff || "N/A"}
                      </div>
                      <div>
                        <strong>Income Ceiling:</strong> ₹
                        {selectedAward.income_ceiling || "N/A"}
                      </div>
                      <div>
                        <strong>Programme:</strong>{" "}
                        {selectedAward.eligible_programme || "All"}
                      </div>
                    </Group>
                    <List className={styles.catalogList}>
                      {selectedAward.catalog
                        ?.split("\n")
                        .map((point, index) => (
                          <List.Item key={`catalog-line-${index}`}>
                            {point}
                          </List.Item>
                        ))}
                    </List>
                  </>
                )}
              </>
            )}
          </div>

          {/* T8: Create New Award Modal */}
          <Modal
            opened={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title="Create New Award"
            size="lg"
          >
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Award Name *"
                  placeholder="Enter award name"
                  value={newAwardForm.award_name}
                  onChange={(e) =>
                    setNewAwardForm((prev) => ({
                      ...prev,
                      award_name: e.currentTarget.value,
                    }))
                  }
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="CPI Cutoff"
                  min={0}
                  max={4}
                  step={0.1}
                  value={newAwardForm.cpi_cutoff}
                  onChange={(val) =>
                    setNewAwardForm((prev) => ({
                      ...prev,
                      cpi_cutoff: val || 0,
                    }))
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Income Ceiling (₹)"
                  min={0}
                  value={newAwardForm.income_ceiling}
                  onChange={(val) =>
                    setNewAwardForm((prev) => ({
                      ...prev,
                      income_ceiling: val || 0,
                    }))
                  }
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  label="Eligible Programme"
                  value={newAwardForm.eligible_programme}
                  onChange={(val) =>
                    setNewAwardForm((prev) => ({
                      ...prev,
                      eligible_programme: val || "all",
                    }))
                  }
                  data={[
                    { value: "all", label: "All" },
                    { value: "B.Tech", label: "B.Tech" },
                    { value: "M.Tech", label: "M.Tech" },
                    { value: "M.Des", label: "M.Des" },
                    { value: "PhD", label: "PhD" },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Catalog Description *"
                  placeholder="Enter catalog description"
                  value={newAwardForm.catalog}
                  onChange={(e) =>
                    setNewAwardForm((prev) => ({
                      ...prev,
                      catalog: e.currentTarget.value,
                    }))
                  }
                  minRows={6}
                  required
                />
              </Grid.Col>
            </Grid>
            <Group position="right" mt="md">
              <Button
                variant="default"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="green"
                loading={creatingAward}
                onClick={handleCreateAward}
              >
                Create Award
              </Button>
            </Group>
          </Modal>
        </>
      )}
    </Container>
  );
}

export default AwardsAndScholarshipCatalogConvenor;
