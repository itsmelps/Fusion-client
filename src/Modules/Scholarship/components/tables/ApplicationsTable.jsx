import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Badge,
  Button,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Loader,
  Flex,
  Modal,
  Textarea,
  ScrollArea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Eye,
  Plus,
  ChatCircleText,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import PropTypes from "prop-types";
import * as api from "../../services/api";

const STATUS_CONFIG = {
  PENDING: { color: "yellow.6", label: "PENDING" },
  INCOMPLETE: { color: "gray", label: "INCOMPLETE" },
  FORWARDED: { color: "indigo", label: "FORWARDED" },
  ACCEPT: { color: "green", label: "ACCEPTED" },
  REJECT: { color: "red", label: "REJECTED" },
  ACCEPTED: { color: "green", label: "ACCEPTED" },
  REJECTED: { color: "red", label: "REJECTED" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || {
    color: "gray",
    label: status,
  };
  return (
    <Badge color={cfg.color} variant="filled" radius="sm" size="md">
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
  const isAssistant = role === "spacsassistant";
  const isConvenor = role === "spacsconvenor";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Workflow Modal state
  const [askInfoModal, setAskInfoModal] = useState({
    open: false,
    app: null,
    note: "",
  });
  const [viewNotesModal, setViewNotesModal] = useState({
    open: false,
    notes: [],
    loading: false,
  });

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
        ...mcm.map((a) => ({
          ...a,
          type_name: "Merit Cum Means Scholarship",
          key_type: "mcm",
        })),
        ...gold.map((a) => ({
          ...a,
          type_name: "Director's Gold Medal",
          key_type: "gold",
        })),
        ...silver.map((a) => ({
          ...a,
          type_name: "Director's Silver Medal",
          key_type: "silver",
        })),
        ...pdm.map((a) => ({
          ...a,
          type_name: "D&M Proficiency Gold Medal",
          key_type: "dm",
        })),
      ];

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

  const updateStatusAPI = async (appId, type, action, note = "") => {
    try {
      if (type === "mcm") await api.updateMCMStatus(appId, action, note);
      else if (type === "gold") await api.updateGoldStatus(appId, action, note);
      else if (type === "silver")
        await api.updateSilverStatus(appId, action, note);
      // PDM hasn't been added to api.js explicitly yet for status, but it's consistent if needed.

      notifications.show({
        title: "Success",
        message: `Application marked as ${action}`,
        color: "green",
      });
      fetchData(); // Refresh list
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Could not update status",
        color: "red",
      });
    }
  };

  const handleAction = (app, action) => {
    if (action === "ask_info") {
      setAskInfoModal({ open: true, app, note: "" });
      return;
    }
    updateStatusAPI(app.id, app.key_type, action);
  };

  const handleAskInfoSubmit = async () => {
    if (!askInfoModal.note.trim()) {
      notifications.show({ message: "Please enter a note", color: "red" });
      return;
    }
    await updateStatusAPI(
      askInfoModal.app.id,
      askInfoModal.app.key_type,
      "ask_info",
      askInfoModal.note,
    );
    setAskInfoModal({ open: false, app: null, note: "" });
  };

  const handleViewNotes = async (app) => {
    setViewNotesModal({ open: true, loading: true, notes: [] });
    try {
      const data = await api.fetchApplicationNotes(app.key_type, app.id);
      setViewNotesModal({ open: true, loading: false, notes: data });
    } catch (err) {
      console.error(err);
      setViewNotesModal({ open: true, loading: false, notes: [] });
      notifications.show({ message: "Failed to load notes", color: "red" });
    }
  };

  const rows = applications.map((app) => {
    const rawStatus = app.status ? app.status.toUpperCase() : "PENDING";

    return (
      <Table.Tr key={`${app.key_type}-${app.id}`}>
        <Table.Td>
          <Text size="sm">{app.id}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.student || "23BCS268"}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.type_name}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">2025-26</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">6</Text>
        </Table.Td>
        <Table.Td>
          <StatusBadge status={rawStatus} />
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.date || "4/13/2026"}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            {/* View Details */}
            <Tooltip label="View Details">
              <ActionIcon variant="subtle" color="blue" size="md">
                <Eye size={18} />
              </ActionIcon>
            </Tooltip>

            {/* Assistant Actions */}
            {isAssistant && rawStatus === "PENDING" && (
              <>
                <Tooltip label="Forward to Convenor">
                  <ActionIcon
                    variant="subtle"
                    color="indigo"
                    size="md"
                    onClick={() => handleAction(app, "forward")}
                  >
                    <CheckCircle size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Ask Student for Info">
                  <ActionIcon
                    variant="subtle"
                    color="orange"
                    size="md"
                    onClick={() => handleAction(app, "ask_info")}
                  >
                    <ChatCircleText size={18} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}

            {/* Convenor Actions */}
            {isConvenor && rawStatus === "FORWARDED" && (
              <>
                <Tooltip label="Accept">
                  <ActionIcon
                    variant="subtle"
                    color="green"
                    size="md"
                    onClick={() => handleAction(app, "accept")}
                  >
                    <CheckCircle size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Reject">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="md"
                    onClick={() => handleAction(app, "reject")}
                  >
                    <XCircle size={18} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
            {isConvenor && rawStatus === "PENDING" && (
              <Tooltip label="Ask Info">
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  size="md"
                  onClick={() => handleAction(app, "ask_info")}
                >
                  <ChatCircleText size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Student View Notes */}
            {isStudent && rawStatus === "INCOMPLETE" && (
              <Tooltip label="View Messages">
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  size="md"
                  onClick={() => handleViewNotes(app)}
                >
                  <ChatCircleText size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <Loader size="md" />
      </div>
    );
  }

  return (
    <>
      <Flex justify="space-between" align="center" mt="md" mb="md" mx="md">
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

      <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
        <Table.Thead bg="#F5F7FA">
          <Table.Tr>
            <Table.Th>
              <Text size="sm" fw={600}>
                ID
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Student
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Scholarship
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Academic Year
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Semester
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Status
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Applied On
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Actions
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length === 0 ? (
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

      {/* Workflow Modals */}
      <Modal
        opened={askInfoModal.open}
        onClose={() => setAskInfoModal({ open: false, app: null, note: "" })}
        title="Ask Student for Information"
      >
        <Textarea
          label="Message"
          placeholder="Please provide your latest transcript..."
          value={askInfoModal.note}
          onChange={(e) =>
            setAskInfoModal({ ...askInfoModal, note: e.target.value })
          }
          minRows={4}
          withAsterisk
        />
        <Group justify="flex-end" mt="md">
          <Button color="blue" onClick={handleAskInfoSubmit}>
            Send Message
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={viewNotesModal.open}
        onClose={() =>
          setViewNotesModal({ open: false, notes: [], loading: false })
        }
        title="Application Messages"
      >
        {viewNotesModal.loading ? (
          <Loader />
        ) : viewNotesModal.notes.length === 0 ? (
          <Text c="dimmed">No messages found.</Text>
        ) : (
          <ScrollArea h={300}>
            {viewNotesModal.notes.map((n) => (
              <div
                key={n.id}
                style={{
                  marginBottom: "1rem",
                  backgroundColor: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <Text size="xs" c="dimmed">
                  {new Date(n.created_at).toLocaleString()} - {n.author_name}
                </Text>
                <Text size="sm" mt={4}>
                  {n.note}
                </Text>
              </div>
            ))}
          </ScrollArea>
        )}
      </Modal>
    </>
  );
}

ApplicationsTable.propTypes = {
  onApply: PropTypes.func.isRequired,
};

export default ApplicationsTable;
