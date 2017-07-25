import './style';
import App from './components/app';

export default App;

if ("serviceWorker" in navigator && window.location.hostname === "localhost") {
  navigator.serviceWorker.register('./sw.js');
}
