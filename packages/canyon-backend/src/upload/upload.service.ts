import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class UploadService {
  async jacoco(data, coverage) {
    const fd = new FormData();

    fd.append("file", coverage);
    fd.append("commitSha", data.commitSha);
    fd.append("branch", data.branch);
    fd.append("projectID", data.projectID);

    const url = `http://localhost:8080`;
    const res = await axios
      .post(`${url}/coverage/client/jacoco`, fd, {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InR6aGFuZ20iLCJpZCI6ODQxNywiaWF0IjoxNzAxODUxNTQ1LCJleHAiOjIwMTc0Mjc1NDV9.Bx8pYLNP9XlmrPDlHNCz_M1A-VoEbhTx0njYyTr9n6Y`,
        },
      })
      .then((res) => {
        console.log(res.data.message);
      });
    return "ok";
  }
}
