const STORAGE_KEY = 'dealbreaker_scan_history';
const MAX_HISTORY_ITEMS = 5;

// Function to get the current history from localStorage
export const getHistory = () => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Error retrieving scan history:", error);
    return [];
  }
};

// Function to add a new analysis result to history
// It takes the result and the file object (for metadata)
export const addAnalysisToHistory = (result, currentFile) => {
  if (!result || !result.analysis) return;

  // We only store the essential data needed to reload the dashboard
  const newHistoryItem = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    filename: result.filename || currentFile?.name,
    type: currentFile?.type, // 'application/pdf' or 'web'
    // Store the analysis data itself
    analysis: result.analysis,
    // Note: We are NOT storing the actual PDF data here, only metadata. 
    // To reload the PDF Viewer, the user would need to re-upload.
    // For URL scans, this provides the full, instant reload experience.
    fileData: null, 
  };

  const currentHistory = getHistory();

  // Remove any existing entry for the same file name to prevent duplication
  const filteredHistory = currentHistory.filter(item => item.filename !== newHistoryItem.filename);

  // Prepend the new item and ensure we don't exceed the max limit
  const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving scan history. Storage may be full.", error);
  }
};