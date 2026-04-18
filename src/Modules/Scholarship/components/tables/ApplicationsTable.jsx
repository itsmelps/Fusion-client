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
  XCircle,
  PencilSimple,
  DownloadSimple,
  ChatCircleText,
  CheckCircle,
} from "@phosphor-icons/react";
import PropTypes from "prop-types";
import * as api from "../../services/api";

const STATUS_CONFIG = {
  SUBMITTED: { color: "blue", label: "SUBMITTED" },
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

function ApplicationsTable({ onApply, onEdit }) {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
  const isAssistant = role === "spacsassistant";
  const isConvenor = role === "spacsconvenor";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Withdraw confirmation modal
  const [withdrawModal, setWithdrawModal] = useState({
    open: false,
    app: null,
  });
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  // View details modal
  const [viewModal, setViewModal] = useState({
    open: false,
    app: null,
  });

  // Workflow Modal state (assistant/convenor)
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

  /* ── Student actions ─────────────────────────────────────────────── */

  const handleWithdraw = async () => {
    if (!withdrawModal.app) return;
    if (!withdrawReason.trim()) {
      notifications.show({
        title: "Required",
        message: "Please provide a reason for withdrawal",
        color: "orange",
      });
      return;
    }
    setWithdrawing(true);
    try {
      await api.withdrawApplication(
        withdrawModal.app.id,
        withdrawModal.app.key_type,
        withdrawReason.trim(),
      );
      notifications.show({
        title: "Success",
        message: "Application withdrawn successfully",
        color: "green",
      });
      setWithdrawModal({ open: false, app: null });
      setWithdrawReason("");
      fetchData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to withdraw application",
        color: "red",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const handleDownloadPDF = async (app) => {
    try {
      await api.downloadApplicationPDF(app.id, app.key_type);
      notifications.show({
        title: "Success",
        message: "PDF download started",
        color: "green",
      });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to download PDF",
        color: "red",
      });
    }
  };

  /* ── Assistant/Convenor actions ──────────────────────────────────── */

  const updateStatusAPI = async (appId, type, action, note = "") => {
    try {
      if (type === "mcm") await api.updateMCMStatus(appId, action, note);
      else if (type === "gold") await api.updateGoldStatus(appId, action, note);
      else if (type === "silver")
        await api.updateSilverStatus(appId, action, note);
      else if (type === "dm") await api.updatePDMStatus(appId, action, note);

      notifications.show({
        title: "Success",
        message: `Application marked as ${action}`,
        color: "green",
      });
      fetchData();
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

  /* ── Table rows ──────────────────────────────────────────────────── */

  const rows = applications.map((app) => {
    const rawStatus = app.status ? app.status.toUpperCase() : "INCOMPLETE";
    const isWithdrawalPending = app.withdrawal_pending;
    // Student can withdraw only if status is SUBMITTED (not yet forwarded) and no pending withdrawal
    const canWithdraw =
      isStudent && rawStatus === "SUBMITTED" && !isWithdrawalPending;
    // Student can edit only if status is INCOMPLETE (sent back by assistant) and no pending withdrawal
    const canEdit =
      isStudent && rawStatus === "INCOMPLETE" && !isWithdrawalPending;
    const canDownload = isStudent;

    return (
      <Table.Tr key={`${app.key_type}-${app.id}`}>
        <Table.Td>
          <Text size="sm">{app.id}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.student || "—"}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.type_name}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.academic_year || "2025-26"}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.semester || "1"}</Text>
        </Table.Td>
        <Table.Td>
          {isWithdrawalPending ? (
            <Badge color="orange" variant="light" size="md">
              WITHDRAW REQUESTED
            </Badge>
          ) : (
            <StatusBadge status={rawStatus} />
          )}
        </Table.Td>
        <Table.Td>
          <Text size="sm">
            {app.date
              ? new Date(app.date).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            {/* View Details */}
            <Tooltip label="View Details">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="md"
                onClick={() => setViewModal({ open: true, app })}
              >
                <Eye size={18} />
              </ActionIcon>
            </Tooltip>

            {/* Student: Withdraw */}
            {canWithdraw && (
              <Tooltip label="Withdraw Application">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="md"
                  onClick={() => setWithdrawModal({ open: true, app })}
                >
                  <XCircle size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Student: Edit */}
            {canEdit && onEdit && (
              <Tooltip label="Edit Application">
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  size="md"
                  onClick={() => onEdit(app)}
                >
                  <PencilSimple size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Student: Download PDF */}
            {canDownload && (
              <Tooltip label="Download PDF">
                <ActionIcon
                  variant="subtle"
                  color="teal"
                  size="md"
                  onClick={() => handleDownloadPDF(app)}
                >
                  <DownloadSimple size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Assistant Actions: Forward for SUBMITTED apps */}
            {isAssistant && rawStatus === "SUBMITTED" && (
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
                <Tooltip label="Message Student">
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

            {/* Student: View Notes when INCOMPLETE */}
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

      {/* ── Withdraw Confirmation Modal ─────────────────────────────── */}
      <Modal
        opened={withdrawModal.open}
        onClose={() => {
          setWithdrawModal({ open: false, app: null });
          setWithdrawReason("");
        }}
        title="Withdraw Application"
        centered
      >
        <Text size="sm" mb="md">
          Are you sure you want to withdraw your application for{" "}
          <strong>{withdrawModal.app?.type_name}</strong>? This action cannot be
          undone.
        </Text>
        <Textarea
          label="Reason for withdrawal"
          placeholder="Please provide a reason..."
          value={withdrawReason}
          onChange={(e) => setWithdrawReason(e.target.value)}
          minRows={3}
          withAsterisk
          mb="md"
        />
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => {
              setWithdrawModal({ open: false, app: null });
              setWithdrawReason("");
            }}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleWithdraw} loading={withdrawing}>
            Withdraw
          </Button>
        </Group>
      </Modal>

      {/* ── View Details Modal ──────────────────────────────────────── */}
      <Modal
        opened={viewModal.open}
        onClose={() => setViewModal({ open: false, app: null })}
        title="Application Details"
        size="lg"
        centered
      >
        {viewModal.app && (
          <div>
            <Table verticalSpacing="sm">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td fw={600}>Application ID</Table.Td>
                  <Table.Td>{viewModal.app.id}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td fw={600}>Student</Table.Td>
                  <Table.Td>{viewModal.app.student || "—"}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td fw={600}>Scholarship</Table.Td>
                  <Table.Td>{viewModal.app.type_name}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td fw={600}>Academic Year</Table.Td>
                  <Table.Td>
                    {viewModal.app.academic_year || "2025-26"}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td fw={600}>Semester</Table.Td>
                  <Table.Td>{viewModal.app.semester || "6"}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td fw={600}>Status</Table.Td>
                  <Table.Td>
                    <StatusBadge
                      status={
                        viewModal.app.status
                          ? viewModal.app.status.toUpperCase()
                          : "PENDING"
                      }
                    />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td fw={600}>Applied On</Table.Td>
                  <Table.Td>
                    {viewModal.app.date
                      ? new Date(viewModal.app.date).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <Text fw={700} mt="xl" mb="sm" size="md">
              Form Data
            </Text>
            <Table verticalSpacing="xs" striped withTableBorder>
              <Table.Tbody>
                {Object.entries(viewModal.app)
                  .filter(
                    ([key, value]) =>
                      ![
                        "id",
                        "student",
                        "status",
                        "date",
                        "type_name",
                        "key_type",
                      ].includes(key) &&
                      value !== null &&
                      value !== "" &&
                      typeof value !== "object",
                  )
                  .map(([key, value]) => (
                    <Table.Tr key={key}>
                      <Table.Td
                        fw={500}
                        style={{ textTransform: "capitalize" }}
                      >
                        {key.replace(/_/g, " ")}
                      </Table.Td>
                      <Table.Td>{String(value)}</Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>

            {/* Documents section */}
            <Text fw={700} mt="xl" mb="sm" size="md">
              Documents
            </Text>
            <Group gap="xs">
              {Object.entries(viewModal.app)
                .filter(
                  ([key, value]) =>
                    (key.toLowerCase().includes("certificate") ||
                      key.toLowerCase().includes("marksheet") ||
                      key.toLowerCase().includes("receipt") ||
                      key.toLowerCase().includes("details") ||
                      key.toLowerCase().includes("affidavit") ||
                      key.toLowerCase().includes("card") ||
                      key.toLowerCase().includes("document")) &&
                    value,
                )
                .map(([key, value]) => (
                  <Button
                    key={key}
                    component="a"
                    href={value}
                    target="_blank"
                    variant="light"
                    color="blue"
                    size="compact-sm"
                    leftSection={<DownloadSimple size={14} />}
                  >
                    {key.replace(/_/g, " ")}
                  </Button>
                ))}
              {Object.entries(viewModal.app).filter(
                ([key, value]) =>
                  (key.toLowerCase().includes("certificate") ||
                    key.toLowerCase().includes("marksheet") ||
                    key.toLowerCase().includes("receipt") ||
                    key.toLowerCase().includes("details") ||
                    key.toLowerCase().includes("affidavit") ||
                    key.toLowerCase().includes("card") ||
                    key.toLowerCase().includes("document")) &&
                  value,
              ).length === 0 && (
                <Text c="dimmed" size="sm">
                  No documents attached.
                </Text>
              )}
            </Group>
          </div>
        )}
      </Modal>

      {/* ── Ask Info Modal (Assistant/Convenor) ─────────────────────── */}
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

      {/* ── View Notes Modal (Student) ──────────────────────────────── */}
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
  onEdit: PropTypes.func,
};

export default ApplicationsTable;
