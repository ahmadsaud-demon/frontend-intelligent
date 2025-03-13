// Mock schools data
export const mockSchools = [
  {
    id: '1',
    name: 'Springfield High School',
    domain: 'springfield.edu',
    logo_url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=128&h=128&fit=crop',
    primary_color: '#4F46E5',
    secondary_color: '#4338CA',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Riverdale Academy',
    domain: 'riverdale.edu',
    logo_url: 'https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=128&h=128&fit=crop',
    primary_color: '#059669',
    secondary_color: '#047857',
    created_at: '2025-01-02T00:00:00Z'
  }
];

// Mock user data
export const mockUsers = {
  '1': [ // Springfield High School
    {
      id: '101',
      email: 'admin@springfield.edu',
      full_name: 'Springfield Administrator',
      role: 'school_admin',
      school_id: '1'
    },
    {
      id: '102',
      email: 'teacher@springfield.edu',
      full_name: 'John Smith',
      role: 'teacher',
      school_id: '1'
    },
    {
      id: '103',
      email: 'student@springfield.edu',
      full_name: 'Jane Doe',
      role: 'student',
      school_id: '1'
    }
  ],
  '2': [ // Riverdale Academy
    {
      id: '201',
      email: 'admin@riverdale.edu',
      full_name: 'Riverdale Administrator',
      role: 'school_admin',
      school_id: '2'
    },
    {
      id: '202',
      email: 'teacher@riverdale.edu',
      full_name: 'Mary Johnson',
      role: 'teacher',
      school_id: '2'
    },
    {
      id: '203',
      email: 'student@riverdale.edu',
      full_name: 'Bob Wilson',
      role: 'student',
      school_id: '2'
    }
  ],
  system: [
    {
      id: '001',
      email: 'admin@edumanager.com',
      full_name: 'System Administrator',
      role: 'system_admin',
      school_id: null
    }
  ]
};

// Mock courses data
export const mockCourses = {
  '1': [ // Springfield High School
    {
      id: '101',
      name: 'Advanced Mathematics',
      description: 'Advanced mathematical concepts and problem solving',
      teacher_id: '102',
      school_id: '1',
      teacher: {
        id: '102',
        full_name: 'John Smith',
        email: 'teacher@springfield.edu'
      }
    },
    {
      id: '102',
      name: 'Physics 101',
      description: 'Introduction to Physics',
      teacher_id: '102',
      school_id: '1',
      teacher: {
        id: '102',
        full_name: 'John Smith',
        email: 'teacher@springfield.edu'
      }
    }
  ],
  '2': [ // Riverdale Academy
    {
      id: '201',
      name: 'Biology Fundamentals',
      description: 'Basic concepts in Biology',
      teacher_id: '202',
      school_id: '2',
      teacher: {
        id: '202',
        full_name: 'Mary Johnson',
        email: 'teacher@riverdale.edu'
      }
    },
    {
      id: '202',
      name: 'Chemistry 101',
      description: 'Introduction to Chemistry',
      teacher_id: '202',
      school_id: '2',
      teacher: {
        id: '202',
        full_name: 'Mary Johnson',
        email: 'teacher@riverdale.edu'
      }
    }
  ]
};

// Mock materials data
export const mockMaterials = {
  '101': [ // Springfield - Advanced Mathematics
    {
      id: '1001',
      name: 'Calculus Introduction',
      file_path: '/materials/calculus-intro.pdf',
      file_type: 'pdf',
      size: 2500000,
      created_at: '2025-03-01T10:00:00Z'
    }
  ],
  '201': [ // Riverdale - Biology Fundamentals
    {
      id: '2001',
      name: 'Cell Structure',
      file_path: '/materials/cell-structure.pdf',
      file_type: 'pdf',
      size: 1800000,
      created_at: '2025-03-02T14:30:00Z'
    }
  ]
};

