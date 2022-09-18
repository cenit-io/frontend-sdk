import axios from "axios";
import tokenProvider from "axios-token-interceptor";

import session from "./session";

const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
const clientSecret = process.env.REACT_APP_OAUTH_CLIENT_SECRET;
const timeoutSpan = +process.env.REACT_APP_TIMEOUT_SPAN;

const { serverBaseUrl } = session;
window.session = session;

axios.defaults.baseURL = serverBaseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

let axiosInstance = null;

const isObject = (obj) => Object.prototype.toString.call(obj).indexOf('Object') !== -1;

const authenticate = () => {
  const credentials = {
    ...session.get('credentials'),
    client_id: clientId,
    client_secret: clientSecret,
  };

  const authRequest = axios.create();
  const options = { url: `${serverBaseUrl}/oauth/token`, method: 'POST', data: credentials };

  return authRequest(options)
    .then((response) => {
      const { created_at, expires_in } = response.data;
      const accessToken  = { ...response.data, created_at: created_at * 1000, expires_in: expires_in * 1000 };

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

export function getAxiosInstance() {
  if (axiosInstance) return axiosInstance;

  axiosInstance = axios.create({ timeout: timeoutSpan });
  axiosInstance.interceptors.request.use(
    tokenProvider({
      getToken: tokenProvider.tokenCache(authenticate, {
        getMaxAge: (response) => response.expires_in,
      }),
      headerFormatter: (response) => `Bearer ${response.access_token}`,
    }),
  );

  return axiosInstance;
}

export function request(options) {
  const { xTenantId } = session;
  const axiosInstance = getAxiosInstance();

  options.headers = { 'Content-Type': 'application/json', ...options.headers };
  if (!options.method) options.method = options.data ? 'POST' : 'GET';
  if (xTenantId) options.headers['X-Tenant-Id'] = xTenantId;

  return axiosInstance(options);
}

export default request;