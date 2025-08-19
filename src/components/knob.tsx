import { createSignal, createEffect, type Component, onMount } from 'solid-js';

interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  size?: number;
  label?: string;
  format?: (value: number) => string;
}

const Knob: Component<KnobProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);
  let knobRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  const size = () => props.size || 80;
  const step = () => props.step || 1;

  // Rotation range: -135° to +135° (270° total range with 90° dead zone at bottom)
  const MIN_ANGLE = -135;
  const MAX_ANGLE = 135;
  const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE;

  const normalizedValue = () => {
    const range = props.max - props.min;
    return (props.value - props.min) / range;
  };

  const rotation = () => {
    return MIN_ANGLE + normalizedValue() * ANGLE_RANGE;
  };

  const angleToValue = (angleDeg: number): number => {
    // Clamp angle to valid range
    const clampedAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angleDeg));

    // Convert angle to normalized value (0-1)
    const normalized = (clampedAngle - MIN_ANGLE) / ANGLE_RANGE;

    // Convert to actual value
    const range = props.max - props.min;
    let value = props.min + normalized * range;

    // Apply stepping
    if (step()) {
      value = Math.round(value / step()) * step();
    }

    return Math.max(props.min, Math.min(props.max, value));
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    if (!knobRef) return;
    const rect = knobRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const updateValue = (clientX: number, clientY: number) => {
      // Calculate angle from center to mouse position
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Get angle in radians, then convert to degrees
      // atan2 returns angle from -π to π, with 0 pointing right
      let angleRad = Math.atan2(deltaY, deltaX);
      let angleDeg = angleRad * (180 / Math.PI);

      // Rotate coordinate system so 0° is at top
      angleDeg = angleDeg + 90;

      // Normalize to -180 to 180 range
      if (angleDeg > 180) angleDeg -= 360;

      // Check if we're in the dead zone (bottom 90°)
      if (angleDeg > MAX_ANGLE && angleDeg <= 180) {
        // Snap to max if closer to right side
        angleDeg = MAX_ANGLE;
      } else if (angleDeg < MIN_ANGLE && angleDeg >= -180) {
        // Snap to min if closer to left side
        angleDeg = MIN_ANGLE;
      }

      // Convert angle to value and update
      const newValue = angleToValue(angleDeg);
      if (newValue !== props.value) {
        props.onChange(newValue);
      }
    };

    // Set initial value based on click position
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

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step() : step();
    const newValue = Math.max(props.min, Math.min(props.max, props.value + delta));
    props.onChange(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    let newValue = props.value;
    const bigStep = step() * 10;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(props.max, props.value + step());
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(props.min, props.value - step());
        break;
      case 'PageUp':
        e.preventDefault();
        newValue = Math.min(props.max, props.value + bigStep);
        break;
      case 'PageDown':
        e.preventDefault();
        newValue = Math.max(props.min, props.value - bigStep);
        break;
      case 'Home':
        e.preventDefault();
        newValue = props.min;
        break;
      case 'End':
        e.preventDefault();
        newValue = props.max;
        break;
      default:
        return;
    }

    props.onChange(newValue);
  };

  const handleInputChange = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    let value = target.value;

    // Remove any non-numeric characters and units
    value = value.replace(/[^\d.-]/g, '');

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newValue = Math.max(props.min, Math.min(props.max, numValue));
      props.onChange(newValue);
    }
  };

  const handleInputFocus = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement;
    // Remove formatting on focus to allow easy editing
    target.value = props.value.toString();
    target.select();
  };

  const handleInputBlur = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement;
    // Restore formatting on blur
    target.value = props.format ? props.format(props.value) : props.value.toString();
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  onMount(() => {
    if (knobRef) {
      knobRef.addEventListener('wheel', handleWheel, { passive: false });
    }
  });

  return (
    <div class="flex items-center gap-3">
      <div class="relative group">
        <div
          ref={knobRef}
          class="relative select-none focus:outline-none"
          style={{
            width: `${size()}px`,
            height: `${size()}px`,
            cursor: isDragging() ? 'grabbing' : 'grab',
          }}
          tabindex="0"
          role="slider"
          aria-valuemin={props.min}
          aria-valuemax={props.max}
          aria-valuenow={props.value}
          aria-label={props.label}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Outer glass ring */}
          <div
            class="absolute inset-0 rounded-full"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.15) 0%, 
                  rgba(255, 255, 255, 0.05) 50%, 
                  rgba(255, 255, 255, 0.1) 100%)
              `,
              'backdrop-filter': 'blur(10px)',
              'box-shadow': `
                0 8px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.3),
                inset 0 -1px 1px rgba(0, 0, 0, 0.2)
              `,
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}
          />

          {/* Inner knob surface - glass */}
          <div
            class="absolute rounded-full overflow-hidden"
            style={{
              top: '4px',
              left: '4px',
              right: '4px',
              bottom: '4px',
              transform: `rotate(${rotation()}deg)`,
              transition: isDragging() ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Glass background */}
            <div
              class="absolute inset-0 rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, 
                    rgba(255, 255, 255, 0.25) 0%, 
                    rgba(255, 255, 255, 0.1) 40%,
                    rgba(255, 255, 255, 0.05) 100%)
                `,
                'backdrop-filter': 'blur(20px)',
                'background-color': 'rgba(255, 255, 255, 0.08)',
                'box-shadow': `
                  inset 0 2px 4px rgba(255, 255, 255, 0.2),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                `,
              }}
            />

            {/* Subtle grip pattern */}
            <div
              class="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `
                  repeating-conic-gradient(
                    from 0deg at 50% 50%,
                    transparent 0deg,
                    transparent 18deg,
                    rgba(255, 255, 255, 0.1) 18deg,
                    rgba(255, 255, 255, 0.1) 20deg,
                    transparent 20deg,
                    transparent 40deg
                  )
                `,
              }}
            />

            {/* Position indicator - glowing */}
            <div
              class="absolute"
              style={{
                top: '8px',
                left: '50%',
                width: '3px',
                height: '16px',
                transform: 'translateX(-50%)',
                background:
                  isHovered() || isFocused()
                    ? 'linear-gradient(180deg, #60a5fa, #3b82f6)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
                'border-radius': '2px',
                'box-shadow': `
                  0 0 6px ${isHovered() || isFocused() ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.5)'},
                  inset 0 0 2px rgba(255,255,255,0.3)
                `,
                transition: 'all 0.2s ease',
              }}
            />

            {/* Center glass detail */}
            <div
              class="absolute rounded-full"
              style={{
                top: '50%',
                left: '50%',
                width: '16px',
                height: '16px',
                transform: 'translate(-50%, -50%)',
                background: `
                  radial-gradient(circle, 
                    rgba(255, 255, 255, 0.2) 0%, 
                    rgba(255, 255, 255, 0.05) 50%,
                    transparent 100%)
                `,
                'backdrop-filter': 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                'box-shadow': `
                  0 1px 3px rgba(0, 0, 0, 0.1),
                  inset 0 1px 2px rgba(255, 255, 255, 0.2)
                `,
              }}
            />
          </div>

          {/* Ambient light effect */}
          <div
            class="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 50% 0%, 
                  rgba(255, 255, 255, 0.15) 0%, 
                  transparent 50%)
              `,
              opacity: isHovered() || isFocused() ? 1 : 0.7,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Focus ring */}
          {isFocused() && (
            <div
              class="absolute inset-0 rounded-full pointer-events-none"
              style={{
                'box-shadow': '0 0 0 2px rgba(59,130,246,0.5)',
              }}
            />
          )}
        </div>

        {/* Value markers around the knob */}
        <svg
          class="absolute inset-0 pointer-events-none"
          width={size()}
          height={size()}
          style={{ opacity: isHovered() || isFocused() ? 1 : 0.3, transition: 'opacity 0.2s' }}
        >
          {/* Arc track */}
          <path
            d={`
              M ${size() / 2 - 35} ${size() / 2 + 25}
              A 35 35 0 1 1 ${size() / 2 + 35} ${size() / 2 + 25}
            `}
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            opacity="0.2"
          />

          {/* Tick marks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = -135 + (i * 270) / 10;
            const rad = (angle * Math.PI) / 180;
            const innerRadius = size() / 2 - 5;
            const outerRadius = size() / 2 - 2;
            const x1 = size() / 2 + Math.cos(rad) * innerRadius;
            const y1 = size() / 2 + Math.sin(rad) * innerRadius;
            const x2 = size() / 2 + Math.cos(rad) * outerRadius;
            const y2 = size() / 2 + Math.sin(rad) * outerRadius;

            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                stroke-width={i % 5 === 0 ? 2 : 1}
                opacity={i % 5 === 0 ? 0.5 : 0.3}
              />
            );
          })}
        </svg>
      </div>

      {/* Label and editable value */}
      <div class="flex flex-col gap-1">
        {props.label && <div class="text-xs font-medium opacity-70">{props.label}</div>}
        <input
          ref={inputRef}
          type="text"
          value={props.format ? props.format(props.value) : props.value.toString()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          class="w-12 px-0 py-0.5 text-center text-sm bg-transparent border-0 border-b border-current/30 focus:outline-none focus:border-current/60 transition-colors"
          style={{
            'font-variant-numeric': 'tabular-nums',
          }}
        />
      </div>
    </div>
  );
};

export default Knob;
