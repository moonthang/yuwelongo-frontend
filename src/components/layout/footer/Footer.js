import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-social-icons">
          <a href="https://github.com/moonthang" target="_blank" rel="noopener noreferrer" aria-label="GitHub de Miguel Angel Sepulveda Burgos">
            <i className="bi bi-github"></i>
          </a>
          <a href="https://github.com/fae320" target="_blank" rel="noopener noreferrer" aria-label="GitHub de Faeli Yobana Nez Fiole">
            <i className="bi bi-github"></i>
          </a>
        </div>
        <p>
          &copy; {new Date().getFullYear()} YuweLongo. Desarrollado por Miguel Angel Sepulveda Burgos y Faeli Yobana Nez
          Fiole.
        </p>
      </div>
    </footer>
  );
};

export default Footer;