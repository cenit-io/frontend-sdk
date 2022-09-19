import LZString from 'lz-string';

class Session {
  get currentAccount() {
    return this.get('account');
  }

  get isAuthenticate() {
    return !!this.currentAccount;
  }

  get serverBaseUrl() {
    return this.get('cenitHost') || process.env.CENIT_BACKEND_BASE_URL || process.env.REACT_APP_CENIT_HOST;
  }

  set serverBaseUrl(value) {
    this.set('cenitHost', value);
  }

  get appBaseUrl() {
    return window.location.href.replace(/\?.*$/, '').replace(/\/$/, '');
  }

  get xTenantId() {
    return this.get('tenantId');
  }

  set xTenantId(value) {
    this.set('tenantId', value);
  }

  get(key, defaultValue) {
    const item = window.sessionStorage.getItem(LZString.compress(key));

    return (item === null) ? defaultValue : JSON.parse(LZString.decompress(item));
  }

  set(key, value) {
    try {
      window.sessionStorage.setItem(LZString.compress(key), LZString.compress(JSON.stringify(value)));
    } catch (e) {
      window.sessionStorage.clear();
    }
  }

  del(key) {
    window.sessionStorage.removeItem(LZString.compress(key));
  }

  clear() {
    window.sessionStorage.clear();
  }
}

const session = new Session();

export default session;
