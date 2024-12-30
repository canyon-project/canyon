export function percent(covered:number, total:number) {
  let tmp;
  if (total > 0) {
    tmp = (1000 * 100 * covered) / total;
    return Math.floor(tmp / 10) / 100;
  } else {
    return 100.0;
  }
}

export function parseProjectID(projectID:string) {
  if (projectID.split("-").length !== 3) {
    throw new Error(`Invalid projectID: ${projectID}`);
  }
  return {
    provider: projectID.split("-")[0],
    repoID: projectID.split("-")[1],
    slug: projectID.split("-")[2],
  }
}
