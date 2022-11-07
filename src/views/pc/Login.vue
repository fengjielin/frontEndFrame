<template>
  <div class="login_container">
    <div class="login_logo">
      <div class="login_title">
        <span class="login_title_cn">统一身份认证入口</span>
        <span class="login_title_en">Uniform identity entry</span>
      </div>
    </div>
    <div class="login_area">
      <div class="login_header_line"></div>
      <div class="login_header">用户登录</div>
      <div class="login_content">
        <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" class="login-area" style="margin: 16px">
          <FormItem prop="userName">
            <Input type="text" v-model="formCustom.userName" placeholder="请输入用户名">
              <span slot="prepend">
                <Icon type="ios-contact" style="font-size: 16px"></Icon>
              </span>
            </Input>
          </FormItem>
          <FormItem prop="passwd">
            <Input type="password" v-model="formCustom.passwd" placeholder="请输入密码">
              <span slot="prepend">
                <Icon type="ios-lock" style="font-size: 16px"></Icon>
              </span>
            </Input>
          </FormItem>
          <FormItem prop="checkcode">
            <Row>
              <Col span="15">
                <Input
                  placeholder="请输入验证码"
                  type="text"
                  v-model="formCustom.checkcode"
                  class="inputcode"
                  @on-enter="handleSubmit('formCustom')"
                ></Input>
              </Col>
              <Col span="8">
                <div class="code" @click="refreshCode" style="margin-left: 20px">
                  <s-identify :identifyCode="identifyCode"></s-identify>
                </div>
              </Col>
            </Row>
          </FormItem>
          <Button
            type="primary"
            @click="handleSubmit('formCustom')"
            :loading="loading"
            size="large"
            class="login-btn"
            style="width: 100%; height: 50px"
          >
            {{ loginTitle }}
          </Button>
        </Form>
      </div>
    </div>
    <div class="footer">
      <!--广州智教信息科技有限公司 &copy; 技术支持-->
    </div>
  </div>
</template>
<script>
  import SIdentify from '@/components/SIdentify.vue';

  export default {
    components: {
      's-identify': SIdentify,
    },
    data() {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入你的密码'));
        } else {
          callback();
        }
      };
      const validateUserName = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入你的用户名'));
        } else {
          callback();
        }
      };
      const validateCode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入验证码'));
        } else {
          if (value != this.identifyCode) {
            callback(new Error('验证码不正确'));
          } else {
            callback();
          }
        }
      };
      return {
        loginTitle: '登录',
        loading: false,
        formCustom: {
          userName: '',
          passwd: '',
          checkcode: '',
        },
        identifyCodes: '1234567890',
        identifyCode: '',
        ruleCustom: {
          userName: [
            {
              validator: validateUserName,
              trigger: 'blur',
            },
          ],
          passwd: [
            {
              validator: validatePass,
              trigger: 'blur',
            },
          ],
          checkcode: [
            {
              validator: validateCode,
              trigger: 'blur',
            },
          ],
        },
        userInfo: null,
      };
    },
    created() {},
    mounted() {
      this.makeCode(this.identifyCodes, 4);
    },
    methods: {
      randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
      },
      refreshCode() {
        this.identifyCode = '';
        this.makeCode(this.identifyCodes, 4);
      },
      makeCode(o, l) {
        for (let i = 0; i < l; i++) {
          this.identifyCode += this.identifyCodes[this.randomNum(0, this.identifyCodes.length)];
        }
      },

      handleSubmit(name) {
        this.loading = true;
        this.loginTitle = '正在登录...';
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.checkLogin();
          } else {
            this.identifyCode = '';
            this.makeCode('', 4);
            this.$Message.error('表单填写有误，请注意提示');
            this.loading = false;
            this.loginTitle = '登录';
          }
        });
      },
      checkLogin() {
        let params = {
          userName: this.formCustom.userName,
          passWord: this.pwdMultilayerEncrypt(this.formCustom.passwd),
        };
        this.axios
          .post(this.interfaceUrl + 'login', this.qs(params))
          .then((res) => {
            let data = res.data;
            if (data.state) {
              if (data.service) {
                window.location.href = data.service;
                return;
              }
              let d = new Date();
              let userInfo = res.data.userInfo;
              let menus = userInfo.auths;
              userInfo.loginTime = Date.parse(d);
              this.$store.commit('setMenus', menus || []);
              this.$store.commit('setUserInfo', userInfo);
              this.$store.commit('setActiveName', menus.length && menus[0].children[0].menuNum);
              this.$router.push({ name: 'Index' });
            } else {
              this.identifyCode = '';
              this.makeCode('', 4);
              this.$Message.error(data.msg);
            }
						this.loginTitle = '登录';
            this.loading = false;
          })
          .catch((e) => {
            this.loading = false;
            console.error(e);
            this.$Message.error(e.message);
          });
      },
    },
  };
</script>

<style type="text/css">
  .login_content .ivu-input {
    height: 50px !important;
  }
</style>
<style type="text/css" scoped="">
  .footer {
    position: fixed;
    bottom: 0px;
    text-align: center;
    width: 100%;
    color: #999999;
    height: 40px;
    line-height: 40px;
  }
  .login_area {
    width: 400px;
    height: 438px;
    border-radius: 5px;
    background: #fff;
  }
  .login_header_line {
    background: #2d8cf0;
    width: 100%;
    height: 8px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
  .login_logo {
    position: absolute;
    left: 31px;
    top: 31px;
    height: 60px;
    width: auto;
    display: flex;
    justify-content: flex-start;
  }
  .login_header {
    margin-top: 30px;
    margin-bottom: 30px;
    width: 400px;
    font-size: 24px;
    font-family: '微软雅黑';
    color: #4d4d4d;
    display: flex;
    justify-content: center;
  }
  .login_title {
    margin-left: 22px;
    font-family: '微软雅黑';
    color: #fff;
  }
  .login_title_cn {
    font-size: 28px;
  }
  .login_title_en {
    font-size: 12px;
  }
  .login_container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('~@/assets/images/bg.jpg') center top/cover no-repeat;
  }
</style>
