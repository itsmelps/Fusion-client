/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import { Loader, Text, Button, Modal } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import { IconDownload } from "@tabler/icons-react";
// eslint-disable-next-line import/no-unresolved
import { mkConfig, generateCsv, download } from "export-to-csv";
import styles from "../../styles/MCM_applications.module.css";
import MedalApplications from "./MedalApplications";
import { host } from "../../../../routes/globalRoutes";
import {
  fetchMCMApplications,
  updateMCMStatus,
  sendNotification,
} from "../../services/api";

function MCMApplications() {
  const [activeTab, setActiveTab] = useState("MCM");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileModalOpened, setFileModalOpened] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchMCMApplications();
      setApplications(data.filter((app) => app.status === "INCOMPLETE"));
      setError(null);
    } catch (fetchErr) {
      console.error(fetchErr);
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (id, action, student) => {
    const confirmed = window.confirm("Are you sure you want to proceed?");
    if (!confirmed) return;

    const status =
      action === "approved"
        ? "ACCEPTED"
        : action === "rejected"
          ? "REJECTED"
          : "UNDER_REVIEW";
    try {
      await updateMCMStatus(id, status);
      fetchApplications();
    } catch (actionErr) {
      console.error("Error during approval:", actionErr);
    }

    const notifType =
      action === "approved"
        ? "Accept_MCM"
        : action === "rejected"
          ? "Reject_MCM"
          : "MCM_UNDER_REVIEW";
    try {
      await sendNotification(student, notifType);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }
  };

  const handleExportAll = () => {
    if (!applications.length) {
      alert("No applications to export.");
      return;
    }
    const config = mkConfig({
      fieldSeparator: ",",
      decimalSeparator: ".",
      useKeysAsHeaders: true,
      showTitle: true,
      title: "MCM Applications",
      useBom: true,
    });
    download(config)(generateCsv(config)(applications));
  };

  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No" },
      { accessorKey: "annual_income", header: "Income" },
      {
        accessorKey: "files",
        header: "Files",
        Cell: ({ row }) => (
          <Button
            size="xs"
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
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              color="green"
              size="xs"
              onClick={() =>
                handleAction(row.original.id, "approved", row.original.student)
              }
            >
              Accept
            </Button>
            <Button
              color="red"
              size="xs"
              onClick={() =>
                handleAction(row.original.id, "rejected", row.original.student)
              }
            >
              Reject
            </Button>
            <Button
              color="gray"
              size="xs"
              onClick={() =>
                handleAction(
                  row.original.id,
                  "under_review",
                  row.original.student,
                )
              }
            >
              Under Review
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const tabKeyDown = (e, tab) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div
          role="button"
          tabIndex={0}
          className={activeTab === "MCM" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("MCM")}
          onKeyDown={(e) => tabKeyDown(e, "MCM")}
        >
          Merit-cum-Means Scholarship
        </div>
        <div
          role="button"
          tabIndex={0}
          className={activeTab === "Medals" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("Medals")}
          onKeyDown={(e) => tabKeyDown(e, "Medals")}
        >
          Convocation Medals
        </div>
      </div>

      {activeTab === "MCM" && (
        <>
          <Text fw={500} size="lg" mb="md">
            Merit-cum-Means Scholarship
          </Text>
          {loading ? (
            <Loader />
          ) : error ? (
            <Text c="red">{error}</Text>
          ) : (
            <MantineReactTable
              columns={columns}
              data={applications}
              enableRowSelection
              enableSorting
              muiTableBodyCellProps={{ onClick: (e) => e.stopPropagation() }}
              renderTopToolbarCustomActions={() => (
                <div className={styles.exportButtonWrapper}>
                  <Button
                    leftSection={<IconDownload />}
                    onClick={handleExportAll}
                  >
                    Export All CSV
                  </Button>
                </div>
              )}
              mantineTableBodyRowProps={() => ({
                className: styles.stripedRow,
              })}
            />
          )}
          <Modal
            opened={fileModalOpened}
            onClose={() => setFileModalOpened(false)}
            title="Uploaded Files"
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
                      {label}
                    </a>
                  ) : null,
                )}
              </div>
            ) : (
              <Text>No files found.</Text>
            )}
          </Modal>
        </>
      )}
      {activeTab === "Medals" && <MedalApplications />}
    </div>
  );
}

export default MCMApplications;
