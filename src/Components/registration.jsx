import React, { useState } from 'react';
import './registration.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Registration = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setSuccess('Registration successful!');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="registration-container">
      <form className="registration-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '8px' }}>{success}</div>}
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="pwd">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          id="pwd"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            id="spwd"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="spwd" style={{ margin: 0 }}>Show Password</label>
        </div>
        <label htmlFor="cpwd">Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="cpwd"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            id="scpwd"
            checked={showConfirmPassword}
            onChange={() => setShowConfirmPassword(!showConfirmPassword)}
          />
          <label htmlFor="scpwd" style={{ margin: 0 }}>Show Confirm Password</label>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Registration;