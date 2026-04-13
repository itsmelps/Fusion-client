/* eslint-disable no-unused-vars, import/no-unresolved, react/prop-types, no-use-before-define */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Group,
  Text,
  Loader,
  Container,
  Title,
  Notification,
  Alert,
} from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import {
  listWithdrawalsRoute,
  acknowledgeWithdrawalRoute,
} from "../../../../routes/SPACSRoutes";
import styles from "../../styles/WithdrawalRequests.module.css";

function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchwithdrawals();
  }, []);

  const fetchwithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(listWithdrawalsRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (withdrawalId) => {
    setAcknowledging(withdrawalId);
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
        setWithdrawals(withdrawals.filter((w) => w.id !== withdrawalId));
        setNotification({
          type: "success",
          message: `Withdrawal #${withdrawalId} acknowledged and closed.`,
        });
      } else {
        const err = await res.json();
        setNotification({
          type: "error",
          message: err.detail || "Failed to acknowledge withdrawal",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setAcknowledging(null);
    }
  };

  if (loading) {
    return (
      <Group position="center" style={{ marginTop: "2rem" }}>
        <Loader size="lg" />
      </Group>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <Container>
        <Alert icon={<IconAlertCircle size={16} />} title="No Pending Requests">
          No pending withdrawal requests at this time.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Title order={2} mb="lg">
        Withdrawal Requests
      </Title>

      {notification && (
        <Notification
          icon={
            notification.type === "success" ? (
              <IconCheck />
            ) : (
              <IconAlertCircle />
            )
          }
          color={notification.type === "success" ? "green" : "red"}
          title={notification.type === "success" ? "Success" : "Error"}
          onClose={() => setNotification(null)}
          mb="lg"
        >
          {notification.message}
        </Notification>
      )}

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll No</th>
            <th>Scholarship Type</th>
            <th>Reason</th>
            <th>Requested At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id}>
              <td>{w.student_name}</td>
              <td>{w.student_id}</td>
              <td>{w.scholarship_type}</td>
              <td>
                <Text size="sm" lineClamp={2}>
                  {w.reason}
                </Text>
              </td>
              <td>{w.requested_at}</td>
              <td>
                <Button
                  size="xs"
                  variant="outline"
                  color="green"
                  loading={acknowledging === w.id}
                  onClick={() => handleAcknowledge(w.id)}
                >
                  Acknowledge
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default WithdrawalRequests;
