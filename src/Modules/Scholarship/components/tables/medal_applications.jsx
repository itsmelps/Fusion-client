/* eslint-disable no-unused-vars, import/no-unresolved, no-use-before-define, no-shadow, react/no-unstable-nested-components, react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Box,
  Button,
  Select,
  Text,
  Badge,
  Group,
  Alert,
  Modal,
} from "@mantine/core";
import { IconDownload, IconAlertCircle } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
  getDirectorGoldApplicationsRoute,
  getDirectorSilverApplicationsRoute,
  getProficiencyDMApplicationsRoute,
  updateDirectorGoldStatusRoute,
  updateDirectorSilverStatusRoute,
  updateProficiencyDMStatusRoute,
  scholarshipNotification,
} from "../../../../routes/SPACSRoutes";
import { host } from "../../../../routes/globalRoutes";
import styles from "../../styles/medal_applications.module.css";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const STATUS_COLORS = {
  INCOMPLETE: "blue",
  Incomplete: "blue",
  ACCEPTED: "green",
  Accept: "green",
  REJECTED: "red",
  Reject: "red",
  UNDER_REVIEW: "orange",
  WITHDRAWN: "gray",
  Withdrawn: "gray",
};

function MedalApplications() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [medals, setMedals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("INCOMPLETE");
  // UC-005: Acknowledge Withdrawal
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const fetchMedalsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      let apiUrl = getDirectorSilverApplicationsRoute;
      if (selectedAward === "Director's Gold Medal")
        apiUrl = getDirectorGoldApplicationsRoute;
      if (selectedAward === "D&M Proficiency Gold Medal")
        apiUrl = getProficiencyDMApplicationsRoute;

      const { data } = await axios.get(apiUrl, {
        headers: { Authorization: `Token ${token}` },
      });
      setMedals(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error loading medal applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedalsData();
  }, [selectedAward]);

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
      console.error("Notification error", err);
    }
  };

  // UC-006: Sanctioning Decision
  const handleApproval = async (id, action) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      let apiUrl = updateDirectorSilverStatusRoute;
      let payload = {
        id,
        status: action === "approved" ? "ACCEPTED" : "REJECTED",
      };

      if (selectedAward === "Director's Gold Medal") {
        apiUrl = updateDirectorGoldStatusRoute;
        payload = { id, action: action === "approved" ? "accept" : "reject" };
      }
      if (selectedAward === "D&M Proficiency Gold Medal") {
        apiUrl = updateProficiencyDMStatusRoute;
        payload = {
          id,
          status: action === "approved" ? "ACCEPTED" : "REJECTED",
        };
      }
      await axios.post(apiUrl, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchMedalsData();
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error updating status");
    }
  };

  const handleAction = async (id, action, student) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this application?`,
    );
    if (!confirmed) return;

    await handleApproval(id, action);

    // BR-SPACS-008: Notify student
    let notifType = "";
    if (action === "approved" && selectedAward.includes("Silver"))
      notifType = "Accept_Silver";
    if (action === "rejected" && selectedAward.includes("Silver"))
      notifType = "Reject_Silver";
    if (action === "approved" && selectedAward === "Director's Gold Medal")
      notifType = "Accept_Gold";
    if (action === "rejected" && selectedAward === "Director's Gold Medal")
      notifType = "Reject_Gold";
    if (selectedAward === "D&M Proficiency Gold Medal")
      notifType = action === "approved" ? "Accept_DM" : "Reject_DM";

    if (notifType) await handleNotification(student, notifType);
  };

  // UC-005: Acknowledge Withdrawal for medals
  const handleAcknowledgeWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    try {
      const token = localStorage.getItem("authToken");
      const awardTypeMap = {
        "Director's Gold Medal": "gold",
        "Director's Silver Medal": "silver",
        "D&M Proficiency Gold Medal": "pdm",
      };
      const res = await axios.post(
        `/api/scholarships/acknowledge-withdrawal/`,
        {
          application_id: selectedWithdrawal.id,
          award_type: awardTypeMap[selectedAward] || "silver",
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.status === 200) {
        await handleNotification(
          selectedWithdrawal.student,
          "MEDAL_WITHDRAWAL_ACKNOWLEDGED",
        );
        alert("Withdrawal acknowledged. Application closed.");
        setWithdrawalModalOpen(false);
        fetchMedalsData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to acknowledge withdrawal.");
    }
  };

  const handleExportRows = (rows) => {
    const csv = generateCsv(csvConfig)(rows.map((r) => r.original));
    download(csvConfig)(csv);
  };
  const handleExportAll = () =>
    handleExportRows(filteredMedals.map((m) => ({ original: m })));

  const handleDownloadAllMarksheets = async () => {
    if (!filteredMedals.length) return alert("No medals to download");
    const zip = new JSZip();
    const token = localStorage.getItem("authToken");
    await Promise.all(
      filteredMedals.map(async (medal, index) => {
        try {
          const url = `${host}${medal.relevant_document || medal.Marksheet}`;
          const response = await fetch(url, {
            headers: { Authorization: `Token ${token}` },
          });
          if (!response.ok)
            throw new Error(`Failed to fetch for ${medal.student}`);
          const blob = await response.blob();
          zip.file(
            `${medal.student}_${index}.${blob.type.split("/")[1] || "pdf"}`,
            blob,
          );
        } catch (error) {
          console.error(`Error for ${medal.student}:`, error);
        }
      }),
    );
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${selectedAward.replace(/\s+/g, "_")}_documents.zip`);
    });
  };

  const filteredMedals = useMemo(() => {
    if (statusFilter === "ALL") return medals;
    return medals.filter((m) => m.status === statusFilter);
  }, [medals, statusFilter]);

  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No", size: 120 },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => (
          <Badge
            color={STATUS_COLORS[row.original.status] || "gray"}
            variant="filled"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "date",
        header: "Date Applied",
        Cell: ({ row }) => row.original.date || "—",
      },
      {
        accessorKey: "relevant_document",
        header: "Document",
        Cell: ({ row }) => {
          const docPath =
            row.original.relevant_document || row.original.Marksheet;
          return docPath ? (
            <a
              href={`${host}${docPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.button} ${styles.fileButton}`}
            >
              View Document
            </a>
          ) : (
            <Text size="xs" color="dimmed">
              No document
            </Text>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => {
          const { id, student, status } = row.original;
          const isWithdrawn = status === "WITHDRAWN" || status === "Withdrawn";
          const isDecided =
            status === "ACCEPTED" ||
            status === "Accept" ||
            status === "REJECTED" ||
            status === "Reject";

          return (
            <Box className={styles.statusButtons}>
              {isWithdrawn ? (
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
                <Group spacing={4}>
                  <Button
                    size="xs"
                    color="green"
                    onClick={() => handleAction(id, "approved", student)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleAction(id, "rejected", student)}
                  >
                    Reject
                  </Button>
                </Group>
              )}
            </Box>
          );
        },
      },
    ],
    [selectedAward],
  );

  const table = useMantineReactTable({
    columns,
    data: filteredMedals,
    enableSorting: true,
    enableRowSelection: true,
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table: t }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button
            leftIcon={<IconDownload size={16} />}
            size="sm"
            onClick={handleExportAll}
          >
            Export CSV (All)
          </Button>
          <Button
            leftIcon={<IconDownload size={16} />}
            size="sm"
            variant="outline"
            disabled={!t.getIsSomeRowsSelected() && !t.getIsAllRowsSelected()}
            onClick={() => handleExportRows(t.getSelectedRowModel().rows)}
          >
            Export CSV (Selected)
          </Button>
          <Button
            color="gray"
            size="sm"
            leftIcon={<IconDownload size={16} />}
            onClick={handleDownloadAllMarksheets}
          >
            Download Docs ZIP
          </Button>
        </div>
      </Box>
    ),
  });

  return (
    <div className={styles.container}>
      <Group mb="md" align="center" position="apart">
        <Text size="xl" weight={600}>
          Medal Applications
        </Text>
        <Group spacing="sm">
          <Select
            value={selectedAward}
            onChange={setSelectedAward}
            size="sm"
            data={[
              {
                value: "Director's Silver Medal",
                label: "Director's Silver Medal",
              },
              {
                value: "Director's Gold Medal",
                label: "Director's Gold Medal",
              },
              {
                value: "D&M Proficiency Gold Medal",
                label: "D&M Proficiency Gold Medal",
              },
            ]}
            style={{ width: 220 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            data={[
              { value: "ALL", label: "All Status" },
              { value: "INCOMPLETE", label: "Submitted" },
              { value: "UNDER_REVIEW", label: "Under Review" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "REJECTED", label: "Rejected" },
              { value: "WITHDRAWN", label: "Withdrawal Requested" },
            ]}
            style={{ width: 200 }}
          />
        </Group>
      </Group>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      ) : filteredMedals.length === 0 ? (
        <Alert color="blue">
          No applications found for the selected filters.
        </Alert>
      ) : (
        <MantineReactTable table={table} />
      )}

      {/* UC-005: Acknowledge Withdrawal Modal */}
      <Modal
        opened={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        title="Acknowledge Withdrawal Request"
        size="md"
      >
        <Alert color="orange" mb="md" icon={<IconAlertCircle size={16} />}>
          Student <strong>{selectedWithdrawal?.student}</strong> has requested
          to withdraw their <strong>{selectedAward}</strong> application.
          Acknowledging this will close the application.
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
    </div>
  );
}

export default MedalApplications;
