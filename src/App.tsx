import TopBar from './components/TopBar';
import FullScreenEditor from './components/FullScreenEditor';

function App() {
  return (
    <div class="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <FullScreenEditor />
    </div>
  );
}

export default App;
