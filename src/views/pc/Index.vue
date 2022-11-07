<template>
  <div class="layout">
    <Layout>
      <Sider ref="sider" hide-trigger class="layout_sider" width="180">
        <div class="logo">LOGO</div>
        <Menu
          :active-name="$store.state.activeName"
          :open-names="calcOpenNames"
          theme="light"
          width="auto"
          accordion
          @on-select="jumpMenu"
        >
          <Submenu :name="item.menuNum" v-for="(item, index) in menus" :key="index">
            <template slot="title">
              <Icon :type="item.menu_icon ? item.menu_icon : 'logo-dropbox'"></Icon>
              {{ item.menuName }}
            </template>
            <MenuItem :name="_cItem.menuNum" v-for="(_cItem, index) in item.children" :key="index">
              {{ _cItem.menuName }}
            </MenuItem>
          </Submenu>
        </Menu>
      </Sider>
      <Layout>
        <Header class="layout_header_bar">
          <div class="username">{{ userInfo.username }}</div>
          <div>
            <Button type="primary" @click="handleLogout">退出</Button>
          </div>
        </Header>
        <Content class="layout_content">
          <Breadcrumb :style="{ margin: '24px 16px 0' }">
            <BreadcrumbItem>{{ curMenu.parentAuth }}</BreadcrumbItem>
            <BreadcrumbItem>{{ curMenu.menuName }}</BreadcrumbItem>
          </Breadcrumb>
          <div class="router-wrapper">
            <keep-alive>
              <router-view
                v-if="$route.meta.keepAlive"
                :key="$store.state.activeName"
                :name="$store.state.activeName"
              ></router-view>
            </keep-alive>
            <router-view
              v-if="!$route.meta.keepAlive"
              :key="$store.state.activeName"
              :name="$store.state.activeName"
            ></router-view>
          </div>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
  export default {
    name: '',
    components: {},
    data() {
      return {
        menus: this.$store.state.menus,
        userInfo: this.$store.state.userInfo,
        curMenu: '',
      };
    },
    created() {
      this.jumpMenu(this.$store.state.activeName);
    },
    mounted() {},
    whatch: {},
    computed: {
      calcOpenNames() {
        let result = '';
        this.$utils.parseTreeJson(this.menus, (item) => {
          let activeName = this.$store.state.activeName;
          if (item.menuNum === activeName) {
            result = this.menus.find((a) => a.id == item.parentId).menuNum;
          }
        });
        return [result];
      },
    },
    methods: {
      jumpMenu(name) {
        console.log('当前路由:' + name);
        this.$store.commit('setActiveName', name);
        this.$router.push({
          name: name,
        });
        let flattenAuths = this.$utils.flatten(this.menus);
        this.$utils.parseTreeJson(this.menus, (item) => {
          if (item.menuNum === name) {
            let parentAuth = flattenAuths.find((auth) => auth.id == item.parentId);
            item.parentAuth = parentAuth.menuName;
            this.curMenu = item;
          }
        });
      },
      handleLogout() {
        this.$Modal.confirm({
          title: '提示框',
          content: '<p>确认要退出吗?</p>',
          loading: true,
          onOk: () => {
            this.logout();
          },
        });
      },
      logout() {
        this.axios
          .post(this.interfaceUrl + 'logout')
          .then(() => {
            this.$Modal.remove();
            sessionStorage.clear();
            this.$router.push({ name: 'Login' });
            window.location.reload();
          })
          .catch((e) => {
            console.error(e);
            this.$Message.error(e.message);
          });
      },
    },
  };
</script>

<style scoped>
  .layout {
    position: relative;
    overflow: hidden;
  }
  .layout,
  .ivu-layout {
    background: #f6f8fa;
    height: 100%;
  }
  .layout_sider {
    height: 100%;
    background: #ffffff;
    border-right: 1px solid #f0f0f0;
    box-sizing: border-box;
  }
  .logo {
    width: 100%;
    height: 70px;
    text-align: center;
    line-height: 70px;
    font-size: 32px;
  }
  .layout_header_bar {
    background: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    padding: 0 16px;
    height: 50px;
    line-height: 50px;
    display: flex;
    justify-content: flex-end;
  }
  .layout_header_bar > div {
    margin-left: 12px;
  }
  .username {
    font-size: 16px;
  }
  .layout_content {
    margin: 12px;
    margin-bottom: 0;
    border-radius: 6px;
    background: #fff;
  }
  .router-wrapper {
    padding: 16px;
  }
  .ivu-menu-vertical.ivu-menu-light:after {
    content: none;
  }
</style>
