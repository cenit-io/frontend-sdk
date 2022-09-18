import LZString from 'lz-string';
import session from './session';

class Local {
  get(key, defaultValue) {
    const item = window.localStorage.getItem(LZString.compress(key));

    return (item === null) ? defaultValue : JSON.parse(LZString.decompress(item));
  }

  set(key, value) {
    try {
      window.localStorage.setItem(LZString.compress(key), LZString.compress(JSON.stringify(value)));
    } catch (e) {
      window.localStorage.clear();
    }
  }

  del(key) {
    window.localStorage.removeItem(LZString.compress(key));
  }

  clear() {
    window.localStorage.clear();
  }

  get theme() {
    const theme = this.get('theme', {
      id: session.iFrameDetected ? 'cenit-io' : 'ecapi',
      mode: 'light',
    });
    return (typeof theme === 'string') ? { id: theme, model: 'light' } : theme;
  }

  setTheme(value) {
    this.set('theme', value);
  }
}

const local = new Local();

export default local;
