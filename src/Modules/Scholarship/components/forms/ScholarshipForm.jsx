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
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { submitMCMApplicationsRoute } from "../../../../routes/SPACSRoutes";

const SCHOLARSHIP_AWARD_MAP = {
  "Merit Cum Means Scholarship": "Merit-cum-Means Scholarship",
  "Single Parent Scholarship": "Merit-cum-Means Scholarship",
};

export default function ScholarshipForm({
  onCancel,
  onSubmitted,
  editData,
  initialType,
}) {
  const user = useSelector((state) => state.user);
  const studentId = user?.username || user?.roll_no || "Student";
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState(editData?.category || "");
  const [cpi, setCpi] = useState(editData?.cpi || "");
  const [scholarshipType, setScholarshipType] = useState(
    editData?.scholarship_type ||
      editData?.type_name ||
      initialType ||
      "Merit Cum Means Scholarship",
  );
  const [academicYear, setAcademicYear] = useState(
    editData?.academic_year || "2024-25",
  );
  const [semester, setSemester] = useState(
    editData?.semester?.toString() || "",
  );
  const [remarks, setRemarks] = useState(editData?.remarks || "");

  // Family Details
  const [fatherOcc, setFatherOcc] = useState(editData?.father_occ || "private");
  const [fatherOccDesc, setFatherOccDesc] = useState(
    editData?.father_occ_desc || "",
  );
  const [motherOcc, setMotherOcc] = useState(
    editData?.mother_occ || "HOUSE_WIFE",
  );
  const [motherOccDesc, setMotherOccDesc] = useState(
    editData?.mother_occ_desc || "",
  );
  const [incomeFather, setIncomeFather] = useState(
    editData?.income_father || "",
  );
  const [incomeMother, setIncomeMother] = useState(
    editData?.income_mother || 0,
  );
  const [incomeOther, setIncomeOther] = useState(editData?.income_other || 0);

  // Document states
  const [documents, setDocuments] = useState({
    income_certificate: null,
    marksheet: null,
    fee_receipt: null,
    bank_details: null,
    affidavit: null,
    aadhar_card: null,
  });

  const handleDocumentChange = (field, file) => {
    setDocuments((prev) => ({ ...prev, [field]: file }));
  };

  const [errors, setErrors] = useState({});

  const fatherOccOptions = [
    { value: "government", label: "Government" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
    { value: "business", label: "Business" },
    { value: "medical", label: "Medical" },
    { value: "consultant", label: "Consultant" },
    { value: "pensioners", label: "Pensioner" },
  ];

  const motherOccOptions = [
    { value: "EMPLOYED", label: "Employed" },
    { value: "HOUSE_WIFE", label: "Housewife" },
  ];

  const categoryOptions = [
    { value: "ST", label: "ST" },
    { value: "SC", label: "SC" },
    { value: "OBC", label: "OBC" },
    { value: "GEN", label: "General" },
  ];

  const scholarshipOptions = [
    {
      value: "Merit Cum Means Scholarship",
      label: "Merit Cum Means Scholarship",
    },
    { value: "Single Parent Scholarship", label: "Single Parent Scholarship" },
  ];

  const validate = () => {
    const e = {};
    if (!category) e.category = "Required";
    if (!cpi && cpi !== 0) e.cpi = "Required";
    if (cpi && (cpi < 0 || cpi > 10)) e.cpi = "Invalid CPI";
    if (!scholarshipType) e.scholarshipType = "Required";
    if (!academicYear) e.academicYear = "Required";
    if (!semester) e.semester = "Required";
    if (!incomeFather && incomeFather !== 0) e.incomeFather = "Required";
    if (incomeFather && incomeFather < 0) e.incomeFather = "Invalid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all required fields correctly.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    const token = localStorage.getItem("authToken");

    const backendAwardName =
      SCHOLARSHIP_AWARD_MAP[scholarshipType] || scholarshipType;
    formData.append("award", backendAwardName);
    formData.append("award_type", backendAwardName);

    if (editData?.id) formData.append("application_id", editData.id);

    formData.append("category", category);
    formData.append("cpi", cpi);
    formData.append("academic_year", academicYear);
    formData.append("semester", semester);
    formData.append("remarks", remarks);

    formData.append("father_occ", fatherOcc);
    formData.append("father_occ_desc", fatherOccDesc || "N/A");
    formData.append("mother_occ", motherOcc);
    formData.append("mother_occ_desc", motherOccDesc || "N/A");
    formData.append("income_father", incomeFather || 0);
    formData.append("income_mother", incomeMother || 0);
    formData.append("income_other", incomeOther || 0);

    // Append documents
    Object.entries(documents).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      const response = await fetch(submitMCMApplicationsRoute, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Token ${token}` },
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: editData ? "Application updated!" : "Application submitted!",
          color: "green",
        });
        if (onSubmitted) onSubmitted();
      } else if (response.status === 409) {
        notifications.show({
          title: "Duplicate",
          message: "You already have an active application.",
          color: "orange",
        });
      } else {
        const data = await response.json();
        notifications.show({
          title: "Error",
          message: data?.detail || "Failed to submit.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Network error.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentDocs = [
    { key: "income_certificate", label: "Income Certificate" },
    { key: "marksheet", label: "Marksheet" },
    { key: "fee_receipt", label: "Fee Receipt" },
    { key: "bank_details", label: "Bank Account Details" },
    { key: "affidavit", label: "Affidavit" },
    { key: "aadhar_card", label: "Aadhar Card" },
  ];

  return (
    <Container size="lg">
      <Paper radius="md" p="xl" withBorder shadow="sm">
        <Title order={2} mb="md">
          {editData
            ? "Edit Scholarship Application"
            : "New Scholarship Application"}
        </Title>
        <Text size="sm" color="dimmed" mb="xl">
          Applying as: <strong>{studentId}</strong>
        </Text>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Divider label="Basic Information" mb="xl" />
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Scholarship Type"
                data={scholarshipOptions}
                value={scholarshipType}
                onChange={setScholarshipType}
                required
                error={errors.scholarshipType}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Category"
                data={categoryOptions}
                value={category}
                onChange={setCategory}
                required
                error={errors.category}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="CPI"
                value={cpi}
                onChange={setCpi}
                required
                error={errors.cpi}
                min={0}
                max={10}
                precision={2}
                step={0.1}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                error={errors.academicYear}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Semester"
                data={Array.from({ length: 8 }, (_, i) => String(i + 1))}
                value={semester}
                onChange={setSemester}
                required
                error={errors.semester}
                mb="md"
              />
            </Grid.Col>
          </Grid>

          {/* Income Details */}
          <Divider label="Family Income (Annual)" mt="xl" mb="xl" />
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Father's Income (₹)"
                value={incomeFather}
                onChange={setIncomeFather}
                required
                error={errors.incomeFather}
                min={0}
                thousandSeparator=","
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Mother's Income (₹)"
                value={incomeMother}
                onChange={setIncomeMother}
                min={0}
                thousandSeparator=","
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Other Sources Income (₹)"
                value={incomeOther}
                onChange={setIncomeOther}
                min={0}
                thousandSeparator=","
                mb="md"
              />
            </Grid.Col>
          </Grid>

          {/* Occupations */}
          <Divider label="Family Occupation" mt="xl" mb="xl" />
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Father's Occupation"
                data={fatherOccOptions}
                value={fatherOcc}
                onChange={setFatherOcc}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Father's Occupation Details"
                value={fatherOccDesc}
                onChange={(e) => setFatherOccDesc(e.target.value)}
                placeholder="e.g. Business details or Govt. Dept"
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Mother's Occupation"
                data={motherOccOptions}
                value={motherOcc}
                onChange={setMotherOcc}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Mother's Occupation Details"
                value={motherOccDesc}
                onChange={(e) => setMotherOccDesc(e.target.value)}
                mb="md"
              />
            </Grid.Col>
          </Grid>

          {/* Documents & Remarks */}
          <Divider label="Documents & Additional Details" mt="xl" mb="xl" />
          <Grid gutter="xl">
            {currentDocs.map((doc) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={doc.key}>
                <FileInput
                  label={doc.label}
                  placeholder={`Upload ${doc.label}`}
                  leftSection={<IconUpload size={16} />}
                  value={documents[doc.key]}
                  onChange={(file) => handleDocumentChange(doc.key, file)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  mb="md"
                />
                {editData?.[doc.key] && !documents[doc.key] && (
                  <Text size="sm" mt="xs" color="blue">
                    ✓ Attached:{" "}
                    <a
                      href={editData[doc.key]}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      View Saved Document
                    </a>
                  </Text>
                )}
              </Grid.Col>
            ))}
            <Grid.Col span={12}>
              <Textarea
                label="Additional Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                minRows={3}
                placeholder="Any special circumstances or details we should know about..."
                mb="xl"
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl" pt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              radius="md"
            >
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={submitting} radius="md">
              {editData ? "Update Application" : "Submit Application"}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

ScholarshipForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmitted: PropTypes.func,
  initialType: PropTypes.string,
  editData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    cpi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    scholarship_type: PropTypes.string,
    type_name: PropTypes.string,
    academic_year: PropTypes.string,
    semester: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remarks: PropTypes.string,
    father_occ: PropTypes.string,
    father_occ_desc: PropTypes.string,
    mother_occ: PropTypes.string,
    mother_occ_desc: PropTypes.string,
    income_father: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    income_mother: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    income_other: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    income_certificate: PropTypes.string,
    marksheet: PropTypes.string,
    fee_receipt: PropTypes.string,
    bank_details: PropTypes.string,
    affidavit: PropTypes.string,
    aadhar_card: PropTypes.string,
  }),
};
