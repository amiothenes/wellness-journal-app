import React from 'react';
import '../styles/Sidebar.css';
import {SidebarProps} from '../types/Entry';
import { formatEntryDate, isToday } from '../utils/dateUtils';
import { getMoodColor,getBgMoodColor } from '../utils/moodUtils';

function Sidebar({allEntries, selectedEntry, onEntryClick, onNewEntry, onDelete, canCreateNewEntry, moodCache}: SidebarProps) {

  const getDisplayMood = (entry: any): number | null => {
    if (isToday(entry.timestamp)) {
      return moodCache[entry.entry_id] ?? null;
    }
    
    // For past entries, use stored avg_mood
    if (entry.avg_mood !== null && entry.avg_mood !== undefined) {
      return entry.avg_mood;
    }
    return null;
  };

  return (
    <div className='sidebar'>
      <button 
        className={`new-entry-button ${!canCreateNewEntry ? 'disabled' : ''}`}
        onClick={onNewEntry}
        disabled={!canCreateNewEntry}>
          {canCreateNewEntry ? 'Create New Entry' : 'Today\'s Entry Exists'}
      </button>
      <div className='sidebar-entries'>
        {allEntries.map((entry) => {
          const mood = getDisplayMood(entry);
          const isTodaysEntry = isToday(entry.timestamp);
          const isSelected = selectedEntry?.entry_id === entry.entry_id;
          return (
          <div 
            key={entry.entry_id} 
            className={`sidebar-entry ${isSelected ? 'selected' : ''} ${isTodaysEntry ? 'today' : ''}`}
            onClick={() => onEntryClick(entry)}
          >
            <div className='entry-date'>
              {formatEntryDate(entry.timestamp)}
            </div>
            <div className="avg-mood">
                {mood ? (
                  <>
                    <span 
                      className="mood-badge"
                      style={{backgroundColor: getBgMoodColor(mood) , color: getMoodColor(mood) }}
                    >
                      {mood.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span className="mood-indicator no-mood">No entries yet</span>
                )}
              </div>
            <button
              className='sidebar-entry-delete'
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry)
              }}>Delete</button>
          </div>
        )})}
      </div>
    </div>
  );
}

export default Sidebar;
