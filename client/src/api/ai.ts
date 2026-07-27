import { apiClient } from "./client";
export interface MatchScoreResult { score: number; feedback: string; }
export async function getMatchScore(jobId: string, resumeText: string) {
  const { data } = await apiClient.post<{ data: MatchScoreResult }>(`/jobs/${jobId}/match-score`, { resumeText });
  return data.data;
}