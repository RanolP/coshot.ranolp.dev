# CodeMirror Widget for SolidJS

A powerful, customizable code editor component built with CodeMirror 6 and SolidJS. This widget provides syntax highlighting, autocompletion, search functionality, and more for a professional code editing experience.

## Features

- 🎨 **Syntax Highlighting** - Support for JavaScript, HTML, CSS, JSX, and TSX
- ⚡ **Autocompletion** - Intelligent code completion with context-aware suggestions
- 🔍 **Search & Replace** - Built-in search functionality with regex support
- 🎯 **Linting** - Real-time code linting with error and warning indicators
- 🌓 **Theme Support** - Light and dark themes with customizable styling
- 📱 **Responsive Design** - Fully responsive design that works on all devices
- 🔧 **Customizable** - Extensive configuration options for different use cases
- 🚀 **Performance** - Optimized for smooth editing experience

## Installation

The CodeMirror widget is already included in this project. The required dependencies are:

```bash
pnpm add codemirror @codemirror/view @codemirror/state @codemirror/commands @codemirror/language @codemirror/lang-javascript @codemirror/lang-html @codemirror/lang-css @codemirror/autocomplete @codemirror/search @codemirror/lint
```

## Basic Usage

```tsx
import { Component, createSignal } from 'solid-js';
import CodeMirrorWidget from './components/CodeMirrorWidget';

const MyComponent: Component = () => {
  const [code, setCode] = createSignal('');

  return (
    <CodeMirrorWidget
      value={code()}
      language="javascript"
      theme="dark"
      height="400px"
      onChange={setCode}
    />
  );
};
```

## Props

| Prop          | Type                                                | Default        | Description                                  |
| ------------- | --------------------------------------------------- | -------------- | -------------------------------------------- |
| `value`       | `string`                                            | `""`           | Initial code content                         |
| `language`    | `"javascript" \| "html" \| "css" \| "jsx" \| "tsx"` | `"javascript"` | Programming language for syntax highlighting |
| `theme`       | `"light" \| "dark"`                                 | `"light"`      | Editor theme                                 |
| `height`      | `string`                                            | `"300px"`      | Editor height                                |
| `onChange`    | `(value: string) => void`                           | `undefined`    | Callback when code changes                   |
| `readOnly`    | `boolean`                                           | `false`        | Make editor read-only                        |
| `placeholder` | `string`                                            | `""`           | Placeholder text when empty                  |
| `className`   | `string`                                            | `""`           | Additional CSS classes                       |

## Examples

### Basic JavaScript Editor

```tsx
<CodeMirrorWidget
  value="console.log('Hello, World!');"
  language="javascript"
  theme="light"
  height="200px"
  onChange={(value) => console.log('Code changed:', value)}
/>
```

### HTML Editor with Dark Theme

```tsx
<CodeMirrorWidget value="<h1>Hello World</h1>" language="html" theme="dark" height="300px" />
```

### Read-only CSS Editor

```tsx
<CodeMirrorWidget
  value="body { color: red; }"
  language="css"
  theme="light"
  height="150px"
  readOnly={true}
/>
```

### JSX Editor with Custom Height

```tsx
<CodeMirrorWidget
  value="<div>Hello {name}</div>"
  language="jsx"
  theme="dark"
  height="400px"
  onChange={handleCodeChange}
/>
```

## Advanced Features

### Custom Styling

The widget includes comprehensive theming support. You can customize the appearance by modifying the theme configuration in the component:

```tsx
// The widget automatically applies themes based on the 'theme' prop
<CodeMirrorWidget
  theme="dark" // Applies dark theme styling
  // ... other props
/>
```

### Language Support

The widget supports multiple programming languages:

- **JavaScript** - Full ES6+ support with autocompletion
- **HTML** - Tag completion and validation
- **CSS** - Property and value autocompletion
- **JSX** - React JSX syntax highlighting
- **TSX** - TypeScript JSX support

### Search and Replace

The widget includes built-in search functionality. Users can:

- Use `Ctrl+F` (or `Cmd+F` on Mac) to open search
- Use `Ctrl+H` (or `Cmd+H` on Mac) to open search and replace
- Navigate through search results with arrow keys

### Autocompletion

Intelligent autocompletion is available for all supported languages:

- JavaScript: Function names, variables, and object properties
- HTML: Tag names and attributes
- CSS: Properties and values
- JSX/TSX: React components and props

## Integration with SolidJS

The widget is designed to work seamlessly with SolidJS reactive primitives:

```tsx
import { Component, createSignal, createEffect } from 'solid-js';
import CodeMirrorWidget from './components/CodeMirrorWidget';

const CodeEditor: Component = () => {
  const [code, setCode] = createSignal('');
  const [isValid, setIsValid] = createSignal(true);

  // React to code changes
  createEffect(() => {
    const currentCode = code();
    // Validate code or perform other operations
    setIsValid(currentCode.length > 0);
  });

  return (
    <div>
      <CodeMirrorWidget value={code()} language="javascript" onChange={setCode} />
      <div class={isValid() ? 'valid' : 'invalid'}>
        {isValid() ? 'Code is valid' : 'Code is invalid'}
      </div>
    </div>
  );
};
```

## Performance Considerations

- The widget uses CodeMirror 6, which is optimized for performance
- Large files are handled efficiently with virtual scrolling
- Syntax highlighting is performed incrementally
- Autocompletion is debounced to prevent excessive API calls

## Browser Support

The widget supports all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

To extend the widget with additional features:

1. **Adding Language Support**: Import additional language packages and update the `getLanguageSupport` function
2. **Custom Themes**: Modify the `EditorView.theme` configuration
3. **Additional Extensions**: Add CodeMirror extensions to the extensions array

## Troubleshooting

### Common Issues

1. **Editor not rendering**: Ensure the parent container has a defined height
2. **Syntax highlighting not working**: Check that the language prop is correctly set
3. **Autocompletion not appearing**: Verify that the autocompletion extension is included

### Debug Mode

Enable debug mode by adding console logs to the `onChange` callback:

```tsx
<CodeMirrorWidget
  onChange={(value) => {
    console.log('CodeMirror value changed:', value);
    setCode(value);
  }}
/>
```

## License

This component is part of the Coshot project and follows the same license terms.

## Changelog

### v1.0.0

- Initial release with basic CodeMirror integration
- Support for JavaScript, HTML, CSS, JSX, and TSX
- Light and dark theme support
- Autocompletion and search functionality
- Responsive design
