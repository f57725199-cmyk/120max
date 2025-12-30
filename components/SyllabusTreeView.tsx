import React, { useState, useRef, useEffect } from 'react';
import { SyllabusStructure, SyllabusMonth, StudentSyllabusProgress } from '../types';
import { SYLLABUS_STRUCTURE_DEFAULTS } from '../constants';
import { Lock, CheckCircle, Circle, BookOpen, ChevronRight, ChevronDown, ChevronUp, ZoomIn, ZoomOut, RefreshCw, Map } from 'lucide-react';

interface SyllabusTreeViewProps {
  classLevel: string;
  onNavigateToChapter: (subjectName: string, chapterName: string) => void;
  progress?: StudentSyllabusProgress;
}

const SyllabusTreeView: React.FC<SyllabusTreeViewProps> = ({ classLevel, onNavigateToChapter, progress }) => {
  const [structure, setStructure] = useState<SyllabusStructure | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(1); // Default Month 1 open

  useEffect(() => {
    // Load syllabus data
    const data = SYLLABUS_STRUCTURE_DEFAULTS[classLevel];
    if (data) {
      setStructure(data);
    }
  }, [classLevel]);

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with Ctrl + Scroll
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 3);
      setScale(newScale);
    }
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const toggleMonth = (monthNum: number, isLocked: boolean) => {
    if (isLocked) return;
    setExpandedMonth(expandedMonth === monthNum ? null : monthNum);
  };

  if (!structure) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Map size={48} className="mb-2 opacity-50" />
        <p>No Season Plan available for Class {classLevel}</p>
        <p className="text-xs">Select Class 9, 10, 11, or 12</p>
      </div>
    );
  }

  // Calculate Layout
  // We will render a vertical trunk with branches
  // Month 1 unlock, rest locked logic (simplified for demo: Month 1 unlocked, others locked unless logic added later)
  // For now, assume Month 1 is unlocked.
  // In a real app, check `progress` or current date.
  const currentMonth = 1; // Start at 1
  
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden border border-slate-200 rounded-xl shadow-inner select-none">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-2 hover:bg-slate-100 rounded-full text-slate-700"><ZoomIn size={20} /></button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-2 hover:bg-slate-100 rounded-full text-slate-700"><ZoomOut size={20} /></button>
        <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-700"><RefreshCw size={20} /></button>
      </div>

      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
        Season Mode: Class {classLevel}
      </div>

      {/* Viewport */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-move"
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={startDrag}
        onTouchMove={onDrag}
        onTouchEnd={stopDrag}
        onWheel={handleWheel}
      >
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center top',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="min-h-full w-full flex flex-col items-center pt-20 pb-20"
        >
          {/* THE TREE TRUNK */}
          <div className="absolute top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-500 via-emerald-300 to-slate-300 left-1/2 -translate-x-1/2 rounded-full opacity-50" />

          {structure.months.map((month, index) => {
            // Logic for locking
            const isUnlocked = index === 0; // Only Month 1 unlocked for now
            const isCompleted = false; // TODO: Check progress
            const isExpanded = expandedMonth === month.monthNumber;

            // Alternating sides
            const isLeft = index % 2 === 0;

            return (
              <div key={month.monthNumber} className={`relative w-full max-w-4xl flex ${isLeft ? 'justify-end' : 'justify-start'} mb-16 px-4 md:px-20`}>
                
                {/* Connector Line to Trunk */}
                <div 
                  className={`absolute top-8 h-1 bg-emerald-400 opacity-60
                    ${isLeft ? 'right-1/2 w-[calc(50%-2rem)] md:w-40 mr-1' : 'left-1/2 w-[calc(50%-2rem)] md:w-40 ml-1'}
                  `}
                />

                {/* Node on Trunk */}
                <div className={`absolute left-1/2 -translate-x-1/2 top-6 w-5 h-5 rounded-full border-4 z-10
                   ${isUnlocked ? 'bg-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200 border-slate-400'}
                `} />

                {/* Month Card */}
                <div 
                  className={`
                    relative w-[85%] md:w-80 bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300
                    ${isUnlocked ? 'border-emerald-400 shadow-emerald-100 hover:shadow-xl' : 'border-slate-300 opacity-80 grayscale'}
                    ${isLeft ? 'mr-4 md:mr-20' : 'ml-4 md:ml-20'}
                  `}
                  onClick={() => toggleMonth(month.monthNumber, !isUnlocked)}
                >
                  {/* Card Header */}
                  <div className={`p-4 flex items-center justify-between cursor-pointer ${isUnlocked ? 'bg-gradient-to-r from-emerald-50 to-white' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm
                        ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}
                      `}>
                        {month.monthNumber}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                          {month.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {month.subjects.reduce((acc, s) => acc + s.chapters.length, 0)} Chapters
                        </p>
                      </div>
                    </div>
                    <div>
                      {isUnlocked ? (
                        isExpanded ? <ChevronUp className="text-emerald-600" /> : <ChevronDown className="text-slate-400" />
                      ) : (
                        <Lock className="text-slate-400" size={18} />
                      )}
                    </div>
                  </div>

                  {/* Card Body (Subjects) */}
                  {isExpanded && isUnlocked && (
                    <div className="p-2 bg-white border-t border-slate-100">
                      {month.subjects.map((sub, sIdx) => (
                        <div key={sIdx} className="mb-3 last:mb-0">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 pl-2 border-l-2 border-emerald-200">
                            {sub.subject}
                          </h4>
                          <div className="space-y-1">
                            {sub.chapters.map((chap, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToChapter(sub.subject, chap);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors group"
                              >
                                <Circle size={6} className="text-emerald-300 group-hover:text-emerald-500 fill-current" />
                                <span className="line-clamp-1">{chap}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status Footer */}
                  <div className={`px-4 py-1 text-[10px] font-bold text-center uppercase tracking-widest
                    ${isUnlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}
                  `}>
                    {isUnlocked ? 'In Progress' : 'Locked'}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTreeView;
