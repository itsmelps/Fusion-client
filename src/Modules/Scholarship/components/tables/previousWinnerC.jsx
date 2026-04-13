import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { Select, Button, Text, Box, Loader } from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconDownload } from "@tabler/icons-react";
import styles from "../../styles/previousWinnersC.module.css";
import { fetchPreviousWinners } from "../../services/api";
import {
  AWARD_MAPPING,
  PROGRAMME_OPTIONS,
  getYearOptions,
  buildCsvHelpers,
  normaliseWinnersResponse,
} from "../../utils/helpers";

const { exportAll, exportRows } = buildCsvHelpers("previous-winners");

function PreviousWinnersConvenor() {
  const [programme, setProgramme] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [award, setAward] = useState("");
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFetchError(null);
    if (!programme || !academicYear || !award) {
      setFetchError("Please select programme, academic year, and award.");
      setShowTable(true);
      setWinners([]);
      return;
    }
    const awardId = AWARD_MAPPING[award];
    if (awardId == null) {
      setFetchError("Unknown award mapping.");
      setShowTable(true);
      setWinners([]);
      return;
    }
    setIsLoading(true);
    setShowTable(true);
    try {
      const data = await fetchPreviousWinners(
        programme,
        parseInt(academicYear, 10),
        awardId,
      );
      setWinners(normaliseWinnersResponse(data));
    } catch (fetchErr) {
      setWinners([]);
      const msg =
        (fetchErr && fetchErr.message) ||
        String(fetchErr) ||
        "Failed to load winners.";
      setFetchError(msg);
      console.error("Error fetching winners:", fetchErr);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { accessorKey: "name", header: "Name", size: 200 },
    { accessorKey: "roll", header: "Roll No", size: 120 },
    { accessorKey: "program", header: "Program", size: 180 },
  ];

  const table = useMantineReactTable({
    columns,
    data: winners,
    enableRowSelection: true,
    enableSorting: true,
    columnFilterDisplayMode: "popover",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table: mrtTable }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button
            color="blue"
            onClick={() => exportAll(winners)}
            leftSection={<IconDownload />}
            className="expbtn"
          >
            Export All Data
          </Button>
          <Button
            disabled={mrtTable.getPrePaginationRowModel().rows.length === 0}
            onClick={() => exportRows(mrtTable.getPrePaginationRowModel().rows)}
            leftSection={<IconDownload />}
            className="expbtn"
          >
            Export All Rows
          </Button>
          <Button
            disabled={mrtTable.getRowModel().rows.length === 0}
            onClick={() => exportRows(mrtTable.getRowModel().rows)}
            leftSection={<IconDownload />}
            className="expbtn"
          >
            Export Page Rows
          </Button>
          <Button
            disabled={
              !mrtTable.getIsSomeRowsSelected() &&
              !mrtTable.getIsAllRowsSelected()
            }
            onClick={() => exportRows(mrtTable.getSelectedRowModel().rows)}
            leftSection={<IconDownload />}
            className="expbtn"
          >
            Export Selected Rows
          </Button>
        </div>
      </Box>
    ),
  });

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <Select
            label="Programme"
            placeholder="Select Programme"
            value={programme}
            onChange={setProgramme}
            data={PROGRAMME_OPTIONS}
            rightSection={<CaretDown />}
            className={styles.formItem}
          />
          <Select
            label="Academic Year"
            placeholder="Select Year"
            value={academicYear}
            onChange={setAcademicYear}
            data={getYearOptions()}
            rightSection={<CaretDown />}
            className={styles.formItem}
          />
          <Select
            label="Scholarship/Awards"
            placeholder="Select Award"
            value={award}
            onChange={setAward}
            data={Object.keys(AWARD_MAPPING).map((a) => ({
              value: a,
              label: a,
            }))}
            rightSection={<CaretDown />}
            className={styles.formItem}
          />
        </div>
        <div className={styles.buttonContainer}>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
      {showTable && (
        <div className={styles.winnersList}>
          {isLoading ? (
            <Loader size="lg" />
          ) : fetchError ? (
            <Text c="red" size="sm">
              {fetchError}
            </Text>
          ) : winners.length > 0 ? (
            <MantineReactTable table={table} />
          ) : (
            <Text c="dimmed">
              No winners found for this programme, year, and award.
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

export default PreviousWinnersConvenor;
