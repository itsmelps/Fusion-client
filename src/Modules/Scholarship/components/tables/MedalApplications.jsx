/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Box, Button, Select, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// eslint-disable-next-line import/no-unresolved
import { mkConfig, generateCsv, download } from "export-to-csv";
import { host } from "../../../../routes/globalRoutes";
import styles from "../../styles/medal_applications.module.css";
import {
  fetchSilverApplications,
  fetchGoldApplications,
  fetchPDMApplications,
  updateSilverStatus,
  updateGoldStatus,
  updatePDMStatus,
  sendNotification,
} from "../../services/api";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

function MedalApplications() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [medals, setMedals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedalsData = async () => {
    setIsLoading(true);
    try {
      let data;
      if (selectedAward === "Director's Gold Medal")
        data = await fetchGoldApplications();
      else if (selectedAward === "D&M Proficiency Gold Medal")
        data = await fetchPDMApplications();
      else data = await fetchSilverApplications();
      setMedals(data.filter((m) => m.status === "INCOMPLETE"));
      setError(null);
    } catch (fetchErr) {
      console.error(fetchErr);
      setError("Error loading medals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedalsData();
  }, [selectedAward]);

  const handleAction = async (id, action, student) => {
    const confirmed = window.confirm("Are you sure you want to proceed?");
    if (!confirmed) return;
    try {
      if (selectedAward === "Director's Gold Medal") {
        await updateGoldStatus(id, action === "approved" ? "accept" : "reject");
      } else if (selectedAward === "D&M Proficiency Gold Medal") {
        await updatePDMStatus(
          id,
          action === "approved" ? "ACCEPTED" : "REJECTED",
        );
      } else {
        await updateSilverStatus(
          id,
          action === "approved" ? "ACCEPTED" : "REJECTED",
        );
      }
      fetchMedalsData();
    } catch (actionErr) {
      console.error(actionErr);
      setError("Error updating status");
    }

    let notifType = "";
    if (action === "approved" && selectedAward.includes("Silver"))
      notifType = "Accept_Silver";
    if (action === "rejected" && selectedAward.includes("Silver"))
      notifType = "Reject_Silver";
    if (action === "approved" && selectedAward.includes("Gold"))
      notifType = "Accept_Gold";
    if (action === "rejected" && selectedAward.includes("Gold"))
      notifType = "Reject_Gold";
    if (selectedAward === "D&M Proficiency Gold Medal")
      notifType = action === "approved" ? "Accept_DM" : "Reject_DM";
    try {
      await sendNotification(student, notifType);
    } catch (notifErr) {
      console.error("Notification error", notifErr);
    }
  };

  const handleExportRows = (rows) =>
    download(csvConfig)(generateCsv(csvConfig)(rows.map((r) => r.original)));
  const handleExportAll = () =>
    handleExportRows(medals.map((m) => ({ original: m })));

  const handleDownloadAllMarksheets = async () => {
    if (!medals.length) return alert("No medals to download");
    const zip = new JSZip();
    const token = localStorage.getItem("authToken");
    await Promise.all(
      medals.map(async (medal, index) => {
        try {
          const response = await fetch(`${host}${medal.Marksheet}`, {
            headers: { Authorization: `Token ${token}` },
          });
          if (!response.ok)
            throw new Error(`Failed to fetch file for ${medal.student}`);
          const blob = await response.blob();
          zip.file(
            `${medal.student}${index}_marksheet.${blob.type.split("/")[1] || "pdf"}`,
            blob,
          );
        } catch (zipErr) {
          console.error(
            `Error downloading marksheet for ${medal.student}:`,
            zipErr,
          );
        }
      }),
    );
    zip
      .generateAsync({ type: "blob" })
      .then((content) => saveAs(content, "All_Marksheets.zip"));
  };

  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No" },
      { id: "award", header: "Award", accessorFn: () => selectedAward },
      {
        accessorKey: "Marksheet",
        header: "File",
        Cell: ({ cell }) => (
          <a
            href={`${host}${cell.getValue()}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.fileButton}`}
          >
            View Marksheet
          </a>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <Box className={styles.statusButtons}>
            <Button
              size="xs"
              color="green"
              onClick={() =>
                handleAction(row.original.id, "approved", row.original.student)
              }
            >
              Approve
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() =>
                handleAction(row.original.id, "rejected", row.original.student)
              }
            >
              Reject
            </Button>
          </Box>
        ),
      },
    ],
    [selectedAward],
  );

  const table = useMantineReactTable({
    columns,
    data: medals,
    enableSorting: true,
    enableRowSelection: true,
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table: mrtTable }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button leftSection={<IconDownload />} onClick={handleExportAll}>
            Export CSV (All)
          </Button>
          <Button
            leftSection={<IconDownload />}
            disabled={
              !mrtTable.getIsSomeRowsSelected() &&
              !mrtTable.getIsAllRowsSelected()
            }
            onClick={() =>
              handleExportRows(mrtTable.getSelectedRowModel().rows)
            }
          >
            Export CSV (Selected)
          </Button>
          <Button
            color="gray"
            leftSection={<IconDownload />}
            onClick={handleDownloadAllMarksheets}
          >
            Download Marksheets ZIP
          </Button>
        </div>
      </Box>
    ),
  });

  return (
    <div className={styles.container}>
      <Text size="xl" fw={500} mb="sm">
        Medal Applications
      </Text>
      <Select
        value={selectedAward}
        onChange={(v) => v && setSelectedAward(v)}
        data={[
          {
            value: "Director's Silver Medal",
            label: "Director's Silver Medal",
          },
          { value: "Director's Gold Medal", label: "Director's Gold Medal" },
          {
            value: "D&M Proficiency Gold Medal",
            label: "D&M Proficiency Gold Medal",
          },
        ]}
      />
      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : (
        <MantineReactTable table={table} />
      )}
    </div>
  );
}

export default MedalApplications;
