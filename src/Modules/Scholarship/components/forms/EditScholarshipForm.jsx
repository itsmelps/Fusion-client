import { useState } from "react";
import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  Group,
  Text,
  Grid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { updateCatalog } from "../../services/api";

function EditScholarshipForm({ scholarship, onCancel, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    award_name: scholarship.award_name || "",
    catalog: scholarship.catalog || "",
    amount: scholarship.amount || scholarship.income_ceiling || 0, // Fallback as amount is not strictly in the model we saw, except implicitly
    cpi_cutoff: scholarship.cpi_cutoff || 0.0,
    income_ceiling: scholarship.income_ceiling || 0,
    eligible_programme: scholarship.eligible_programme || "all",
    frequency: "Annual",
    max_backlogs: 0,
  });

  // Basic classification from catalog text since model doesn't have explicit category
  const isMerit = formData.catalog.toLowerCase().includes("merit");
  const [category, setCategory] = useState(
    isMerit ? "Merit-based" : "Need-based",
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // In a real scenario, we'd send all fields if the backend supported them.
      // Based on our plan, we submit them to the updated endpoint.
      await updateCatalog(scholarship.id, {
        catalog: formData.catalog,
        award_name: formData.award_name,
        cpi_cutoff: formData.cpi_cutoff,
        income_ceiling: formData.income_ceiling,
        eligible_programme: formData.eligible_programme,
        publish: scholarship.publish_flag,
      });

      notifications.show({
        title: "Success",
        message: "Scholarship type updated successfully",
        color: "green",
      });
      if (onSaved) onSaved();
    } catch (err) {
      notifications.show({
        title: "Update Failed",
        message: err.message || "Could not update scholarship",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Text size="xl" fw={700} mb="lg">
        Edit Scholarship Type
      </Text>

      <Grid gutter="lg">
        <Grid.Col span={12}>
          <TextInput
            label="Name"
            value={formData.award_name}
            onChange={(e) => handleChange("award_name", e.currentTarget.value)}
            disabled // Often name shouldn't change to not break logic, but we make it read-only
            withAsterisk
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label="Category"
            data={["Merit-based", "Need-based"]}
            value={category}
            onChange={setCategory}
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label="Frequency"
            data={["Annual", "Semester"]}
            value={formData.frequency}
            onChange={(val) => handleChange("frequency", val)}
            withAsterisk
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Description"
            value={formData.catalog}
            onChange={(e) => handleChange("catalog", e.currentTarget.value)}
            minRows={3}
            withAsterisk
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Amount (INR)"
            value={formData.amount}
            onChange={(val) => handleChange("amount", val)}
            prefix="₹ "
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Max Backlogs Allowed"
            value={formData.max_backlogs}
            onChange={(val) => handleChange("max_backlogs", val)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="CPI Cutoff"
            value={formData.cpi_cutoff}
            onChange={(val) => handleChange("cpi_cutoff", val)}
            decimalScale={2}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Annual Family Income Limit (₹)"
            value={formData.income_ceiling}
            onChange={(val) => handleChange("income_ceiling", val)}
            prefix="₹ "
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Eligibility Criteria"
            value="CPI > 8.0 and family income < 8 LPA" // Placeholder
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Applicable Categories (comma-separated, e.g. GEN,SC,ST,OBC)"
            value="GEN,OBC,SC,ST" // Placeholder
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button color="blue" onClick={handleUpdate} loading={loading}>
          Update
        </Button>
      </Group>
    </div>
  );
}

EditScholarshipForm.propTypes = {
  scholarship: PropTypes.shape({
    id: PropTypes.number,
    award_name: PropTypes.string,
    catalog: PropTypes.string,
    amount: PropTypes.number,
    cpi_cutoff: PropTypes.number,
    income_ceiling: PropTypes.number,
    eligible_programme: PropTypes.string,
    publish_flag: PropTypes.bool,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

export default EditScholarshipForm;
