import TopBar from './components/top-bar';
import FullScreenEditor from './components/full-screen-editor';
import { ThemeProvider } from './contexts/theme-context';

function App() {
  return (
    <ThemeProvider>
      <div class="h-screen flex flex-col overflow-hidden">
        <TopBar />
        <FullScreenEditor />
      </div>
    </ThemeProvider>
  );
}

export default App;
