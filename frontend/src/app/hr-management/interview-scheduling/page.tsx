"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import api from "@/lib/api";
import { Search, ChevronLeft, ChevronRight, Loader2, Clock, Briefcase, Mail, Phone, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { SideDrawer, Application } from "../candidate-pipeline/page";

// Time block settings
const START_HOUR = 9;
const END_HOUR = 17; // 5 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i);

export default function InterviewSchedulingPage() {
  const [interviews, setInterviews] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
    return d;
  });

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/v1/applications?hasInterview=true&perPage=100${search ? `&search=${search}` : ''}`);
      setInterviews(data.data.items);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchInterviews(), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Generate week days (Sunday to Saturday)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  // Helper to place card accurately in the grid
  const getCardStyle = (interview: Application) => {
    const start = new Date(interview.interviewDate);
    const end = interview.interviewEndTime ? new Date(interview.interviewEndTime) : new Date(start.getTime() + 60 * 60 * 1000); // default 1hr
    
    // Clamp to 9 AM - 5 PM
    const startMins = Math.max(0, (start.getHours() - START_HOUR) * 60 + start.getMinutes());
    let endMins = (end.getHours() - START_HOUR) * 60 + end.getMinutes();
    
    // If it crosses boundaries or is somehow invalid, clamp it
    if (endMins <= startMins) endMins = startMins + 60; // minimum 1 hr visible
    const durationMins = Math.min(endMins - startMins, (END_HOUR - START_HOUR) * 60 - startMins);
    
    return {
      top: `${(startMins / 60) * 100}px`,
      height: `${(durationMins / 60) * 100}px`,
      minHeight: '60px' // ensure it's clickable even if short
    };
  };

  const currentMonthYear = currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Interview Schedule</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage and track candidate interviews for the week.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search candidate or job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0,0,0,0);
                today.setDate(today.getDate() - today.getDay());
                setCurrentWeekStart(today);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Today
            </button>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <button onClick={handlePrevWeek} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={handleNextWeek} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        
        {/* Calendar Header Row */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="w-20 shrink-0 border-r border-zinc-200 flex flex-col items-center justify-center p-3 dark:border-zinc-800">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 text-center leading-tight">
              {currentMonthYear.split(" ")[0]} <br/> {currentMonthYear.split(" ")[1]}
            </span>
          </div>
          <div className="grid flex-1 grid-cols-7">
            {weekDays.map((day, i) => {
              const today = isToday(day);
              return (
                <div key={i} className="flex flex-col items-center justify-center border-r border-zinc-200/50 py-3 last:border-r-0 dark:border-zinc-800/50">
                  <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <div className={cn("mt-1.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors", 
                    today ? "bg-indigo-600 text-white shadow-md" : "text-zinc-700 dark:text-zinc-200"
                  )}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Body Area */}
        <div className="flex flex-1 overflow-y-auto custom-scrollbar relative">
          
          {loading && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
               <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
             </div>
          )}

          {/* Time Column */}
          <div className="w-20 shrink-0 border-r border-zinc-200 dark:border-zinc-800">
            {HOURS.map((hour) => (
              <div key={hour} className="relative h-[100px]">
                <div className="absolute -top-3 right-3 text-xs font-medium text-zinc-500">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className="grid flex-1 grid-cols-7 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {HOURS.map((hour, i) => (
                <div key={i} className="h-[100px] border-b border-zinc-100 dark:border-zinc-800/60 w-full" />
              ))}
            </div>

            {/* Vertical Columns and Events */}
            {weekDays.map((day, colIdx) => {
              const dayInterviews = interviews.filter(inv => {
                const d = new Date(inv.interviewDate);
                return d.getDate() === day.getDate() &&
                       d.getMonth() === day.getMonth() &&
                       d.getFullYear() === day.getFullYear();
              });

              return (
                <div key={colIdx} className="relative border-r border-zinc-100 last:border-r-0 dark:border-zinc-800/40">
                  {dayInterviews.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedApp(inv)}
                      className={cn(
                        "absolute left-1 right-1 cursor-pointer overflow-hidden rounded-lg border p-2.5 shadow-sm transition-all hover:z-10 hover:shadow-md",
                        "bg-indigo-50/80 border-indigo-200/60 hover:border-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-800 dark:hover:border-indigo-500"
                      )}
                      style={getCardStyle(inv)}
                    >
                      <div className="flex items-center gap-2">
                        {inv.candidate.candidateProfile?.avatar ? (
                           <img src={inv.candidate.candidateProfile.avatar} alt="avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                        ) : (
                           <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
                             {inv.fullName.slice(0,2).toUpperCase()}
                           </div>
                        )}
                        <h4 className="truncate text-xs font-bold text-indigo-950 dark:text-indigo-100">
                          {inv.fullName}
                        </h4>
                      </div>
                      
                      <p className="mt-1 truncate text-[11px] font-medium text-indigo-700/80 dark:text-indigo-300">
                        {inv.job.title}
                      </p>
                      
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-indigo-600/70 dark:text-indigo-400">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {new Date(inv.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {inv.interviewEndTime && (
                            <> - {new Date(inv.interviewEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Drawer Integration */}
      {selectedApp && (
        <SideDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={(id, status) => {
             setInterviews(prev => prev.map(a => a.id === id ? { ...a, status } : a));
          }}
          onUpdateApp={(id, updates) => {
             setInterviews(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
          }}
        />
      )}
    </div>
  );
}
