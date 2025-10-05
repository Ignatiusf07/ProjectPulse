import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f7fc',
    padding: '20px',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    marginTop: '70px',
  },
  formTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#2c3e50',
    letterSpacing: '0.5px',
    textTransform: 'capitalize',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    borderBottom: '2px solid #4CAF50',
    paddingBottom: '8px',
    width: '100%',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '20px',
    width: '100%',
  },
  label: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#555',
    marginBottom: '8px',
    textAlign: 'left',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '12px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  }
};

const Credential = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setSuccess('Login successful!');
        setEmail('');
        setPassword('');
        navigate('/dashboard');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleGoogleLogin = () => {
    setError('');
    setSuccess('');
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setSuccess('Google login successful!');
        navigate('/dashboard');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.formTitle}>Login</h2>
        <form style={styles.form} onSubmit={handleLogin}>
          {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '8px' }}>{success}</div>}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="pwd" style={styles.label}>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="pwd"
              style={styles.input}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                type="checkbox"
                id="showpwd"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showpwd" style={{ margin: 0 }}>Show Password</label>
            </div>
          </div>
          <button type="submit" style={styles.submitButton}>Login</button>
          <button type="button" onClick={handleGoogleLogin} style={{ ...styles.submitButton, backgroundColor: '#4285F4', marginTop: '10px' }}>
            Sign in with Google
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href="/registration" style={{ color: '#4CAF50', fontSize: '1rem', textDecoration: 'none' }}>
            Create account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Credential;