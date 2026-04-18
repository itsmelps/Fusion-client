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
  Stack,
  Divider,
  Badge,
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

/* ── Reusable section wrapper ──────────────────────────────────────── */
function FormSection({ title, children }) {
  return (
    <Paper withBorder p="lg" radius="md" style={{ backgroundColor: "#FAFBFC" }}>
      <Title order={5} mb="md" c="blue.7" fw={700}>
        {title}
      </Title>
      {children}
    </Paper>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ScholarshipForm({ onCancel, onSubmitted, editData, initialType }) {
  const user = useSelector((state) => state.user);
  const studentId = user?.username || user?.roll_no || "Student";

  const [submitting, setSubmitting] = useState(false);

  // ── Form state ────────────────────────────────────────────────────
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
  const [document, setDocument] = useState(null);

  // -- Family Details --
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

  const [brotherName, setBrotherName] = useState(editData?.brother_name || "");
  const [brotherOccupation, setBrotherOccupation] = useState(
    editData?.brother_occupation || "",
  );
  const [sisterName, setSisterName] = useState(editData?.sister_name || "");
  const [sisterOccupation, setSisterOccupation] = useState(
    editData?.sister_occupation || "",
  );

  // -- Property --
  const [houseType, setHouseType] = useState(
    editData?.house?.toUpperCase() || "OWNED",
  );
  const [plotArea, setPlotArea] = useState(editData?.plot_area || "");
  const [constructedArea, setConstructedArea] = useState(
    editData?.constructed_area || "",
  );
  const [fourWheeler, setFourWheeler] = useState(editData?.four_wheeler || 0);
  const [fourWheelerDesc, setFourWheelerDesc] = useState(
    editData?.four_wheeler_desc || "",
  );
  const [twoWheeler, setTwoWheeler] = useState(editData?.two_wheeler || 0);
  const [twoWheelerDesc, setTwoWheelerDesc] = useState(
    editData?.two_wheeler_desc || "",
  );

  // -- Education & Bank --
  const [schoolName, setSchoolName] = useState(editData?.school_name || "");
  const [schoolFee, setSchoolFee] = useState(editData?.school_fee || "");
  const [collegeName, setCollegeName] = useState(
    editData?.college_name || "IIITDMJ",
  );
  const [collegeFee, setCollegeFee] = useState(editData?.college_fee || "");
  const [bankName, setBankName] = useState(editData?.bank_name || "");
  const [loanAmount, setLoanAmount] = useState(editData?.loan_amount || "");

  // Validation errors
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

  const houseOptions = [
    { value: "OWNED", label: "Owned" },
    { value: "RENTED", label: "Rented" },
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
    {
      value: "Single Parent Scholarship",
      label: "Single Parent Scholarship",
    },
  ];

  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    label: `Semester ${i + 1}`,
  }));

  // ── Validation ────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!category) e.category = "Category is required";
    if (!cpi && cpi !== 0) e.cpi = "CPI is required";
    if (cpi && (cpi < 0 || cpi > 10)) e.cpi = "CPI must be between 0 and 10";
    if (!scholarshipType) e.scholarshipType = "Scholarship type is required";
    if (!academicYear) e.academicYear = "Academic year is required";
    if (!semester) e.semester = "Semester is required";
    if (!incomeFather && incomeFather !== 0)
      e.incomeFather = "Father's income is required";
    if (incomeFather && incomeFather < 0)
      e.incomeFather = "Income cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all required fields correctly.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      const backendAwardName =
        SCHOLARSHIP_AWARD_MAP[scholarshipType] || scholarshipType;
      formData.append("award", backendAwardName);
      formData.append("award_type", backendAwardName);

      if (editData?.id) {
        formData.append("application_id", editData.id);
      }

      // Core details
      formData.append("category", category);
      formData.append("cpi", cpi);
      formData.append("academic_year", academicYear);
      formData.append("semester", semester);
      formData.append("remarks", remarks);

      // Family & Income
      formData.append("father_occ", fatherOcc);
      formData.append("father_occ_desc", fatherOccDesc || "N/A");
      formData.append("mother_occ", motherOcc);
      formData.append("mother_occ_desc", motherOccDesc || "N/A");
      formData.append("income_father", incomeFather || 0);
      formData.append("income_mother", incomeMother || 0);
      formData.append("income_other", incomeOther || 0);

      formData.append("brother_name", brotherName || "N/A");
      formData.append("brother_occupation", brotherOccupation || "N/A");
      formData.append("sister_name", sisterName || "N/A");
      formData.append("sister_occupation", sisterOccupation || "N/A");

      // Property & Vehicles
      formData.append("house", houseType);
      formData.append("plot_area", plotArea || 0);
      formData.append("constructed_area", constructedArea || 0);
      formData.append("four_wheeler", fourWheeler || 0);
      formData.append("four_wheeler_desc", fourWheelerDesc || "N/A");
      formData.append("two_wheeler", twoWheeler || 0);
      formData.append("two_wheeler_desc", twoWheelerDesc || "N/A");

      // Education & Bank
      formData.append("school_name", schoolName || "N/A");
      formData.append("school_fee", schoolFee || 0);
      formData.append("college_name", collegeName || "IIITDMJ");
      formData.append("college_fee", collegeFee || 0);
      formData.append("bank_name", bankName || "N/A");
      formData.append("loan_amount", loanAmount || 0);

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
          message: editData
            ? "Application updated successfully!"
            : "Application submitted successfully!",
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
    <Container size="md" mt="md" mb="xl">
      <Paper radius="md" p="xl" withBorder shadow="sm">
        {/* ── Header ──────────────────────────────────────────────── */}
        <Group justify="space-between" align="flex-start" mb="lg">
          <div>
            <Title order={3} fw={800} style={{ letterSpacing: "-0.5px" }}>
              {editData
                ? "Edit Scholarship Application"
                : "New Scholarship Application"}
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Applying as{" "}
              <Text component="span" fw={600} c="blue">
                {studentId}
              </Text>
            </Text>
          </div>
          {editData && (
            <Badge color="yellow" variant="light" size="lg">
              Editing
            </Badge>
          )}
        </Group>

        <Stack gap="lg">
          {/* ── Section 1: Basic Information ───────────────────────── */}
          <FormSection title="1. Basic Information">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Scholarship Type"
                  placeholder="Select type"
                  data={scholarshipOptions}
                  value={scholarshipType}
                  onChange={setScholarshipType}
                  withAsterisk
                  error={errors.scholarshipType}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Category"
                  placeholder="Select your category"
                  data={categoryOptions}
                  value={category}
                  onChange={setCategory}
                  withAsterisk
                  error={errors.category}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
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
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Academic Year"
                  placeholder="2024-25"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  withAsterisk
                  error={errors.academicYear}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Select
                  label="Semester"
                  placeholder="Select semester"
                  data={semesterOptions}
                  value={semester}
                  onChange={setSemester}
                  withAsterisk
                  error={errors.semester}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Section 2: Family Income ───────────────────────────── */}
          <FormSection title="2. Family Income Details">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Father's Annual Income (₹)"
                  placeholder="e.g. 300000"
                  value={incomeFather}
                  onChange={setIncomeFather}
                  withAsterisk
                  error={errors.incomeFather}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Mother's Annual Income (₹)"
                  placeholder="e.g. 0"
                  value={incomeMother}
                  onChange={setIncomeMother}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Other Source Income (₹)"
                  placeholder="e.g. 0"
                  value={incomeOther}
                  onChange={setIncomeOther}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Section 3: Parent Occupation ───────────────────────── */}
          <FormSection title="3. Parent Occupation">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Father's Occupation"
                  data={fatherOccOptions}
                  value={fatherOcc}
                  onChange={setFatherOcc}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Father's Occupation Details"
                  placeholder="Company name, role, etc."
                  value={fatherOccDesc}
                  onChange={(e) => setFatherOccDesc(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Mother's Occupation"
                  data={motherOccOptions}
                  value={motherOcc}
                  onChange={setMotherOcc}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Mother's Occupation Details"
                  placeholder="Role details if applicable"
                  value={motherOccDesc}
                  onChange={(e) => setMotherOccDesc(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Section 4: Siblings ────────────────────────────────── */}
          <FormSection title="4. Siblings Information">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Brother's Name"
                  placeholder="Enter name or N/A"
                  value={brotherName}
                  onChange={(e) => setBrotherName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Brother's Occupation"
                  placeholder="Student, Working, etc."
                  value={brotherOccupation}
                  onChange={(e) => setBrotherOccupation(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Sister's Name"
                  placeholder="Enter name or N/A"
                  value={sisterName}
                  onChange={(e) => setSisterName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Sister's Occupation"
                  placeholder="Student, Working, etc."
                  value={sisterOccupation}
                  onChange={(e) => setSisterOccupation(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Section 5: Property & Assets ───────────────────────── */}
          <FormSection title="5. Property & Assets">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Select
                  label="House Type"
                  data={houseOptions}
                  value={houseType}
                  onChange={setHouseType}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Plot Area (sq ft)"
                  placeholder="e.g. 1200"
                  value={plotArea}
                  onChange={setPlotArea}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Constructed Area (sq ft)"
                  placeholder="e.g. 800"
                  value={constructedArea}
                  onChange={setConstructedArea}
                  min={0}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider
                  label="Vehicles"
                  labelPosition="left"
                  my="xs"
                  color="gray.3"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 3 }}>
                <NumberInput
                  label="Four Wheelers"
                  value={fourWheeler}
                  onChange={setFourWheeler}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 9 }}>
                <TextInput
                  label="Four Wheeler Details"
                  placeholder="Make, Model, Year"
                  value={fourWheelerDesc}
                  onChange={(e) => setFourWheelerDesc(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <NumberInput
                  label="Two Wheelers"
                  value={twoWheeler}
                  onChange={setTwoWheeler}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 9 }}>
                <TextInput
                  label="Two Wheeler Details"
                  placeholder="Make, Model, Year"
                  value={twoWheelerDesc}
                  onChange={(e) => setTwoWheelerDesc(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Section 6: Education & Bank ────────────────────────── */}
          <FormSection title="6. Education & Loan Details">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Previous School Name"
                  placeholder="e.g. Delhi Public School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="School Annual Fee (₹)"
                  placeholder="e.g. 50000"
                  value={schoolFee}
                  onChange={setSchoolFee}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="College Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="College Annual Fee (₹)"
                  placeholder="e.g. 90250"
                  value={collegeFee}
                  onChange={setCollegeFee}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider
                  label="Education Loan"
                  labelPosition="left"
                  my="xs"
                  color="gray.3"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Bank Name"
                  placeholder="e.g. State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Loan Amount (₹)"
                  placeholder="e.g. 200000"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Section 7: Documents & Remarks ────────────────────── */}
          <FormSection title="7. Documents & Remarks">
            <Grid gutter="md">
              <Grid.Col span={12}>
                <FileInput
                  label="Income Certificate / Supporting Document"
                  description="Upload PDF, DOC, or image files (max 5MB)"
                  placeholder="Click to select file"
                  leftSection={<IconUpload size={16} />}
                  value={document}
                  onChange={setDocument}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {editData?.income_certificate && !document && (
                  <Text size="xs" mt="xs" c="blue">
                    📎 Existing document on file.{" "}
                    <a
                      href={editData.income_certificate}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontWeight: 600, color: "inherit" }}
                    >
                      View current
                    </a>
                  </Text>
                )}
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Additional Remarks"
                  placeholder="Any other relevant details you wish to provide..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  minRows={3}
                  maxRows={6}
                  autosize
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          {/* ── Actions ────────────────────────────────────────────── */}
          <Divider />
          <Group justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={onCancel} size="md">
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSubmit}
              loading={submitting}
              size="md"
              radius="md"
              style={{
                paddingLeft: 32,
                paddingRight: 32,
                fontWeight: 600,
              }}
            >
              {editData ? "Update Application" : "Submit Application"}
            </Button>
          </Group>
        </Stack>
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
    annual_income: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
    brother_name: PropTypes.string,
    brother_occupation: PropTypes.string,
    sister_name: PropTypes.string,
    sister_occupation: PropTypes.string,
    house: PropTypes.string,
    plot_area: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    constructed_area: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    four_wheeler: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    four_wheeler_desc: PropTypes.string,
    two_wheeler: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    two_wheeler_desc: PropTypes.string,
    school_name: PropTypes.string,
    school_fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    college_name: PropTypes.string,
    college_fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bank_name: PropTypes.string,
    loan_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    income_certificate: PropTypes.string,
  }),
};

export default ScholarshipForm;
