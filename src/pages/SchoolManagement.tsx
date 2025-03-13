import React, { useState, useEffect } from 'react';
import { Plus, Building2, Pencil, Globe, Palette, UserPlus, X } from 'lucide-react';
import { getSchools, createSchool, updateSchoolBranding, createUser } from '../lib/api';
import type { School } from '../types/auth';

interface SchoolFormData {
  name: string;
  domain: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
}

interface AdminFormData {
  email: string;
  full_name: string;
  password: string;
}

export default function SchoolManagement() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [schoolFormData, setSchoolFormData] = useState<SchoolFormData>({
    name: '',
    domain: '',
    logo_url: '',
    primary_color: '#4F46E5',
    secondary_color: '#4338CA'
  });
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    email: '',
    full_name: '',
    password: ''
  });

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    try {
      setError(null);
      const data = await getSchools();
      setSchools(data);
    } catch (error) {
      console.error('Error loading schools:', error);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(school: School) {
    setEditingSchool(school);
    setSchoolFormData({
      name: school.name,
      domain: school.domain,
      logo_url: school.logo_url || '',
      primary_color: school.primary_color,
      secondary_color: school.secondary_color
    });
    setShowSchoolForm(true);
  }

  function handleAddAdmin(school: School) {
    setSelectedSchool(school);
    setAdminFormData({
      email: `admin@${school.domain}`,
      full_name: '',
      password: ''
    });
    setShowAdminForm(true);
  }

  async function handleSchoolSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      if (editingSchool) {
        await updateSchoolBranding(editingSchool.id, schoolFormData);
      } else {
        await createSchool(schoolFormData);
      }
      await loadSchools();
      setShowSchoolForm(false);
      setEditingSchool(null);
      setSchoolFormData({
        name: '',
        domain: '',
        logo_url: '',
        primary_color: '#4F46E5',
        secondary_color: '#4338CA'
      });
    } catch (error) {
      setError('Failed to save school. Please try again.');
      console.error('Error saving school:', error);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchool) return;

    try {
      setError(null);
      await createUser({
        ...adminFormData,
        role: 'school_admin',
        school_id: selectedSchool.id
      });
      setShowAdminForm(false);
      setSelectedSchool(null);
      setAdminFormData({
        email: '',
        full_name: '',
        password: ''
      });
    } catch (error) {
      setError('Failed to create admin. Please try again.');
      console.error('Error creating admin:', error);
    }
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <Building2 className="h-8 w-8 mr-2 text-indigo-600" />
            School Management
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => {
              setEditingSchool(null);
              setShowSchoolForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {showSchoolForm && (
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingSchool ? 'Edit School' : 'Add New School'}
            </h3>
            <form onSubmit={handleSchoolSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  School Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={schoolFormData.name}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  value={schoolFormData.domain}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, domain: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  disabled={!!editingSchool}
                />
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  value={schoolFormData.logo_url}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, logo_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    id="primary_color"
                    value={schoolFormData.primary_color}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, primary_color: e.target.value })}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    id="secondary_color"
                    value={schoolFormData.secondary_color}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, secondary_color: e.target.value })}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSchoolForm(false);
                    setEditingSchool(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingSchool ? 'Update School' : 'Create School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminForm && selectedSchool && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add School Admin for {selectedSchool.name}
                </h3>
                <button
                  onClick={() => {
                    setShowAdminForm(false);
                    setSelectedSchool(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="admin_email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="admin_name"
                    value={adminFormData.full_name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, full_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="admin_password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminForm(false);
                      setSelectedSchool(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {schools.map((school) => (
              <li key={school.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="h-12 w-12 rounded-lg object-contain bg-gray-100"
                        />
                      ) : (
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: school.primary_color }}
                        >
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{school.name}</h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Globe className="h-4 w-4 mr-1" />
                          {school.domain}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center sm:mt-0 sm:ml-4">
                      <div className="flex items-center space-x-2 mr-4">
                        <Palette className="h-4 w-4 text-gray-400" />
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: school.primary_color }}
                        />
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: school.secondary_color }}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddAdmin(school)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-100 hover:bg-green-200"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Admin
                        </button>
                        <button
                          onClick={() => handleEdit(school)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}