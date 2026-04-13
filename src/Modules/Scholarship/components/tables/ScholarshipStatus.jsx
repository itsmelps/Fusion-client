/* eslint-disable no-unused-vars, import/no-unresolved, react/prop-types, react/no-unstable-nested-components */
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Box,
  Text,
  Loader,
  Container,
  Title,
  Badge,
  Modal,
  Textarea,
  Alert,
  Group,
  Notification,
  Tabs,
} from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import {
  IconDownload,
  IconPrinter,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import styles from "../../styles/ScholarshipStatus.module.css";
import {
  showMcmStatusRoute,
  showGoldStatusRoute,
  showSilverStatusRoute,
  showPdmStatusRoute,
  withdrawApplicationRoute,
  downloadApplicationRoute,
} from "../../../../routes/SPACSRoutes";

const SCHOLARSHIP_TYPES = [
  {
    label: "Merit-Cum-Means Scholarship",
    route: showMcmStatusRoute,
    key: "mcm",
    award_type: "mcm",
  },
  {
    label: "Director's Gold Medal",
    route: showGoldStatusRoute,
    key: "gold",
    award_type: "gold",
  },
  {
    label: "Director's Silver Medal",
    route: showSilverStatusRoute,
    key: "silver",
    award_type: "silver",
  },
  {
    label: "D&M Proficiency Gold Medal",
    route: showPdmStatusRoute,
    key: "pdm",
    award_type: "dm",
  },
];

const WITHDRAW_ALLOWED_STATUSES = [
  "Incomplete",
  "INCOMPLETE",
  "Submitted",
  "SUBMITTED",
];

// Status badge label mapping
const STATUS_BADGE_MAP = {
  INCOMPLETE: "Under Review",
  Incomplete: "Under Review",
  Complete: "Verified",
  Accept: "Accepted",
  Reject: "Rejected",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  SUBMITTED: "Under Review",
  Submitted: "Under Review",
  WITHDRAWN: "Withdrawn",
  Withdrawn: "Withdrawn",
};

const STATUS_COLOR_MAP = {
  "Under Review": "orange",
  Verified: "blue",
  Accepted: "green",
  Rejected: "red",
  Withdrawn: "gray",
};

function StatusBadge({ status }) {
  const displayStatus = STATUS_BADGE_MAP[status] || status;
  const color = STATUS_COLOR_MAP[displayStatus] || "gray";
  return (
    <Badge color={color} variant="filled">
      {displayStatus}
    </Badge>
  );
}

function ScholarshipBlock({ title, route, awardType, tabState, setTabState }) {
  const state = tabState[awardType] || {
    loaded: false,
    loading: false,
    data: [],
  };

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [notification, setNotification] = useState(null);

  const csvConfig = useMemo(
    () =>
      mkConfig({
        fieldSeparator: ",",
        decimalSeparator: ".",
        useKeysAsHeaders: true,
        filename: `scholarship_status_${title.replace(/\s+/g, "_")}`,
      }),
    [title],
  );

  const fetchStatus = async () => {
    setTabState((prev) => ({
      ...prev,
      [awardType]: { ...prev[awardType], loading: true, loaded: false },
    }));
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(route, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setTabState((prev) => ({
        ...prev,
        [awardType]: { loading: false, loaded: true, data },
      }));
    } catch (err) {
      console.error("Fetch error:", err);
      setTabState((prev) => ({
        ...prev,
        [awardType]: { ...prev[awardType], loading: false, loaded: true },
      }));
    }
  };

  // UC-007: Download PDF Application
  const handleDownloadPDF = async (row) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${downloadApplicationRoute}?application_id=${row.id}&award_type=${awardType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `application_${row.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setNotification({
        title: "Error",
        message: "Failed to download PDF",
        color: "red",
      });
    }
  };

  // UC-004: Request Withdrawal (BR-SPACS-009: only before review)
  const openWithdraw = (row) => {
    const canWithdraw = WITHDRAW_ALLOWED_STATUSES.includes(row.status);
    if (!canWithdraw) {
      setNotification({
        title: "Cannot Withdraw",
        message:
          "Withdrawal is only allowed when the application is in Submitted or Draft status (before review begins).",
        color: "orange",
      });
      return;
    }
    setSelectedApp(row);
    setWithdrawReason("");
    setWithdrawModalOpen(true);
  };

  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) {
      setNotification({
        title: "Error",
        message: "Please provide a reason for withdrawal.",
        color: "red",
      });
      return;
    }
    setWithdrawing(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(withdrawApplicationRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: selectedApp.id,
          award_type: awardType,
          reason: withdrawReason,
        }),
      });
      if (res.ok) {
        setNotification({
          title: "Success",
          message: "Withdrawal request submitted successfully.",
          color: "green",
        });
        setWithdrawModalOpen(false);
        fetchStatus(); // refresh
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to withdraw application.",
          color: "red",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        title: "Error",
        message: "Network error. Please try again.",
        color: "red",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Application ID", size: 120 },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "date",
        header: "Date Applied",
        Cell: ({ row }) => row.original.date || "—",
      },
      {
        header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <Group spacing="xs">
            {/* UC-007: Download PDF */}
            <Button
              size="xs"
              variant="light"
              leftIcon={<IconDownload size={14} />}
              onClick={() => handleDownloadPDF(row.original)}
            >
              Download
            </Button>
            {/* UC-004: Withdraw - only for INCOMPLETE */}
            {WITHDRAW_ALLOWED_STATUSES.includes(row.original.status) && (
              <Button
                size="xs"
                variant="light"
                color="red"
                onClick={() => openWithdraw(row.original)}
              >
                Withdraw
              </Button>
            )}
          </Group>
        ),
      },
    ],
    [awardType],
  );

  const table = useMantineReactTable({
    columns,
    data: state.data,
    enableSorting: true,
    enableRowSelection: true,
    paginationDisplayMode: "pages",
    renderTopToolbarCustomActions: ({ table: t }) => (
      <Box>
        <Group spacing="xs">
          <Button
            size="xs"
            leftIcon={<IconDownload size={14} />}
            onClick={() => {
              const csv = generateCsv(csvConfig)(state.data);
              download(csvConfig)(csv);
            }}
            disabled={state.data.length === 0}
          >
            Export All
          </Button>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<IconDownload size={14} />}
            onClick={() => {
              const data = t.getSelectedRowModel().rows.map((r) => r.original);
              if (data.length === 0) {
                setNotification({
                  title: "Info",
                  message: "Select rows to export.",
                  color: "blue",
                });
                return;
              }
              const csv = generateCsv(csvConfig)(data);
              download(csvConfig)(csv);
            }}
          >
            Export Selected
          </Button>
        </Group>
      </Box>
    ),
  });

  return (
    <div className={styles.formContainer}>
      <Title order={3} className={styles.scholarshipName}>
        {title}
      </Title>

      {!state.loaded && !state.loading && (
        <Button className={styles.checkStatusButton} onClick={fetchStatus}>
          Check Status
        </Button>
      )}

      {state.loading && <Loader size="lg" mt="md" />}

      {state.loaded && !state.loading && (
        <>
          {state.data.length === 0 ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="blue"
              mt="md"
              title="No Applications Found"
            >
              You have not submitted any applications for this scholarship yet.
            </Alert>
          ) : (
            <MantineReactTable table={table} />
          )}
          <Button variant="outline" mt="sm" size="xs" onClick={fetchStatus}>
            Refresh
          </Button>
        </>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          icon={<IconCheck size={18} />}
          color={notification.color}
          onClose={() => setNotification(null)}
          title={notification.title}
          mt="md"
        >
          {notification.message}
        </Notification>
      )}

      {/* Withdrawal Modal — UC-004 */}
      <Modal
        opened={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Request Withdrawal"
        size="md"
      >
        <Alert color="orange" mb="md" icon={<IconAlertCircle size={16} />}>
          This will submit a withdrawal request for Application ID:{" "}
          <strong>{selectedApp?.id}</strong>. The SPACS office must acknowledge
          it to close the application.
        </Alert>
        <Textarea
          label="Reason for Withdrawal"
          placeholder="Please provide your reason for withdrawal..."
          minRows={3}
          required
          value={withdrawReason}
          onChange={(e) => setWithdrawReason(e.currentTarget.value)}
        />
        <Group position="right" mt="md">
          <Button variant="default" onClick={() => setWithdrawModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" loading={withdrawing} onClick={handleWithdraw}>
            Submit Withdrawal
          </Button>
        </Group>
      </Modal>
    </div>
  );
}

export default function ScholarshipStatus() {
  const [tabState, setTabState] = useState({
    mcm: { loaded: false, loading: false, data: [] },
    gold: { loaded: false, loading: false, data: [] },
    silver: { loaded: false, loading: false, data: [] },
    dm: { loaded: false, loading: false, data: [] },
  });

  return (
    <Container className={styles.wrapper}>
      <Title order={2} mb="lg">
        Scholarship Applications Status
      </Title>
      {/* UC-008: Check Application Status — per-tab independent state */}
      {SCHOLARSHIP_TYPES.map((s) => (
        <ScholarshipBlock
          key={s.key}
          title={s.label}
          route={s.route}
          awardType={s.award_type}
          tabState={tabState}
          setTabState={setTabState}
        />
      ))}
    </Container>
  );
}
