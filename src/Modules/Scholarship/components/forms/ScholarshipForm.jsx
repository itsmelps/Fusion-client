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
  Stack,
  Divider,
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
  // ── Form state ────────────────────────────────────────────────────
  const [category, setCategory] = useState(editData?.category || "");
  const [cpi, setCpi] = useState(editData?.cpi || "");
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

  // -- Family Details --
  const [fatherOcc, setFatherOcc] = useState(editData?.father_occ || "private");
  const [fatherOccDesc, setFatherOccDesc] = useState(
    editData?.father_occ_desc || "",
  );
  const [motherOcc, setMotherOcc] = useState(
    editData?.mother_occ || "housewife",
  );
  const [motherOccDesc, setMotherOccDesc] = useState(
    editData?.mother_occ_desc || "",
  );

  const [incomeFather, setIncomeFather] = useState(
    editData?.income_father || "",
  );
  const [incomeMother, setIncomeMother] = useState(
    editData?.income_mother || "0",
  );
  const [incomeOther, setIncomeOther] = useState(editData?.income_other || "0");

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
    editData?.house?.toLowerCase() || "owned",
  );
  const [plotArea, setPlotArea] = useState(editData?.plot_area || "");
  const [constructedArea, setConstructedArea] = useState(
    editData?.constructed_area || "",
  );
  const [fourWheeler, setFourWheeler] = useState(editData?.four_wheeler || "");
  const [fourWheelerDesc, setFourWheelerDesc] = useState(
    editData?.four_wheeler_desc || "",
  );
  const [twoWheeler, setTwoWheeler] = useState(editData?.two_wheeler || "");
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
    { value: "pensioner", label: "Pensioner" },
    { value: "other", label: "Other" },
  ];

  const motherOccOptions = [
    ...fatherOccOptions,
    { value: "housewife", label: "Housewife" },
  ];

  const houseOptions = [
    { value: "owned", label: "Owned" },
    { value: "rented", label: "Rented" },
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
    if (!incomeFather && incomeFather !== 0)
      e.incomeFather = "Father's income is required";
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

      formData.append("brother_name", brotherName);
      formData.append("brother_occupation", brotherOccupation);
      formData.append("sister_name", sisterName);
      formData.append("sister_occupation", sisterOccupation);

      // Property & Vehicles
      formData.append("house", houseType.toUpperCase());
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
        <Title order={3} mb={4} fw={800} style={{ letterSpacing: "-0.5px" }}>
          {editData
            ? "Edit Scholarship Application"
            : "New Scholarship Application"}
        </Title>
        <Text size="sm" c="dimmed" mb="xl">
          Applying as:{" "}
          <Text component="span" fw={600} c="blue">
            {studentId}
          </Text>
        </Text>

        <Stack gap="xl">
          {/* ── Category & Basic Info ─────────────────────────────── */}
          <Paper
            withBorder
            p="md"
            radius="md"
            style={{ backgroundColor: "#fafafa" }}
          >
            <Title order={6} mb="md" tt="uppercase" c="dimmed" fw={700}>
              Basic Information
            </Title>
            <Grid gutter="lg">
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
            </Grid>
          </Paper>

          {/* ── Income Details ────────────────────────────────────── */}
          <section>
            <Title order={5} mb="md" fw={700}>
              Income Details
            </Title>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Father's Annual Income (₹)"
                  placeholder="e.g. 300000"
                  value={incomeFather}
                  onChange={setIncomeFather}
                  withAsterisk
                  error={errors.incomeFather}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Mother's Annual Income (₹)"
                  value={incomeMother}
                  onChange={setIncomeMother}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Other Source Income (₹)"
                  value={incomeOther}
                  onChange={setIncomeOther}
                  min={0}
                />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          {/* ── Occupation Details ─────────────────────────────────── */}
          <section>
            <Title order={5} mb="md" fw={700}>
              Occupation Details
            </Title>
            <Grid gutter="lg">
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
                  label="Father's Occupation Description"
                  placeholder="Company name, rank, etc."
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
                  label="Mother's Occupation Description"
                  placeholder="Role details if any"
                  value={motherOccDesc}
                  onChange={(e) => setMotherOccDesc(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          {/* ── Siblings Details ───────────────────────────────────── */}
          <section>
            <Title order={5} mb="md" fw={700}>
              Siblings Details
            </Title>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Brother's Name"
                  value={brotherName}
                  onChange={(e) => setBrotherName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Brother's Occupation"
                  value={brotherOccupation}
                  onChange={(e) => setBrotherOccupation(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Sister's Name"
                  value={sisterName}
                  onChange={(e) => setSisterName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Sister's Occupation"
                  value={sisterOccupation}
                  onChange={(e) => setSisterOccupation(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          {/* ── Property & Vehicles ────────────────────────────────── */}
          <section>
            <Title order={5} mb="md" fw={700}>
              Property & Assets
            </Title>
            <Grid gutter="lg">
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
                  value={plotArea}
                  onChange={setPlotArea}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Constructed Area (sq ft)"
                  value={constructedArea}
                  onChange={setConstructedArea}
                  min={0}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Four Wheeler Count"
                  value={fourWheeler}
                  onChange={setFourWheeler}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Four Wheeler Description"
                  placeholder="Model, Year"
                  value={fourWheelerDesc}
                  onChange={(e) => setFourWheelerDesc(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Two Wheeler Count"
                  value={twoWheeler}
                  onChange={setTwoWheeler}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Two Wheeler Description"
                  placeholder="Make, Year"
                  value={twoWheelerDesc}
                  onChange={(e) => setTwoWheelerDesc(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          {/* ── Education & Bank ───────────────────────────────────── */}
          <section>
            <Title order={5} mb="md" fw={700}>
              Education & Financials
            </Title>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="School Fee (Annual)"
                  value={schoolFee}
                  onChange={setSchoolFee}
                  min={0}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Bank Name"
                  placeholder="e.g. SBI"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Educational Loan Amount (₹)"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  min={0}
                />
              </Grid.Col>
            </Grid>
          </section>

          {/* ── Submission Metadata ────────────────────────────────── */}
          <Paper
            withBorder
            p="md"
            radius="md"
            style={{ borderStyle: "dashed" }}
          >
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Academic Year"
                  placeholder="2024-25"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  withAsterisk
                  error={errors.academicYear}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
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
              <Grid.Col span={12}>
                <Textarea
                  label="Additional Remarks"
                  placeholder="Any other details you want to provide..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  minRows={3}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* ── Document Upload ────────────────────────────────────── */}
          <section>
            <FileInput
              label="Income Certificate / Supporting Documents"
              placeholder="Select PDF or Image"
              leftSection={<IconUpload size={16} />}
              value={document}
              onChange={setDocument}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {editData?.income_certificate && (
              <Text size="sm" mt="xs" c="blue">
                Current Document:{" "}
                <a
                  href={editData.income_certificate}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: 600, color: "inherit" }}
                >
                  View Details
                </a>
              </Text>
            )}
          </section>

          {/* ── Actions ────────────────────────────────────────────── */}
          <Group justify="flex-end" gap="md" mt="xl">
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
                paddingLeft: 40,
                paddingRight: 40,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(34, 139, 230, 0.25)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
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
