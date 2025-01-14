import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";
import lightplus from "shiki/themes/light-plus.mjs";
import tokyoNight from "shiki/themes/tokyo-night.mjs";
import css from "shiki/langs/css.mjs";
import jscss from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

export const createHighlighterCoreInstance = async () => {
  return await createHighlighterCore({
    themes: [
      // 传入导入的包，而不是字符串
      lightplus,
      tokyoNight,
    ],
    langs: [css, jscss, json],
    // `shiki/wasm` contains the wasm binary inlined as base64 string.
    engine: createOnigurumaEngine(getWasm),
  });
};
