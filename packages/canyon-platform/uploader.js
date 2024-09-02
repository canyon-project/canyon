import fs from "fs";
import { uploadCanyonCoverage } from "canyon-uploader3";

uploadCanyonCoverage().finally(() => {
  console.log("canyon: upload init coverage done");
  if (fs.existsSync(".canyon_output")) {
    fs.rm(".canyon_output", { recursive: true }, (err) => {
      if (err) {
        console.log(err);
      }
      console.log("canyon: remove .canyon_output done");
    });
  }
});
