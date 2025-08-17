import { createSignal } from 'solid-js';
import CodeMirrorDemo from './components/CodeMirrorDemo';
import ShikiCodeMirrorDemo from './components/ShikiCodeMirrorDemo';

function App() {
  const [count, setCount] = createSignal(0);
  const [showCodeMirror, setShowCodeMirror] = createSignal(false);
  const [showShikiCodeMirror, setShowShikiCodeMirror] = createSignal(false);

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header class="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div class="i-carbon-camera w-5 h-5 text-white" />
              </div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Coshot
              </h1>
            </div>
            <nav class="hidden md:flex space-x-6">
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-16">
        <div class="text-center max-w-4xl mx-auto">
          <h2 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to Coshot
          </h2>
          <p class="text-xl text-gray-300 mb-12 leading-relaxed">
            A modern web application built with SolidJS, TypeScript, UnoCSS, and
            Ark UI. Experience the power of reactive programming with beautiful,
            accessible components.
          </p>

          {/* Feature Cards */}
          <div class="grid md:grid-cols-3 gap-8 mb-16">
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <div class="i-carbon-rocket w-6 h-6 text-blue-400" />
              </div>
              <h3 class="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p class="text-gray-400">
                Built with Vite for instant hot module replacement and blazing
                fast builds.
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <div class="i-carbon-palette w-6 h-6 text-purple-400" />
              </div>
              <h3 class="text-xl font-semibold mb-2">Beautiful UI</h3>
              <p class="text-gray-400">
                Styled with UnoCSS utility classes and Ark UI components for a
                modern look.
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <div class="i-carbon-security w-6 h-6 text-green-400" />
              </div>
              <h3 class="text-xl font-semibold mb-2">Type Safe</h3>
              <p class="text-gray-400">
                Full TypeScript support with strict mode for better development
                experience.
              </p>
            </div>
          </div>

          {/* Interactive Demo */}
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h3 class="text-2xl font-semibold mb-6">Interactive Demo</h3>
            <div class="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={() => setCount(count() + 1)}
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <div class="i-carbon-add w-4 h-4 mr-2" />
                Count: {count()}
              </button>
              <button
                onClick={() => setCount(0)}
                class="px-6 py-3 border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <div class="i-carbon-reset w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={() => setShowCodeMirror(!showCodeMirror())}
                class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <div class="i-carbon-code w-4 h-4 mr-2" />
                {showCodeMirror() ? 'Hide' : 'Show'} CodeMirror
              </button>
              <button
                onClick={() => setShowShikiCodeMirror(!showShikiCodeMirror())}
                class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <div class="i-carbon-terminal w-4 h-4 mr-2" />
                {showShikiCodeMirror() ? 'Hide' : 'Show'} Shiki Editor
              </button>
            </div>
            <p class="text-gray-400">
              Try clicking the buttons above to see reactive updates in action!
            </p>
          </div>

          {/* CodeMirror Demo */}
          {showCodeMirror() && (
            <div class="mt-8">
              <CodeMirrorDemo />
            </div>
          )}
          
          {/* Shiki CodeMirror Demo */}
          {showShikiCodeMirror() && (
            <div class="mt-8">
              <ShikiCodeMirrorDemo />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer class="border-t border-white/10 bg-white/5 backdrop-blur-sm mt-16">
        <div class="container mx-auto px-4 py-8">
          <div class="text-center text-gray-400">
            <p>
              &copy; 2024 Coshot. Built with ❤️ using SolidJS, UnoCSS, and Ark
              UI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
