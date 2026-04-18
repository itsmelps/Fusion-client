import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Loader,
  Stack,
} from "@mantine/core";
import { Plus, Trash } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { fetchAwards, createAwardNew, retireAward } from "../../services/api";

function ManageScholarshipsAwards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    award_name: "",
    catalog: "",
    cpi_cutoff: 0.0,
    income_ceiling: 0,
    eligible_programme: "all",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchAwards();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch awards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAwardNew(formData);
      notifications.show({
        title: "Success",
        message: "Award/Scholarship created successfully",
        color: "green",
      });
      setModalOpened(false);
      setFormData({
        award_name: "",
        catalog: "",
        cpi_cutoff: 0.0,
        income_ceiling: 0,
        eligible_programme: "all",
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetire = async (id) => {
    if (!window.confirm("Are you sure you want to retire this award?")) return;
    try {
      await retireAward(id);
      notifications.show({
        title: "Success",
        message: "Award retired successfully",
        color: "blue",
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  const rows = data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text size="sm" fw={500}>
          {item.award_name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={item.publish_flag ? "green" : "gray"} variant="light">
          {item.publish_flag ? "Live" : "Retired"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="xs" color="dimmed">
          {item.eligible_programme}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.cpi_cutoff || "N/A"}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹ {item.income_ceiling || "N/A"}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Retire Award">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleRetire(item.id)}
              disabled={!item.publish_flag}
            >
              <Trash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="md" />
      </Group>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>
            Award Management
          </Text>
          <Text size="sm" c="dimmed">
            Add or retire scholarships and medals across the portal.
          </Text>
        </div>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => setModalOpened(true)}
          variant="filled"
          color="blue"
        >
          Add New Award
        </Button>
      </Group>

      <Table highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: "#F8F9FA" }}>
            <Table.Th>Name</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Programme</Table.Th>
            <Table.Th>Min CPI</Table.Th>
            <Table.Th>Max Income</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add New Scholarship or Award"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Award Name"
              placeholder="e.g. Reliance Foundation Scholarship"
              required
              value={formData.award_name}
              onChange={(e) =>
                setFormData({ ...formData, award_name: e.target.value })
              }
            />
            <Textarea
              label="Catalog Description"
              placeholder="Detailed description and eligibility criteria..."
              minRows={3}
              required
              value={formData.catalog}
              onChange={(e) =>
                setFormData({ ...formData, catalog: e.target.value })
              }
            />
            <Group grow>
              <NumberInput
                label="Min CPI Cutoff"
                placeholder="0.0"
                step={0.1}
                min={0}
                max={10}
                precision={2}
                value={formData.cpi_cutoff}
                onChange={(val) =>
                  setFormData({ ...formData, cpi_cutoff: val })
                }
              />
              <NumberInput
                label="Max Family Income"
                placeholder="₹ 500000"
                min={0}
                value={formData.income_ceiling}
                onChange={(val) =>
                  setFormData({ ...formData, income_ceiling: val })
                }
              />
            </Group>
            <Select
              label="Eligible Programme"
              data={[
                { value: "all", label: "All Programmes" },
                { value: "B.Tech", label: "B.Tech" },
                { value: "B.Des", label: "B.Des" },
                { value: "M.Tech", label: "M.Tech" },
                { value: "PhD", label: "PhD" },
              ]}
              value={formData.eligible_programme}
              onChange={(val) =>
                setFormData({ ...formData, eligible_programme: val })
              }
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create Award
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

export default ManageScholarshipsAwards;
