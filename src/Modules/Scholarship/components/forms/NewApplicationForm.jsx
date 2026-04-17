import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Text,
  Paper,
  Grid,
  Select,
  NumberInput,
  TextInput,
  Textarea,
  Button,
  Group,
  FileButton,
  Box,
  Divider,
  Flex,
} from "@mantine/core";
import { UploadSimple } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";

function NewApplicationForm({ onCancel }) {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    cpi: "",
    income: "",
    type: "Merit Cum Means Scholarship",
    year: "2024-25",
    semester: "",
    remarks: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Logic for submission based on 'type'
      // This would hook into api.submitMCM or api.submitGold/Silver
      notifications.show({
        title: "Success",
        message: "Application submitted successfully",
        color: "green",
      });
      onCancel();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Submission failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      radius="md"
      p="xl"
      withBorder
      style={{ maxWidth: "1000px", margin: "0 auto" }}
    >
      <Text size="xl" fw={700} mb="xs">
        New Scholarship Application
      </Text>
      <Text size="sm" c="dimmed" mb="xl">
        Applying as: {user?.username || "23BCS268"}
      </Text>

      <Box mb="lg">
        <Select
          label="Category"
          placeholder="Select your category"
          required
          withAsterisk
          data={["General", "OBC", "SC", "ST"]}
          value={formData.category}
          onChange={(val) => setFormData({ ...formData, category: val })}
        />
      </Box>

      <Grid mb="lg">
        <Grid.Col span={6}>
          <NumberInput
            label="CPI"
            placeholder="e.g. 8.5"
            required
            withAsterisk
            precision={2}
            min={0}
            max={10}
            step={0.1}
            value={formData.cpi}
            onChange={(val) => setFormData({ ...formData, cpi: val })}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Annual Family Income (₹)"
            placeholder="e.g. 300000"
            required
            withAsterisk
            min={0}
            value={formData.income}
            onChange={(val) => setFormData({ ...formData, income: val })}
          />
        </Grid.Col>
      </Grid>

      <Box mb="lg">
        <Select
          label="Scholarship Type"
          placeholder="Select scholarship type"
          required
          withAsterisk
          data={[
            "Merit Cum Means Scholarship",
            "Director's Gold Medal",
            "Director's Silver Medal",
            "D&M Proficiency Medal",
          ]}
          value={formData.type}
          onChange={(val) => setFormData({ ...formData, type: val })}
        />
      </Box>

      <Grid mb="lg">
        <Grid.Col span={6}>
          <TextInput
            label="Academic Year"
            placeholder="2024-25"
            required
            withAsterisk
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Semester"
            placeholder="Select semester"
            required
            withAsterisk
            data={["1", "2", "3", "4", "5", "6", "7", "8"]}
            value={formData.semester}
            onChange={(val) => setFormData({ ...formData, semester: val })}
          />
        </Grid.Col>
      </Grid>

      <Box mb="lg">
        <Textarea
          label="Remarks"
          placeholder="Enter any additional remarks..."
          minRows={3}
          value={formData.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
        />
      </Box>

      <Box mb="xl">
        <Text fw={600} size="sm" mb="xs">
          Additional Supporting Documents (Optional)
        </Text>
        <Paper
          withBorder
          p="md"
          radius="sm"
          style={{ backgroundColor: "#F8F9FA" }}
        >
          <Group justify="center" gap="xs" style={{ cursor: "pointer" }}>
            <FileButton onChange={setFile} accept="application/pdf,image/*">
              {(props) => (
                <Flex
                  direction="column"
                  align="center"
                  onClick={props.onClick} // eslint-disable-line react/prop-types
                  onKeyDown={props.onKeyDown} // eslint-disable-line react/prop-types
                  style={{ cursor: "pointer", ...props.style }} // eslint-disable-line react/prop-types
                >
                  <UploadSimple size={24} c="dimmed" />
                  <Text size="sm" c="dimmed" mt="xs">
                    {file ? file.name : "Upload a document if requested"}
                  </Text>
                </Flex>
              )}
            </FileButton>
          </Group>
        </Paper>
      </Box>

      <Divider mb="xl" />

      <Group justify="flex-end">
        <Button variant="default" radius="md" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="blue"
          radius="md"
          size="md"
          loading={loading}
          onClick={handleSubmit}
        >
          Submit Application
        </Button>
      </Group>
    </Paper>
  );
}

NewApplicationForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default NewApplicationForm;
