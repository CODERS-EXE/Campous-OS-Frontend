const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  detail: string;
}

export class ApiClient {
  private accessToken: string | null = null;
  private collegeId: string | null = null;
  private collegeSubdomain: string | null = null;

  setAuth(token: string | null, collegeId?: string | null, subdomain?: string | null) {
    this.accessToken = token;
    if (collegeId !== undefined) this.collegeId = collegeId;
    if (subdomain !== undefined) this.collegeSubdomain = subdomain;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.accessToken) h["Authorization"] = `Bearer ${this.accessToken}`;
    if (this.collegeId) h["X-College-Id"] = this.collegeId;
    if (this.collegeSubdomain) h["X-College-Subdomain"] = this.collegeSubdomain;
    return h;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...this.headers(), ...(options.headers || {}) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Request failed");
    }
    return res.json();
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  // AI Assistant helpers
  sendAiMessage(message: string) {
    return this.post<AiChatResponse>("/api/v1/ai/chat", { message });
  }

  getAiHistory() {
    return this.get<AiChatMessage[]>(`/api/v1/ai/history`);
  }

  clearAiHistory() {
    return this.delete<{ ok: boolean }>("/api/v1/ai/history");
  }

  getAiSuggestions() {
    return this.get<AiSuggestionsResponse>("/api/v1/ai/suggestions");
  }

  getStudents() {
    return this.get<Student[]>("/api/v1/users/students");
  }

  // Transport API helpers
  getBuses() {
    return this.get<BusVehicle[]>("/api/v1/transport/buses");
  }
  getBus(busId: string) {
    return this.get<BusVehicle>(`/api/v1/transport/buses/${busId}`);
  }
  createBus(body: unknown) {
    return this.post<BusVehicle>("/api/v1/transport/buses", body);
  }
  updateBus(busId: string, body: unknown) {
    return this.patch<BusVehicle>(`/api/v1/transport/buses/${busId}`, body);
  }
  deleteBus(busId: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/transport/buses/${busId}`);
  }
  updateBusLocation(busId: string, body: unknown) {
    return this.post<unknown>(`/api/v1/transport/buses/${busId}/location`, body);
  }
  getRoutes() {
    return this.get<BusRoute[]>("/api/v1/transport/routes");
  }
  createRoute(body: unknown) {
    return this.post<BusRoute>("/api/v1/transport/routes", body);
  }
  updateRoute(routeId: string, body: unknown) {
    return this.patch<BusRoute>(`/api/v1/transport/routes/${routeId}`, body);
  }
  deleteRoute(routeId: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/transport/routes/${routeId}`);
  }
  getAssignments() {
    return this.get<StudentBusAssignment[]>("/api/v1/transport/assignments");
  }
  createAssignment(body: unknown) {
    return this.post<StudentBusAssignment>("/api/v1/transport/assignments", body);
  }
  deleteAssignment(assignmentId: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/transport/assignments/${assignmentId}`);
  }
  getMyBus(studentUserId?: string) {
    const url = studentUserId
      ? `/api/v1/transport/my-bus?student_user_id=${studentUserId}`
      : "/api/v1/transport/my-bus";
    return this.get<MyBusResponse>(url);
  }

  // Hostel API helpers
  getHostelStats() {
    return this.get<HostelStats>("/api/v1/hostel/stats");
  }
  getHostelBuildings() {
    return this.get<HostelBuilding[]>("/api/v1/hostel/buildings");
  }
  createHostelBuilding(body: unknown) {
    return this.post<HostelBuilding>("/api/v1/hostel/buildings", body);
  }
  updateHostelBuilding(id: string, body: unknown) {
    return this.patch<HostelBuilding>(`/api/v1/hostel/buildings/${id}`, body);
  }
  deleteHostelBuilding(id: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/hostel/buildings/${id}`);
  }
  getHostelRooms(params?: { hostel?: string; building_id?: string; floor?: number; status_filter?: string }) {
    const q = new URLSearchParams();
    if (params?.hostel) q.set("hostel", params.hostel);
    if (params?.building_id) q.set("building_id", params.building_id);
    if (params?.floor) q.set("floor", String(params.floor));
    if (params?.status_filter) q.set("status_filter", params.status_filter);
    const url = `/api/v1/hostel/rooms${q.toString() ? `?${q.toString()}` : ""}`;
    return this.get<HostelRoom[]>(url);
  }
  createHostelRoom(body: unknown) {
    return this.post<HostelRoom>("/api/v1/hostel/rooms", body);
  }
  updateHostelRoom(id: string, body: unknown) {
    return this.patch<HostelRoom>(`/api/v1/hostel/rooms/${id}`, body);
  }
  deleteHostelRoom(id: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/hostel/rooms/${id}`);
  }
  getHostelAllocations(statusFilter?: string) {
    const url = statusFilter ? `/api/v1/hostel/allocations?status_filter=${statusFilter}` : "/api/v1/hostel/allocations";
    return this.get<HostelRoomAllocation[]>(url);
  }
  allocateHostelRoom(body: { student_id: string; room_id: string; remarks?: string }) {
    return this.post<HostelRoomAllocation>("/api/v1/hostel/allocations", body);
  }
  changeHostelRoom(body: { student_id: string; new_room_id: string; remarks?: string }) {
    return this.post<HostelRoomAllocation>("/api/v1/hostel/allocations/change", body);
  }
  vacateHostelRoom(allocationId: string, remarks?: string) {
    const url = remarks ? `/api/v1/hostel/allocations/${allocationId}/vacate?remarks=${encodeURIComponent(remarks)}` : `/api/v1/hostel/allocations/${allocationId}/vacate`;
    return this.post<{ ok: boolean }>(url, {});
  }
  getHostelRequests(statusFilter?: string) {
    const url = statusFilter ? `/api/v1/hostel/requests?status_filter=${statusFilter}` : "/api/v1/hostel/requests";
    return this.get<HostelRequestItem[]>(url);
  }
  createHostelRequest(body: { preferred_hostel: string; request_reason: string }) {
    return this.post<HostelRequestItem>("/api/v1/hostel/requests", body);
  }
  approveHostelRequest(requestId: string, body: { allocated_room_id?: string; remarks?: string }) {
    return this.patch<HostelRequestItem>(`/api/v1/hostel/requests/${requestId}/approve`, body);
  }
  rejectHostelRequest(requestId: string, body: { remarks?: string }) {
    return this.patch<HostelRequestItem>(`/api/v1/hostel/requests/${requestId}/reject`, body);
  }
  getMyHostelRoom() {
    return this.get<MyRoomResponse>("/api/v1/hostel/my-room");
  }
}

export const api = new ApiClient();

export interface AuthResponse {
  tokens: { access_token: string; refresh_token: string; token_type: string };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    college_id: string | null;
    profile: Record<string, unknown>;
    is_verified: boolean;
  };
  college: {
    id: string;
    name: string;
    subdomain: string;
    logo_url: string | null;
    theme_color: string;
    plan: string;
    status: string;
  } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  college_id: string | null;
  profile: Record<string, unknown>;
  is_verified: boolean;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  roll_no: string;
  department: string;
  course?: string;
  year: number;
  semester: number;
  avatar_url?: string;
  emergency_contact?: string;
  blood_group?: string;
  created_at?: string;
}

export interface StudentAttendanceRecord {
  student_id: string;
  status: string;
  marked_by?: string | null;
}

export interface Attendance {
  id: string;
  faculty_id: string;
  subject: string;
  date: string;
  session_name?: string | null;
  records: StudentAttendanceRecord[];
  created_at: string;
}

export interface Assignment {
  id: string;
  created_by: string;
  title: string;
  description?: string;
  subject?: string;
  due_date?: string | null;
  attachments: string[];
  published: boolean;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  files: string[];
  submitted_at: string;
  marks_awarded?: number | null;
}

export interface Result {
  id: string;
  student_id: string;
  subject: string;
  exam_name?: string;
  internal_marks?: number;
  practical_marks?: number;
  total_marks?: number;
  grade?: string;
}

export interface TimetableEntry {
  id: string;
  faculty_id: string;
  subject: string;
  classroom?: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  course?: string;
  designation?: string;
  status?: string;
  subjects: string[];
  created_at?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "faculty" | "parent" | "warden";
  department?: string;
  course?: string;
  designation?: string;
  status?: string;
  hostel?: string;
  phone?: string;
  student_ids?: string[];
  subjects?: string[];
  roll_no?: string;
  year?: number;
  semester?: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  course?: string;
  designation?: string;
  status?: string;
  hostel?: string;
  phone?: string;
  student_ids?: string[];
  subjects?: string[];
  roll_no?: string;
  year?: number;
  semester?: number;
}

export interface College {
  id: string;
  name: string;
  subdomain: string;
  logo_url: string | null;
  theme_color: string;
  plan: string;
  status: string;
  created_at?: string;
}

export interface DashboardStats {
  total_students: number;
  total_faculty: number;
  unread_notifications: number;
  attendance_rate: number | null;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  priority: string;
  created_at: string;
  is_read: boolean;
}

export interface Room {
  id: string;
  hostel_name: string;
  block?: string | null;
  floor?: number | null;
  room_number: string;
  capacity: number;
  occupied: number;
  student_ids: string[];
  amenities: string[];
  is_available: boolean;
  created_at: string;
}

export interface Outpass {
  id: string;
  student_id: string;
  student_name: string;
  student_roll_no?: string | null;
  reason: string;
  from_date: string;
  to_date: string;
  destination?: string | null;
  contact_number?: string | null;
  status: string;
  approved_by?: string | null;
  approved_by_name?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostelStudent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  roll_no: string;
  department: string;
  year: number;
  semester: number;
  hostel: string;
  phone?: string;
  emergency_contact?: string;
  blood_group?: string;
}

export interface AiChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AiChatResponse {
  reply: string;
  suggested_questions: string[];
}

export interface AiSuggestionsResponse {
  suggestions: string[];
}

// Bus Tracking Interfaces
export interface BusStop {
  name: string;
  latitude: number;
  longitude: number;
  estimated_time?: string | null;
}

export interface BusRoute {
  id: string;
  route_name: string;
  stops: BusStop[];
  timings?: string | null;
}

export interface BusVehicle {
  id: string;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  route_id?: string | null;
  route_name?: string | null;
  capacity: number;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
    speed: number;
    status: string;
    timestamp: string;
  } | null;
}

export interface StudentBusAssignment {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  bus_id: string;
  bus_number: string;
  route_id: string;
  route_name: string;
  stop_name?: string | null;
  created_at: string;
}

export interface MyBusResponse {
  assignment: {
    id?: string | null;
    stop_name?: string | null;
  };
  bus: {
    id: string;
    bus_number: string;
    driver_name: string;
    driver_phone: string;
    capacity: number;
    status: string;
  };
  route: {
    id?: string | null;
    route_name: string;
    timings?: string | null;
    stops: BusStop[];
  };
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    status: string;
    timestamp: string;
  };
  eta_minutes: number;
}

export interface HostelBuilding {
  id: string;
  name: string;
  total_floors: number;
  total_rooms: number;
  gender?: string;
  status: string;
  description?: string;
  capacity?: number;
  occupied?: number;
  created_at: string;
}

export interface HostelRoom {
  id: string;
  building_id?: string | null;
  hostel_name: string;
  block?: string | null;
  floor?: number | null;
  room_number: string;
  capacity: number;
  occupied: number;
  room_type: string;
  status: string;
  student_ids: string[];
  occupants?: {
    user_id: string;
    name: string;
    email: string;
    roll_no: string;
    department: string;
  }[];
  amenities: string[];
  is_available: boolean;
  created_at: string;
}

export interface HostelRoomAllocation {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  department: string;
  room_id: string;
  room_number: string;
  hostel_name: string;
  allocated_by_name: string;
  allocated_date: string;
  vacated_date?: string | null;
  status: string;
  remarks?: string | null;
}

export interface HostelRequestItem {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  department: string;
  preferred_hostel: string;
  request_reason: string;
  status: string;
  approved_by_name?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostelStats {
  total_buildings: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  total_capacity: number;
  total_occupied: number;
  hostel_students: number;
  pending_requests: number;
  pending_outpasses: number;
  occupancy_percentage: number;
}

export interface MyRoomResponse {
  allocated: boolean;
  allocation?: {
    id: string;
    allocated_date: string;
    remarks?: string | null;
  } | null;
  room?: {
    id: string;
    room_number: string;
    hostel_name: string;
    floor: number;
    capacity: number;
    occupied: number;
    room_type: string;
    amenities: string[];
  } | null;
  building?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  roommates?: {
    name: string;
    email: string;
    roll_no: string;
    department: string;
    phone?: string;
  }[];
  latest_request?: {
    id: string;
    preferred_hostel: string;
    status: string;
    created_at: string;
  } | null;
}
