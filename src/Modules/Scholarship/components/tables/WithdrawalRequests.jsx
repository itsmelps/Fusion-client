import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Loader,
  Flex,
  Modal,
  Badge,
  Container,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, CheckCircle, XCircle } from "@phosphor-icons/react";
import {
  listWithdrawalsRoute,
  acknowledgeWithdrawalRoute,
} from "../../../../routes/SPACSRoutes";

function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // View details modal
  const [viewModal, setViewModal] = useState({
    open: false,
    req: null,
  });

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(listWithdrawalsRoute, {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Error",
        message: "Failed to fetch withdrawal requests.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleDecision = async (reqId, action) => {
    setProcessingId(reqId);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(acknowledgeWithdrawalRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ withdrawal_id: reqId, action }),
      });

      if (res.ok) {
        setWithdrawals((prev) => prev.filter((w) => w.id !== reqId));
        notifications.show({
          title: "Success",
          message:
            action === "approve"
              ? "Withdrawal approved and application removed."
              : "Withdrawal rejected. Application remains active.",
          color: action === "approve" ? "green" : "blue",
        });
        if (viewModal.open) setViewModal({ open: false, req: null });
      } else {
        const data = await res.json();
        notifications.show({
          title: "Error",
          message: data.detail || "Failed to process withdrawal.",
          color: "red",
        });
      }
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Error",
        message: "Network error. Please try again.",
        color: "red",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const rows = withdrawals.map((req) => (
    <Table.Tr key={req.id}>
      <Table.Td>
        <Text size="sm">{req.student_id}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {req.student_name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{req.scholarship_type}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          component="div"
          style={{
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {req.reason}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{new Date(req.requested_at).toLocaleDateString()}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="orange" variant="light">
          PENDING
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => setViewModal({ open: true, req })}
            >
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Approve Withdrawal (Delete Application)">
            <ActionIcon
              variant="subtle"
              color="green"
              loading={processingId === req.id}
              onClick={() => handleDecision(req.id, "approve")}
            >
              <CheckCircle size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Reject Withdrawal (Keep Application)">
            <ActionIcon
              variant="subtle"
              color="red"
              loading={processingId === req.id}
              onClick={() => handleDecision(req.id, "reject")}
            >
              <XCircle size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader size="md" />
      </Flex>
    );
  }

  return (
    <Container size="xl" py="md">
      <Flex justify="space-between" align="center" mb="md">
        <Text size="xl" fw={700}>
          Pending Withdrawal Requests
        </Text>
        <Button variant="outline" size="sm" onClick={fetchWithdrawals}>
          Refresh
        </Button>
      </Flex>

      <Table highlightOnHover verticalSpacing="md">
        <Table.Thead bg="#F5F7FA">
          <Table.Tr>
            <Table.Th>
              <Text size="sm" fw={600}>
                Roll No
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Student Name
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Scholarship Type
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Reason
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Requested At
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Status
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
              <Table.Td colSpan={7} py="xl" ta="center" c="dimmed">
                No pending withdrawal requests found.
              </Table.Td>
            </Table.Tr>
          ) : (
            rows
          )}
        </Table.Tbody>
      </Table>

      {/* View Details Modal */}
      <Modal
        opened={viewModal.open}
        onClose={() => setViewModal({ open: false, req: null })}
        title="Withdrawal Request Details"
        size="lg"
        centered
      >
        {viewModal.req && (
          <div>
            <Text fw={700} size="lg" mb="sm">
              Reason for Withdrawal
            </Text>
            <Text
              p="md"
              bg="gray.0"
              style={{ borderRadius: 8, marginBottom: 20 }}
            >
              {viewModal.req.reason}
            </Text>

            <Text fw={700} size="md" mb="sm">
              Application Details
            </Text>
            {viewModal.req.application_data ? (
              <>
                <Table verticalSpacing="xs">
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td fw={500}>Application ID</Table.Td>
                      <Table.Td>{viewModal.req.application_data.id}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td fw={500}>Academic Year</Table.Td>
                      <Table.Td>
                        {viewModal.req.application_data.academic_year}
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td fw={500}>Semester</Table.Td>
                      <Table.Td>
                        {viewModal.req.application_data.semester}
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td fw={500}>Original Status</Table.Td>
                      <Table.Td>
                        <Badge color="blue" variant="filled">
                          {viewModal.req.application_data.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>

                <Text fw={700} mt="lg" mb="xs" size="sm">
                  Technical Data
                </Text>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {Object.entries(viewModal.req.application_data)
                    .filter(
                      ([key, val]) =>
                        ![
                          "id",
                          "status",
                          "date",
                          "academic_year",
                          "semester",
                        ].includes(key) &&
                        val &&
                        typeof val !== "object",
                    )
                    .map(([key, val]) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #fafafa",
                          padding: "4px 0",
                        }}
                      >
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ textTransform: "capitalize" }}
                        >
                          {key.replace(/_/g, " ")}
                        </Text>
                        <Text size="xs">{String(val)}</Text>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <Text c="red" size="sm">
                Original application data not available.
              </Text>
            )}

            <Group justify="flex-end" mt="xl">
              <Button
                color="green"
                leftSection={<CheckCircle size={16} />}
                onClick={() => handleDecision(viewModal.req.id, "approve")}
                loading={processingId === viewModal.req.id}
              >
                Approve Withdrawal
              </Button>
              <Button
                color="red"
                variant="outline"
                leftSection={<XCircle size={16} />}
                onClick={() => handleDecision(viewModal.req.id, "reject")}
                loading={processingId === viewModal.req.id}
              >
                Reject Withdrawal
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </Container>
  );
}

export default WithdrawalRequests;
