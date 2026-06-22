const API_BASE = "/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export interface User {
  id: string;
  email: string;
}

export interface RoomPlayer {
  id: string;
  symbol: string;
  userId: string;
  user: User;
}

export interface Room {
  id: string;
  roomId: string;
  board: string[];
  turn: string;
  status: string;
  winner: string | null;
  players: RoomPlayer[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<ApiResponse<{ accessToken: string; user: User }>>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      request<ApiResponse<{ accessToken: string; user: User }>>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<ApiResponse<null>>("/auth/logout", { method: "POST" }),
    me: () => request<ApiResponse<{ user: User }>>("/auth/me"),
    refresh: () =>
      request<ApiResponse<{ accessToken: string }>>("/auth/refresh", {
        method: "POST",
      }),
  },
  rooms: {
    create: () =>
      request<ApiResponse<{ room: Room }>>("/rooms", { method: "POST" }),
    get: (roomId: string) =>
      request<ApiResponse<{ room: Room }>>(`/rooms/${roomId}`),
    join: (roomId: string) =>
      request<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/join`, {
        method: "POST",
      }),
    move: (roomId: string, cellIndex: number) =>
      request<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/move`, {
        method: "POST",
        body: JSON.stringify({ cellIndex }),
      }),
    restart: (roomId: string) =>
      request<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/restart`, {
        method: "POST",
      }),
  },
};