// Mock API usage data per school
export const mockApiUsage = {
  '1': { // Springfield High School
    daily: [
      { date: '2025-03-06', calls: 5000 },
      { date: '2025-03-07', calls: 6000 },
      { date: '2025-03-08', calls: 4500 },
      { date: '2025-03-09', calls: 7000 },
      { date: '2025-03-10', calls: 5500 },
      { date: '2025-03-11', calls: 6500 },
      { date: '2025-03-12', calls: 5000 }
    ],
    endpoints: [
      { path: '/api/courses', calls: 15000, avgResponseTime: 120 },
      { path: '/api/students', calls: 12000, avgResponseTime: 150 },
      { path: '/api/grades', calls: 10000, avgResponseTime: 135 },
      { path: '/api/materials', calls: 8000, avgResponseTime: 180 }
    ]
  },
  '2': { // Riverdale Academy
    daily: [
      { date: '2025-03-06', calls: 8000 },
      { date: '2025-03-07', calls: 9000 },
      { date: '2025-03-08', calls: 7500 },
      { date: '2025-03-09', calls: 11000 },
      { date: '2025-03-10', calls: 8500 },
      { date: '2025-03-11', calls: 9500 },
      { date: '2025-03-12', calls: 8000 }
    ],
    endpoints: [
      { path: '/api/courses', calls: 25000, avgResponseTime: 115 },
      { path: '/api/students', calls: 20000, avgResponseTime: 145 },
      { path: '/api/grades', calls: 18000, avgResponseTime: 130 },
      { path: '/api/materials', calls: 15000, avgResponseTime: 175 }
    ]
  }
};

// Mock subscriptions data
export const mockSubscriptions = [
  {
    id: '1',
    school_id: '1',
    plan_name: 'Professional',
    status: 'active',
    start_date: '2025-01-01T00:00:00Z',
    end_date: '2026-01-01T00:00:00Z',
    max_users: 500,
    max_api_calls: 100000
  },
  {
    id: '2',
    school_id: '2',
    plan_name: 'Enterprise',
    status: 'active',
    start_date: '2025-01-01T00:00:00Z',
    end_date: '2026-01-01T00:00:00Z',
    max_users: 1000,
    max_api_calls: 500000
  }
];

// Mock billing data per school
export const mockBilling = {
  '1': { // Springfield High School
    currentPlan: 'Professional',
    nextBillingDate: '2025-04-01T00:00:00Z',
    subscriptionEndDate: '2026-03-31T00:00:00Z',
    apiUsage: 75000,
    apiLimit: 100000,
    recentInvoices: [
      {
        id: '1001',
        amount: 499.99,
        status: 'paid',
        date: '2025-03-01T00:00:00Z'
      },
      {
        id: '1002',
        amount: 499.99,
        status: 'pending',
        date: '2025-04-01T00:00:00Z'
      }
    ]
  },
  '2': { // Riverdale Academy
    currentPlan: 'Enterprise',
    nextBillingDate: '2025-04-01T00:00:00Z',
    subscriptionEndDate: '2026-03-31T00:00:00Z',
    apiUsage: 250000,
    apiLimit: 500000,
    recentInvoices: [
      {
        id: '2001',
        amount: 999.99,
        status: 'paid',
        date: '2025-03-01T00:00:00Z'
      },
      {
        id: '2002',
        amount: 999.99,
        status: 'pending',
        date: '2025-04-01T00:00:00Z'
      }
    ]
  }
};

// Mock QA data
export const mockQAHistory = {
  '1001': [ // Springfield - Calculus Material
    {
      id: '10001',
      question: 'Can you explain derivatives?',
      answer: 'A derivative measures the rate of change of a function with respect to its variable. It tells us the slope of the tangent line at any point on the curve.',
      created_at: '2025-03-01T15:00:00Z',
      user: {
        full_name: 'Jane Doe'
      }
    }
  ],
  '2001': [ // Riverdale - Biology Material
    {
      id: '20001',
      question: 'What are the main parts of a cell?',
      answer: 'The main parts of a cell include:\n1. Cell membrane\n2. Nucleus\n3. Cytoplasm\n4. Mitochondria\n5. Endoplasmic reticulum',
      created_at: '2025-03-02T10:30:00Z',
      user: {
        full_name: 'Bob Wilson'
      }
    }
  ]
};