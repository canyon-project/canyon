// src/types/global.d.ts
import {CanyonReportData} from "../types.ts";

declare global {
  interface Window {
    reportData: CanyonReportData
  }
}
