import React from 'react';

const Index = () => {
  return (
    <div style={styles.container}>
      <div style={styles.contentContainer}>
        <h1 style={styles.heading}>Welcome to the Agile Project Management Tool</h1>
        <p style={styles.subheading}>This tool makes software development life easier for employees and teams.</p>
        <p style={styles.description}>
          With our tool, you can streamline project planning, track progress, and ensure smooth collaboration across teams. 
          Stay on top of your tasks, deadlines, and workflows, all in one place.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f6fa', // Light background
    padding: '20px',
    boxSizing: 'border-box',
  },
  contentContainer: {
    textAlign: 'center',
    maxWidth: '800px',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  subheading: {
    fontSize: '1.2rem',
    fontWeight: '400',
    color: '#4CAF50', // Subtle accent color
    marginBottom: '30px',
  },
  description: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#555',
    lineHeight: '1.6',
    marginTop: '20px',
  },
};

export default Index;
