/* eslint-disable no-unused-vars, import/no-unresolved, react/prop-types, no-use-before-define, react/no-unstable-nested-components, jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useMemo } from "react";
import {
  Loader,
  Text,
  Button,
  Modal,
  Badge,
  Tabs,
  Alert,
  Group,
  Select,
  Textarea,
} from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import { IconDownload, IconAlertCircle } from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import {
  getMCMApplicationsRoute,
  updateMCMStatusRoute,
  scholarshipNotification,
  forwardApplicationRoute,
} from "../../../../routes/SPACSRoutes";
import styles from "../../styles/MCM_applications.module.css";
import MedalApplications from "./medal_applications";
import { host } from "../../../../routes/globalRoutes";

const STATUS_LABELS = {
  INCOMPLETE: { color: "blue", label: "Submitted" },
  ACCEPTED: { color: "green", label: "Accepted" },
  REJECTED: { color: "red", label: "Rejected" },
  UNDER_REVIEW: { color: "orange", label: "Under Review" },
  WITHDRAWN: { color: "gray", label: "Withdrawn" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_LABELS[status] || { color: "gray", label: status };
  return (
    <Badge color={cfg.color} variant="filled">
      {cfg.label}
    </Badge>
  );
}

function MCMApplications() {
  const [activeTab, setActiveTab] = useState("MCM");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileModalOpened, setFileModalOpened] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  // UC-005: Acknowledge Withdrawal
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  // T6: Forward to Convener
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedForward, setSelectedForward] = useState(null);
  const [forwardNotes, setForwardNotes] = useState("");
  const [forwardLoading, setForwardLoading] = useState(false);
  // Filter
  const [statusFilter, setStatusFilter] = useState("INCOMPLETE");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      const response = await fetch(getMCMApplicationsRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // BR-SPACS-008: Notification on status change
  const handleNotification = async (recipient, type) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      await axios.post(
        scholarshipNotification,
        { recipient, type },
        { headers: { Authorization: `Token ${token}` } },
      );
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  // UC-006: Sanctioning Decision (Approve/Reject) + UC-002: Verify
  const handleAction = async (id, action, student) => {
    const actionLabels = {
      approved: "approve",
      rejected: "reject",
      under_review: "mark as Under Review",
    };
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabels[action] || action} this application?`,
    );
    if (!confirmed) return;

    const payload = {
      id,
      status:
        action === "approved"
          ? "ACCEPTED"
          : action === "rejected"
            ? "REJECTED"
            : "UNDER_REVIEW",
    };

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(updateMCMStatusRoute, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.status === 200) {
        // BR-SPACS-008: notify student
        const notifMap = {
          approved: "Accept_MCM",
          rejected: "Reject_MCM",
          under_review: "MCM_UNDER_REVIEW",
        };
        await handleNotification(student, notifMap[action]);
        fetchApplications();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update application status.");
    }
  };

  // UC-005: Acknowledge Withdrawal
  const handleAcknowledgeWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `/api/scholarships/acknowledge-withdrawal/`,
        { application_id: selectedWithdrawal.id, award_type: "mcm" },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.status === 200) {
        await handleNotification(
          selectedWithdrawal.student,
          "MCM_WITHDRAWAL_ACKNOWLEDGED",
        );
        alert("Withdrawal acknowledged. Application closed.");
        setWithdrawalModalOpen(false);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to acknowledge withdrawal.");
    }
  };

  // T6: Forward to Convener
  const handleForward = async () => {
    if (!selectedForward) return;
    setForwardLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        forwardApplicationRoute,
        {
          scholarship_type: "mcm",
          application_id: selectedForward.id,
          notes: forwardNotes,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.status === 200) {
        alert("Application forwarded to convener successfully.");
        setForwardModalOpen(false);
        setForwardNotes("");
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to forward application.");
    } finally {
      setForwardLoading(false);
    }
  };

  const handleExportAll = () => {
    if (applications.length === 0) {
      alert("No applications to export.");
      return;
    }
    const config = mkConfig({
      fieldSeparator: ",",
      decimalSeparator: ".",
      useKeysAsHeaders: true,
      showTitle: true,
      title: "MCM Applications",
    });
    const csv = generateCsv(config)(filteredApplications);
    download(config)(csv);
  };

  const filteredApplications = useMemo(() => {
    if (statusFilter === "ALL") return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No", size: 120 },
      { accessorKey: "annual_income", header: "Annual Income (₹)", size: 150 },
      {
        accessorKey: "date",
        header: "Date Applied",
        Cell: ({ row }) => row.original.date || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "files",
        header: "Documents",
        Cell: ({ row }) => (
          <Button
            size="xs"
            variant="light"
            onClick={() => {
              setSelectedFiles(row.original);
              setFileModalOpened(true);
            }}
          >
            View Files
          </Button>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        Cell: ({ row }) => {
          const { id, student, status } = row.original;
          const isWithdrawn = status === "WITHDRAWN";
          const isDecided = status === "ACCEPTED" || status === "REJECTED";
          const isVerified = status === "Complete"; // T6: Show forward for verified apps
          return (
            <Group spacing={4}>
              {isWithdrawn ? (
                // UC-005: Acknowledge Withdrawal
                <Button
                  size="xs"
                  color="orange"
                  onClick={() => {
                    setSelectedWithdrawal(row.original);
                    setWithdrawalModalOpen(true);
                  }}
                >
                  Acknowledge Withdrawal
                </Button>
              ) : isDecided ? (
                <Text size="xs" color="dimmed">
                  Decision recorded
                </Text>
              ) : (
                <>
                  {/* UC-002: Verify / UC-006: Sanction */}
                  <Button
                    size="xs"
                    color="orange"
                    variant="light"
                    onClick={() => handleAction(id, "under_review", student)}
                    disabled={status === "UNDER_REVIEW"}
                  >
                    Under Review
                  </Button>
                  <Button
                    size="xs"
                    color="green"
                    onClick={() => handleAction(id, "approved", student)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleAction(id, "rejected", student)}
                  >
                    Reject
                  </Button>
                  {/* T6: Forward to Convener - only for verified */}
                  {isVerified && (
                    <Button
                      size="xs"
                      color="blue"
                      onClick={() => {
                        setSelectedForward(row.original);
                        setForwardNotes("");
                        setForwardModalOpen(true);
                      }}
                    >
                      Forward to Convener
                    </Button>
                  )}
                </>
              )}
            </Group>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className={styles.container}>
      {/* Inner tabs: MCM | Medals */}
      <div className={styles.tabs}>
        <div
          role="button"
          tabIndex={0}
          className={activeTab === "MCM" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("MCM")}
        >
          Merit-cum-Means Scholarship
        </div>
        <div
          role="button"
          tabIndex={0}
          className={activeTab === "Medals" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("Medals")}
        >
          Convocation Medals
        </div>
      </div>

      {activeTab === "MCM" && (
        <>
          <Group mb="md" align="center" position="apart">
            <Text weight={600} size="lg">
              MCM Scholarship Applications
            </Text>
            <Select
              size="sm"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: "ALL", label: "All Applications" },
                { value: "INCOMPLETE", label: "Submitted (Pending Review)" },
                { value: "UNDER_REVIEW", label: "Under Review" },
                { value: "ACCEPTED", label: "Accepted" },
                { value: "REJECTED", label: "Rejected" },
                { value: "WITHDRAWN", label: "Withdrawal Requested" },
              ]}
              style={{ width: 220 }}
            />
          </Group>

          {loading ? (
            <Loader />
          ) : error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          ) : filteredApplications.length === 0 ? (
            <Alert color="blue">
              No applications found for the selected filter.
            </Alert>
          ) : (
            <MantineReactTable
              columns={columns}
              data={filteredApplications}
              enableRowSelection
              enableSorting
              muiTableBodyCellProps={{ onClick: (e) => e.stopPropagation() }}
              renderTopToolbarCustomActions={() => (
                <Button
                  leftSection={<IconDownload size={16} />}
                  onClick={handleExportAll}
                  size="sm"
                >
                  Export CSV
                </Button>
              )}
              mantineTableBodyRowProps={() => ({
                className: styles.stripedRow,
              })}
            />
          )}

          {/* Files Modal */}
          <Modal
            opened={fileModalOpened}
            onClose={() => setFileModalOpened(false)}
            title="Uploaded Documents"
            size="lg"
          >
            {selectedFiles ? (
              <div className={styles.fileModalContainer}>
                {[
                  ["Aadhar Card", selectedFiles.Aadhar_card],
                  ["Affidavit", selectedFiles.Affidavit],
                  ["Bank Details", selectedFiles.Bank_details],
                  ["Fee Receipt", selectedFiles.Fee_Receipt],
                  ["Marksheet", selectedFiles.Marksheet],
                  ["Income Certificate", selectedFiles.income_certificate],
                ].map(([label, path]) =>
                  path ? (
                    <a
                      className={styles.fileLink}
                      key={label}
                      href={`${host}${path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 {label}
                    </a>
                  ) : (
                    <Text key={label} color="dimmed" size="sm">
                      {label}: Not uploaded
                    </Text>
                  ),
                )}
              </div>
            ) : (
              <Text>No files found.</Text>
            )}
          </Modal>

          {/* UC-005: Acknowledge Withdrawal Modal */}
          <Modal
            opened={withdrawalModalOpen}
            onClose={() => setWithdrawalModalOpen(false)}
            title="Acknowledge Withdrawal Request"
            size="md"
          >
            <Alert color="orange" mb="md" icon={<IconAlertCircle size={16} />}>
              Student <strong>{selectedWithdrawal?.student}</strong> has
              requested to withdraw their MCM Scholarship application (ID:{" "}
              {selectedWithdrawal?.id}). Acknowledging this will close the
              application.
            </Alert>
            <Group position="right" mt="md">
              <Button
                variant="default"
                onClick={() => setWithdrawalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button color="orange" onClick={handleAcknowledgeWithdrawal}>
                Acknowledge & Close
              </Button>
            </Group>
          </Modal>

          {/* T6: Forward to Convener Modal */}
          <Modal
            opened={forwardModalOpen}
            onClose={() => setForwardModalOpen(false)}
            title="Forward to Convener"
            size="md"
          >
            <Alert color="blue" mb="md" icon={<IconAlertCircle size={16} />}>
              Forward application ID <strong>{selectedForward?.id}</strong> to
              the convener for final review and approval.
            </Alert>
            <Textarea
              label="Notes (Optional)"
              placeholder="Add any notes for the convener..."
              minRows={3}
              value={forwardNotes}
              onChange={(e) => setForwardNotes(e.currentTarget.value)}
              mb="md"
            />
            <Group position="right">
              <Button
                variant="default"
                onClick={() => setForwardModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="blue"
                loading={forwardLoading}
                onClick={handleForward}
              >
                Forward Application
              </Button>
            </Group>
          </Modal>
        </>
      )}

      {activeTab === "Medals" && <MedalApplications />}
    </div>
  );
}

export default MCMApplications;
