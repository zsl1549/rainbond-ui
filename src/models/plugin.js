import {
  getMyPlugins,
  createPlugin,
  getPluginInfo,
  getPluginVersions,
  getPluginVersionInfo,
  getPluginVersionConfig,
  editPluginVersionInfo,
  addPluginVersionConfig,
  removePluginVersionConfig,
  editPluginVersionConfig,
  removePluginVersion,
  createPluginVersion,
  buildPluginVersion,
  getBuildPluginVersionStatus,
  getBuildVersionLog,
  getUsedApp,
  deletePlugin,
  getDefaultPlugin,
  installDefaultPlugin,
  getShareRecord,
  sharePlugin,
  giveupSharePlugin,
  getPluginShareInfo,
  submitSharePlugin,
  getShareEventInfo,
  getShareOneEventInfo,
  startShareOneEvent,
  installMarketPlugin,
  getUnInstalledPlugin
} from '../services/plugin';

export default {
  namespace: 'plugin',
  state: {
    // app detail info
    groupDetail: {},
    // component list
    apps: []
  },
  effects: {
    *installMarketPlugin({ payload, callback }, { call }) {
      const response = yield call(installMarketPlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getUnInstalledPlugin({ payload, callback }, { call }) {
      const response = yield call(getUnInstalledPlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *startShareOneEvent({ payload, callback }, { call }) {
      const response = yield call(startShareOneEvent, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getShareOneEventInfo({ payload, callback }, { call }) {
      const response = yield call(getShareOneEventInfo, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getShareEventInfo({ payload, callback }, { call }) {
      const response = yield call(getShareEventInfo, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *submitSharePlugin({ payload, callback }, { call }) {
      const response = yield call(submitSharePlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getPluginShareInfo({ payload, callback }, { call }) {
      const response = yield call(getPluginShareInfo, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *giveupSharePlugin({ payload, callback }, { call }) {
      const response = yield call(giveupSharePlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *sharePlugin({ payload, callback }, { call }) {
      const response = yield call(sharePlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getShareRecord({ payload, callback }, { call }) {
      const response = yield call(getShareRecord, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *installDefaultPlugin({ payload, callback }, { call }) {
      const response = yield call(installDefaultPlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getDefaultPlugin({ payload, callback }, { call }) {
      const response = yield call(getDefaultPlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getUsedApp({ payload, callback }, { call }) {
      const response = yield call(getUsedApp, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getBuildVersionLog({ payload, callback }, { call }) {
      const response = yield call(getBuildVersionLog, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getBuildPluginVersionStatus({ payload, callback }, { call }) {
      const response = yield call(getBuildPluginVersionStatus, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *buildPluginVersion({ payload, callback }, { call }) {
      const response = yield call(buildPluginVersion, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *createPluginVersion({ payload, callback }, { call }) {
      const response = yield call(createPluginVersion, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *removePluginVersion({ payload, callback }, { call }) {
      const response = yield call(removePluginVersion, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getPluginVersionConfig({ payload, callback }, { call }) {
      const response = yield call(getPluginVersionConfig, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *removePluginVersionConfig({ payload, callback }, { call }) {
      const response = yield call(removePluginVersionConfig, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *addPluginVersionConfig({ payload, callback }, { call }) {
      const response = yield call(addPluginVersionConfig, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *editPluginVersionConfig({ payload, callback }, { call }) {
      const response = yield call(editPluginVersionConfig, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getPluginVersionInfo({ payload, callback }, { call }) {
      const response = yield call(getPluginVersionInfo, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *editPluginVersionInfo({ payload, callback }, { call }) {
      const response = yield call(editPluginVersionInfo, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getPluginVersions({ payload, callback }, { call }) {
      const response = yield call(getPluginVersions, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getMyPlugins({ payload, callback }, { call }) {
      const response = yield call(getMyPlugins, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *createPlugin({ payload, callback }, { call }) {
      const response = yield call(createPlugin, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *getPluginInfo({ payload, callback }, { call }) {
      const response = yield call(getPluginInfo, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *deletePlugin({ payload, callback, handleError }, { call }) {
      const response = yield call(deletePlugin, payload, handleError);
      if (response && callback) {
        callback(response);
      }
    }
  },
  reducers: {
    clearApps(state) {
      return {
        ...state,
        apps: []
      };
    }
  }
};
