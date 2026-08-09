import { apiClient } from "./client";

import type { AuthResponse, User } from "@/types";

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  role: "CANDIDATE" | "RECRUITER";
}) {
  const { data } = await apiClient.post<{
    data: AuthResponse;
  }>("/auth/register", payload);

  return data.data;
}

export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const { data } = await apiClient.post<{
    data: AuthResponse;
  }>("/auth/login", payload);

  return data.data;
}

export async function getMeRequest() {
  const { data } = await apiClient.get<{
    data: User;
  }>("/auth/me");

  return data.data;
}

export async function refreshRequest() {
  await apiClient.post("/auth/refresh");
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}