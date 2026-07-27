import { apiClient } from "./client";
import type { Job, PaginatedJobs, Application, Company } from "@/types";

export interface JobFilters { search?: string; type?: string; experience?: string; isRemote?: boolean; location?: string; page?: number; limit?: number; }

export async function fetchJobs(filters: JobFilters) {
  const { data } = await apiClient.get<{ data: PaginatedJobs }>("/jobs", { params: filters });
  return data.data;
}
export async function fetchJobBySlug(slug: string) {
  const { data } = await apiClient.get<{ data: Job }>(`/jobs/${slug}`);
  return data.data;
}
export async function fetchMyJobs() {
  const { data } = await apiClient.get<{ data: Job[] }>("/jobs/recruiter/mine");
  return data.data;
}
export async function createJob(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<{ data: Job }>("/jobs", payload);
  return data.data;
}
export async function setJobStatus(jobId: string, isActive: boolean) {
  const { data } = await apiClient.patch<{ data: Job }>(`/jobs/${jobId}/status`, { isActive });
  return data.data;
}
export async function applyToJob(jobId: string, coverLetter?: string) {
  const { data } = await apiClient.post<{ data: Application }>(`/jobs/${jobId}/apply`, { coverLetter });
  return data.data;
}
export async function fetchMyApplications() {
  const { data } = await apiClient.get<{ data: Application[] }>("/applications/mine");
  return data.data;
}
export async function fetchMyCompany() {
  const { data } = await apiClient.get<{ data: Company | null }>("/companies/me");
  return data.data;
}
export async function createCompany(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<{ data: Company }>("/companies/me", payload);
  return data.data;
}