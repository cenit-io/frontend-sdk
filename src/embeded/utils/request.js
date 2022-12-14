import { v4 as uuid } from 'uuid';
import session from '../../utils/session';
import {
  toQueryParams as _toQueryParams,
  loadItemId as _loadItemId
} from '../../utils/request';

const promises = {};

export const toQueryParams = _toQueryParams;
export const loadItemId = _loadItemId;

export function request(options) {
  const requestId = uuid();
  const message = { cmd: 'doRequest', token: session.get('token'), options, requestId };

  window.parent.postMessage(message, '*');

  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
  });
}

window.addEventListener('message', (event) => {
  const { origin, data: { cmd, error, response, requestId } } = event;

  if (cmd !== 'response' || origin !== session.cenitFrontendBaseUrl) return false;

  const promise = promises[requestId];

  // eslint-disable-next-line no-console
  if (!promise) return console.error(`Not promise register with id: '${requestId}'.`);

  delete promises[requestId];

  return error ? promise.reject(error) : promise.resolve(response);
});

export default request;
