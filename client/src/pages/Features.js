import React, { useState } from 'react';

const Features = () => {
  return (
    <div className="features-container">
      {/* Hero Title Section */}
      <h1 className="features-hero-title">
        <span className="title-white">FLAME</span>
        <span className="title-cyan">FEATURES</span>
      </h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>
        Everything you need for the perfect Minecraft server experience
      </p>

      {/* Main Feature Layout */}
      <div className="features-main-layout">
        {/* Left: Floating Console and Icons */}
        <div className="floating-console-wrapper">
          <div className="console-card">
            <div className="console-header">FLAME CLOUD</div>

            <div className="console-line">
              <div className="dot dot-green"></div>
              <div className="line-bars"></div>
            </div>
            <div className="console-line">
              <div className="dot dot-blue"></div>
              <div className="line-bars"></div>
            </div>
            <div className="console-line">
              <div className="dot dot-orange"></div>
              <div className="line-bars"></div>
            </div>
            <div className="console-line">
              <div className="dot dot-green"></div>
              <div className="line-bars"></div>
            </div>
          </div>

          {/* Floating Icons Around the card */}
          <div className="floating-icon icon-cpu">⚙️</div>
          <div className="floating-icon icon-shield">🛡️</div>
          <div className="floating-icon icon-ssd">💿</div>
        </div>

        {/* Right: Feature Cards Grid */}
        <div className="futuristic-cards-grid">
          <div className="futuristic-card">
            <div className="card-icon-container">🚀</div>
            <div className="card-content">
              <h4>AMD RYZEN POWERED</h4>
              <span className="highlight">Premium Performance</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container">🛡️</div>
            <div className="card-content">
              <h4>DDOS PROTECTION</h4>
              <span className="highlight">Online, Always</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container">⚡</div>
            <div className="card-content">
              <h4>LAG IS NO MORE</h4>
              <span className="highlight">Smooth Gameplay</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container">🌍</div>
            <div className="card-content">
              <h4>MULTIPLE LOCATIONS</h4>
              <span className="highlight">UAE • India • Germany</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container">🕒</div>
            <div className="card-content">
              <h4>INSTANT SETUP</h4>
              <span className="highlight">60 Seconds</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container">💬</div>
            <div className="card-content">
              <h4>24/7 SUPPORT</h4>
              <span className="highlight">Always Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-icon-box">📈</div>
          <span className="stat-num">99.9%</span>
          <span className="stat-text">Uptime</span>
        </div>
        <div className="stat-item">
          <div className="stat-icon-box">🛠️</div>
          <span className="stat-num">24/7</span>
          <span className="stat-text">Support</span>
        </div>
        <div className="stat-item">
          <div className="stat-icon-box">📡</div>
          <span className="stat-num">&lt;20MS</span>
          <span className="stat-text">Latency</span>
        </div>
        <div className="stat-item">
          <div className="stat-icon-box">⭐</div>
          <span className="stat-num">400+</span>
          <span className="stat-text">Happy Users</span>
        </div>
      </div>
    </div>
  );
};

export default Features;
