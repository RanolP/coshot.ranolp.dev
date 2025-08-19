import type { Component } from 'solid-js';
import { createSignal, Show, createEffect, onCleanup } from 'solid-js';
import { useTheme } from '../contexts/ThemeContext';

interface TourStep {
  target?: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tour: Component<TourProps> = (props) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = createSignal(0);
  const [tooltipPosition, setTooltipPosition] = createSignal({ top: '50%', left: '50%' });
  
  const tourSteps: TourStep[] = [
    {
      title: 'Welcome to Coshot!',
      content: 'Coshot helps you create beautiful, shareable code screenshots with syntax highlighting and real TypeScript type checking.',
    },
    {
      target: '.editor-container',
      title: 'Code Editor',
      content: 'Type or paste your code here. The editor provides syntax highlighting for over 100 programming languages, making your code look clean and professional.',
      position: 'top'
    },
    {
      target: '.editor-toolbar',
      title: 'Customize Your Theme',
      content: 'Click the palette icon to choose from over 60 beautiful themes including GitHub, Dracula, One Dark Pro, and more. Each theme instantly updates your code\'s appearance to match your brand or preference.',
      position: 'bottom'
    },
    {
      target: '.editor-toolbar',
      title: 'Language Support',
      content: 'Select your programming language from 100+ supported languages. Each language gets proper syntax highlighting tailored to its syntax.',
      position: 'bottom'
    },
    {
      target: '.editor-toolbar',
      title: 'TwoSlash - Type Information',
      content: 'For TypeScript and JavaScript, enable TwoSlash to show real type information in your screenshots. This feature runs the TypeScript compiler to display actual types and errors.',
      position: 'bottom'
    },
    {
      target: '.editor-container',
      title: 'Try TwoSlash Example',
      content: 'With TwoSlash enabled, try typing: const num = 42; then on the next line type: num and add a comment "//    ^?" to see the type displayed. Perfect for educational content and documentation!',
      position: 'top'
    },
    {
      title: 'Ready to Create!',
      content: 'You\'re all set! Create beautiful code screenshots and share them with the Share button. Perfect for documentation, tutorials, and social media.',
    }
  ];

  const currentStepData = () => tourSteps[currentStep()];

  const nextStep = () => {
    if (currentStep() < tourSteps.length - 1) {
      setCurrentStep(currentStep() + 1);
    } else {
      props.onClose();
    }
  };

  const prevStep = () => {
    if (currentStep() > 0) {
      setCurrentStep(currentStep() - 1);
    }
  };

  const skipTour = () => {
    props.onClose();
  };

  createEffect(() => {
    if (props.isOpen && currentStepData()?.target) {
      const target = document.querySelector(currentStepData()!.target!);
      if (target) {
        const rect = target.getBoundingClientRect();
        const position = currentStepData()?.position || 'bottom';
        
        let top = 0;
        let left = 0;
        
        switch (position) {
          case 'top':
            top = rect.top - 200;
            left = rect.left + rect.width / 2 - 200;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2 - 200;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - 100;
            left = rect.left - 420;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - 100;
            left = rect.right + 20;
            break;
        }
        
        setTooltipPosition({ 
          top: `${Math.max(20, Math.min(window.innerHeight - 220, top))}px`, 
          left: `${Math.max(20, Math.min(window.innerWidth - 420, left))}px` 
        });
        
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTooltipPosition({ top: '50%', left: '50%' });
      }
    } else {
      setTooltipPosition({ top: '50%', left: '50%' });
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      skipTour();
    } else if (e.key === 'ArrowRight') {
      nextStep();
    } else if (e.key === 'ArrowLeft') {
      prevStep();
    }
  };

  createEffect(() => {
    if (props.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
    }
  });

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-2000">
        <div class="absolute inset-0 bg-black/80" onClick={skipTour} />
        
        {currentStepData()?.target && (
          <div class="highlight-overlay" />
        )}
        
        <div 
          class="absolute w-400px rounded-12px shadow-2xl animate-fadeIn"
          style={{
            'background-color': colors()?.['panel.background'] || 'var(--theme-panel-background)',
            border: `2px solid ${colors()?.['focusBorder'] || 'var(--theme-focusBorder)'}`,
            color: colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
            top: currentStepData()?.target ? tooltipPosition().top : '50%',
            left: currentStepData()?.target ? tooltipPosition().left : '50%',
            transform: currentStepData()?.target ? 'none' : 'translate(-50%, -50%)'
          }}
        >
          <div class="p-20px">
            <div class="flex justify-between items-center mb-16px">
              <h3 class="m-0 text-20px font-600">
                {currentStepData().title}
              </h3>
              <button 
                class="bg-none border-none cursor-pointer p-0 w-24px h-24px flex items-center justify-center rounded-4px opacity-60 hover:opacity-100"
                style={{ color: colors()?.['icon.foreground'] || 'var(--theme-icon-foreground)' }}
                onClick={skipTour}
                title="Close tour"
              >
                <div class="i-lucide:x w-16px h-16px" />
              </button>
            </div>
            
            <p class="m-0 mb-20px text-14px">
              {currentStepData().content}
            </p>
            
            <div class="flex justify-between items-center">
              <div class="text-12px opacity-60">
                Step {currentStep() + 1} of {tourSteps.length}
              </div>
              
              <div class="flex gap-8px">
                {currentStep() > 0 && (
                  <button
                    class="px-16px py-8px rounded-6px border-1 cursor-pointer font-500 text-14px transition-all"
                    style={{
                      'background-color': 'transparent',
                      'border-color': colors()?.['button.border'] || 'var(--theme-button-border)',
                      color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
                    }}
                    onClick={prevStep}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors()?.['button.secondaryHoverBackground'] || 'var(--theme-button-secondaryHoverBackground)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Previous
                  </button>
                )}
                
                <button
                  class="px-16px py-8px rounded-6px border-none cursor-pointer font-500 text-14px transition-all"
                  style={{
                    'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
                    color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
                  }}
                  onClick={nextStep}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors()?.['button.hoverBackground'] || 'var(--theme-button-hoverBackground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors()?.['button.background'] || 'var(--theme-button-background)';
                  }}
                >
                  {currentStep() === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
            
            <div class="flex gap-6px mt-16px justify-center">
              {tourSteps.map((_, index) => (
                <div 
                  class="w-8px h-8px rounded-full cursor-pointer transition-all"
                  style={{
                    'background-color': index === currentStep() 
                      ? (colors()?.['focusBorder'] || 'var(--theme-focusBorder)')
                      : (colors()?.['scrollbarSlider.background'] || 'var(--theme-scrollbarSlider-background)'),
                    opacity: index === currentStep() ? '1' : '0.3'
                  }}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .highlight-overlay {
          position: fixed;
          pointer-events: none;
          z-index: 1999;
        }
      `}</style>
    </Show>
  );
};

export default Tour;