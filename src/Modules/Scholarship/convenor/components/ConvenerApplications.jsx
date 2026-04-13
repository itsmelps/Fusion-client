/* eslint-disable no-unused-vars, import/no-unresolved, react/prop-types, no-use-before-define, react/no-unstable-nested-components, jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useMemo } from "react";
import {
  Loader,
  Text,
  Button,
  Modal,
  Badge,
  Alert,
  Group,
  Select,
  Box,
} from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconDownload, IconAlertCircle } from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
  getMCMApplicationsRoute,
  updateMCMStatusRoute,
  getDirectorGoldApplicationsRoute,
  getDirectorSilverApplicationsRoute,
  getProficiencyDMApplicationsRoute,
  updateDirectorGoldStatusRoute,
  updateDirectorSilverStatusRoute,
  updateProficiencyDMStatusRoute,
  scholarshipNotification,
} from "../../../../routes/SPACSRoutes";
import { host } from "../../../../routes/globalRoutes";
import styles from "../../styles/MCM_applications.module.css";
// reusing the MCM module css since it has tab styling

const STATUS_LABELS = {
  INCOMPLETE: { color: "blue", label: "Submitted" },
  Complete: { color: "blue", label: "Forwarded (Pending Review)" },
  ACCEPTED: { color: "green", label: "Accepted" },
  Accept: { color: "green", label: "Accepted" },
  REJECTED: { color: "red", label: "Rejected" },
  Reject: { color: "red", label: "Rejected" },
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

function ConvenerApplications() {
  const [activeTab, setActiveTab] = useState("MCM");

  return (
    <div className={styles.container}>
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
        <div
          role="button"
          tabIndex={0}
          className={
            activeTab === "SingleParent" ? styles.activeTab : styles.tab
          }
          onClick={() => setActiveTab("SingleParent")}
        >
          Single Parent Scholarship
        </div>
      </div>

      {activeTab === "MCM" && <MCMConvenerView />}
      {activeTab === "Medals" && <MedalsConvenerView />}
      {activeTab === "SingleParent" && (
        <Alert icon={<IconAlertCircle size={16} />} color="blue" mt="md">
          <Text weight={600}>
            Single Parent Scholarship is Under Construction.
          </Text>
          <Text size="sm">
            No backend support or application workflows are currently available
            for this module yet.
          </Text>
        </Alert>
      )}
    </div>
  );
}

function MCMConvenerView() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Complete"); // Default to forwarded applications
  const [fileModalOpened, setFileModalOpened] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);

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

  const handleAction = async (id, action, student) => {
    const actionLabels = {
      approved: "approve",
      rejected: "reject",
    };
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabels[action] || action} this application?`,
    );
    if (!confirmed) return;

    const payload = {
      id,
      status: action === "approved" ? "ACCEPTED" : "REJECTED",
    };

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(updateMCMStatusRoute, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.status === 200) {
        const notifMap = {
          approved: "Accept_MCM",
          rejected: "Reject_MCM",
        };
        await handleNotification(student, notifMap[action]);
        fetchApplications();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update application status.");
    }
  };

  const handleExportAll = () => {
    if (convenorApplications.length === 0) {
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

  // Only consider applications that are either Complete (forwarded by SPACS), ACCEPTED, or REJECTED.
  const convenorApplications = useMemo(() => {
    return applications.filter((app) =>
      ["Complete", "ACCEPTED", "REJECTED"].includes(app.status),
    );
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === "ALL") return convenorApplications;
    return convenorApplications.filter((app) => app.status === statusFilter);
  }, [convenorApplications, statusFilter]);

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
          const isDecided = status === "ACCEPTED" || status === "REJECTED";

          return (
            <Group spacing={4}>
              {isDecided ? (
                <Text size="xs" color="dimmed">
                  Decision recorded
                </Text>
              ) : (
                <>
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
    <>
      <Group mb="md" align="center" position="apart" mt="md">
        <Text weight={600} size="lg">
          MCM Applications for Approval
        </Text>
        <Select
          size="sm"
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: "ALL", label: "All Forwarded" },
            { value: "Complete", label: "Pending Approval" },
            { value: "ACCEPTED", label: "Accepted" },
            { value: "REJECTED", label: "Rejected" },
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
          <div
            className={styles.fileModalContainer}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
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
                  style={{ textDecoration: "none", color: "#1B61B3" }}
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
    </>
  );
}

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

function MedalsConvenerView() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [medals, setMedals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Complete");

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

  const convenorMedals = useMemo(() => {
    return medals.filter((app) =>
      ["Complete", "ACCEPTED", "Accept", "REJECTED", "Reject"].includes(
        app.status,
      ),
    );
  }, [medals]);

  const filteredMedals = useMemo(() => {
    if (statusFilter === "ALL") return convenorMedals;
    // Map backend response variants to uniform status values for filtering
    return convenorMedals.filter((m) => {
      let normalizedStatus = m.status;
      if (m.status === "Accept") normalizedStatus = "ACCEPTED";
      if (m.status === "Reject") normalizedStatus = "REJECTED";
      return normalizedStatus === statusFilter;
    });
  }, [convenorMedals, statusFilter]);

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
        } catch (err) {
          console.error(`Error for ${medal.student}:`, err);
        }
      }),
    );
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${selectedAward.replace(/\s+/g, "_")}_documents.zip`);
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No", size: 120 },
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
        accessorKey: "relevant_document",
        header: "Document",
        Cell: ({ row }) => {
          const docPath =
            row.original.relevant_document || row.original.Marksheet;
          return docPath ? (
            <Button
              component="a"
              href={`${host}${docPath}`}
              target="_blank"
              size="xs"
              variant="outline"
              rel="noopener noreferrer"
            >
              View Document
            </Button>
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
          const isDecided =
            status === "ACCEPTED" ||
            status === "Accept" ||
            status === "REJECTED" ||
            status === "Reject";

          return (
            <Box>
              {isDecided ? (
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
      <Box style={{ display: "flex", gap: "8px" }}>
        <Button
          leftSection={<IconDownload size={16} />}
          size="sm"
          onClick={handleExportAll}
        >
          Export CSV (All)
        </Button>
        <Button
          leftSection={<IconDownload size={16} />}
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
          leftSection={<IconDownload size={16} />}
          onClick={handleDownloadAllMarksheets}
        >
          Download Docs ZIP
        </Button>
      </Box>
    ),
  });

  return (
    <Box mt="md">
      <Group mb="md" align="center" position="apart">
        <Text size="xl" weight={600}>
          Medals Pending Approval
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
              { value: "ALL", label: "All Forwarded" },
              { value: "Complete", label: "Pending Approval" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "REJECTED", label: "Rejected" },
            ]}
            style={{ width: 200 }}
          />
        </Group>
      </Group>

      {isLoading ? (
        <Loader />
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
    </Box>
  );
}

export default ConvenerApplications;
