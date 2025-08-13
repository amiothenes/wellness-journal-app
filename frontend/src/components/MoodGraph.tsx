import React, { useState } from 'react';
import { JournalEntry } from '../types/Entry';
import { addWeeks, subWeeks, addMonths, subMonths, startOfWeek, startOfMonth, format, eachDayOfInterval, getDay, getMonth, getYear } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/MoodGraph.css';
import {getMoodColor, getBgMoodColor} from '../utils/moodUtils';

function getMoodForDate(dateStr: string, entries: JournalEntry[]) {
  // Find the entry for the date
  const entry = entries.find(e => e.timestamp.slice(0, 10) === dateStr);
  if (!entry || !entry.paragraphs || entry.paragraphs.length === 0) return null;
  // Use the last paragraph's mood for the day
  return entry.paragraphs[entry.paragraphs.length - 1].mood;
}

function MoodGraph({ entries }: { entries: JournalEntry[] }) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLineGraph, setShowLineGraph] = useState(true);

  // Calculate days for current view
  let days: Date[] = [];
  if (view === 'week') {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    days = eachDayOfInterval({ start, end: addWeeks(start, 1) });
    days = days.slice(0, 7); // Only 7 days
  } else {
    // Month view: weeks start Monday, end Sunday
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    // Find the last day to display: last day of the last week that contains the last day of the month
    const lastDayOfMonth = addMonths(startOfMonth(currentDate), 1);
    const end = addWeeks(startOfWeek(lastDayOfMonth, { weekStartsOn: 1 }), 0); // start of week containing first day of next month
    // Calculate number of weeks displayed
    days = eachDayOfInterval({ start, end: addWeeks(start, 5) });
    days = days.slice(0, 35); // 35 days for a full month view
  }

  // Prepare data for graph
  const graphData = days.map(day => ({
    date: format(day, 'yyyy-MM-dd'),
    label: format(day, view === 'week' ? 'EEE' : 'd'),
    mood: getMoodForDate(format(day, 'yyyy-MM-dd'), entries),
  }));

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  };
  const handleNext = () => {
    setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
  };

  return (
    <div className="main mood-graph-page">
      <div className="main-background"></div>
      {/* Header section with navigation and view toggle */}
      <div className="mood-graph-header">
        {/* Left: Month/Week view toggle (only when calendar is visible) */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {!showLineGraph && (
            <button className="save-button" onClick={() => setView(view === 'week' ? 'month' : 'week')}>
              {view === 'week' ? 'Month View' : 'Week View'}
            </button>
          )}
        </div>
        {/* Center: Navigation and title */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 2, justifyContent: 'center' }}>
          <button className="save-button" onClick={handlePrev}>&lt;</button>
          <span className="mood-graph-title" style={{ margin: '0 1rem' }}>
            {view === 'week' ? `Week of ${format(days[0], 'MMM d, yyyy')}` : `${format(currentDate, 'MMMM yyyy')}`}
          </span>
          <button className="save-button" onClick={handleNext}>&gt;</button>
        </div>
        {/* Right: Line graph toggle button */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <button
            className={`save-button toggle-graph-btn${showLineGraph ? ' active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
            onClick={() => setShowLineGraph((prev) => !prev)}
            aria-label={showLineGraph ? 'Show Calendar' : 'Show Line Graph'}>
            {showLineGraph ? <span role="img" aria-label="calendar">📅</span> : <span role="img" aria-label="graph">📈</span>}
            {showLineGraph ? 'Calendar' : 'Line Graph'}
          </button>
        </div>
      </div>
      {/* Calendar section: displays either a week or a month grid, only if line graph is hidden */}
      {!showLineGraph && (
        <div
          className="mood-graph-calendar"
          data-view={view}>
          {/* Month view: render weekday headers (Mon-Sun) at the top of the grid */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((wd) => (
            <div key={wd} className="mood-graph-day mood-graph-header-day mood-graph-day--bg">{wd}</div>
          ))}
          {/* Render each day cell for both week and month views */}
          {days.map((day, idx) => {
            const isCurrentMonth = getMonth(day) === getMonth(currentDate);
            const showBg = view === 'month' ? !isCurrentMonth : true;
            return (
              <div
                key={day.toISOString()}
                className={`mood-graph-day${view === 'month' && !isCurrentMonth ? ' mood-graph-day--outside mood-graph-day--bg' : ' mood-graph-day--bg'}`}
                style={{ opacity: view === 'month' ? (isCurrentMonth ? 1 : 0.5) : 1 }}>
                {/* Date label: shows weekday and day for week view, just day for month view */}
                <span className="mood-graph-date">{format(day, view === 'week' ? 'EEE d' : 'd')}</span>
                {/* Mood value for the day, or '-' if not available */}
                <span
                  className="mood-graph-mood"
                  style={{
                    backgroundColor: getBgMoodColor(getMoodForDate(format(day, 'yyyy-MM-dd'), entries) ?? 5),
                    color: getMoodColor(getMoodForDate(format(day, 'yyyy-MM-dd'), entries) ?? 5)
                  }}>
                  {getMoodForDate(format(day, 'yyyy-MM-dd'), entries) ?? '-'}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {/* Line graph section: displays mood trend for the selected days, only if toggled on */}
      {showLineGraph && (
        <div className="mood-graph-chart" style={{ marginTop: '40px', height: '480px' }}>
          <ResponsiveContainer width="100%" height={440}>
            <LineChart data={graphData} margin={{ top: 40, right: 40, left: 0, bottom: 0 }}>
              {/* X-Axis: shows day labels (weekday for week view, day number for month view) */}
              <XAxis dataKey="label" />
              {/* Y-Axis: mood scale from 1 to 10 */}
              <YAxis domain={[1, 10]} allowDecimals={false} />
              {/* Tooltip: shows mood value on hover */}
              <Tooltip />
              {/* Line: mood values for each day */}
              <Line type="monotone" dataKey="mood" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MoodGraph;
