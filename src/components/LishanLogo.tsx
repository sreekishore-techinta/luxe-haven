import React from 'react';

interface LishanLogoProps {
  size?: 'small' | 'medium' | 'large';
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

const LishanLogo: React.FC<LishanLogoProps> = ({ 
  size = 'medium', 
  layout = 'vertical',
  className = ''
}) => {
  const sizeMap = {
    small: { box: '80px', text: '24px', sub: '10px', initials: '40px', gap: '12px' },
    medium: { box: '140px', text: '42px', sub: '14px', initials: '72px', gap: '24px' },
    large: { box: '200px', text: '60px', sub: '20px', initials: '100px', gap: '32px' },
  };

  const currentSize = sizeMap[size];

  return (
    <div 
      className={`logo-container ${layout} ${className}`}
      style={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        gap: currentSize.gap,
        fontFamily: "'Playfair Display', serif",
        userSelect: 'none'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        
        .logo-box {
          background-color: #2C1810;
          border-radius: 20%;
          border: 3px solid #D4AF37;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 
            0 10px 25px rgba(0,0,0,0.2),
            inset 0 0 15px rgba(0,0,0,0.5),
            inset 0 0 2px 1px rgba(249, 226, 156, 0.5);
          overflow: hidden;
        }

        .initials-text {
          font-family: 'Cinzel Decorative', cursive;
          background: linear-gradient(
            145deg, 
            #F9E29C 0%, 
            #D4AF37 45%, 
            #A67C00 55%, 
            #F9E29C 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.6));
          font-weight: 700;
          letter-spacing: -2px;
        }

        .shiny-overlay {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 55%
          );
          animation: lishanShine 4s infinite linear;
          pointer-events: none;
        }

        @keyframes lishanShine {
          0% { transform: translate(-15%, -15%); }
          100% { transform: translate(15%, 15%); }
        }

        .brand-name-text {
          color: #2C1810;
          font-weight: 700;
          margin: 0;
          letter-spacing: 1px;
          line-height: 1;
        }

        .brand-tagline-text {
          font-family: 'Cinzel', serif;
          color: #A67C00;
          margin: 8px 0 0 0;
          letter-spacing: 8px;
          text-transform: uppercase;
        }

        .decorative-divider {
          width: 40px;
          height: 1px;
          background: #D4AF37;
          margin: 12px 0;
          opacity: 0.6;
        }
      `}</style>

      <div 
        className="logo-box" 
        style={{ width: currentSize.box, height: currentSize.box }}
      >
        <div className="shiny-overlay"></div>
        <span 
          className="initials-text" 
          style={{ fontSize: currentSize.initials }}
        >
          LS
        </span>
      </div>

      <div 
        className="brand-text-wrapper"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: layout === 'vertical' ? 'center' : 'flex-start' 
        }}
      >
        <h1 
          className="brand-name-text" 
          style={{ fontSize: currentSize.text }}
        >
          Lishan
        </h1>
        <div className="decorative-divider"></div>
        <p 
          className="brand-tagline-text" 
          style={{ fontSize: currentSize.sub }}
        >
          Sarees
        </p>
      </div>
    </div>
  );
};

export default LishanLogo;
