import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f7fc',
    padding: '20px',
  },
  profileBox: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '18px',
    color: '#333',
  },
  label: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '6px',
    marginTop: '12px',
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    marginBottom: '12px',
    background: '#f5f6fa',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '10px 20px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
  info: {
    marginBottom: '10px',
    color: '#333',
    fontSize: '1.1rem',
  },
};

const Profile = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState('user');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        // Determine role based on email
        const email = u.email || '';
        const isAdmin = email === 'ignatiuspinto95@gmail.com';
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setDisplayName(data.displayName || u.displayName || '');
          setAvatarUrl(data.avatarUrl || '');
          setRole(isAdmin ? 'admin' : 'user');
        } else {
          setDisplayName(u.displayName || '');
          setAvatarUrl('');
          setRole(isAdmin ? 'admin' : 'user');
       Y }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!user) return;
    try {
      await updateProfile(user, { displayName });
      // Save to Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        displayName,
        email: user.email,
        avatarUrl,
        role,
      });
      setSuccess('Profile updated!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    setSuccess('');
    setError('');
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);
      // Save avatar URL to Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        displayName,
        email: user.email,
        avatarUrl: url,
      });
      setSuccess('Avatar uploaded!');
    } catch (err) {
      setError('Failed to upload avatar.');
    }
    setUploading(false);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.profileBox}>
          <h2 style={styles.heading}>User Profile</h2>
          <div style={styles.info}>You are not logged in.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileBox}>
        <h2 style={styles.heading}>User Profile</h2>
        <div style={styles.info}><strong>Email:</strong> {user.email}</div>
        <div style={{ marginBottom: '16px' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No Avatar</div>
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} style={{ marginTop: 8 }} />
        </div>
        <form onSubmit={handleUpdate} style={{ width: '100%' }}>
          <label htmlFor="displayName" style={styles.label}>Display Name</label>
          <input
            type="text"
            id="displayName"
            style={styles.input}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter display name"
          />
          <div style={styles.label}>Role: <strong>{role}</strong></div>
          <button type="submit" style={styles.button}>Update Profile</button>
        </form>
        {uploading && <div style={{ color: '#333', marginTop: '10px' }}>Uploading avatar...</div>}
        {success && <div style={{ color: 'green', marginTop: '10px' }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>
    </div>
  );
};

export default Profile;
