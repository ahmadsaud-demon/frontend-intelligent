import React, { useState, useEffect } from 'react';
import { PlusCircle, Upload, FileText, Trash2, MessageCircle, HelpCircle } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import DocumentQA from '../components/DocumentQA';
import AddCourseModal from '../components/AddCourseModal';
import { fetchCourses, fetchMaterials, uploadMaterial, deleteMaterial } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Course {
  id: string;
  name: string;
  description: string;
  teacher: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Material {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  size: number;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Record<string, Material[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadMaterials(selectedCourse);
    }
  }, [selectedCourse]);

  async function loadCourses() {
    try {
      const coursesData = await fetchCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMaterials(courseId: string) {
    try {
      const materialsData = await fetchMaterials(courseId);
      setMaterials(prev => ({ ...prev, [courseId]: materialsData }));
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }

  async function handleFileUpload(courseId: string, file: File) {
    try {
      setUploading(true);
      await uploadMaterial(courseId, file);
      await loadMaterials(courseId);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteMaterial(courseId: string, materialId: string) {
    try {
      await deleteMaterial(courseId, materialId);
      await loadMaterials(courseId);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  }

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'school_admin';

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Courses
          </h2>
        </div>
        {(isAdmin || isTeacher) && (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Course
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {courses.map((course) => (
              <li key={course.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-indigo-600">{course.name}</h3>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCourse(course.id === selectedCourse ? null : course.id);
                          setShowChat(false);
                          setSelectedMaterial(null);
                        }}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        {course.id === selectedCourse ? 'Hide Details' : 'View Details'}
                      </button>
                      {course.id === selectedCourse && (
                        <button
                          onClick={() => {
                            setShowChat(!showChat);
                            setSelectedMaterial(null);
                          }}
                          className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {showChat ? 'Hide Chat' : 'Show Chat'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{course.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Teacher: {course.teacher.full_name}
                    </p>
                  </div>

                  {selectedCourse === course.id && (
                    <div className="mt-4 space-y-4">
                      {showChat ? (
                        <ChatInterface courseId={course.id} />
                      ) : (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-gray-900">Course Materials</h4>
                            {(isAdmin || (isTeacher && course.teacher.id === user?.id)) && (
                              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Material
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(course.id, file);
                                  }}
                                  disabled={uploading}
                                />
                              </label>
                            )}
                          </div>

                          <div className="space-y-2">
                            {materials[course.id]?.map((material) => (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{material.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(material.size)}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setSelectedMaterial(
                                      material.id === selectedMaterial ? null : material.id
                                    )}
                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                  >
                                    <HelpCircle className="h-4 w-4 mr-1" />
                                    Ask Questions
                                  </button>
                                  <button
                                    onClick={() => window.open(`/api/materials/${material.id}/download`, '_blank')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Download
                                  </button>
                                  {(isAdmin || (isTeacher && course.teacher.id === user?.id)) && (
                                    <button
                                      onClick={() => handleDeleteMaterial(course.id, material.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {materials[course.id]?.length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No materials uploaded yet
                              </p>
                            )}
                          </div>

                          {selectedMaterial && (
                            <div className="mt-6">
                              <DocumentQA materialId={selectedMaterial} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCourseAdded={loadCourses}
      />
    </div>
  );
}

export default Courses;