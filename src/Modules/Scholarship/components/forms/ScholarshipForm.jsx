/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  TextInput,
  Grid,
  Container,
  Paper,
  Title,
  Text,
  Group,
  Select,
  NumberInput,
  Textarea,
  FileInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { submitMCMApplicationsRoute } from "../../../../routes/SPACSRoutes";

/**
 * Award-type value → the string the backend's resolve_award_for_submission()
 * can translate into a DB Award_and_scholarship row.
 */
const SCHOLARSHIP_AWARD_MAP = {
  "Merit Cum Means Scholarship": "Merit-cum-Means Scholarship",
  "Single Parent Scholarship": "Merit-cum-Means Scholarship",
};

function ScholarshipForm({ onCancel, onSubmitted, editData }) {
  const user = useSelector((state) => state.user);
  const studentId = user?.username || user?.roll_no || "Student";

  const [submitting, setSubmitting] = useState(false);

  // ── Form state ────────────────────────────────────────────────────
  const [category, setCategory] = useState(editData?.category || "");
  const [cpi, setCpi] = useState(editData?.cpi || "");
  const [annualIncome, setAnnualIncome] = useState(
    editData?.annual_income || "",
  );
  const [scholarshipType, setScholarshipType] = useState(
    editData?.scholarship_type || editData?.type_name || "",
  );
  const [academicYear, setAcademicYear] = useState(
    editData?.academic_year || "2024-25",
  );
  const [semester, setSemester] = useState(
    editData?.semester?.toString() || "",
  );
  const [remarks, setRemarks] = useState(editData?.remarks || "");
  const [document, setDocument] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: "merit-based", label: "Merit-Based" },
    { value: "need-based", label: "Need-Based" },
  ];

  const scholarshipOptions = [
    {
      value: "Merit Cum Means Scholarship",
      label: "Merit Cum Means Scholarship",
    },
    {
      value: "Single Parent Scholarship",
      label: "Single Parent Scholarship",
    },
  ];

  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  // ── Validation ────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!category) e.category = "Category is required";
    if (!cpi && cpi !== 0) e.cpi = "CPI is required";
    if (!scholarshipType) e.scholarshipType = "Scholarship type is required";
    if (!academicYear) e.academicYear = "Academic year is required";
    if (!semester) e.semester = "Semester is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      // The backend's resolve_award_for_submission() reads 'award' or 'award_type'
      const backendAwardName =
        SCHOLARSHIP_AWARD_MAP[scholarshipType] || scholarshipType;
      formData.append("award", backendAwardName);
      formData.append("award_type", backendAwardName);

      // MCM-specific required fields with sensible defaults
      formData.append("father_occ", "private");
      formData.append("father_occ_desc", "N/A");
      formData.append("mother_occ", "HOUSE_WIFE");
      formData.append("mother_occ_desc", "N/A");
      formData.append("income_father", annualIncome || 0);
      formData.append("income_mother", 0);
      formData.append("income_other", 0);
      formData.append("annual_income", annualIncome || 0);
      formData.append("house", "OWNED");
      formData.append("school_name", "N/A");
      formData.append("school_fee", 0);
      formData.append("college_name", "IIITDMJ");
      formData.append("college_fee", 0);
      formData.append("bank_name", "N/A");
      formData.append("loan_amount", 0);
      formData.append("plot_area", 0);
      formData.append("constructed_area", 0);
      formData.append("four_wheeler", 0);
      formData.append("two_wheeler", 0);

      // Extra context fields
      formData.append("cpi", cpi);
      formData.append("category", category);
      formData.append("scholarship_type", scholarshipType);
      formData.append("academic_year", academicYear);
      formData.append("semester", semester);
      formData.append("remarks", remarks);

      if (document) {
        formData.append("income_certificate", document);
      }

      const response = await fetch(submitMCMApplicationsRoute, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Token ${token}` },
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "Application submitted successfully!",
          color: "green",
        });
        if (onSubmitted) onSubmitted();
      } else if (response.status === 409) {
        notifications.show({
          title: "Duplicate Application",
          message:
            "You already have an active application for this scholarship.",
          color: "orange",
        });
      } else {
        let errMsg = "Failed to submit application.";
        try {
          const data = await response.json();
          errMsg = data.detail || data.message || errMsg;
        } catch {
          // non-JSON response
        }
        notifications.show({
          title: "Error",
          message: errMsg,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      notifications.show({
        title: "Error",
        message: "Network error. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="lg" mt="md" mb="xl" px={{ base: "md", sm: "xl" }}>
      <Paper
        radius="md"
        p={{ base: "md", sm: "xl" }}
        withBorder
        shadow="sm"
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <Title order={3} mb={4} fw={700}>
          New Scholarship Application
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Applying as: {studentId}
        </Text>

        {/* ── Category ─────────────────────────────────────────────── */}
        <Select
          label="Category"
          placeholder="Select your category"
          data={categoryOptions}
          value={category}
          onChange={setCategory}
          withAsterisk
          error={errors.category}
          mb="lg"
          styles={{
            input: { height: 42 },
          }}
        />

        {/* ── CPI + Annual Family Income ───────────────────────────── */}
        <Group grow mb="lg" align="flex-start">
          <NumberInput
            label="CPI"
            placeholder="e.g. 8.5"
            value={cpi}
            onChange={setCpi}
            withAsterisk
            error={errors.cpi}
            min={0}
            max={10}
            step={0.1}
            decimalScale={2}
            styles={{
              input: { height: 42 },
            }}
          />
          <NumberInput
            label="Annual Family Income (₹)"
            placeholder="e.g. 300000"
            value={annualIncome}
            onChange={setAnnualIncome}
            min={0}
            styles={{
              input: { height: 42 },
            }}
          />
        </Group>

        {/* ── Scholarship Type ─────────────────────────────────────── */}
        <Select
          label="Scholarship Type"
          placeholder="Select scholarship type"
          data={scholarshipOptions}
          value={scholarshipType}
          onChange={setScholarshipType}
          withAsterisk
          error={errors.scholarshipType}
          mb="lg"
          styles={{
            input: { height: 42 },
          }}
        />

        {/* ── Academic Year + Semester ──────────────────────────────── */}
        <Group grow mb="lg" align="flex-start">
          <TextInput
            label="Academic Year"
            placeholder="2024-25"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            withAsterisk
            error={errors.academicYear}
            styles={{
              input: { height: 42 },
            }}
          />
          <Select
            label="Semester"
            placeholder=""
            data={semesterOptions}
            value={semester}
            onChange={setSemester}
            withAsterisk
            error={errors.semester}
            styles={{
              input: { height: 42 },
            }}
          />
        </Group>

        {/* ── Remarks ──────────────────────────────────────────────── */}
        <Textarea
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          minRows={3}
          mb="lg"
          styles={{
            input: { minHeight: 80 },
          }}
        />

        {/* ── Document Upload ──────────────────────────────────────── */}
        <FileInput
          label="Additional Supporting Documents (Optional)"
          placeholder="Upload a document if requested"
          leftSection={<IconUpload size={16} />}
          value={document}
          onChange={setDocument}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          mb="xl"
          styles={{
            input: { height: 42 },
          }}
        />

        {/* ── Actions ──────────────────────────────────────────────── */}
        <Group justify="flex-end" gap="md">
          <Button variant="default" onClick={onCancel} size="md">
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSubmit}
            loading={submitting}
            size="md"
          >
            Submit Application
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

ScholarshipForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmitted: PropTypes.func,
  editData: PropTypes.shape({
    category: PropTypes.string,
    cpi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    annual_income: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    scholarship_type: PropTypes.string,
    type_name: PropTypes.string,
    academic_year: PropTypes.string,
    semester: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remarks: PropTypes.string,
  }),
};

export default ScholarshipForm;
