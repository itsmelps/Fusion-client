/* eslint-disable no-use-before-define, no-shadow */
import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Grid,
  Textarea,
  Group,
  Container,
  Paper,
  Title,
  NumberInput,
  Text,
  Alert,
  Notification,
  Loader,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import PropTypes from "prop-types";
import {
  showDirectorGoldSubmitRoute,
  getDraftRoute,
  saveDraftRoute,
  deleteDraftRoute,
  showGoldStatusRoute,
} from "../../../../routes/SPACSRoutes";
import { validateGrandTotal } from "../../utils/helpers";

const AWARD_TYPE = "gold";

export default function DirectorGoldForm({ onCancel, onSubmitted, editData }) {
  const [formData, setFormData] = useState({
    award_type: "Director's Gold",
    justification: editData?.justification || "",
    correspondence_address: editData?.correspondence_address || "",
    nearest_policestation: editData?.nearest_policestation || "",
    nearest_railwaystation: editData?.nearest_railwaystation || "",
    financial_assistance: editData?.financial_assistance || "",
    grand_total: editData?.grand_total || "",
    academic_achievements: editData?.academic_achievements || "",
    social: editData?.social || "",
    corporate: editData?.corporate || "",
    hall_activities: editData?.hall_activities || "",
    gymkhana_activities: editData?.gymkhana_activities || "",
    institute_activities: editData?.institute_activities || "",
    counselling_activities: editData?.counselling_activities || "",
    other_activities: editData?.other_activities || "",
    science_inside: editData?.science_inside || "",
    science_outside: editData?.science_outside || "",
    games_inside: editData?.games_inside || "",
    games_outside: editData?.games_outside || "",
    cultural_inside: editData?.cultural_inside || "",
    cultural_outside: editData?.cultural_outside || "",
    relevant_document: null,
  });
  const [grandTotalError, setGrandTotalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftLoading, setDraftLoading] = useState(true);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fileError, setFileError] = useState("");

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const inputStyles = {
    input: {
      height: "42px",
      minHeight: "42px",
    },
  };

  // BR-SPACS-007: Load draft on mount
  useEffect(() => {
    const loadDraftAndCheckEligibility = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Load draft
        const draftRes = await fetch(
          `${getDraftRoute}?award_type=${AWARD_TYPE}`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (draftRes.ok) {
          const draftData = await draftRes.json();
          if (draftData && draftData.draft_data) {
            setFormData((prev) => ({ ...prev, ...draftData.draft_data }));
          }
        }

        // Check eligibility
        const statusRes = await fetch(showGoldStatusRoute, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (Array.isArray(statusData) && statusData.length > 0) {
            const completeApp = statusData.find(
              (app) => app.status === "Complete",
            );
            if (completeApp) {
              setDuplicateWarning(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading draft or checking status:", err);
      } finally {
        setDraftLoading(false);
      }
    };

    loadDraftAndCheckEligibility();
  }, []);

  // BR-SPACS-007: Auto-save every 60 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveDraftToBackend();
    }, 60000); // 60 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const saveDraftToBackend = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(saveDraftRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          award_type: AWARD_TYPE,
          draft_data: {
            ...formData,
            relevant_document: null, // Don't save file object
          },
        }),
      });
    } catch (err) {
      console.error("Draft auto-save failed:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size exceeds 2MB limit (Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );
      setFormData((prev) => ({ ...prev, relevant_document: null }));
    } else {
      setFileError("");
      setFormData((prev) => ({ ...prev, relevant_document: file }));
    }
  };

  const handleSaveDraft = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(saveDraftRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          award_type: AWARD_TYPE,
          draft_data: {
            ...formData,
            relevant_document: null,
          },
        }),
      });
      if (res.ok) {
        setNotification({
          title: "Success",
          message: "Draft saved successfully!",
          color: "green",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        title: "Error",
        message: "Failed to save draft.",
        color: "red",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.relevant_document && !editData?.relevant_document) {
      setNotification({
        title: "Error",
        message: "Marksheet is required. Please upload a file.",
        color: "red",
      });
      return;
    }

    if (fileError) {
      setNotification({
        title: "Error",
        message: "Please upload a file within the 2MB size limit.",
        color: "red",
      });
      return;
    }

    const validationErr = validateGrandTotal(formData.grand_total);
    if (validationErr) {
      setGrandTotalError(validationErr);
      return;
    }

    setSubmitting(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    if (editData?.id) {
      formDataToSend.append("application_id", editData.id);
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(showDirectorGoldSubmitRoute, {
        method: "POST",
        body: formDataToSend,
        headers: { Authorization: `Token ${token}` },
      });

      if (res.ok) {
        // BR-SPACS-007: Delete draft on successful submit
        await fetch(`${deleteDraftRoute}?award_type=${AWARD_TYPE}`, {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });
        setNotification({
          title: "Success",
          message: "Form submitted successfully!",
          color: "green",
        });
        if (onSubmitted) onSubmitted();
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to submit the form",
          color: "red",
        });
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setNotification({
        title: "Error",
        message: "Network error. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const achievementFields = [
    "academic_achievements",
    "social",
    "corporate",
    "hall_activities",
    "gymkhana_activities",
    "institute_activities",
    "counselling_activities",
    "other_activities",
    "science_inside",
    "science_outside",
    "games_inside",
    "games_outside",
    "cultural_inside",
    "cultural_outside",
  ];

  const marksheetInputId = "director-gold-marksheet-input";

  if (draftLoading) {
    return (
      <Container size="lg" mt="xl">
        <Loader />
      </Container>
    );
  }

  return (
    <Container size="lg">
      {duplicateWarning && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          mb="md"
          title="Existing Application Found"
        >
          You already have an active application for Director's Gold Medal in
          this academic cycle. You cannot submit another application.
        </Alert>
      )}

      {notification && (
        <Notification
          icon={<IconCheck size={18} />}
          color={notification.color}
          onClose={() => setNotification(null)}
          title={notification.title}
          mb="md"
        >
          {notification.message}
        </Notification>
      )}

      <Paper radius="md" p="sm">
        <Title order={2} mb="lg">
          Director&apos;s Gold Medal Application Form
        </Title>
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Police Station"
                name="nearest_policestation"
                value={formData.nearest_policestation}
                onChange={handleChange}
                placeholder="e.g. Madhav Nagar Police Station"
                required
                maxLength={500}
                styles={inputStyles}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Railway Station"
                name="nearest_railwaystation"
                value={formData.nearest_railwaystation}
                onChange={handleChange}
                placeholder="e.g. Jabalpur Junction"
                required
                maxLength={500}
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid>

          <Grid gutter="md" mt="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Grand Total Amount"
                value={formData.grand_total}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, grand_total: value }));
                  setGrandTotalError(validateGrandTotal(value));
                }}
                placeholder="e.g. 50000"
                min={0}
                step={0.01}
                decimalScale={2}
                error={grandTotalError}
                required
                styles={inputStyles}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Financial Assistance"
                name="financial_assistance"
                value={formData.financial_assistance}
                onChange={handleChange}
                placeholder="e.g. Yes, from State Govt (if any)"
                required
                maxLength={500}
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid>

          <div style={{ marginTop: "20px" }}>
            {["justification", "correspondence_address"].map((field) => (
              <div key={field} style={{ marginBottom: "15px" }}>
                <Textarea
                  label={field.replace(/_/g, " ")}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Provide detailed ${field.replace(/_/g, " ")}...`}
                  minRows={3}
                  required
                  maxLength={500}
                  description="Maximum 500 characters"
                  descriptionProps={{ color: "dimmed" }}
                />
              </div>
            ))}
          </div>

          <Grid gutter="md" mt="md">
            {achievementFields.map((field) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={field}>
                <Textarea
                  label={field.replace(/_/g, " ")}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`e.g. Won 1st prize in ${field.replace(/_/g, " ")} competition`}
                  minRows={2}
                  required
                  maxLength={500}
                  description="Maximum 500 characters"
                  descriptionProps={{ color: "dimmed" }}
                />
              </Grid.Col>
            ))}
          </Grid>
          <Grid gutter="md" mt="md">
            <Grid.Col span={12}>
              <input
                id={marksheetInputId}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <Button fullWidth component="label" htmlFor={marksheetInputId}>
                Upload Marksheet (PDF)
              </Button>
              <Text size="xs" color="dimmed" mt={4} textAlign="center">
                Max size: 2MB (PDF only)
              </Text>
              {fileError && (
                <Text color="red" size="sm" mt="xs">
                  {fileError}
                </Text>
              )}
              {formData.relevant_document && (
                <TextInput
                  value={formData.relevant_document.name}
                  readOnly
                  mt="sm"
                  label="Uploaded File"
                  styles={inputStyles}
                />
              )}
              {editData?.relevant_document && (
                <Text size="sm" mt="xs">
                  Current file:{" "}
                  <a
                    href={editData.relevant_document}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    View Document
                  </a>
                </Text>
              )}
            </Grid.Col>
          </Grid>
          <Group position="apart" mt="xl">
            <Button
              variant="outline"
              onClick={onCancel || handleSaveDraft}
              radius="md"
              style={{ fontWeight: 500 }}
            >
              {onCancel ? "Cancel" : "Save Draft"}
            </Button>
            <Button
              type="submit"
              color="blue"
              loading={submitting}
              disabled={duplicateWarning}
              radius="md"
              style={{
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(34, 139, 230, 0.2)",
                transition: "transform 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {editData ? "Update" : "Submit"}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

DirectorGoldForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmitted: PropTypes.func,
  editData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    justification: PropTypes.string,
    correspondence_address: PropTypes.string,
    nearest_policestation: PropTypes.string,
    nearest_railwaystation: PropTypes.string,
    financial_assistance: PropTypes.string,
    grand_total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    academic_achievements: PropTypes.string,
    social: PropTypes.string,
    corporate: PropTypes.string,
    hall_activities: PropTypes.string,
    gymkhana_activities: PropTypes.string,
    institute_activities: PropTypes.string,
    counselling_activities: PropTypes.string,
    other_activities: PropTypes.string,
    science_inside: PropTypes.string,
    science_outside: PropTypes.string,
    games_inside: PropTypes.string,
    games_outside: PropTypes.string,
    cultural_inside: PropTypes.string,
    cultural_outside: PropTypes.string,
    relevant_document: PropTypes.string,
  }),
};
