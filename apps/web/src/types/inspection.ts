export type InspectionResult = "ok" | "ng" | "recheck";

export type Inspection = {
  id: string;
  projectId: string;
  memberId: string;
  memberKind: string;
  result: InspectionResult;
  inspectedAt: string;
};