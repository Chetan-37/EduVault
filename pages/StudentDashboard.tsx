import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Paper } from '../types';
import { Button } from '../components/Button';
import { geminiService } from '../services/geminiService';
import { Search, FileText, Download, Sparkles, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Fallback for ReactMarkdown if not installed, although prompt says 'Use popular libraries'.
// But typically in this single-response environment we can't guarantee npm installs. 
// I will create a simple text renderer if ReactMarkdown breaks, but for now assume standard HTML rendering.

const SimpleMarkdown: React.FC<{content: string}> = ({ content }) => {
    // Very basic formatter for the demo to handle newlines and lists
    return (
        <div className="prose prose-indigo max-w-none text-sm text-gray-700">
            {content.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('-') || line.startsWith('*') ? 'pl-4' : 'mb-2'}>
                    {line}
                </p>
            ))}
        </div>
    )
}

export const StudentDashboard: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    setPapers(storageService.getPapers());
  }, []);

  // Derive unique options for filters
  const courses = useMemo(() => Array.from(new Set(papers.map(p => p.course))), [papers]);
  const subjects = useMemo(() => {
    return Array.from(new Set(
      papers
        .filter(p => !selectedCourse || p.course === selectedCourse)
        .map(p => p.subject)
    ));
  }, [papers, selectedCourse]);
  
  const years = useMemo(() => {
      return Array.from(new Set(
          papers
          .filter(p => !selectedCourse || p.course === selectedCourse)
          .filter(p => !selectedSubject || p.subject === selectedSubject)
          .map(p => p.year)
      )).sort((a: number, b: number) => b - a);
  }, [papers, selectedCourse, selectedSubject]);

  const filteredPapers = papers.filter(p => {
    return (
      (!selectedCourse || p.course === selectedCourse) &&
      (!selectedSubject || p.subject === selectedSubject) &&
      (!selectedYear || p.year.toString() === selectedYear)
    );
  });

  const handleGenerateStudyPlan = async () => {
    if (!selectedCourse || !selectedSubject) return;
    setAiLoading(true);
    setShowAiModal(true);
    setAiResponse(null);
    
    const result = await geminiService.generateStudyPlan(selectedCourse, selectedSubject);
    setAiResponse(result);
    setAiLoading(false);
  };

  const handleDownload = (paper: Paper) => {
      // Create a temporary link to download the Base64 file
      if(!paper.fileDataUrl) {
          alert("File not available");
          return;
      }
      const link = document.createElement('a');
      link.href = paper.fileDataUrl;
      link.download = paper.fileName || `${paper.subject}_${paper.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <div className="space-y-8 relative">
      {/* Hero / Header */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Student Portal</h1>
            <p className="text-indigo-100 max-w-xl">
                Access previous year question papers to boost your exam preparation. 
                Use our filters to find exactly what you need.
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500 to-transparent opacity-50 transform skew-x-12"></div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-30">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block ml-1">Course</label>
                <select 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    value={selectedCourse}
                    onChange={e => { setSelectedCourse(e.target.value); setSelectedSubject(''); setSelectedYear(''); }}
                >
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="relative flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block ml-1">Subject</label>
                <select 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    value={selectedSubject}
                    onChange={e => { setSelectedSubject(e.target.value); setSelectedYear(''); }}
                    disabled={!selectedCourse}
                >
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="relative w-full md:w-32">
                 <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block ml-1">Year</label>
                 <select 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    disabled={!selectedSubject}
                >
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>

        {/* AI Action Button - Only shows if subject is selected */}
        {selectedSubject && (
            <Button 
                onClick={handleGenerateStudyPlan} 
                variant="ghost" 
                className="w-full md:w-auto border border-indigo-100 bg-indigo-50 text-indigo-700 mt-6 md:mt-0"
            >
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Study Plan
            </Button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.length > 0 ? (
            filteredPapers.map(paper => (
                <div key={paper.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden group">
                    <div className="p-5 flex-1">
                        <div className="flex justify-between items-start">
                            <div className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {paper.course}
                            </div>
                            <span className="text-gray-400 text-xs">{paper.year}</span>
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {paper.subject}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{paper.title}</p>
                        <p className="text-xs text-gray-400 mt-4">Uploaded by {paper.uploadedBy}</p>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase">Semester {paper.semester}</span>
                        <Button size="sm" variant="secondary" onClick={() => handleDownload(paper)} className="!py-1 !px-3 !text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                        </Button>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No papers found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
            </div>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <h2 className="text-xl font-bold">AI Study Assistant</h2>
                    </div>
                    <button onClick={() => setShowAiModal(false)} className="text-white/80 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 animate-pulse">Analyzing {selectedSubject} curriculum...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo max-w-none">
                             <h3 className="text-gray-900 font-bold text-lg mb-4">Study Plan for {selectedSubject}</h3>
                             <SimpleMarkdown content={aiResponse || ''} />
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                    <Button onClick={() => setShowAiModal(false)}>Close</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};