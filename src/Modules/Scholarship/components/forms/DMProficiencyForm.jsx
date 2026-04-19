/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-props-no-spreading, no-use-before-define */
import React, { useEffect, useState } from "react";
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
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import PropTypes from "prop-types";
import {
  submitPdmRoute,
  getDraftRoute,
  saveDraftRoute,
  deleteDraftRoute,
  showPdmStatusRoute,
} from "../../../../routes/SPACSRoutes";

const AWARD_TYPE = "dm";

export default function DMProficiencyForm({ onCancel, onSubmitted, editData }) {
  const [submitting, setSubmitting] = useState(false);
  const [draftLoading, setDraftLoading] = useState(true);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [notification, setNotification] = useState(null);

  const form = useForm({
    initialValues: {
      award_type: "D&M Proficiency Gold Medal",
      justification: editData?.justification || "",
      correspondence_address: editData?.correspondence_address || "",
      nearest_policestation: editData?.nearest_policestation || "",
      nearest_railwaystation: editData?.nearest_railwaystation || "",
      financial_assistance: editData?.financial_assistance || "",
      grand_total: editData?.grand_total || "",
      title_name: editData?.title_name || "",
      no_of_students: editData?.no_of_students || "",
      roll_no1: editData?.roll_no1 || "",
      roll_no2: editData?.roll_no2 || "",
      roll_no3: editData?.roll_no3 || "",
      roll_no4: editData?.roll_no4 || "",
      roll_no5: editData?.roll_no5 || "",
      brief_description: editData?.brief_description || "",
      cse_topic: editData?.cse_topic || "",
      ece_topic: editData?.ece_topic || "",
      mech_topic: editData?.mech_topic || "",
      design_topic: editData?.design_topic || "",
      cse_percentage: editData?.cse_percentage || "",
      ece_percentage: editData?.ece_percentage || "",
      mech_percentage: editData?.mech_percentage || "",
      design_percentage: editData?.design_percentage || "",
      relevant_document: null,
    },
    validate: {
      grand_total: (value) =>
        !value || isNaN(value) || Number(value) < 0
          ? "Grand total must be a valid non-negative number"
          : null,
      no_of_students: (value) =>
        !value || isNaN(value) || Number(value) <= 0
          ? "Number of students must be greater than 0"
          : null,
      cse_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "CSE % must be between 0 and 100"
          : null,
      ece_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "ECE % must be between 0 and 100"
          : null,
      mech_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "Mech % must be between 0 and 100"
          : null,
      design_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "Design % must be between 0 and 100"
          : null,
    },
  });

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
            form.setValues(draftData.draft_data);
          }
        }

        // Check eligibility
        const statusRes = await fetch(showPdmStatusRoute, {
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
  }, [form.values]);

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
            ...form.values,
            relevant_document: null, // Don't save file object
          },
        }),
      });
    } catch (err) {
      console.error("Draft auto-save failed:", err);
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
            ...form.values,
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

  const marksheetInputId = "dm-proficiency-marksheet-input";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.values.relevant_document && !editData?.relevant_document) {
      setNotification({
        title: "Error",
        message: "Marksheet is required. Please upload a file.",
        color: "red",
      });
      return;
    }
    if (form.validate().hasErrors) {
      setNotification({
        title: "Error",
        message: "Please fix the form errors.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    const formDataToSend = new FormData();
    Object.entries(form.values).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    if (editData?.id) {
      formDataToSend.append("application_id", editData.id);
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(submitPdmRoute, {
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

  return (
    <Container size="lg">
      {draftLoading ? (
        <Loader />
      ) : (
        <>
          {duplicateWarning && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="orange"
              mb="md"
              title="Existing Application Found"
            >
              You already have an active application for D&M Proficiency Gold
              Medal in this academic cycle. You cannot submit another
              application.
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
              DM Proficiency Form
            </Title>
            <form onSubmit={handleSubmit}>
              <Grid gutter="lg">
                {["justification", "correspondence_address"].map((field) => (
                  <Grid.Col span={12} key={field}>
                    <Textarea
                      label={field.replace(/_/g, " ")}
                      placeholder={`Enter ${field.replace(/_/g, " ")}`}
                      minRows={3}
                      {...form.getInputProps(field)}
                      required
                      maxLength={500}
                      description="Maximum 500 characters"
                      descriptionProps={{ color: "dimmed" }}
                    />
                  </Grid.Col>
                ))}
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Nearest Police Station"
                    placeholder="Enter Nearest Police Station"
                    {...form.getInputProps("nearest_policestation")}
                    required
                    maxLength={500}
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Nearest Railway Station"
                    placeholder="Enter Nearest Railway Station"
                    {...form.getInputProps("nearest_railwaystation")}
                    required
                    maxLength={500}
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Financial Assistance"
                    placeholder="Enter Financial Assistance"
                    {...form.getInputProps("financial_assistance")}
                    required
                    maxLength={500}
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Grand Total"
                    placeholder="Enter Grand Total"
                    value={form.values.grand_total}
                    onChange={(value) => {
                      form.setFieldValue("grand_total", value);
                      form.validateField("grand_total");
                    }}
                    error={form.errors.grand_total}
                    required
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Title Name"
                    placeholder="Enter Title Name"
                    {...form.getInputProps("title_name")}
                    required
                    maxLength={500}
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Number of Students"
                    placeholder="Enter Number of Students"
                    value={form.values.no_of_students}
                    onChange={(value) => {
                      form.setFieldValue("no_of_students", value);
                      form.validateField("no_of_students");
                    }}
                    error={form.errors.no_of_students}
                    required
                  />
                </Grid.Col>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Grid.Col span={{ base: 12, sm: 6 }} key={`roll_no${num}`}>
                    <TextInput
                      label={`Roll No ${num}`}
                      placeholder={`Enter Roll No ${num}`}
                      {...form.getInputProps(`roll_no${num}`)}
                      required
                      maxLength={10}
                    />
                  </Grid.Col>
                ))}
                <Grid.Col span={12}>
                  <Textarea
                    label="Brief Description"
                    placeholder="Enter a brief description"
                    minRows={4}
                    {...form.getInputProps("brief_description")}
                    required
                    maxLength={500}
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                {["cse", "ece", "mech", "design"].map((field) => (
                  <React.Fragment key={field}>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={`${field.toUpperCase()} Topic`}
                        placeholder={`Enter ${field.toUpperCase()} Topic`}
                        {...form.getInputProps(`${field}_topic`)}
                        required
                        maxLength={500}
                        description="Maximum 500 characters"
                        descriptionProps={{ color: "dimmed" }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label={`${field.toUpperCase()} Percentage`}
                        placeholder={`Enter ${field.toUpperCase()} Percentage`}
                        value={form.values[`${field}_percentage`]}
                        onChange={(value) => {
                          form.setFieldValue(`${field}_percentage`, value);
                          form.validateField(`${field}_percentage`);
                        }}
                        error={form.errors[`${field}_percentage`]}
                        required
                      />
                    </Grid.Col>
                  </React.Fragment>
                ))}
                <Grid.Col span={12}>
                  <input
                    id={marksheetInputId}
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      form.setFieldValue(
                        "relevant_document",
                        e.target.files?.[0] ?? null,
                      )
                    }
                  />
                  <Button
                    fullWidth
                    component="label"
                    htmlFor={marksheetInputId}
                  >
                    Upload Marksheet (PDF)
                  </Button>
                  {form.values.relevant_document?.name && (
                    <TextInput
                      value={form.values.relevant_document.name}
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
                  {editData ? "Update" : "Submit"}
                </Button>
              </Group>
            </form>
          </Paper>
        </>
      )}
    </Container>
  );
}

DMProficiencyForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmitted: PropTypes.func,
  editData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title_name: PropTypes.string,
    no_of_students: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    justification: PropTypes.string,
    correspondence_address: PropTypes.string,
    nearest_policestation: PropTypes.string,
    nearest_railwaystation: PropTypes.string,
    financial_assistance: PropTypes.string,
    brief_description: PropTypes.string,
    grand_total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roll_no1: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roll_no2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roll_no3: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roll_no4: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roll_no5: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ece_topic: PropTypes.string,
    cse_topic: PropTypes.string,
    mech_topic: PropTypes.string,
    design_topic: PropTypes.string,
    ece_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cse_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    mech_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    design_percentage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    relevant_document: PropTypes.string,
  }),
};
