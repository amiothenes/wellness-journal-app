import React from 'react';
import '../styles/Sidebar.css';
import {SidebarProps} from '../types/Entry';

function Sidebar({allEntries, onEntryClick, onNewEntry, onDelete}: SidebarProps) {

  // Display format: How to show "Jan 15 - Mood: 8" 

  return (
    //display all entries as string for now
    <div className='sidebar'>
      <button className='new-entry-button' onClick={onNewEntry}>Create New Entry</button>
      <div className='sidebar-entries'>
        {allEntries.map((entry) => (
          <div 
            key={entry.entry_id} 
            className='sidebar-entry' 
            onClick={() => onEntryClick(entry)}
          >
            Entry
            <div>
              {new Date(entry.timestamp).toLocaleDateString()}
            </div>
            <button className='sidebar-entry-delete' onClick={() => onDelete(entry)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
