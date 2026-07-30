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

  // Fees Management API helpers
  getFeeStructures(params?: { academic_year?: string; semester?: number; department?: string }) {
    const q = new URLSearchParams();
    if (params?.academic_year) q.set("academic_year", params.academic_year);
    if (params?.semester) q.set("semester", String(params.semester));
    if (params?.department) q.set("department", params.department);
    const url = `/api/v1/fees/structures${q.toString() ? `?${q.toString()}` : ""}`;
    return this.get<FeeStructure[]>(url);
  }

  createFeeStructure(body: unknown) {
    return this.post<FeeStructure>("/api/v1/fees/structures", body);
  }

  updateFeeStructure(id: string, body: unknown) {
    return this.patch<FeeStructure>(`/api/v1/fees/structures/${id}`, body);
  }

  deleteFeeStructure(id: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/fees/structures/${id}`);
  }

  assignFees(body: unknown) {
    return this.post<{ ok: boolean; assigned_count: number; total_target: number }>("/api/v1/fees/assign", body);
  }

  getStudentFeeDetails(studentId?: string) {
    const url = studentId ? `/api/v1/fees/student/details?student_id=${studentId}` : "/api/v1/fees/student/details";
    return this.get<StudentFeeDetailsResponse>(url);
  }

  submitOnlinePayment(body: unknown) {
    return this.post<{ ok: boolean; payment: Payment; message: string }>("/api/v1/fees/pay/online", body);
  }

  recordOfflinePayment(body: unknown) {
    return this.post<{ ok: boolean; payment: Payment; receipt: Receipt }>("/api/v1/fees/pay/offline", body);
  }

  approvePayment(paymentId: string) {
    return this.post<{ ok: boolean; payment: Payment; receipt: Receipt }>(`/api/v1/fees/payments/${paymentId}/approve`, {});
  }

  rejectPayment(paymentId: string) {
    return this.post<{ ok: boolean; payment: Payment }>(`/api/v1/fees/payments/${paymentId}/reject`, {});
  }

  getPayments(params?: { status_filter?: string; student_id?: string }) {
    const q = new URLSearchParams();
    if (params?.status_filter) q.set("status_filter", params.status_filter);
    if (params?.student_id) q.set("student_id", params.student_id);
    const url = `/api/v1/fees/payments${q.toString() ? `?${q.toString()}` : ""}`;
    return this.get<Payment[]>(url);
  }

  generateInvoice(body: unknown) {
    return this.post<Invoice>("/api/v1/fees/invoices/generate", body);
  }

  getPendingDues(params?: { search?: string; academic_year?: string; semester?: number; department?: string }) {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.academic_year) q.set("academic_year", params.academic_year);
    if (params?.semester) q.set("semester", String(params.semester));
    if (params?.department) q.set("department", params.department);
    const url = `/api/v1/fees/dues${q.toString() ? `?${q.toString()}` : ""}`;
    return this.get<PendingDue[]>(url);
  }

  getFeeAnalytics() {
    return this.get<FeeAnalytics>("/api/v1/fees/analytics");
  }

  // Library Management API helpers
  getLibraryCategories() {
    return this.get<LibraryCategory[]>("/api/v1/library/categories");
  }
  createLibraryCategory(body: unknown) {
    return this.post<LibraryCategory>("/api/v1/library/categories", body);
  }
  updateLibraryCategory(id: string, body: unknown) {
    return this.patch<LibraryCategory>(`/api/v1/library/categories/${id}`, body);
  }
  deleteLibraryCategory(id: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/library/categories/${id}`);
  }

  getLibraryBooks(params?: { category_id?: string; search?: string; available_only?: boolean }) {
    const q = new URLSearchParams();
    if (params?.category_id) q.set("category_id", params.category_id);
    if (params?.search) q.set("search", params.search);
    if (params?.available_only) q.set("available_only", "true");
    const url = `/api/v1/library/books${q.toString() ? `?${q.toString()}` : ""}`;
    return this.get<LibraryBook[]>(url);
  }
  getLibraryBook(bookId: string) {
    return this.get<LibraryBook>(`/api/v1/library/books/${bookId}`);
  }
  createLibraryBook(body: unknown) {
    return this.post<LibraryBook>("/api/v1/library/books", body);
  }
  updateLibraryBook(id: string, body: unknown) {
    return this.patch<LibraryBook>(`/api/v1/library/books/${id}`, body);
  }
  deleteLibraryBook(id: string) {
    return this.delete<{ ok: boolean }>(`/api/v1/library/books/${id}`);
  }

  issueLibraryBook(body: unknown) {
    return this.post<LibraryIssue>("/api/v1/library/issues", body);
  }
  returnLibraryBook(body: unknown) {
    return this.post<{ ok: boolean; issue: LibraryIssue; fine_amount: number }>("/api/v1/library/return", body);
  }
  renewLibraryBook(body: unknown) {
    return this.post<{ ok: boolean; issue: LibraryIssue }>("/api/v1/library/renew", body);
  }
  payLibraryFine(issueId: string) {
    return this.post<{ ok: boolean; issue: LibraryIssue }>(`/api/v1/library/fines/${issueId}/pay`, {});
  }
  getLibraryIssues(params?: { status_filter?: string; user_id?: string; overdue_only?: boolean }) {
    const q = new URLSearchParams();
    if (params?.status_filter) q.set("status_filter", params.status_filter);
    if (params?.user_id) q.set("user_id", params.user_id);
    if (params?.overdue_only) q.set("overdue_only", "true");
    const url = `/api/v1/library/issues${q.toString() ? `?${q.toString()}` : ""}`;
    return this.get<LibraryIssue[]>(url);
  }
  getMyLibraryIssues() {
    return this.get<LibraryIssueWithOverdue[]>("/api/v1/library/my-issues");
  }
  getLibraryAnalytics() {
    return this.get<LibraryAnalytics>("/api/v1/library/analytics");
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

export interface FeeStructure {
  id: string;
  college_id: string;
  name: string;
  code: string;
  description?: string | null;
  amount: number;
  academic_year: string;
  semester?: number | null;
  department?: string | null;
  course?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentFee {
  id: string;
  college_id: string;
  student_id: string;
  fee_structure_id: string;
  fee_name: string;
  academic_year: string;
  semester?: number | null;
  total_amount: number;
  discount: number;
  net_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  college_id: string;
  student_id: string;
  student_fee_id?: string | null;
  amount: number;
  payment_mode: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  payment_date: string;
  approved_by?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  college_id: string;
  student_id: string;
  invoice_number: string;
  academic_year: string;
  semester?: number | null;
  student_fee_ids: string[];
  total_amount: number;
  discount_amount: number;
  payable_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  college_id: string;
  payment_id: string;
  receipt_number: string;
  invoice_id?: string | null;
  student_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
}

export interface StudentFeeDetailsResponse {
  summary: {
    total_net: number;
    total_paid: number;
    total_due: number;
    fee_count: number;
  };
  student_fees: StudentFee[];
  payments: Payment[];
  invoices: Invoice[];
  receipts: Receipt[];
}

export interface PendingDue {
  student_fee_id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  department: string;
  fee_name: string;
  academic_year: string;
  semester: number;
  net_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date: string;
  status: string;
}

export interface FeeAnalytics {
  total_billed: number;
  total_paid: number;
  total_due: number;
  collection_rate: number;
  online_paid?: number;
  offline_paid?: number;
  pending_approval_count?: number;
  fee_records_count?: number;
  college_stats?: {
    college_id: string;
    college_name: string;
    total_billed: number;
    total_paid: number;
    total_due: number;
    collection_rate: number;
  }[];
}
// Library Management Interfaces
export interface LibraryCategory {
  id: string;
  college_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryBook {
  id: string;
  college_id: string;
  title: string;
  author: string;
  isbn?: string | null;
  publisher?: string | null;
  edition?: string | null;
  year?: number | null;
  category_id?: string | null;
  category_name?: string | null;
  total_quantity: number;
  available_quantity: number;
  location?: string | null;
  description?: string | null;
  cover_url?: string | null;
  language: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryIssue {
  id: string;
  college_id: string;
  book_id: string;
  book_title: string;
  book_isbn?: string | null;
  user_id: string;
  user_name: string;
  user_role: string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  renewed_count: number;
  max_renewals: number;
  status: string;
  fine_amount: number;
  fine_paid: boolean;
  fine_paid_date?: string | null;
  fine_reason?: string | null;
  remarks?: string | null;
  issued_by?: string | null;
  returned_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryIssueWithOverdue extends LibraryIssue {
  is_overdue: boolean;
}

export interface LibraryAnalytics {
  total_books: number;
  total_available?: number;
  total_issued: number;
  total_categories?: number;
  active_issues?: number;
  overdue_issues: number;
  returned_today?: number;
  pending_fines_amount?: number;
  collected_fines_amount?: number;
  total_fines_collected?: number;
  college_stats?: {
    college_id: string;
    college_name: string;
    total_books: number;
    total_issued: number;
    total_overdue: number;
  }[];
}

// ==================== PLACEMENT MANAGEMENT INTERFACES ====================

export interface CompanyContact {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
}

export interface Company {
  id: string;
  college_id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  industry: string;
  location: string;
  tier: "tier_1" | "tier_2" | "tier_3";
  employee_count?: number;
  contacts: CompanyContact[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_drives: number;
  total_placements: number;
  average_package?: number;
  highest_package?: number;
}

export interface EligibilityCriteria {
  min_cgpa: number;
  allowed_branches: string[];
  max_backlogs: number;
  max_gap_years: number;
  min_percentage_10th?: number;
  min_percentage_12th?: number;
  year_of_study?: number[];
}

export interface DriveLocation {
  city: string;
  state?: string;
  country: string;
  is_remote: boolean;
  is_hybrid: boolean;
}

export interface PackageDetails {
  ctc: number;
  base_salary?: number;
  variable_pay?: number;
  joining_bonus?: number;
  stock_options?: string;
  other_benefits?: string;
}

export interface PlacementDrive {
  id: string;
  college_id: string;
  company_id: string;
  title: string;
  description?: string;
  role: string;
  role_type: "full_time" | "internship" | "both";
  package: PackageDetails;
  locations: DriveLocation[];
  eligibility: EligibilityCriteria;
  start_date: string;
  deadline: string;
  interview_start_date?: string;
  expected_joining_date?: string;
  status: "draft" | "open" | "closed" | "completed" | "cancelled";
  total_positions?: number;
  job_description_url?: string;
  selection_process?: string;
  bond_duration?: number;
  total_applications: number;
  shortlisted_count: number;
  selected_count: number;
  created_at: string;
  updated_at: string;
  company?: Company;
  is_eligible?: boolean;
  eligibility_reasons?: string[];
  has_applied?: boolean;
  application_status?: string;
}

export interface StudentApplication {
  id: string;
  college_id: string;
  drive_id: string;
  student_id: string;
  resume_url?: string;
  cover_letter?: string;
  portfolio_url?: string;
  student_name: string;
  student_email: string;
  student_roll_no: string;
  student_department: string;
  student_cgpa?: number;
  student_year?: number;
  status: "applied" | "under_review" | "shortlisted" | "interview_scheduled" | 
          "selected" | "rejected" | "withdrawn" | "offer_accepted" | "offer_rejected";
  remarks?: string;
  rejection_reason?: string;
  applied_at: string;
  reviewed_at?: string;
  status_updated_at: string;
  drive?: PlacementDrive;
  company?: Company;
}

export interface InterviewRound {
  id: string;
  college_id: string;
  drive_id: string;
  student_id: string;
  application_id: string;
  round_number: number;
  round_type: "aptitude" | "coding" | "technical" | "hr" | 
                "group_discussion" | "case_study" | "presentation" | "other";
  round_name?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  location?: string;
  meeting_link?: string;
  interviewer_names?: string;
  panel_size?: number;
  status: "scheduled" | "in_progress" | "completed" | "cleared" | 
          "not_cleared" | "absent" | "rescheduled" | "cancelled";
  result?: "pass" | "fail" | "hold";
  score?: number;
  feedback?: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
  drive?: PlacementDrive;
  company?: Company;
}

export interface PlacementOffer {
  id: string;
  college_id: string;
  drive_id: string;
  student_id: string;
  application_id: string;
  company_id: string;
  student_name: string;
  student_roll_no: string;
  student_department: string;
  student_email: string;
  role: string;
  location: string;
  package_ctc: number;
  base_salary?: number;
  joining_bonus?: number;
  offer_date: string;
  offer_valid_till?: string;
  expected_joining_date?: string;
  actual_joining_date?: string;
  offer_letter_url?: string;
  acceptance_letter_url?: string;
  status: "pending" | "sent" | "accepted" | "rejected" | "withdrawn" | "expired" | "joined";
  bond_duration_months?: number;
  probation_period_months?: number;
  remarks?: string;
  rejection_reason?: string;
  created_at: string;
  accepted_at?: string;
  rejected_at?: string;
  updated_at: string;
  drive?: PlacementDrive;
  company?: Company;
}

export interface PlacementStats {
  total_companies: number;
  total_drives: number;
  active_drives: number;
  total_applications: number;
  total_placed: number;
  highest_package: number;
  average_package: number;
  lowest_package: number;
  placement_percentage: number;
  total_students: number;
}
