// hash     String,
//   statement_map   Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
//   fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
//   branch_map      Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
//   input_source_map String,
//   ts              DateTime
// 查询coverage_map表
export function coverageMapQuerySql(hashList: string[]): string {
  return `
    SELECT *
    FROM coverage_map
    WHERE hash IN (${hashList.map((hash) => `'${hash}'`).join(', ')});
  `;
}
