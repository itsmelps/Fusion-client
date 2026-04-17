import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Badge,
  Button,
  Group,
  Text,
  Paper,
  ActionIcon,
  Tooltip,
  Loader,
  Flex,
} from "@mantine/core";
import { Eye, Trash, Plus } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import * as api from "../../services/api";

const STATUS_CONFIG = {
  PENDING: { color: "yellow.6", label: "PENDING" },
  INCOMPLETE: { color: "orange", label: "INCOMPLETE" },
  FORWARDED: { color: "cyan", label: "FORWARDED" },
  ACCEPT: { color: "green", label: "ACCEPTED" },
  REJECT: { color: "red", label: "REJECTED" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || {
    color: "gray",
    label: status,
  };
  return (
    <Badge color={cfg.color} variant="filled" radius="xl" px="md">
      {cfg.label}
    </Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

function ApplicationsTable({ onApply }) {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Unified listing for all types
      const mcm = isStudent
        ? await api.fetchMCMStatus()
        : await api.fetchMCMApplications();
      const gold = isStudent
        ? await api.fetchGoldStatus()
        : await api.fetchGoldApplications();
      const silver = isStudent
        ? await api.fetchSilverStatus()
        : await api.fetchSilverApplications();
      const pdm = isStudent
        ? await api.fetchPDMStatus()
        : await api.fetchPDMApplications();

      const combined = [
        ...mcm.map((a) => ({ ...a, type_name: "Merit Cum Means Scholarship" })),
        ...gold.map((a) => ({ ...a, type_name: "Director's Gold Medal" })),
        ...silver.map((a) => ({ ...a, type_name: "Director's Silver Medal" })),
        ...pdm.map((a) => ({ ...a, type_name: "D&M Proficiency Gold Medal" })),
      ];

      // Sort by date or id
      setApplications(combined.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const rows = applications.map((app) => (
    <Table.Tr
      key={`${app.type_name}-${app.id}`}
      style={{ borderBottom: "1px solid #F1F3F5" }}
    >
      <Table.Td>
        <Text size="sm">{app.id}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {app.student || "23BCS268"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {app.type_name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">2025-26</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">6</Text>
      </Table.Td>
      <Table.Td>
        <StatusBadge status={app.status || "PENDING"} />
      </Table.Td>
      <Table.Td>
        <Text size="sm">{app.date || "4/13/2026"}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="light" color="blue" radius="xl" size="lg">
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Application">
            <ActionIcon variant="light" color="red" radius="xl" size="lg">
              <Trash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper radius="md" p={0}>
      <Flex justify="space-between" align="center" mb="xl" px="md" pt="md">
        <Text size="xl" fw={700}>
          Scholarship Applications
        </Text>
        {isStudent && (
          <Button
            leftSection={<Plus size={18} />}
            color="blue"
            radius="md"
            onClick={onApply}
          >
            Apply
          </Button>
        )}
      </Flex>

      <Table verticalSpacing="md" horizontalSpacing="md">
        <Table.Thead bg="#F3F3F7">
          <Table.Tr>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                ID
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Student
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Scholarship
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Academic Year
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Semester
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Status
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Applied On
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Actions
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={8} py="xl">
                <center>
                  <Loader size="sm" />
                </center>
              </Table.Td>
            </Table.Tr>
          ) : rows.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={8} py="xl" ta="center" c="dimmed">
                No applications found.
              </Table.Td>
            </Table.Tr>
          ) : (
            rows
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

ApplicationsTable.propTypes = {
  onApply: PropTypes.func.isRequired,
};

ApplicationsTable.propTypes = {
  onApply: PropTypes.func.isRequired,
};

export default ApplicationsTable;
