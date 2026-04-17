/* eslint-disable no-use-before-define, no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Grid,
  Container,
  Paper,
  Title,
  Alert,
  FileButton,
  Text,
  Group,
  Select,
  NumberInput,
  Stepper,
  Badge,
  Notification,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import PropTypes from "prop-types";
import {
  submitMCMApplicationsRoute,
  checkApplicationWindow,
  getDraftRoute,
  saveDraftRoute,
  deleteDraftRoute,
  showMcmStatusRoute,
} from "../../../../routes/SPACSRoutes";

/* eslint-disable react/jsx-props-no-spreading */

const AWARD_TYPE = "mcm";

function ScholarshipForm({ onCancel }) {
  const [step, setStep] = useState(0); // 0 = personal/family, 1 = document upload, 2 = review
  const [uploadStatus, setUploadStatus] = useState({});
  const [documents, setDocuments] = useState({});
  const [showForm, setShowForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);

  const form = useForm({
    mode: "uncontrolled",
    validateInputOnBlur: true,
    initialValues: {
      brother_name: "",
      brother_occupation: "",
      sister_name: "",
      sister_occupation: "",
      income_father: 0,
      income_mother: 0,
      income_other: 0,
      father_occ: "",
      mother_occ: "",
      father_occ_desc: "",
      mother_occ_desc: "",
      four_wheeler: 0,
      four_wheeler_desc: "",
      two_wheeler: 0,
      two_wheeler_desc: "",
      house: "",
      plot_area: 0,
      constructed_area: 0,
      school_fee: 0,
      school_name: "",
      bank_name: "",
      loan_amount: 0,
      college_fee: 0,
      college_name: "",
      annual_income: 0,
    },
    validate: {
      father_occ: (v) => (!v ? "Father's occupation is required" : null),
      mother_occ: (v) => (!v ? "Mother's occupation is required" : null),
      father_occ_desc: (v) => (!v ? "Required" : null),
      mother_occ_desc: (v) => (!v ? "Required" : null),
      house: (v) => (!v ? "Required" : null),
      school_name: (v) => (!v ? "Required" : null),
      bank_name: (v) => (!v ? "Required" : null),
      college_name: (v) => (!v ? "Required" : null),
      income_mother: (v) => (v < 0 ? "Income must be positive" : null),
      income_father: (v) => (v < 0 ? "Income must be positive" : null),
      income_other: (v) => (v < 0 ? "Income must be positive" : null),
      school_fee: (v) => (v < 0 ? "Fee must be positive" : null),
      plot_area: (v) => (v < 0 ? "Area must be positive" : null),
      constructed_area: (v) => (v < 0 ? "Area must be positive" : null),
      loan_amount: (v) => (v < 0 ? "Amount must be positive" : null),
      annual_income: (v) => (v < 0 ? "Income must be positive" : null),
      college_fee: (v) => (v < 0 ? "Fee must be positive" : null),
    },
  });

  const documentFields = [
    {
      id: "income_certificate",
      name: "Income Certificate",
      type: ".pdf,.doc,.docx",
    },
    { id: "Marksheet", name: "Marksheet", type: ".pdf,.doc,.docx" },
    { id: "Fee_Receipt", name: "Fee Receipt", type: ".pdf,.jpg,.jpeg,.png" },
    { id: "Bank_details", name: "Bank Details", type: ".pdf,.doc,.docx" },
    { id: "Affidavit", name: "Affidavit", type: ".pdf,.doc,.docx" },
    { id: "Aadhar_card", name: "Aadhar Card", type: ".pdf,.jpg,.jpeg,.png" },
  ];

  // BR-SPACS-007: Load draft on mount and check eligibility
  useEffect(() => {
    const loadDraftAndCheckEligibility = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Load draft data
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

        // Check MCM status for eligibility
        const statusRes = await fetch(showMcmStatusRoute, {
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
      }
    };

    loadDraftAndCheckEligibility();

    // Check application window
    const fetchWindow = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(checkApplicationWindow, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ award: "MCM Scholarship" }),
        });
        const data = await response.json();
        setShowForm(data);
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setDraftLoading(false);
      }
    };
    fetchWindow();
  }, []);

  // BR-SPACS-007: Auto-save draft every 60 seconds
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
          draft_data: form.values,
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
          draft_data: form.values,
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

  const handleNext = (e) => {
    e.preventDefault();
    const result = form.validate();
    if (!result.hasErrors) {
      setStep(1);
    }
  };

  const handleFileChange = (docId, file) => {
    if (file) {
      setUploadStatus((prev) => ({ ...prev, [docId]: "uploading" }));
      setDocuments((prev) => ({ ...prev, [docId]: file }));
      setTimeout(() => {
        setUploadStatus((prev) => ({ ...prev, [docId]: "success" }));
      }, 800);
    }
  };

  // BR-SPACS-004: All required documents must be uploaded
  const allDocumentsUploaded = documentFields.every(
    (doc) => documents[doc.id] !== undefined,
  );

  const handleSubmit = async () => {
    // BR-SPACS-004: Completeness check
    if (!allDocumentsUploaded) {
      setNotification({
        title: "Error",
        message: "Please upload all required documents before submitting.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    const submissionData = new FormData();
    Object.entries(form.values).forEach(([key, val]) =>
      submissionData.append(key, val),
    );
    Object.entries(documents).forEach(([key, file]) => {
      if (file) submissionData.append(key, file);
    });

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(submitMCMApplicationsRoute, {
        method: "POST",
        body: submissionData,
        headers: { Authorization: `Token ${token}` },
      });

      if (response.ok) {
        // BR-SPACS-007: Delete draft on successful submit
        await fetch(`${deleteDraftRoute}?award_type=${AWARD_TYPE}`, {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });
        setSubmitted(true);
        setStep(2);
        setNotification({
          title: "Success",
          message: "Application submitted successfully!",
          color: "green",
        });
      } else if (response.status === 409) {
        // BR-SPACS-002: Duplicate application
        setDuplicateWarning(true);
        setNotification({
          title: "Error",
          message:
            "You already have an active application for this scholarship.",
          color: "red",
        });
      } else {
        const data = await response.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to submit application.",
          color: "red",
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setNotification({
        title: "Error",
        message: "Network error. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (draftLoading) {
    return (
      <Container size="lg" mt="xl">
        <Loader />
      </Container>
    );
  }

  if (showForm.result !== "Success") {
    return (
      <Container size="lg" mt="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          title="Application Window Closed"
        >
          {showForm.message || "The application window is currently closed."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" mt="md">
      <Group justify="flex-end" mb="sm">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
      </Group>

      {/* BR-SPACS-002: Duplicate warning */}
      {duplicateWarning && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          mb="md"
          title="Existing Application Found"
        >
          You already have an active application for MCM Scholarship in this
          academic cycle. You cannot submit another application. Please check
          your Application Status tab.
        </Alert>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          icon={<IconCircleCheck size={18} />}
          color={notification.color}
          onClose={() => setNotification(null)}
          title={notification.title}
          mb="md"
        >
          {notification.message}
        </Notification>
      )}

      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="lg">
          Merit Cum Means (MCM) Scholarship Application
        </Title>

        <Stepper active={step} mb="xl" breakpoint="sm">
          <Stepper.Step
            label="Personal Details"
            description="Family & income info"
          />
          <Stepper.Step label="Documents" description="Upload required files" />
          <Stepper.Step
            label="Submitted"
            description="Application submitted"
            completed={submitted}
          />
        </Stepper>

        {/* Step 0: Personal/Family Details */}
        {step === 0 && (
          <form onSubmit={handleNext}>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Father's Occupation *"
                  placeholder="Select father's occupation"
                  data={[
                    { value: "government", label: "Government" },
                    { value: "private", label: "Private" },
                    { value: "public", label: "Public" },
                    { value: "business", label: "Business" },
                    { value: "medical", label: "Medical" },
                    { value: "consultant", label: "Consultant" },
                    { value: "pensioners", label: "Pensioners" },
                  ]}
                  mt="md"
                  {...form.getInputProps("father_occ")}
                />
                <TextInput
                  label="Father's Occupation Description *"
                  placeholder="Describe father's occupation"
                  mt="md"
                  {...form.getInputProps("father_occ_desc")}
                  maxLength={200}
                />
                <NumberInput
                  label="Father's Annual Income *"
                  placeholder="Enter father's income (₹)"
                  mt="md"
                  min={0}
                  {...form.getInputProps("income_father")}
                />
                <Select
                  label="Mother's Occupation *"
                  placeholder="Select mother's occupation"
                  data={[
                    { value: "EMPLOYED", label: "Employed" },
                    { value: "HOUSE_WIFE", label: "House Wife" },
                  ]}
                  mt="md"
                  {...form.getInputProps("mother_occ")}
                />
                <TextInput
                  label="Mother's Occupation Description *"
                  placeholder="Describe mother's occupation"
                  mt="md"
                  {...form.getInputProps("mother_occ_desc")}
                  maxLength={200}
                />
                <NumberInput
                  label="Mother's Annual Income *"
                  placeholder="Enter mother's income (₹)"
                  mt="md"
                  min={0}
                  {...form.getInputProps("income_mother")}
                />
                <NumberInput
                  label="Other Sources Annual Income *"
                  placeholder="Enter other income (₹)"
                  mt="md"
                  min={0}
                  {...form.getInputProps("income_other")}
                />
                <NumberInput
                  label="Total Annual Income *"
                  placeholder="Enter total annual income (₹)"
                  mt="md"
                  min={0}
                  {...form.getInputProps("annual_income")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Brother's Name"
                  placeholder="Enter brother's name"
                  mt="md"
                  {...form.getInputProps("brother_name")}
                  maxLength={200}
                />
                <TextInput
                  label="Brother's Occupation"
                  placeholder="Enter brother's occupation"
                  mt="md"
                  {...form.getInputProps("brother_occupation")}
                  maxLength={200}
                />
                <TextInput
                  label="Sister's Name"
                  placeholder="Enter sister's name"
                  mt="md"
                  {...form.getInputProps("sister_name")}
                  maxLength={200}
                />
                <TextInput
                  label="Sister's Occupation"
                  placeholder="Enter sister's occupation"
                  mt="md"
                  {...form.getInputProps("sister_occupation")}
                  maxLength={200}
                />
                <NumberInput
                  label="No. of Four-Wheeler Vehicles *"
                  mt="md"
                  min={0}
                  max={100}
                  {...form.getInputProps("four_wheeler")}
                />
                <TextInput
                  label="Four-Wheeler Description"
                  placeholder="Make/model of vehicles"
                  mt="md"
                  {...form.getInputProps("four_wheeler_desc")}
                  maxLength={200}
                />
                <NumberInput
                  label="No. of Two-Wheeler Vehicles *"
                  mt="md"
                  min={0}
                  max={100}
                  {...form.getInputProps("two_wheeler")}
                />
                <TextInput
                  label="Two-Wheeler Description"
                  placeholder="Make/model of vehicles"
                  mt="md"
                  {...form.getInputProps("two_wheeler_desc")}
                  maxLength={200}
                />
                <Select
                  label="House Type *"
                  placeholder="Select house type"
                  data={[
                    { value: "RENTED", label: "Rented" },
                    { value: "OWNED", label: "Owned" },
                  ]}
                  mt="md"
                  {...form.getInputProps("house")}
                />
                <NumberInput
                  label="Plot Area (sq ft) *"
                  mt="md"
                  min={0}
                  {...form.getInputProps("plot_area")}
                />
                <NumberInput
                  label="Constructed Area (sq ft) *"
                  mt="md"
                  min={0}
                  {...form.getInputProps("constructed_area")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="School Name *"
                  placeholder="Sibling's school name (if applicable)"
                  mt="md"
                  {...form.getInputProps("school_name")}
                  maxLength={200}
                />
                <NumberInput
                  label="School Fee (₹) *"
                  mt="md"
                  min={0}
                  {...form.getInputProps("school_fee")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="College Name *"
                  placeholder="Your college name"
                  mt="md"
                  {...form.getInputProps("college_name")}
                  maxLength={200}
                />
                <NumberInput
                  label="College Fee (₹) *"
                  mt="md"
                  min={0}
                  {...form.getInputProps("college_fee")}
                />
                <TextInput
                  label="Bank Name *"
                  placeholder="Your bank name"
                  mt="md"
                  {...form.getInputProps("bank_name")}
                  maxLength={200}
                />
                <NumberInput
                  label="Loan Amount (₹) *"
                  mt="md"
                  min={0}
                  {...form.getInputProps("loan_amount")}
                />
              </Grid.Col>
            </Grid>
            <Group position="apart" mt="xl">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button type="submit" color="blue" disabled={duplicateWarning}>
                Next: Upload Documents
              </Button>
            </Group>
          </form>
        )}

        {/* Step 1: Document Upload */}
        {step === 1 && (
          <>
            <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="lg">
              Please upload all required documents. All fields marked with * are
              mandatory.
            </Alert>
            <Grid>
              {documentFields.map((doc) => (
                <Grid.Col key={doc.id} span={{ base: 12, sm: 6 }}>
                  <Text size="sm" weight={500} mb={4}>
                    {doc.name} *
                  </Text>
                  <FileButton
                    onChange={(file) => handleFileChange(doc.id, file)}
                    accept={doc.type}
                  >
                    {(fileButtonProps) => (
                      <Button
                        onClick={fileButtonProps.onClick}
                        fullWidth
                        color={
                          uploadStatus[doc.id] === "success" ? "green" : "gray"
                        }
                        leftIcon={
                          uploadStatus[doc.id] === "success" ? (
                            <IconCircleCheck size={16} />
                          ) : null
                        }
                        variant={
                          uploadStatus[doc.id] === "success"
                            ? "filled"
                            : "outline"
                        }
                      >
                        {uploadStatus[doc.id] === "success"
                          ? `✓ ${doc.name} uploaded`
                          : `Upload ${doc.name}`}
                      </Button>
                    )}
                  </FileButton>
                </Grid.Col>
              ))}
            </Grid>

            {/* BR-SPACS-004: Show progress */}
            <Alert
              mt="md"
              color={allDocumentsUploaded ? "green" : "yellow"}
              icon={
                allDocumentsUploaded ? (
                  <IconCircleCheck size={16} />
                ) : (
                  <IconAlertCircle size={16} />
                )
              }
            >
              {allDocumentsUploaded
                ? "All documents uploaded! You can now submit."
                : `${Object.values(uploadStatus).filter((s) => s === "success").length} / ${documentFields.length} documents uploaded.`}
            </Alert>

            <Group position="apart" mt="xl">
              <Button variant="default" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                color="blue"
                onClick={handleSubmit}
                loading={submitting}
                disabled={!allDocumentsUploaded || duplicateWarning}
              >
                Submit Application
              </Button>
            </Group>
          </>
        )}

        {/* Step 2: Success */}
        {step === 2 && submitted && (
          <Alert
            icon={<IconCircleCheck size={20} />}
            color="green"
            title="Application Submitted Successfully!"
          >
            Your MCM Scholarship application has been submitted. You will
            receive a notification when the status changes. You can track your
            application under <strong>Scholarship Status</strong>.
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

ScholarshipForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default ScholarshipForm;
