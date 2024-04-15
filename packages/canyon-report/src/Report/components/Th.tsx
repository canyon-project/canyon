const Th = () => {
  return (
    <thead>
      <tr>
        <th
          data-col="file"
          data-fmt="html"
          data-html="true"
          className="file sorted"
        >
          File
          <span className="sorter" />
        </th>
        <th
          data-col="pic"
          data-type="number"
          data-fmt="html"
          data-html="true"
          className="pic"
        >
          <span className="sorter" />
        </th>
        <th
          data-col="statements"
          data-type="number"
          data-fmt="pct"
          className="pct"
        >
          Statements
          <span className="sorter" />
        </th>
        <th
          data-col="statements_raw"
          data-type="number"
          data-fmt="html"
          className="abs"
        >
          <span className="sorter" />
        </th>
        <th
          data-col="branches"
          data-type="number"
          data-fmt="pct"
          className="pct"
        >
          Branches
          <span className="sorter" />
        </th>
        <th
          data-col="branches_raw"
          data-type="number"
          data-fmt="html"
          className="abs"
        >
          <span className="sorter" />
        </th>
        <th
          data-col="functions"
          data-type="number"
          data-fmt="pct"
          className="pct"
        >
          Functions
          <span className="sorter" />
        </th>
        <th
          data-col="functions_raw"
          data-type="number"
          data-fmt="html"
          className="abs"
        >
          <span className="sorter" />
        </th>
        <th data-col="lines" data-type="number" data-fmt="pct" className="pct">
          Lines
          <span className="sorter" />
        </th>
        <th
          data-col="lines_raw"
          data-type="number"
          data-fmt="html"
          className="abs"
        >
          <span className="sorter" />
        </th>
      </tr>
    </thead>
  );
};

export default Th;
