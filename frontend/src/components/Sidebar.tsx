import React from 'react';
import '../styles/Sidebar.css';
import {SidebarProps} from '../types/Entry';

function Sidebar({allEntries, onEntryClick}: SidebarProps) {

  // Display format: How to show "Jan 15 - Mood: 8" 

  return (
    //display all entries as string for now
    <div className='sidebar'>
      {allEntries.map((allEntries, i) => (
        <div key={i} className='sidebar-entry'>{allEntries.toString()}</div>
      ))}
    </div>
  );
}

export default Sidebar;
