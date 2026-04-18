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
  submitSilverRoute,
  getDraftRoute,
  saveDraftRoute,
  deleteDraftRoute,
  showSilverStatusRoute,
} from "../../../../routes/SPACSRoutes";
import { validateGrandTotal } from "../../utils/helpers";

const AWARD_TYPE = "silver";

export default function DirectorSilverForm({
  onCancel,
  onSubmitted,
  editData,
}) {
  const [formData, setFormData] = useState({
    award_type: "Director's Silver",
    Marksheet: null,
    justification: editData?.justification || "",
    correspondence_address: editData?.correspondence_address || "",
    nearest_policestation: editData?.nearest_policestation || "",
    nearest_railwaystation: editData?.nearest_railwaystation || "",
    financial_assistance: editData?.financial_assistance || "",
    grand_total: editData?.grand_total || "",
    inside_achievements: editData?.inside_achievements || "",
    outside_achievements: editData?.outside_achievements || "",
  });
  const [grandTotalError, setGrandTotalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftLoading, setDraftLoading] = useState(true);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [notification, setNotification] = useState(null);

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
        const statusRes = await fetch(showSilverStatusRoute, {
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
            Marksheet: null, // Don't save file object
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
    setFormData((prev) => ({ ...prev, Marksheet: file }));
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
            Marksheet: null,
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
    if (!formData.Marksheet) {
      setNotification({
        title: "Error",
        message: "Marksheet is required. Please upload a file.",
        color: "red",
      });
      return;
    }

    const err = validateGrandTotal(formData.grand_total);
    if (err) {
      setGrandTotalError(err);
      return;
    }

    setSubmitting(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(submitSilverRoute, {
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

  const marksheetInputId = "director-silver-marksheet-input";

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
          You already have an active application for Director's Silver Medal in
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
          Director&apos;s Silver Medal Application Form
        </Title>
        <form onSubmit={handleSubmit}>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Police Station"
                name="nearest_policestation"
                value={formData.nearest_policestation}
                onChange={handleChange}
                placeholder="Enter Nearest Police Station"
                required
                maxLength={500}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Railway Station"
                name="nearest_railwaystation"
                value={formData.nearest_railwaystation}
                onChange={handleChange}
                placeholder="Enter Nearest Railway Station"
                required
                maxLength={500}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Grand Total Amount"
                name="grand_total"
                value={formData.grand_total}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, grand_total: value }));
                  setGrandTotalError(validateGrandTotal(value));
                }}
                placeholder="Enter Grand Total Amount"
                min={0}
                step={0.01}
                error={grandTotalError}
                required
              />
            </Grid.Col>
            {[
              "justification",
              "correspondence_address",
              "financial_assistance",
              "inside_achievements",
              "outside_achievements",
            ].map((field) => (
              <Grid.Col span={12} key={field}>
                <Textarea
                  label={field.replace(/_/g, " ")}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field.replace(/_/g, " ")}`}
                  minRows={3}
                  required
                  maxLength={500}
                  description="Maximum 500 characters"
                  descriptionProps={{ color: "dimmed" }}
                />
              </Grid.Col>
            ))}
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
              {formData.Marksheet && (
                <TextInput
                  value={formData.Marksheet.name}
                  readOnly
                  mt="sm"
                  label="Uploaded File"
                />
              )}
              {editData?.relevant_document && (
                <Text size="sm" mt="xs">
                  Current file:{" "}
                  <a
                    href={editData.relevant_document}
                    target="_blank"
                    rel="noreferrer"
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
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

DirectorSilverForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmitted: PropTypes.func,
  editData: PropTypes.shape({
    justification: PropTypes.string,
    correspondence_address: PropTypes.string,
    nearest_policestation: PropTypes.string,
    nearest_railwaystation: PropTypes.string,
    financial_assistance: PropTypes.string,
    grand_total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inside_achievements: PropTypes.string,
    outside_achievements: PropTypes.string,
    relevant_document: PropTypes.string,
    award_type: PropTypes.string,
  }),
};
