import React from 'react'
import './Contact.css'

const Contact = () => {
  return (
    <div className="contact-container">
        <h1 className="contact-heading">Contact Your Administrator</h1>
        <h2 className="contact-sub-heading">Email at: <a href="mailto:admin@projectpulse.com" className="contact-link">admin@projectpulse.com</a></h2>
        <h2 className="contact-sub-heading">Contact at: <a href="tel:+917778545584" className="contact-link">+91 77785 45584</a></h2>
      </div>
  );
};

export default Contact
