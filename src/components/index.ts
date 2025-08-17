// CodeMirror Widget Components
export { default as CodeMirrorWidget } from './CodeMirrorWidget';
export { default as CodeMirrorDemo } from './CodeMirrorDemo';
export { default as CodeMirrorUsage } from './CodeMirrorUsage';
export { default as SimpleCodeMirrorExample } from './SimpleCodeMirrorExample';

// Shiki CodeMirror Components
export { default as ShikiCodeMirrorWidget } from './codemirror/ShikiCodeMirrorWidget';
export { default as ShikiCodeMirrorDemo } from './ShikiCodeMirrorDemo';

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
