import React from 'react';

// Fallback styles
const styles = {
  header: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
  downloadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  }
};

function Header({ onSave, isCompiling }) {
  return (
    <header className="bg-gray-800 text-white p-4" style={styles.header}>
      <div className="container mx-auto flex justify-between items-center" style={styles.container}>
        <h1 className="text-xl font-bold" style={styles.title}>LaTeX Resume Editor</h1>
        <div className="flex space-x-4" style={styles.buttonContainer}>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            style={styles.saveButton}
          >
            Save .tex
          </button>
          <a
            href="http://localhost:5001/download"
            className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded ${
              isCompiling ? 'opacity-50' : ''
            }`}
            style={{
              ...styles.downloadButton,
              opacity: isCompiling ? 0.5 : 1,
              pointerEvents: isCompiling ? 'none' : 'auto'
            }}
          >
            Download PDF
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
