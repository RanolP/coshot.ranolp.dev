import TopBar from './components/TopBar';
import FullScreenEditor from './components/FullScreenEditor';
import { ThemeProvider } from './contexts/ThemeContext';

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
