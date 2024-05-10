export function resolveProjectID(projectID) {
  return projectID.split('-')[1] || projectID;
}
