'use client';  // Important for Next.js client-side components

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import TabContent from './TabContent';

// Define interfaces for type safety
interface Tab {
  id: number;
  title: string;
  isActive: boolean;
}

const StudyHelper: React.FC = () => {
  // Load saved tabs with type safety
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Check if we're in browser environment due to Next.js SSR
    if (typeof window !== 'undefined') {
      const savedTabs = localStorage.getItem('studyTabs');
      return savedTabs ? JSON.parse(savedTabs) : [
        { id: 1, title: 'Topic 1', isActive: true }
      ];
    }
    return [{ id: 1, title: 'Topic 1', isActive: true }];
  });

  // Load last active tab with type safety
  const [activeTabId, setActiveTabId] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedActiveId = localStorage.getItem('activeTabId');
      return savedActiveId ? parseInt(savedActiveId) : 1;
    }
    return 1;
  });

  const [nextTabId, setNextTabId] = useState<number>(() => {
    return Math.max(...tabs.map(tab => tab.id), 0) + 1;
  });

  // Save tabs whenever they change
  useEffect(() => {
    localStorage.setItem('studyTabs', JSON.stringify(tabs));
  }, [tabs]);

  // Save active tab whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTabId', activeTabId.toString());
  }, [activeTabId]);

  const addTab = (): void => {
    const newTab: Tab = {
      id: nextTabId,
      title: `Topic ${nextTabId}`,
      isActive: false
    };
    setTabs([...tabs, newTab]);
    setNextTabId(nextTabId + 1);
    setActiveTabId(newTab.id);
  };

  const removeTab = (tabId: number): void => {
    if (tabs.length === 1) return; // Don't remove the last tab

    // Clean up stored data for this tab
    localStorage.removeItem(`tab_${tabId}_data`);

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[0].id);
    }
    setTabs(newTabs);
  };

  const selectTab = (tabId: number): void => {
    setActiveTabId(tabId);
  };

  const updateTabTitle = (tabId: number, newTitle: string): void => {
    setTabs(tabs.map(tab =>
      tab.id === tabId ? { ...tab, title: newTitle } : tab
    ));
  };

  const resetAllTabs = () => {
    // Reset all tabs to initial state
    const initialTab = { id: 1, title: 'Topic 1', isActive: true };
    setTabs([initialTab]);
    setActiveTabId(1);
    setNextTabId(2);

    // Clear all tab data from localStorage
    tabs.forEach(tab => {
      localStorage.removeItem(`tab_${tab.id}_data`);
    });
    localStorage.removeItem('studyTabs');
    localStorage.removeItem('activeTabId');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Tab Bar */}
      <div className="flex items-center space-x-1 bg-white rounded-t-lg border-b">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`group relative flex items-center px-4 py-2 cursor-pointer ${activeTabId === tab.id
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                : 'hover:bg-gray-50'
              }`}
          >
            {/* Tab content */}
            <span
              onClick={() => selectTab(tab.id)}
              className="mr-2"
            >
              {tab.title}
            </span>

            {/* Close button */}
            {tabs.length > 1 && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add tab button */}
        <button
          onClick={addTab}
          className="p-2 hover:bg-gray-50 rounded-lg"
          title="Add new topic"
        >
          <Plus className="h-5 w-5" />
        </button>
        {/* Add Reset All button */}
        <button
            onClick={resetAllTabs}
            className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 ml-auto mr-2"
        >
            Reset All Tabs
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg shadow-lg">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={activeTabId === tab.id ? 'block' : 'hidden'}
          >
            <TabContent
              tabId={tab.id}
              updateTabTitle={(title: string) => updateTabTitle(tab.id, title)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyHelper;