<template>
  <div style="height: 100vh;"
       :class="{
         'ie-window': isIE
       }"
       v-if="initFinish">
    <nav-header v-if="!hideNav"
                :aiforce-company-id="aiforceCompanyId"
                :bizList="bizList"></nav-header>
    <div :class="hideNav ? 'mod-app-noheader' : 'mod-app'"
         @click='hideMenu'>
      <elx-navigator v-if="!hideNav"
                     :routes="navConfig"
                     :activeName="activeName"
                     :collapsed="navCollapsed"
                     @item-click="toLink"
                     @width-change="handleWidthChange"></elx-navigator>
      <div class="mod-body"
           v-loading.body="loading"
           element-loading-text="页面加载中">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Vuex from 'vuex';

import {
  PROMISE_GET_FAQ_ANSWER_TYPE, setPromise
} from '@system/service/globlePromise';

import { reverseMap } from './constant/routeMap';
import './asset/font/iconfont';
import bus from './routes/knowledge/faq/component/bus';
import bigBus from './components/bus';
import navHeader from './components/header.vue';
import role, { getRole } from './service/role';
import { getBizList } from './service/basic';
import viewSetting from './service/viewSetting';
import { getFirstPage } from './service/aiforceAuth';
import './yi-components';
import otherLinks from './constant/otherLinkConfigs';
import EventCenter from './service/eventCenter';
import {
  VIEW_SETTING,
  TOGGLE_NAV,
  CURRENT_BIZ_INFO,
  GET_FAQ_ANSWER_TYPE
} from './store/mutation-types';
import { addSlotCategory } from './routes/knowledge/faq/constants/slotConfig';
import { getIframeTitle } from './constant/iframeTitleMap';

// 判断是否在iframe里
const hideNav = window.top !== window.self;
const INIT_LEADINGWORD = 'initLeadingWord';

export default {
  name: 'app',
  props: {
    aiforceCompanyId: {
      type: Number,
      default: -1
    },
    navConfig: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      bizList: [],
      role,
      showModal: false,
      bizs: [],
      loading: false,
      initFinish: false,
      menuType: localStorage.getItem('menu-text') === 'true' ? 'big' : 'small',
      menuItems: [],
      otherLinks,
      activeName: '',
      isIE: Boolean(window.ActiveXObject) || 'ActiveXObject' in window,
      hideNav
    };
  },
  components: {
    navHeader
  },
  computed: {
    ...Vuex.mapGetters(['navAuth', 'navCollapsed']),
    ...Vuex.mapState(['currentBizInfo'])
  },
  watch: {
    $route (to) {
      this.onRouteChange(to.path);
    }
  },
  methods: {
    ...Vuex.mapActions(['editorConfigs', 'channelConfigSwitch']),
    ...Vuex.mapActions('leadingWordConfig', [
      'publishDefaultLeadingWords',
      'initLeadingWordsSetting',
      'setOptions'
    ]),
    handleWidthChange () {
      this.$store.commit(TOGGLE_NAV);
      this.reRenderCharts();
    },
    reRenderCharts () {
      setTimeout(() => {
        EventCenter.fire('windowResize');
      }, 3.2e2);
    },
    toLink (link) {
      if ((link.path || link.name) === this.$route.fullPath) {
        const current = Object.assign({}, this.$router.history.current);

        this.$router.history.updateRoute({
          matched: [],
          path: ''
        });
        setTimeout(() => {
          this.$router.replace({
            path: current.fullPath
          });
        }, 1);
        return;
      }
      if (link.path) {
        this.$router.push(link.path);
      } else if (link.name) {
        this.$router.push(link.name);
      }
    },
    hideMenu (event) {
      bus.$emit('hideMenu', event);
    },
    onRouteChange (queryStr) {
      if (!queryStr || queryStr === '') {
        return;
      }
      const path = queryStr.split('?')[0];

      // 路由权限特殊处理，有待优化
      let authPath = path;

      if (path.indexOf('missionDetail') !== -1) {
        authPath = '/business/knowledge/faq/missionManage/missionDetail';
      } else if (path.indexOf('apiCaseList') !== -1) {
        authPath = '/business/setting/mockApiManage';
      } else if (path.indexOf('badQaDetail') !== -1) {
        authPath = '/business/knowledge/faq/missionManage/missionDebugMode/badQaDetail';
        this.navAuth.badQaDetail = true;
      }

      let pathItem = reverseMap(authPath);

      if (~authPath.indexOf('/business/iframeView/')) {
        const sn = authPath.slice(21);

        if (viewSetting.snToUrl && viewSetting.snToUrl[sn]) {
          pathItem = {
            name: sn,
            path: authPath,
            title: getIframeTitle(sn)
          };
        } else {
          this.$router.push(getFirstPage(this.navConfig));
          return;
        }
      } else if (!pathItem || !this.navAuth[pathItem.name]) {
        this.$router.push(getFirstPage(this.navConfig));
      }
      document.querySelector('title').innerText = `${pathItem.title} - 智能机器人子系统`;
      this.activeName = pathItem.name;
    },
    setLangAttr (lang) {
      this.$nextTick(() => {
        const htmlEl = document.querySelector('html');

        htmlEl.setAttribute('lang', lang);
      });
    },
    // 设置当前租户id
    setCurrentTenant () {
      // 当前租户id信息保存在本地存储中
      const localTenantId = Number(window.localStorage.getItem('global-current-tanant-id'));
      const { userGroups } = this.currentBizInfo;

      if (!Array.isArray(userGroups) || userGroups.length === 0) {
        return;
      }
      let currentTenant = userGroups.find((tenant) => tenant.id === localTenantId);

      if (!currentTenant) {
        const firstTenantId = userGroups[0].id;

        [currentTenant] = userGroups;
        window.localStorage.setItem('global-current-tanant-id', firstTenantId);
      }
      this.$http.defaults.headers.common['tenant-id'] = currentTenant.id;
      this.$store.commit(
        CURRENT_BIZ_INFO,
        Object.assign(this.currentBizInfo, { currentTenantId: currentTenant.id, currentTenantName: currentTenant.name })
      );
    },
    // 通过用户所有业务列表和当前url中bId信息设置当前业务信息
    setCurrentBiz (bizList) {
      const bId = window.location.pathname.split('/')[2];
      const currentBiz = bizList.find((biz) => biz.CompanyId * (1 << 16) + biz.bizId === Number(bId));

      this.$store.commit(CURRENT_BIZ_INFO, currentBiz);
    },
    fillSystemSlots () {
      try {
        if (viewSetting.extraSlotList && Array.isArray(viewSetting.extraSlotList)) {
          addSlotCategory(viewSetting.extraSlotList);
        }
      } catch (err) {
        console.log(err);
      }
    },
    getAnnouncement () {
      this.$http.get('/basic/announcement/count').then((res) => {
        const { data } = res;

        if (data.code === 1000) {
          if (!data.data) {
            return;
          }
          const updates = data.data['1'] || { total: 0, read: 0 };
          const announcements = data.data['2'] || { total: 0, read: 0 };

          bigBus.messageDatas['1'].unread = updates.total - updates.read;
          bigBus.messageDatas['1'].total = updates.total;
          bigBus.messageDatas['2'].unread = announcements.total - announcements.read;
          bigBus.messageDatas['2'].total = announcements.total;
          bigBus.messageDatas.isDot = bigBus.messageDatas['1'].unread + bigBus.messageDatas['2'].unread;
        }
      });
      bigBus.$on('fLoadingShow', () => {
        this.loading = true;
      });
      bigBus.$on('fLoadingHide', () => {
        this.loading = false;
      });
      bigBus.$on('menu-text', (data) => {
        if (data) {
          this.menuType = 'big';
        } else {
          this.menuType = 'small';
        }
      });
    }
  },
  async created () {
    const loadingInstance = this.$loading();

    this.$store.commit(VIEW_SETTING, viewSetting);

    // 设置全局promise
    setPromise(PROMISE_GET_FAQ_ANSWER_TYPE, this.$store.dispatch(GET_FAQ_ANSWER_TYPE));
    // 确认当前路径是否被授权，在下一次轮询中执行代码，配合导航组件的高亮功能
    this.onRouteChange(this.$router.history.current.fullPath);

    const [bizList] = await Promise.all([
      getBizList(),
      getRole(),
      this.$store.dispatch('editorConfigs')
    ]);

    this.fillSystemSlots();
    this.bizList = bizList;
    this.setCurrentBiz(bizList);

    // 多租户业务需要设置当前租户信息
    if (viewSetting.isTenantBiz) {
      this.setCurrentTenant();
    }

    this.getAnnouncement();
    window.sessionStorage.clear();
    loadingInstance.close();
    this.initFinish = true;
  },
  async mounted () {
    this.setLangAttr(this.$i18n.locale);
    this.channelConfigSwitch();
    this.setOptions();
    if (!viewSetting[INIT_LEADINGWORD]) {
      this.initLeadingWordsSetting();
    }
  }
};
</script>

<style lang='less'>
@import "~asset/font/iconfont.css";
@import "~asset/css/vars.less";

// @font-face {
//   font-family: zhuiyi-number;
//   src: url('~asset/font/din_alternate_bold.ttf');
// }

.app-nav {
  float: left;
  .nav-item.last-item {
    position: absolute;
    bottom: 0;
    width: @nav-width-main;
  }
  .nav-list.big .nav-item.last-item {
    width: 140px;
  }
}
.biz .el-radio__label {
  display: none;
}
.el-select-dropdown__item {
  padding: 0 !important;
  height: 36px !important;
  line-height: 36px !important;
  text-indent: 12px !important;
}
#search-modal .el-radio__label {
  display: none;
}
.inline-list {
  overflow: hidden;
  > li {
    float: left;
  }
}
.mod-nav {
  background-color: #fff;
  overflow-x: hidden;
  border-right: 1px solid #ccc;
}

.mod-body {
  & > * {
    margin-left: auto;
    margin-right: auto;
    min-width: 1080px;
    box-sizing: border-box;
  }

  .left {
    float: left;
  }
  .right {
    float: right;
  }
  .icon-1 {
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: #000000;
  }
  .clear::after {
    content: "";
    visibility: hidden;
    display: block;
    clear: both;
  }
}
.input-workorder input {
  height: 40px;
  line-height: 40px;
  text-indent: 10px;
  width: 300px;
  background-color: #f5f5f5;
  border: 1px solid #cccccc;
  outline: none;
  border-radius: 3px;
  margin-left: 20px;
}
.input-workorder i {
  right: -122px;
}

#show-modal {
  position: absolute;
  z-index: 10;
  width: 100px;
  height: 20px;
  margin-top: 100px;
  margin-left: 40px;
}

w {
  overflow: hidden;
  > li {
    float: left;
  }
}

.el-dialog {
  position: absolute;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  margin-bottom: 50px;
}

.el-input__prefix .el-input__icon.el-icon-date {
  line-height: 30px;
}

.ie-window .sys-export__button .el-tooltip {
  vertical-align: top;
  margin-top: 6px;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
