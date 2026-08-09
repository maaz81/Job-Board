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

export async function forgotPasswordRequest(email: string) {
  const { data } = await apiClient.post<{
    data: null;
    message: string;
  }>("/auth/forgot-password", {
    email,
  });

  return data;
}

export async function resetPasswordRequest(
  token: string,
  password: string
) {
  const { data } = await apiClient.post<{
    data: null;
    message: string;
  }>("/auth/reset-password", {
    token,
    password,
  });

  return data;
}

export async function verifyEmailRequest(token: string) {
  const { data } = await apiClient.post<{
    data: null;
    message: string;
  }>("/auth/verify-email", {
    token,
  });

  return data;
}

export async function resendVerificationRequest() {
  const { data } = await apiClient.post<{
    data: null;
    message: string;
  }>("/auth/resend-verification");

  return data;
}