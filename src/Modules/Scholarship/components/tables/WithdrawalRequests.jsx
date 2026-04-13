/* eslint-disable no-unused-vars, react/no-unstable-nested-components, react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Container,
  Title,
  Loader,
  Alert,
  Group,
  Badge,
  Notification,
} from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import {
  listWithdrawalsRoute,
  acknowledgeWithdrawalRoute,
} from "../../../../routes/SPACSRoutes";
import styles from "../../styles/medal_applications.module.css";

function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // T4: Fetch withdrawal requests on mount
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      const response = await fetch(listWithdrawalsRoute, {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setWithdrawals(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // T4: Acknowledge withdrawal button handler
  const handleAcknowledge = async (withdrawalId) => {
    setProcessingId(withdrawalId);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(acknowledgeWithdrawalRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ withdrawal_id: withdrawalId }),
      });
      if (res.ok) {
        // Remove row and show notification
        setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
        setNotification({
          title: "Success",
          message: "Withdrawal acknowledged successfully.",
          color: "green",
        });
      } else {
        const data = await res.json();
        setNotification({
          title: "Error",
          message: data.detail || "Failed to acknowledge withdrawal.",
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
      setProcessingId(null);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "student_name", header: "Student Name" },
      { accessorKey: "roll_no", header: "Roll No" },
      { accessorKey: "scholarship_type", header: "Scholarship Type" },
      { accessorKey: "reason", header: "Reason", size: 200 },
      {
        accessorKey: "requested_at",
        header: "Requested At",
        Cell: ({ row }) => {
          const date = new Date(row.original.requested_at);
          return date.toLocaleString();
        },
      },
      {
        header: "Action",
        id: "action",
        Cell: ({ row }) => (
          <Button
            size="xs"
            color="green"
            loading={processingId === row.original.id}
            onClick={() => handleAcknowledge(row.original.id)}
          >
            Acknowledge
          </Button>
        ),
      },
    ],
    [processingId],
  );

  const table = useMantineReactTable({
    columns,
    data: withdrawals,
    enableSorting: true,
    paginationDisplayMode: "pages",
  });

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Pending Withdrawal Requests
      </Title>

      {notification && (
        <Notification
          icon={<IconCheck size={18} />}
          color={notification.color}
          onClose={() => setNotification(null)}
          title={notification.title}
          mb="md"
        >
          {notification.message}
        </Notification>
      )}

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Loader size="lg" />
      ) : (
        <>
          {withdrawals.length === 0 ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="blue"
              title="No Pending Requests"
            >
              No pending withdrawal requests at this time.
            </Alert>
          ) : (
            <MantineReactTable table={table} />
          )}
          <Button variant="outline" mt="md" onClick={fetchWithdrawals}>
            Refresh
          </Button>
        </>
      )}
    </Container>
  );
}

export default WithdrawalRequests;
