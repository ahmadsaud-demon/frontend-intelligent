import MockAdapter from 'axios-mock-adapter';
import { 
  mockUsers, 
  mockCourses, 
  mockMaterials, 
  mockChatMessages, 
  mockGrades,
  mockApiUsage, 
  mockSubscriptions, 
  mockBilling,
  mockQAHistory
} from './mockData';

export function setupMockApi(axiosInstance: any) {
  const mock = new MockAdapter(axiosInstance);

  // Auth endpoints
  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const user = mockUsers.find(u => u.email === email);

    if (user && password === 'password123') {
      return [200, {
        token: 'mock-jwt-token',
        user
      }];
    }
    return [401, { message: 'Invalid credentials' }];
  });

  mock.onPost('/auth/logout').reply(200);

  mock.onGet('/auth/me').reply((config) => {
    const authHeader = config.headers?.Authorization;
    if (authHeader?.includes('mock-jwt-token')) {
      return [200, mockUsers[0]];
    }
    return [401, { message: 'Unauthorized' }];
  });

  // Users/Students
  mock.onGet('/users').reply((config) => {
    const role = config.params?.role;
    if (role) {
      return [200, mockUsers.filter(u => u.role === role)];
    }
    return [200, mockUsers];
  });

  // Courses
  mock.onGet('/courses').reply(200, mockCourses);

  mock.onPost('/courses').reply((config) => {
    const courseData = JSON.parse(config.data);
    const newCourse = {
      id: String(mockCourses.length + 1),
      ...courseData,
      teacher: mockUsers.find(u => u.id === courseData.teacher_id)
    };
    return [200, newCourse];
  });

  // Course Materials
  mock.onGet(/\/courses\/\d+\/materials/).reply((config) => {
    const courseId = config.url?.split('/')[2];
    return [200, mockMaterials[courseId] || []];
  });

  // Chat
  mock.onGet(/\/courses\/\d+\/chat/).reply((config) => {
    const courseId = config.url?.split('/')[2];
    return [200, { roomId: courseId }];
  });

  mock.onGet(/\/chat\/\d+\/messages/).reply((config) => {
    const roomId = config.url?.split('/')[2];
    return [200, mockChatMessages[roomId] || []];
  });

  // Grades
  mock.onGet('/grades').reply(200, mockGrades);

  // Schools
  mock.onGet('/schools').reply(200, [
    {
      id: '1',
      name: 'Demo School',
      domain: 'demo.school.com',
      logo_url: 'https://example.com/logo.png',
      primary_color: '#4F46E5',
      secondary_color: '#4338CA'
    }
  ]);

  mock.onGet(/\/schools\/domain\/.*/).reply((config) => {
    const domain = config.url?.split('/').pop();
    return [200, {
      id: '1',
      name: 'Demo School',
      domain: domain,
      logo_url: null,
      primary_color: '#4F46E5',
      secondary_color: '#4338CA'
    }];
  });

  // Document QA
  mock.onGet(/\/materials\/\d+\/qa/).reply((config) => {
    const materialId = config.url?.split('/')[2];
    return [200, mockQAHistory[materialId] || []];
  });

  mock.onPost(/\/materials\/\d+\/qa/).reply((config) => {
    const { question } = JSON.parse(config.data);
    return [200, {
      answer: 'This is a mock answer to your question: ' + question
    }];
  });

  // API Usage
  mock.onGet('/api-usage').reply((config) => {
    const schoolId = config.params?.school_id;
    if (schoolId) {
      return [200, {
        ...mockApiUsage,
        daily: mockApiUsage.daily.map(d => ({ ...d, calls: Math.floor(d.calls / 10) })),
        endpoints: mockApiUsage.endpoints.map(e => ({ ...e, calls: Math.floor(e.calls / 10) })),
      }];
    }
    return [200, mockApiUsage];
  });

  // Subscriptions
  mock.onGet('/subscriptions').reply((config) => {
    const schoolId = config.params?.school_id;
    if (schoolId) {
      const subscription = mockSubscriptions.find(s => s.school_id === schoolId);
      return [200, subscription ? [subscription] : []];
    }
    return [200, mockSubscriptions];
  });

  // Billing
  mock.onGet('/billing').reply((config) => {
    const schoolId = config.params?.school_id;
    if (schoolId) {
      return [200, {
        ...mockBilling,
        currentPlan: 'Professional',
        apiUsage: 25000,
        apiLimit: 100000,
      }];
    }
    return [200, mockBilling];
  });

  return mock;
}