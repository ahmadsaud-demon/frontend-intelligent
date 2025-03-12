import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Users/Students
export async function getUsers(role?: string) {
  const { data } = await api.get('/users', { params: { role } });
  return data;
}

export async function createUser(userData: { email: string; full_name: string; role: string }) {
  const { data } = await api.post('/users', userData);
  return data;
}

export async function updateUser(userId: string, userData: Partial<{ email: string; full_name: string; role: string }>) {
  const { data } = await api.put(`/users/${userId}`, userData);
  return data;
}

export async function deleteUser(userId: string) {
  await api.delete(`/users/${userId}`);
  return { success: true };
}

// Authentication
export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('auth_token', data.token);
  return data.user;
}

export async function logout() {
  await api.post('/auth/logout');
  localStorage.removeItem('auth_token');
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data;
}

// Courses
export async function fetchCourses() {
  const { data } = await api.get('/courses');
  return data;
}

export async function createCourse(courseData: { name: string; description: string; teacher_id: string }) {
  const { data } = await api.post('/courses', courseData);
  return data;
}

export async function updateCourse(courseId: string, courseData: Partial<{ name: string; description: string; teacher_id: string }>) {
  const { data } = await api.put(`/courses/${courseId}`, courseData);
  return data;
}

export async function deleteCourse(courseId: string) {
  await api.delete(`/courses/${courseId}`);
  return { success: true };
}

// Enrollments
export async function createEnrollment(enrollmentData: { student_id: string; course_id: string }) {
  const { data } = await api.post('/enrollments', enrollmentData);
  return data;
}

export async function deleteEnrollment(studentId: string, courseId: string) {
  await api.delete(`/enrollments/${studentId}/${courseId}`);
  return { success: true };
}

// Grades
export async function getGrades(type: 'all' | 'student' | 'teacher') {
  const { data } = await api.get('/grades', { params: { type } });
  return data;
}

export async function createGrade(gradeData: { enrollment_id: string; grade: number; comment?: string }) {
  const { data } = await api.post('/grades', gradeData);
  return data;
}

export async function updateGrade(gradeId: string, gradeData: Partial<{ grade: number; comment: string }>) {
  const { data } = await api.put(`/grades/${gradeId}`, gradeData);
  return data;
}

export async function deleteGrade(gradeId: string) {
  await api.delete(`/grades/${gradeId}`);
  return { success: true };
}

// Course Materials
export async function fetchMaterials(courseId: string) {
  const { data } = await api.get(`/courses/${courseId}/materials`);
  return data;
}

export async function uploadMaterial(courseId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post(`/courses/${courseId}/materials`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function deleteMaterial(courseId: string, materialId: string) {
  await api.delete(`/courses/${courseId}/materials/${materialId}`);
  return { success: true };
}

// Chat Rooms
export async function getChatRoom(courseId: string) {
  const { data } = await api.get(`/courses/${courseId}/chat`);
  return data;
}

// Chat Messages
export async function fetchMessages(roomId: string) {
  const { data } = await api.get(`/chat/${roomId}/messages`);
  return data;
}

export async function sendMessage(roomId: string, content: string) {
  const { data } = await api.post(`/chat/${roomId}/messages`, { content });
  return data;
}

// Document QA
export async function fetchQAHistory(materialId: string) {
  const { data } = await api.get(`/materials/${materialId}/qa`);
  return data;
}

export async function askQuestion(materialId: string, question: string) {
  const { data } = await api.post(`/materials/${materialId}/qa`, { question });
  return data;
}

// Mock timetable data
const MOCK_TIMETABLE = [
  {
    id: '1',
    day: 'Monday',
    time: '09:00',
    subject: 'Mathematics',
    teacher: 'Dr. Smith',
    room: '101'
  },
  {
    id: '2',
    day: 'Monday',
    time: '11:00',
    subject: 'Physics',
    teacher: 'Prof. Johnson',
    room: '102'
  },
  {
    id: '3',
    day: 'Tuesday',
    time: '10:00',
    subject: 'Chemistry',
    teacher: 'Dr. Williams',
    room: '103'
  },
  {
    id: '4',
    day: 'Wednesday',
    time: '14:00',
    subject: 'Biology',
    teacher: 'Mrs. Brown',
    room: '104'
  },
  {
    id: '5',
    day: 'Thursday',
    time: '13:00',
    subject: 'English',
    teacher: 'Ms. Davis',
    room: '105'
  }
];

export async function fetchTimetable() {
  return Promise.resolve(MOCK_TIMETABLE);
}

export async function updateTimetableSlot(slotId: string, updatedSlot: any) {
  return Promise.resolve(updatedSlot);
}