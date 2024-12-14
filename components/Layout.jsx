import React from 'react';
import { useLocation } from 'react-router-dom';
import BackButton from './BackButton'; // Adjust the path to your BackButton component

const Layout = ({ children }) => {
  const location = useLocation();

  // List of pages where the back button should NOT appear
  const excludeBackButtonRoutes = ['/dashboard'];

  return (
    <div style={styles.container}>
      {!excludeBackButtonRoutes.includes(location.pathname) && (
        <div style={styles.backButtonWrapper}>
          <BackButton />
        </div>
      )}
      <div style={styles.content}>{children}</div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
  },
  backButtonWrapper: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000, // Ensure the button stays above other elements
  },
  content: {
    padding: '20px',
  },
};

export default Layout;
