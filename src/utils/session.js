import LZString from 'lz-string';

class Session {
  get currentAccount() {
    return this.get('account');
  }

  get isAuthenticate() {
    return !!this.currentAccount;
  }

  get cenitBackendBaseUrl() {
    return this.get('cenitBackendBaseUrl')
      || process.env.CENIT_BACKEND_BASE_URL
      || process.env.REACT_APP_CENIT_BACKEND_BASE_URL
      || process.env.REACT_APP_CENIT_HOST // TODO: Deprecate
      || 'https://backend.cenit.io';

  }

  set cenitBackendBaseUrl(value) {
    this.set('cenitBackendBaseUrl', value);
  }

  /**
   * TODO: Deprecate, use cenitBackendBaseUrl
   * @returns {*}
   */
  get serverBaseUrl() {
    return this.cenitBackendBaseUrl
  }

  /**
   * TODO: Deprecate, use cenitBackendBaseUrl
   * @param value
   */
  set serverBaseUrl(value) {
    this.cenitBackendBaseUrl = value;
  }

  get cenitFrontendBaseUrl() {
    return this.get('cenitFrontendBaseUrl')
      || process.env.CENIT_FRONTEND_BASE_URL
      || process.env.REACT_APP_CENIT_FRONTEND_BASE_URL
      || process.env.REACT_APP_LOCALHOST // TODO: Deprecate
      || 'https://frontend.cenit.io';
  }

  set cenitFrontendBaseUrl(value) {
    this.set('cenitFrontendBaseUrl', value);
  }

  get currentAppBaseUrl() {
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
