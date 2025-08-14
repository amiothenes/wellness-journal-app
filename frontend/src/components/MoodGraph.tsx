import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JournalEntry } from "../types/Entry";
import {
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  startOfMonth,
  format,
  eachDayOfInterval,
  getDay,
  getMonth,
  getYear,
  isToday,
} from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/MoodGraph.css";
import { getMoodColor, getBgMoodColor } from "../utils/moodUtils";
import { isToday as isTodayUtil } from "../utils/dateUtils";

function getMoodForDate(
  dateStr: string,
  entries: JournalEntry[],
  moodCache: { [entryId: number]: number | null }
) {
  // Find the entry for the date
  const entry = entries.find((e) => e.timestamp.slice(0, 10) === dateStr);

  if (!entry) return null;

  // First priority: use stored avg_mood if available (works for both past and present entries)
  if (entry.avg_mood !== null && entry.avg_mood !== undefined) {
    return entry.avg_mood;
  }

  // Second priority: if this is today's entry, use the live mood cache
  if (isTodayUtil(entry.timestamp)) {
    const cachedMood = moodCache[entry.entry_id];
    if (cachedMood !== undefined) {
      return cachedMood;
    }
  }

  // Fallback: return null if no mood data is available
  return null;
}

function getEntryForDate(
  dateStr: string,
  entries: JournalEntry[]
): JournalEntry | null {
  return entries.find((e) => e.timestamp.slice(0, 10) === dateStr) || null;
}

