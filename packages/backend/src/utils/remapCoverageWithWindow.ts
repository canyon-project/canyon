// @ts-nocheck
export const remapCoverageWithWindow = (coverage) => {
  const remappedCoverage = {};
  // C:\home\mcddeploy\slave-000\workspace\RN_V2\source\ibu-flight-app-booking-db52ebf09f242eb2ae7a80b21b126c86ee9f471c-db52ebf09f242eb2ae7a80b21b126c86ee9f471c\src\CouponListPage\ListModule\View\index.tsx
  Object.entries(coverage).forEach(([key, value]) => {
    const zhuanhuan = value.path.replaceAll('\\', '/').replaceAll('C:', '');
    remappedCoverage[zhuanhuan] = {
      ...value,
      path: zhuanhuan,
    };
  });
  return remappedCoverage;
};
