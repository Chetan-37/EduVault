import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { storageService, generateId } from '../services/storageService';
import { Paper, CourseData } from '../types';
import { Button } from '../components/Button';
import { Upload, Trash2, FileText, Settings, Pencil, X, Save, MoveRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload Form State
  const [formData, setFormData] = useState({
    course: '',
    semester: '',
    subject: '',
    year: new Date().getFullYear(),
    title: ''
  });
  const [file, setFile] = useState<File | null>(null);

  // Edit Modal State
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  useEffect(() => {
    setPapers(storageService.getPapers());
    setCourses(storageService.getCourses());
  }, []);

  // --- Upload Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file");

    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const currentUser = storageService.getCurrentUser();
      
      const newPaper: Paper = {
        id: generateId(),
        ...formData,
        uploadedBy: currentUser?.name || 'Unknown',
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        fileDataUrl: reader.result as string
      };

      storageService.savePaper(newPaper);
      setPapers(storageService.getPapers());
      setUploading(false);
      setFormData({ ...formData, title: '' }); 
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert("Paper uploaded successfully!");
    };
    reader.onerror = () => {
        setUploading(false);
        alert("Error reading file");
    }
  };

  const handlePaperDelete = (id: string, e?: React.MouseEvent) => {
      // Stop propagation if called from button click to prevent other interactions
      if (e) e.stopPropagation();
      
      if(window.confirm('Are you sure you want to delete this paper?')) {
          // Optimistic update: Remove from UI immediately
          setPapers(prevPapers => prevPapers.filter(p => p.id !== id));
          
          // Then remove from storage
          storageService.deletePaper(id);
      }
  };

  // --- Edit Handlers ---

  const openEditModal = (paper: Paper) => {
    setEditingPaper({ ...paper });
  };

  const closeEditModal = () => {
    setEditingPaper(null);
  };

  const handleUpdatePaper = () => {
    if (!editingPaper) return;
    
    // Validate logic
    if (!editingPaper.course || !editingPaper.subject || !editingPaper.title) {
      alert("Please fill in all required fields.");
      return;
    }

    storageService.updatePaper(editingPaper);
    setPapers(storageService.getPapers()); // Refresh list
    closeEditModal();
  };

  // Derived state for upload form
  const availableSubjects = courses.find(c => c.name === formData.course)?.subjects || [];
  
  // Derived state for edit modal
  const editAvailableSubjects = editingPaper 
    ? courses.find(c => c.name === editingPaper.course)?.subjects || []
    : [];

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex justify-between items-end border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage, rename, and organize question papers.</p>
        </div>
        <Link to="/admin/courses">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Curriculum
            </Button>
        </Link>
      </div>

      {/* Top Section: Upload and Paper List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-indigo-600" />
                    Upload Paper
                </h2>
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Course</label>
                            <Link to="/admin/courses" className="text-xs text-indigo-600 hover:underline">
                                Edit Courses
                            </Link>
                        </div>
                        <select 
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow bg-white"
                            value={formData.course}
                            onChange={e => setFormData({...formData, course: e.target.value, subject: ''})}
                        >
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        {courses.length === 0 && <p className="text-xs text-red-500 mt-1">No courses defined.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow bg-white"
                            value={formData.semester} 
                            onChange={e => setFormData({...formData, semester: e.target.value})}
                        >
                            <option value="">Select Semester</option>
                            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="block text-sm font-medium text-gray-700">Subject</label>
                             {formData.course && (
                                 <Link to="/admin/courses" className="text-xs text-indigo-600 hover:underline">
                                    Edit Subjects
                                 </Link>
                             )}
                        </div>
                        <select 
                            required
                            disabled={!formData.course}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow bg-white disabled:bg-gray-100 disabled:text-gray-400"
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                        >
                            <option value="">{formData.course ? "Select Subject" : "Select Course First"}</option>
                            {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Year</label>
                        <input required type="number" min="2000" max="2099" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                            value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title</label>
                        <input required type="text" placeholder="e.g., End Semester Exam - May" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
                        <input 
                            ref={fileInputRef}
                            required 
                            type="file" 
                            accept="application/pdf" 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={handleFileChange} 
                        />
                    </div>

                    <Button type="submit" className="w-full mt-4" isLoading={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Paper'}
                    </Button>
                </form>
            </div>
        </div>

        {/* Paper List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Recent Uploads</h2>
            </div>
            {papers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No papers uploaded yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {papers.map((paper) => (
                                    <tr key={paper.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded flex items-center justify-center">
                                                    <FileText className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{paper.subject}</div>
                                                    <div className="text-xs text-gray-500">{paper.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.course} (Sem {paper.semester})</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(paper)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                                                    title="Edit / Rename / Move"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => handlePaperDelete(paper.id, e)} 
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors" 
                                                    title="Delete Paper"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPaper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200 flex flex-col animate-in fade-in zoom-in duration-200">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-indigo-50 rounded-t-xl">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Pencil className="h-5 w-5 text-indigo-600" />
                          Edit Paper Details
                      </h3>
                      <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  <div className="p-6 space-y-6">
                      
                      {/* Rename Section */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                             <FileText className="h-3 w-3" /> 
                             Rename
                          </h4>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Display Title</label>
                              <input 
                                  type="text" 
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                  value={editingPaper.title}
                                  onChange={e => setEditingPaper({...editingPaper, title: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                              <input 
                                  type="text" 
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                  value={editingPaper.fileName}
                                  onChange={e => setEditingPaper({...editingPaper, fileName: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="border-t border-gray-100"></div>

                      {/* Move Section */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                             <MoveRight className="h-3 w-3" /> 
                             Move / Curriculum
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                  <select 
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                      value={editingPaper.course}
                                      onChange={e => setEditingPaper({...editingPaper, course: e.target.value, subject: ''})}
                                  >
                                      {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                  <select 
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                      value={editingPaper.semester}
                                      onChange={e => setEditingPaper({...editingPaper, semester: e.target.value})}
                                  >
                                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                              <select 
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                  value={editingPaper.subject}
                                  onChange={e => setEditingPaper({...editingPaper, subject: e.target.value})}
                              >
                                  <option value="">Select Subject</option>
                                  {editAvailableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                      </div>

                       <div className="border-t border-gray-100"></div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Year</label>
                          <input 
                              type="number" 
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={editingPaper.year}
                              onChange={e => setEditingPaper({...editingPaper, year: parseInt(e.target.value)})}
                          />
                      </div>
                  </div>
                  <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                      <Button variant="secondary" onClick={closeEditModal}>Cancel</Button>
                      <Button onClick={handleUpdatePaper} className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};