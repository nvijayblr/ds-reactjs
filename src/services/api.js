/* eslint no-underscore-dangle: [1, { "allow": ["__env"] }] */
import axios from 'axios';
import moment from 'moment';

const { apiDomain, sharedKey } = window.__env;

/* eslint-disable no-param-reassign */
axios.interceptors.request.use(
  config => {
    let auth = localStorage.getItem('auth');
    const loginUrl = `${apiDomain}/auth/login/${sharedKey}`;

    let token = null;
    let loginExpiryMoment = null;
    let loginExpired = null;

    if (config.url === loginUrl) {
      localStorage.removeItem('auth');
      localStorage.removeItem('roles');
      auth = null;
    }

    if (auth) {
      const parsedAuth = JSON.parse(auth);

      token = parsedAuth.jwt;
      loginExpiryMoment = moment.unix(parsedAuth.logged_in_till);
      loginExpired = moment().isAfter(loginExpiryMoment);

      if (loginExpired) {
        localStorage.removeItem('auth');
        localStorage.removeItem('roles');
        window.location.href = '/public/login';
        return;
      }

      if (token) {
        config.headers['X-auth'] = token;
      }
    } else if (config.url !== loginUrl) {
      window.location.href = '/public/login';
    }

    // eslint-disable-next-line consistent-return
    return config;
  },

  error => Promise.reject(error)
);
/* eslint-enable no-param-reassign */

export const loginRequest = values => axios.post(`${apiDomain}/auth/login/${sharedKey}`, values);

export const getDevicesRequest = (query, signal) =>
  axios.get(`${apiDomain}/api/device/?q=${query}`, signal);

export const getDeviceDataRequest = (deviceId, ingestionId) =>
  axios.get(`${apiDomain}/api/device/${deviceId}/?result=${ingestionId}`);

export const getIngestionHistoryRequest = deviceId =>
  axios.get(`${apiDomain}/api/device/${deviceId}/history/`);

export const getLogsRequest = (params, signal) => {
  if (params) {
    return axios.get(
      `${apiDomain}/api/generic/audit-log/?datetime_gte=${params.start}&datetime_lte=${params.end}&page_size=1000`,
      signal
    );
  }

  return axios.get(`${apiDomain}/api/generic/audit-log/?page_size=1000`, signal);
};

export const getCmaDataRequest = (deviceId, cmaItemId, ingestionId) =>
  axios.get(`${apiDomain}/api/device/${deviceId}/cma-objects/${cmaItemId}/?result=${ingestionId}`);

export const getPoliciesCmasRequest = () => axios.get(`${apiDomain}/api/cma-devices/`);

export const getPolicyPackageIngestionHistoryRequest = deviceId =>
  axios.get(`${apiDomain}/api/cma-devices/ingestion-history/?device_uuid=${deviceId}`);

export const getCmaPolicyPackagesRequest = (deviceId, ingestionId) =>
  axios.get(
    `${apiDomain}/api/cma-devices/packages/?device_uuid=${deviceId}&result_uuid=${ingestionId}`
  );
export const getCmaPolicyPackageDataRequest = (deviceId, ingestionId, packageName) =>
  axios.get(`${apiDomain}/api/device/${deviceId}/?result=${ingestionId}&package=${packageName}`);

export const getRolesRequest = query => axios.get(`${apiDomain}/api/dds-pages/`);

export const getDevicesPassword = deviceId =>
  axios.get(`${apiDomain}/api/device/${deviceId}/oob-pwd/`);

export const getInventories = signal =>
  axios.get(`${apiDomain}/api/generic/inventory-list/`, signal);

export const addEditInventories = (query, method) => {
  if (method === 'ADD') {
    return axios.post(`${apiDomain}/api/generic/inventory/`, query);
  }
  return axios.put(`${apiDomain}/api/generic/inventory/${query.uuid}/`, query);
};

export const deleteInventories = query =>
  axios.delete(`${apiDomain}/api/generic/inventory/`, query);

export const getCountries = () => axios.get(`${apiDomain}/api/generic/country/`);

export const getCredentials = () => axios.get(`${apiDomain}/api/generic/cred/`);

export const getProfiles = () => axios.get(`${apiDomain}/api/generic/profile/`);

export const getTransports = () => axios.get(`${apiDomain}/api/choices/transport/`);

export const getEasyIPRequest = ip => axios.get(`${apiDomain}/api/easyip/?q=${ip}`);

export const getBatchesReq = () => axios.get(`${apiDomain}/api/batches/`);

export const getReportTypesVendorsReq = () => axios.get(`${apiDomain}/api/report-generation/`);

export const getReportOptionsReq = (vendor, options) => {
  if (!options) return axios.get(`${apiDomain}/api/report-generation/${vendor}/`);
  return axios.get(`${apiDomain}/api/report-generation/${vendor}/?level=${options}`);
};

export const previewReportReq = (vendor, options, selectedBatchId) =>
  axios.get(
    `${apiDomain}/api/report-generation/${vendor}/download/?level=${options}&batch_id=${selectedBatchId}&format=json`
  );

export const downloadReportReq = (vendor, options, selectedBatchId, format) =>
  window.open(
    `${apiDomain}/api/report-generation/${vendor}/download/?level=${options}&batch_id=${selectedBatchId}&format=${format}`
  );
