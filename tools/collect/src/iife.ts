import { installCollect } from "./core.js";
import { applyCollectParamsFromCurrentScript } from "./script-params.js";
import { isWebDriverBrowser } from "./webdriver.js";

if (!isWebDriverBrowser()) {
  applyCollectParamsFromCurrentScript();
  installCollect();
}
