// CodeMirror Widget Components
export { default as CodeMirrorWidget } from './CodeMirrorWidget';
export { default as CodeMirrorDemo } from './CodeMirrorDemo';
export { default as CodeMirrorUsage } from './CodeMirrorUsage';
export { default as SimpleCodeMirrorExample } from './SimpleCodeMirrorExample';

// Re-export types for convenience
export type CodeMirrorLanguage = 'javascript' | 'html' | 'css' | 'jsx' | 'tsx';
export type CodeMirrorTheme = 'light' | 'dark';

// Widget props interface
export interface CodeMirrorWidgetProps {
  value?: string;
  language?: CodeMirrorLanguage;
  theme?: CodeMirrorTheme;
  height?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}
