import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        // Fetch avatar from Firestore
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setAvatarUrl(profileSnap.data().avatarUrl || '');
        } else {
          setAvatarUrl('');
        }
      } else {
        setAvatarUrl('');
      }
    });

    let timeoutId;
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(async () => {
          await signOut(auth);
          navigate('/');
          alert('Session timed out due to inactivity.');
        }, 5 * 60 * 1000); // 5 minutes
      }
    };

    // Listen for user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetTimeout));
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-title">
          <a href="/">ProjectPulse</a>
        </div>
        <ul className="navbar-list">
          {!user && <li className="navbar-item"><a href="/credential">Login</a></li>}
          <li className="navbar-item"><a href="/blog">Blog</a></li>
          <li className="navbar-item"><a href="/contact">Contact</a></li>
          {user && (
            <>
              <li className="navbar-item"><a href="/dashboard">Dashboard</a></li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
              </li>
              <li className="navbar-item navbar-avatar" onClick={() => navigate('/profile')}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="navbar-avatar-img" />
                ) : (
                  <div className="navbar-avatar-placeholder">👤</div>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
