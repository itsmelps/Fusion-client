import React, { useState, useMemo } from "react";
import { Button, Box, Text, Loader, Container, Title } from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconDownload } from "@tabler/icons-react";
import styles from "../../styles/ScholarshipStatus.module.css";
import {
  fetchMCMStatus,
  fetchGoldStatus,
  fetchSilverStatus,
  fetchPDMStatus,
} from "../../services/api";
import { buildCsvHelpers } from "../../utils/helpers";

const { exportAll, exportRows } = buildCsvHelpers("scholarship_status");

export default function ScholarshipStatus() {
  const [page, setPage] = useState(1);
  const [showStatus, setShowStatus] = useState(false);
  const [applications, setApplications] = useState([]);

  const fetchFnMap = {
    2: fetchMCMStatus,
    3: fetchGoldStatus,
    4: fetchSilverStatus,
    5: fetchPDMStatus,
  };

  const fetchStatus = async (apiFn) => {
    setShowStatus(true);
    setApplications([]);
    try {
      const data = await apiFn();
      setApplications(data);
    } catch (fetchErr) {
      console.error("Fetch error:", fetchErr);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Application ID", enableSorting: true },
      { accessorKey: "status", header: "Status", enableSorting: true },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: applications,
    enableSorting: true,
    enableRowSelection: true,
    paginationDisplayMode: "pages",
    renderTopToolbarCustomActions: ({ table: mrtTable }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button
            leftSection={<IconDownload />}
            onClick={() => exportAll(applications)}
            disabled={!applications.length}
          >
            Export All Data
          </Button>
          <Button
            leftSection={<IconDownload />}
            onClick={() => exportRows(mrtTable.getRowModel().rows)}
            disabled={!mrtTable.getRowModel().rows.length}
          >
            Export Page Rows
          </Button>
          <Button
            leftSection={<IconDownload />}
            onClick={() => exportRows(mrtTable.getSelectedRowModel().rows)}
            disabled={
              !mrtTable.getIsSomeRowsSelected() &&
              !mrtTable.getIsAllRowsSelected()
            }
          >
            Export Selected
          </Button>
        </div>
      </Box>
    ),
  });

  const scholarships = [
    { label: "Merit-Cum-Means Scholarship", page: 2 },
    { label: "Director's Gold Medal", page: 3 },
    { label: "Director's Silver Medal", page: 4 },
    { label: "D&M Proficiency Gold Medal", page: 5 },
  ];

  const renderStatusBlock = (label, pageNum) => (
    <div className={styles.formContainer}>
      <Title order={3} className={styles.scholarshipName}>
        {label}
      </Title>
      {!showStatus ? (
        <Button
          className={styles.checkStatusButton}
          onClick={() => fetchStatus(fetchFnMap[pageNum])}
        >
          Check Status
        </Button>
      ) : applications.length === 0 ? (
        <Loader size="lg" />
      ) : (
        <MantineReactTable table={table} />
      )}
    </div>
  );

  return (
    <Container className={styles.wrapper}>
      {page === 1 && (
        <div className={styles.scholarshipContainer}>
          {scholarships.map(({ label, page: p }) => (
            <div key={String(p)} className={styles.sch}>
              <Text className={styles.scholarshipName}>{label}</Text>
              <Button
                className={styles.checkStatusButton}
                onClick={() => {
                  setPage(p);
                  setShowStatus(false);
                }}
              >
                Check Status
              </Button>
            </div>
          ))}
        </div>
      )}
      {page > 1 &&
        renderStatusBlock(
          scholarships.find((s) => s.page === page)?.label,
          page,
        )}
    </Container>
  );
}
