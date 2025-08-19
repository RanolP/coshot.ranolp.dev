import { createSignal, createEffect, type Component } from 'solid-js';

interface DialProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  size?: number;
  label?: string;
  format?: (value: number) => string;
}

const Dial: Component<DialProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let dialRef: SVGSVGElement | undefined;
  
  const size = () => props.size || 60;
  const center = () => size() / 2;
  const radius = () => (size() - 12) / 2;
  const strokeWidth = 3;
  
  const normalizedValue = () => {
    const range = props.max - props.min;
    return (props.value - props.min) / range;
  };
  
  const angle = () => {
    const startAngle = -135;
    const endAngle = 135;
    const range = endAngle - startAngle;
    return startAngle + normalizedValue() * range;
  };
  
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const updateValue = (clientX: number, clientY: number) => {
      if (!dialRef) return;
      
      const rect = dialRef.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      
      let angleRad = Math.atan2(deltaY, deltaX);
      let angleDeg = angleRad * (180 / Math.PI);
      
      angleDeg = angleDeg + 90;
      if (angleDeg < 0) angleDeg += 360;
      
      if (angleDeg > 315) angleDeg = 315;
      if (angleDeg < 45 && angleDeg >= 0) angleDeg = 45;
      if (angleDeg >= 45 && angleDeg <= 315) {
        const normalizedAngle = (angleDeg - 45) / 270;
        const range = props.max - props.min;
        let newValue = props.min + normalizedAngle * range;
        
        if (props.step) {
          newValue = Math.round(newValue / props.step) * props.step;
        }
        
        newValue = Math.max(props.min, Math.min(props.max, newValue));
        props.onChange(newValue);
      }
    };
    
    updateValue(e.clientX, e.clientY);
    
    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const knobX = () => {
    const angleRad = angle() * (Math.PI / 180);
    return center() + Math.cos(angleRad) * radius();
  };
  
  const knobY = () => {
    const angleRad = angle() * (Math.PI / 180);
    return center() + Math.sin(angleRad) * radius();
  };
  
  const arcPath = () => {
    const startAngle = -135 * (Math.PI / 180);
    const endAngle = angle() * (Math.PI / 180);
    
    const x1 = center() + Math.cos(startAngle) * radius();
    const y1 = center() + Math.sin(startAngle) * radius();
    const x2 = center() + Math.cos(endAngle) * radius();
    const y2 = center() + Math.sin(endAngle) * radius();
    
    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius()} ${radius()} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };
  
  const trackPath = () => {
    const startAngle = -135 * (Math.PI / 180);
    const endAngle = 135 * (Math.PI / 180);
    
    const x1 = center() + Math.cos(startAngle) * radius();
    const y1 = center() + Math.sin(startAngle) * radius();
    const x2 = center() + Math.cos(endAngle) * radius();
    const y2 = center() + Math.sin(endAngle) * radius();
    
    return `M ${x1} ${y1} A ${radius()} ${radius()} 0 1 1 ${x2} ${y2}`;
  };
  
  return (
    <div class="flex flex-col items-center gap-1">
      <svg
        ref={dialRef}
        width={size()}
        height={size()}
        class="cursor-pointer select-none"
        style={{ 
          transform: 'rotate(0deg)',
          transition: isDragging() ? 'none' : 'transform 0.1s ease'
        }}
        onMouseDown={handleMouseDown}
      >
        <path
          d={trackPath()}
          fill="none"
          stroke="currentColor"
          stroke-width={strokeWidth}
          opacity="0.2"
        />
        <path
          d={arcPath()}
          fill="none"
          stroke="currentColor"
          stroke-width={strokeWidth}
        />
        <circle
          cx={knobX()}
          cy={knobY()}
          r="6"
          fill="currentColor"
          class="drop-shadow-sm"
        />
      </svg>
      {props.label && (
        <div class="text-xs text-center opacity-70">
          {props.format ? props.format(props.value) : props.value}
        </div>
      )}
    </div>
  );
};

export default Dial;