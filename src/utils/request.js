import axios from 'axios';
import tokenProvider from 'axios-token-interceptor';

import session from './session';

const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
const clientSecret = process.env.REACT_APP_OAUTH_CLIENT_SECRET;
const timeoutSpan = +process.env.REACT_APP_TIMEOUT_SPAN;

const { cenitBackendAppBaseUrl } = session;
window.session = session;

axios.defaults.baseURL = cenitBackendAppBaseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

let globalAxiosInstance = null;

const isObject = (obj) => Object.prototype.toString.call(obj).indexOf('Object') !== -1;

const authenticate = () => {
  const credentials = {
    ...session.get('credentials'),
    client_id: clientId,
    client_secret: clientSecret,
  };

  const authRequest = axios.create();
  const options = { url: `${cenitBackendAppBaseUrl}/oauth/token`, method: 'POST', data: credentials };

  return authRequest(options)
    .then((response) => {
      const { created_at: createdAt, expires_in: expiresIn } = response.data;
      const accessToken = { ...response.data, created_at: createdAt * 1000, expires_in: expiresIn * 1000 };

      session.set('credentials', { grant_type: 'refresh_token', refresh_token: response.data.refresh_token });
      session.set('accessToken', accessToken);

      return accessToken;
    }).catch((err) => {
      session.clear();
      throw Error(err.response ? err.response.data.error_description || err.response.data.error : err.message);
    });
};

export function toQueryParams(requestData) {
  const qs = [];
  const add = (key, value) => {
    let v = typeof value === 'function' ? value() : value;
    v = v === null || v === undefined ? '' : v;
    qs[qs.length] = `${encodeURIComponent(key)}=${encodeURIComponent(v)}`;
  };

  const buildParams = (prefix, data) => {
    if (prefix) {
      if (Array.isArray(data)) {
        data.forEach((item, idx) => {
          buildParams(`${prefix}[${isObject(item[idx]) && item[idx] ? idx : ''}]`, item[idx]);
        });
      } else if (isObject(data)) {
        Object.keys(data).forEach((key) => buildParams(`${prefix}[${key}]`, data[key]));
      } else {
        add(prefix, data);
      }
    } else if (Array.isArray(data)) {
      data.forEach((item) => add(item.name, item.value));
    } else {
      Object.keys(data).forEach((key) => buildParams(key, data[key]));
    }
    return qs;
  };

  return buildParams('', requestData).join('&');
}

function getAxiosInstance() {
  if (!globalAxiosInstance) {
    globalAxiosInstance = axios.create({ timeout: timeoutSpan });
    globalAxiosInstance.interceptors.request.use(
      tokenProvider({
        getToken: tokenProvider.tokenCache(authenticate, {
          getMaxAge: (response) => response.expires_in,
        }),
        headerFormatter: (response) => `Bearer ${response.access_token}`,
      }),
    );
  }

  return globalAxiosInstance;
}

export function request(options) {
  const { xTenantId } = session;
  const axiosInstance = getAxiosInstance();

  /* eslint-disable no-param-reassign */
  options.headers = { 'Content-Type': 'application/json', ...options.headers };
  if (!options.method) options.method = options.data ? 'POST' : 'GET';
  if (xTenantId) options.headers['X-Tenant-Id'] = xTenantId;
  /* eslint-enable no-param-reassign */

  return axiosInstance(options);
}

export default request;
