<template>
  <div class="container">
    <div class="" style="padding: 16px">
      <div class="search_area"></div>
      <div class="content_area mt16">
        <div class="login_box">
          <h1>mobile登录页面</h1>
          <div>
            <Input v-model="loginForm.username" style="width: 300px" />
          </div>
          <div>
            <Input v-model="loginForm.password" style="width: 300px" />
          </div>
          <div>
            <Button type="primary" @click="login">登录</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  components: {},
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
    };
  },
  created() {},
  mounted() {},
  whatch: {},
  computed: {},
  methods: {
    async login() {
      const { data: res } = await this.$post("/login", this.loginForm);
      console.log(res);
      if (res.meta.status == 200) {
        let rightList = res.rights || [];
        let userInfo = res.data;
        let loginTime = new Date();
        userInfo.loginTime = loginTime;
        this.$store.commit("setRightList", rightList);
        this.$store.commit("setUserInfo", userInfo);

        this.$router.push({
          name: "mobileIndex",
        });
      } else {
        this.$Message.error({
          content: res.meta.msg,
          duration: 3,
        });
      }
    },
  },
};
</script>

<style scoped>
.search_area {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 42px;
}
.page {
  float: none;
  text-align: center;
  margin-right: 0;
  margin-top: 12px;
}
.login_box {
  width: 400px;
  margin: 0 auto;
}
.login_box > div {
  margin-bottom: 12px;
}
</style>