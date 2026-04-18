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

        {/* ── CPI + Family Income ─────────────────────────── */}
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
          />
          <NumberInput
            label="Father's Annual Income (₹)"
            placeholder="e.g. 300000"
            value={incomeFather}
            onChange={setIncomeFather}
            withAsterisk
            error={errors.incomeFather}
            min={0}
          />
        </Group>

        <Group grow mb="lg" align="flex-start">
          <NumberInput
            label="Mother's Annual Income (₹)"
            value={incomeMother}
            onChange={setIncomeMother}
            min={0}
          />
          <NumberInput
            label="Other Source Income (₹)"
            value={incomeOther}
            onChange={setIncomeOther}
            min={0}
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
        />

        {/* ── Occupation Details ───────────────────────────────────── */}
        <Title order={5} mb="sm" mt="md">
          Occupation Details
        </Title>
        <Grid mb="lg">
          <Grid.Col span={6}>
            <Select
              label="Father's Occupation"
              data={fatherOccOptions}
              value={fatherOcc}
              onChange={setFatherOcc}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Father's Occupation Description"
              value={fatherOccDesc}
              onChange={(e) => setFatherOccDesc(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Mother's Occupation"
              data={motherOccOptions}
              value={motherOcc}
              onChange={setMotherOcc}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Mother's Occupation Description"
              value={motherOccDesc}
              onChange={(e) => setMotherOccDesc(e.target.value)}
            />
          </Grid.Col>
        </Grid>

        {/* ── Siblings Details ─────────────────────────────────────── */}
        <Title order={5} mb="sm" mt="md">
          Siblings Details
        </Title>
        <Grid mb="lg">
          <Grid.Col span={6}>
            <TextInput
              label="Brother's Name"
              value={brotherName}
              onChange={(e) => setBrotherName(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Brother's Occupation"
              value={brotherOccupation}
              onChange={(e) => setBrotherOccupation(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Sister's Name"
              value={sisterName}
              onChange={(e) => setSisterName(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Sister's Occupation"
              value={sisterOccupation}
              onChange={(e) => setSisterOccupation(e.target.value)}
            />
          </Grid.Col>
        </Grid>

        {/* ── Property & Vehicles ──────────────────────────────────── */}
        <Title order={5} mb="sm" mt="md">
          Property & Assets
        </Title>
        <Grid mb="lg">
          <Grid.Col span={4}>
            <Select
              label="House"
              data={houseOptions}
              value={houseType}
              onChange={setHouseType}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Plot Area (sq ft)"
              value={plotArea}
              onChange={setPlotArea}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Constructed Area (sq ft)"
              value={constructedArea}
              onChange={setConstructedArea}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput
              label="Four Wheeler Count"
              value={fourWheeler}
              onChange={setFourWheeler}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Four Wheeler Description"
              value={fourWheelerDesc}
              onChange={(e) => setFourWheelerDesc(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Two Wheeler Count"
              value={twoWheeler}
              onChange={setTwoWheeler}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Two Wheeler Description"
              value={twoWheelerDesc}
              onChange={(e) => setTwoWheelerDesc(e.target.value)}
            />
          </Grid.Col>
        </Grid>

        {/* ── Education & Bank ─────────────────────────────────────── */}
        <Title order={5} mb="sm" mt="md">
          Education & Financials
        </Title>
        <Grid mb="lg">
          <Grid.Col span={6}>
            <TextInput
              label="School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="School Fee"
              value={schoolFee}
              onChange={setSchoolFee}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Loan Amount (₹)"
              value={loanAmount}
              onChange={setLoanAmount}
            />
          </Grid.Col>
        </Grid>

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
        {editData?.income_certificate && (
          <Text size="sm" mt="-md" mb="xl">
            Current Document:{" "}
            <a
              href={editData.income_certificate}
              target="_blank"
              rel="noreferrer"
            >
              View Certificate
            </a>
          </Text>
        )}

        {/* ── Actions ──────────────────────────────────────────────── */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="default"
            onClick={onCancel}
            size="md"
            radius="md"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSubmit}
            loading={submitting}
            size="md"
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
