export function coverageMapQuerySql(hashList: string[]): string {
  return `
    SELECT *
    FROM coverage_map
    WHERE hash IN (${hashList.map((hash) => `'${hash}'`).join(', ')});
  `;
}
