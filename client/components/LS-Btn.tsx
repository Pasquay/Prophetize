import React, { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

interface MergedShapeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fill?: string;
  children?: ReactNode;
  containerStyle?: CSSProperties;
}

const MergedShape: React.FC<MergedShapeProps> = ({
  fill = "#87CEEB",
  children,
  containerStyle,
  onClick,
  ...props
}) => {
  const buttonBaseStyle: CSSProperties = {
    position: 'relative',
    width: 342,
    height: 210,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    outline: 'none',
    // Helps center the children text/content
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...containerStyle,
  };

  return (
    <button onClick={onClick} style={buttonBaseStyle} {...props}>
      {/* Shape Layers */}
      <div style={{ position: 'absolute', left: 260, top: 60, width: 50, height: 30, backgroundColor: fill }} />
      <div style={{ position: 'absolute', left: 0, top: 90, width: 342, height: 60, backgroundColor: fill, borderRadius: '20px' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 342, height: 60, backgroundColor: fill, borderRadius: '20px' }} />
      <div style={{ position: 'absolute', left: 290, top: 150, width: 20, height: 60, backgroundColor: fill, borderRadius: '0 0 12px 12px' }} />
      <div style={{ position: 'absolute', left: 240, top: 150, width: 30, height: 40, backgroundColor: fill, borderRadius: '0 0 16px 16px' }} />

      {/* SVG Bridges */}
      <svg style={{ position: 'absolute', left: 240, top: 70, width: 20, height: 20, pointerEvents: 'none' }} viewBox="-20 0 20 20">
        <path d="M 0 0 C 0 14.92 -3.6 20 -20 20 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 310, top: 70, width: 20, height: 20, pointerEvents: 'none' }} viewBox="0 0 20 20">
        <path d="M 0 0 C 0 14.92 3.6 20 20 20 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 278, top: 150, width: 12, height: 12, pointerEvents: 'none' }} viewBox="-12 -12 12 12">
        <path d="M 0 0 C 0 -8.952 -2.16 -12 -12 -12 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 310, top: 150, width: 12, height: 12, pointerEvents: 'none' }} viewBox="0 -12 12 12">
        <path d="M 0 0 C 0 -8.952 2.16 -12 12 -12 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 224, top: 150, width: 16, height: 16, pointerEvents: 'none' }} viewBox="-16 -16 16 16">
        <path d="M 0 0 C 0 -11.936 -2.88 -16 -16 -16 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 270, top: 150, width: 16, height: 16, pointerEvents: 'none' }} viewBox="0 -16 16 16">
        <path d="M 0 0 C 0 -11.936 2.88 -16 16 -16 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 240, top: 60, width: 20, height: 20, pointerEvents: 'none' }} viewBox="-20 -20 20 20">
        <path d="M 0 0 C 0 -14.92 -3.6 -20 -20 -20 H 0 Z" fill={fill} />
      </svg>
      <svg style={{ position: 'absolute', left: 310, top: 60, width: 20, height: 20, pointerEvents: 'none' }} viewBox="0 -20 20 20">
        <path d="M 0 0 C 0 -14.92 3.6 -20 20 -20 H 0 Z" fill={fill} />
      </svg>

      {/* Content Layer */}
      <span style={{ 
        position: 'relative', 
        zIndex: 1, 
        pointerEvents: 'none',
        // Example styling for the button label
        color: 'white',
        fontWeight: '600'
      }}>
        {children}
      </span>
    </button>
  );
};

export default MergedShape;