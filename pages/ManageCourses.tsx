import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CourseData } from '../types';
import { Button } from '../components/Button';
import { Plus, X, BookOpen, ArrowLeft, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ManageCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Input States
  const [newCourseName, setNewCourseName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    setCourses(storageService.getCourses());
  }, []);

  const handleAddCourse = () => {
      if (!newCourseName.trim()) return;
      const newCourse: CourseData = {
          id: crypto.randomUUID(),
          name: newCourseName.trim(),
          subjects: []
      };
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      storageService.saveCourses(updatedCourses);
      setNewCourseName('');
  };

  const handleDeleteCourse = (id: string) => {
      if (confirm("Delete this course? This will not delete existing papers associated with it.")) {
          const updatedCourses = courses.filter(c => c.id !== id);
          setCourses(updatedCourses);
          storageService.saveCourses(updatedCourses);
          if (selectedCourseId === id) setSelectedCourseId(null);
      }
  };

  const handleAddSubject = () => {
      if (!selectedCourseId || !newSubjectName.trim()) return;
      
      const updatedCourses = courses.map(c => {
          if (c.id === selectedCourseId) {
              // Prevent duplicates
              if (c.subjects.includes(newSubjectName.trim())) return c;
              return { ...c, subjects: [...c.subjects, newSubjectName.trim()] };
          }
          return c;
      });

      setCourses(updatedCourses);
      storageService.saveCourses(updatedCourses);
      setNewSubjectName('');
  };

  const handleDeleteSubject = (courseId: string, subject: string) => {
      if (confirm(`Remove subject "${subject}" from this course?`)) {
          const updatedCourses = courses.map(c => {
              if (c.id === courseId) {
                  return { ...c, subjects: c.subjects.filter(s => s !== subject) };
              }
              return c;
          });
          setCourses(updatedCourses);
          storageService.saveCourses(updatedCourses);
      }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4 border-b pb-4 border-gray-200">
        <Button variant="secondary" size="sm" onClick={() => navigate('/admin')} className="!p-2 rounded-full">
             <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Curriculum</h1>
          <p className="text-gray-600 mt-1">Configure courses and subjects available for the portal.</p>
        </div>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Manage Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">1. Courses</h3>
                    <p className="text-xs text-gray-500">Select a course to manage its subjects</p>
                  </div>
                  <Layers className="text-indigo-200 h-5 w-5" />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {courses.map(course => (
                      <div 
                          key={course.id} 
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedCourseId === course.id ? 'bg-indigo-50 border-indigo-200 border' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded ${selectedCourseId === course.id ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                <BookOpen className={`h-4 w-4 ${selectedCourseId === course.id ? 'text-indigo-700' : 'text-gray-500'}`} />
                              </div>
                              <span className={`text-sm font-medium ${selectedCourseId === course.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                                  {course.name}
                              </span>
                          </div>
                          <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete Course"
                          >
                              <X className="h-4 w-4" />
                          </button>
                      </div>
                  ))}
                  {courses.length === 0 && <div className="text-center p-8 text-sm text-gray-400">No courses found</div>}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          placeholder="New Course Name..." 
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCourse()}
                      />
                      <Button onClick={handleAddCourse} disabled={!newCourseName.trim()} className="!px-3">
                          <Plus className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
          </div>

          {/* Manage Subjects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <h3 className="font-semibold text-gray-800">2. Subjects</h3>
                  <p className="text-xs text-gray-500">
                      {selectedCourse ? `Managing subjects for: ${selectedCourse.name}` : 'Select a course from the left to view subjects'}
                  </p>
              </div>
              
              {selectedCourse ? (
                  <>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                          {selectedCourse.subjects.length > 0 ? (
                              selectedCourse.subjects.map((subject, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 group shadow-sm">
                                      <span className="text-sm text-gray-700 font-medium">{subject}</span>
                                      <button 
                                          onClick={() => handleDeleteSubject(selectedCourse.id, subject)}
                                          className="text-gray-300 group-hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                                          title="Remove Subject"
                                      >
                                          <X className="h-4 w-4" />
                                      </button>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center p-8 text-sm text-gray-400">No subjects added yet for this course</div>
                          )}
                      </div>
                      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  placeholder="New Subject Name..." 
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                  value={newSubjectName}
                                  onChange={(e) => setNewSubjectName(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                              />
                              <Button onClick={handleAddSubject} disabled={!newSubjectName.trim()} className="!px-3">
                                  <Plus className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 bg-gray-50/50">
                      <BookOpen className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">Select a course to manage subjects</p>
                      <p className="text-xs mt-1 opacity-70">Use the panel on the left</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};