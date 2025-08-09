import React from 'react';
import '../styles/Sidebar.css';
import {SidebarProps} from '../types/Entry';

function Sidebar({allEntries, selectedEntry, onEntryClick, onNewEntry, onDelete}: SidebarProps) {

  return (
    <div className='sidebar'>
      <button className='new-entry-button' onClick={onNewEntry}>Create New Entry</button>
      <div className='sidebar-entries'>
        {allEntries.map((entry) => (
          <div 
            key={entry.entry_id} 
            className={`sidebar-entry ${selectedEntry?.entry_id === entry.entry_id ? 'selected' : ''}`}
            onClick={() => onEntryClick(entry)}
          >
            Entry
            <div className='entry-date'>
              {new Date(entry.timestamp).toLocaleDateString()}
            </div>
            <button
              className='sidebar-entry-delete'
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry)
              }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
