/* @refresh reload */
import { render } from 'solid-js/web';
import 'virtual:uno.css';
import './index.css';
import App from './app.tsx';

const root = document.getElementById('root');

render(() => <App />, root!);