function MoodGraph({
  entries,
  onEntryClick,
  moodCache,
}: {
  entries: JournalEntry[];
  onEntryClick?: (entry: JournalEntry) => void;
  moodCache: { [entryId: number]: number | null };
}) {
  const navigate = useNavigate();

  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLineGraph, setShowLineGraph] = useState(true);

  // Calculate days for current view
  let days: Date[] = [];
  if (view === "week") {
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
  const graphData = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const mood = getMoodForDate(dayStr, entries, moodCache);
    return {
      date: dayStr,
      label: format(day, view === "week" ? "EEE" : "d"),
      mood: mood,
    };
  });

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate(
      view === "week" ? subWeeks(currentDate, 1) : subMonths(currentDate, 1)
    );
  };
  const handleNext = () => {
    setCurrentDate(
      view === "week" ? addWeeks(currentDate, 1) : addMonths(currentDate, 1)
    );
  };

  const goBack = () => {
    navigate(-1); // Go back one page in history
  };

  const handleDayClick = (day: Date, entry: JournalEntry | null) => {
    if (entry && onEntryClick) {
      onEntryClick(entry);
      navigate("/");
    }
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const dateStr = data.activePayload[0].payload.date;
      const entry = getEntryForDate(dateStr, entries);
      if (entry && onEntryClick) {
        onEntryClick(entry);
        navigate("/");
      }
    }
  };

  return (
    <div className="main mood-graph-page">
      <div className="main-background"></div>
      {/* Header section with navigation and view toggle */}
      <div className="mood-graph-header">
        {/* Left: Month/Week view toggle (only when calendar is visible) */}
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <button onClick={goBack} className="blue-button go-back">
            {" "}
            Journal{" "}
          </button>
        </div>
        {/* Center: Navigation and title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 2,
            justifyContent: "center",
          }}
        >
          <button 
            className="blue-button" 
            onClick={handlePrev}
            style={{
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0'
            }}
          >
            <img
              src="/arrow-left-solid-full.svg"
              alt="Previous"
              width="18"
              height="18"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </button>
          <span className="mood-graph-title" style={{ margin: "0 1rem" }}>
            {view === "week"
              ? `Week of ${format(days[0], "MMM d, yyyy")}`
              : `${format(currentDate, "MMMM yyyy")}`}
          </span>
          <button 
            className="blue-button" 
            onClick={handleNext}
            style={{
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0'
            }}
          >
            <img
              src="/arrow-right-solid-full.svg"
              alt="Next"
              width="18"
              height="18"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </button>
        </div>
        {/* Right: Line graph toggle button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <button
            className="blue-button"
            style={{ marginRight: "1rem" }}
            onClick={() => setView(view === "week" ? "month" : "week")}
          >
            {view === "week" ? "Month View" : "Week View"}
          </button>
          <button
            className={`blue-button ${showLineGraph ? " active" : ""}`}
            onClick={() => setShowLineGraph((prev) => !prev)}
            aria-label={showLineGraph ? "Show Calendar" : "Show Line Graph"}
          >
            {showLineGraph ? (
              <span role="img" aria-label="calendar">
                📅
              </span>
            ) : (
              <span role="img" aria-label="graph">
                📈
              </span>
            )}
            {showLineGraph ? "Calendar" : "Line Graph"}
          </button>
        </div>
      </div>
      {/* Calendar section: displays either a week or a month grid, only if line graph is hidden */}
      {!showLineGraph && (
        <div className="mood-graph-calendar" data-view={view}>
          {/* Month view: render weekday headers (Mon-Sun) at the top of the grid */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((wd) => (
            <div
              key={wd}
              className="mood-graph-day mood-graph-header-day mood-graph-day--bg"
            >
              {wd}
            </div>
          ))}
          {/* Render each day cell for both week and month views */}
          {days.map((day, idx) => {
            const isCurrentMonth = getMonth(day) === getMonth(currentDate);
            const showBg = view === "month" ? !isCurrentMonth : true;
            const dayStr = format(day, "yyyy-MM-dd");
            const entry = getEntryForDate(dayStr, entries);
            const isCurrentDay = isToday(day);
            const hasEntry = entry !== null;

            return (
              <div
                key={day.toISOString()}
                className={`mood-graph-day${
                  view === "month" && !isCurrentMonth
                    ? " mood-graph-day--outside mood-graph-day--bg"
                    : " mood-graph-day--bg"
                } ${isCurrentDay ? " mood-graph-current-day" : ""} ${
                  hasEntry ? " mood-graph-has-entry" : ""
                }`}
                style={{
                  opacity: view === "month" ? (isCurrentMonth ? 1 : 0.5) : 1,
                }}
                onClick={() => handleDayClick(day, entry)}
              >
                {/* Date label: shows weekday and day for week view, just day for month view */}
                <span className="mood-graph-date">
                  {format(day, view === "week" ? "d" : "d")}
                </span>
                {/* Mood value for the day, or '-' if not available */}
                <span
                  className="mood-graph-mood"
                  style={{
                    backgroundColor: getMoodForDate(
                      format(day, "yyyy-MM-dd"),
                      entries,
                      moodCache
                    )
                      ? getBgMoodColor(
                          getMoodForDate(
                            format(day, "yyyy-MM-dd"),
                            entries,
                            moodCache
                          )!
                        )
                      : "var(--bg-tertiary)",
                    color: getMoodForDate(
                      format(day, "yyyy-MM-dd"),
                      entries,
                      moodCache
                    )
                      ? getMoodColor(
                          getMoodForDate(
                            format(day, "yyyy-MM-dd"),
                            entries,
                            moodCache
                          )!
                        )
                      : "var(--text-secondary)",
                  }}
                >
                  {getMoodForDate(
                    format(day, "yyyy-MM-dd"),
                    entries,
                    moodCache
                  ) ?? "-"}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {/* Line graph section: displays mood trend for the selected days, only if toggled on */}
      {showLineGraph && (
        <div
          className="mood-graph-chart"
          style={{ marginTop: "40px", height: "480px" }}
        >
          <ResponsiveContainer width="100%" height={440}>
            <LineChart
              data={graphData.filter((d) => d.mood !== null)} // Filter out null values for chart
              margin={{ top: 40, right: 40, left: 0, bottom: 0 }}
              onClick={handleChartClick}
            >
              {/* X-Axis: shows day labels (weekday for week view, day number for month view) */}
              <XAxis dataKey="label" />
              {/* Y-Axis: mood scale from 1 to 10 */}
              <YAxis domain={[1, 10]} allowDecimals={false} />
              {/* Tooltip: shows mood value on hover */}
              <Tooltip />
              {/* Line: mood values for each day */}
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MoodGraph;
