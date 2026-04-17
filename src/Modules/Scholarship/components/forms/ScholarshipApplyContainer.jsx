import { useState, useEffect } from "react";
import {
  Paper,
  Select,
  Text,
  Divider,
  Stack,
  Group,
  ThemeIcon,
  Container,
} from "@mantine/core";
import { PencilLine } from "@phosphor-icons/react";
import PropTypes from "prop-types";

// Import existing forms
import ScholarshipForm from "./ScholarshipForm";
import DirectorGoldForm from "./DirectorGoldForm";
import DirectorSilverForm from "./DirectorSilverForm";
import DMProficiencyForm from "./DMProficiencyForm";

const SCHOLARSHIP_OPTIONS = [
  { value: "mcm", label: "Merit-cum-Means Scholarship" },
  { value: "gold", label: "Director's Gold Medal" },
  { value: "silver", label: "Director's Silver Medal" },
  { value: "dm", label: "D&M Proficiency Gold Medal" },
];

function ScholarshipApplyContainer({ initialType }) {
  const [selectedType, setSelectedType] = useState(initialType || "mcm");

  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [initialType]);

  const renderForm = () => {
    switch (selectedType) {
      case "mcm":
        return <ScholarshipForm />;
      case "gold":
        return <DirectorGoldForm />;
      case "silver":
        return <DirectorSilverForm />;
      case "dm":
        return <DMProficiencyForm />;
      default:
        return <ScholarshipForm />;
    }
  };

  return (
    <Container size="lg" py="md">
      <Stack spacing="xl">
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between">
            <Group>
              <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                <PencilLine size={24} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">
                  New Scholarship Application
                </Text>
                <Text size="sm" c="dimmed">
                  Select a scholarship type and fill in the details below.
                </Text>
              </div>
            </Group>
            <Select
              label="Scholarship Type"
              placeholder="Pick one"
              data={SCHOLARSHIP_OPTIONS}
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 300 }}
            />
          </Group>
        </Paper>

        <Divider label="Application Form" labelPosition="center" />

        <div style={{ minHeight: "400px" }}>{renderForm()}</div>
      </Stack>
    </Container>
  );
}

ScholarshipApplyContainer.propTypes = {
  initialType: PropTypes.string,
};

export default ScholarshipApplyContainer;
