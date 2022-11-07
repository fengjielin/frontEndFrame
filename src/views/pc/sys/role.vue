<style scoped="scoped" type="text/css">
.role_container {
  height: auto;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}
.search_area {
  display: flex;
  justify-content: flex-start;
  border-bottom: 1px dashed #eeeeee;
}

.menu_header {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
<template>
  <div class="content">
    <div class="role_container">
      <div class="menu_header notice_search_area">
        <div @click="addRoleView()">
          <Button
            type="primary"
            style="margin-bottom: 5px"
            >新增</Button
          >
        </div>
      </div>
      <Table
        size="small"
        :loading="loading"
        border
        :columns="roleColumns"
        :data="roles"
      ></Table>
      <Page
        :total="pageTotal"
        :current="pageNum"
        :page-size="pageSize"
        show-elevator
        show-total
        @on-change="choseRolePageChange"
        align="center"
        style="text-align: center; margin-top: 39px"
      ></Page>

      <Modal
        v-model="authModal.view"
        :title="authRoleName"
        @on-cancel="modalCancel()"
      >
        <div style="position: relative">
          <Tree
            ref="tree"
            :data="comps"
            show-checkbox
            multiple
            @on-check-change="getCheckComps"
          ></Tree>
          <Spin size="large" fix v-if="spinShow"></Spin>
        </div>
        <div slot="footer" style="text-align: center">
          <Button
            type="primary"
            size="large"
            @click="saveAuth()"
            :loading="authLoading"
            >保存</Button
          >
          <Button type="primary" size="large" @click="modalCancel()"
            >关闭</Button
          >
        </div>
      </Modal>

      <Modal
        v-model="roleModal.view"
        :closable="true"
        :title="roleModal.title"
        @on-cancel="modalCancel()"
        :mask-closable="false"
      >
        <Form
          ref="roleComp"
          :rules="ruleValidate"
          :model="roleModal"
          :label-width="100"
        >
          <FormItem label="角色名称：" prop="roleName">
            <Input type="text" v-model="roleModal.roleName" maxlength="20"></Input>
          </FormItem>
          <FormItem label="角色描述：" prop="roleDesc">
            <Input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 5 }"
              v-model="roleModal.roleDesc"
            ></Input>
          </FormItem>
        </Form>
        <div slot="footer" style="text-align: center">
          <Button type="primary" size="large" @click="dealRole()" :loading = 'loading'>保存</Button>
          <Button type="primary" size="large" @click="modalCancel()"
            >关闭</Button
          >
        </div>
      </Modal>

      <Modal
        v-model="rolePersonModal.view"
        :title="rolePersonModal.title"
        @on-cancel="personModalCancel()"
        width="800"
        :mask-closable="false"
      >
        <Form
          ref="roleComp"
          :rules="ruleValidate"
          :model="rolePersonModal"
          :label-width="80"
          inline
        >
          <FormItem label="姓名：">
            <Input
              suffix="ios-search"
              @on-search="searchUserRoles"
              :search="true"
              type="text"
              v-model="rolePersonModal.xm"
              style="width: 200px"
              placeholder="输入姓名查询"
            ></Input>
          </FormItem>
          <FormItem label="">
            <Button
              type="primary"
              icon="ios-add-circle"
              style="margin-bottom: 5px"
              @click="addUser"
              >新增角色人员</Button
            >
            <Button
              type="error"
              icon="ios-close"
              style="margin-bottom: 5px;"
              @click="batchRemoveUserRole"
              >移除角色人员</Button
            >
          </FormItem>
        </Form>
        <Table
          size="small"
          :loading="loading"
          border
          :columns="rolePersonColumns"
          :data="userRoles"
          @on-selection-change="mutiSelectUserRoles"
        ></Table>
        <Page
          :total="rolePersonModal.pageTotal"
          :current="rolePersonModal.pageNum"
          :page-size="rolePersonModal.pageSize"
          show-elevator
          show-total
          @on-change="choseRolePersonChange"
          align="right"
          style="margin-top: 10px; margin-right: 20px"
        ></Page>
        <div slot="footer" style="text-align: center"></div>
      </Modal>

      <Modal
        v-model="userModal.view"
        :title="userModal.title"
        @on-cancel="userModalCancel()"
        width="800"
        :mask-closable="false"
      >
        <Form
          ref="roleComp"
          :rules="ruleValidate"
          :model="userModal"
          :label-width="120"
          inline
        >
          <FormItem label="用户类型：">
            <Select
              v-model="userModal.userType"
              style="width: 200px"
              @on-change="serachUsers"
            >
              <Option value="T" key="1">教师</Option>
              <Option value="S" key="1">学生</Option>
            </Select>
          </FormItem>
          <FormItem label="姓名：">
            <Input
              suffix="ios-search"
              @on-search="serachUsers"
              :search="true"
              type="text"
              v-model="userModal.xm"
              style="width: 200px"
              placeholder="输入姓名查询"
            ></Input>
          </FormItem>
          <FormItem label="">
            <Button
              type="primary"
              icon="ios-add-circle"
              style="margin-bottom: 5px"
              @click="joinUserRole"
              >确认新增</Button
            >
          </FormItem>
        </Form>
        <div style="color: #999999; text-align: right; font-size: 12px">
          为您查询到{{ userModal.pageTotal }}条结果
        </div>
        <Table
          size="small"
          :loading="loading"
          border
          :columns="userColumns"
          :data="userInfos"
          @on-selection-change="mutiSelect"
        ></Table>
        <Page
          :total="userModal.pageTotal"
          :current="userModal.pageNum"
          :page-size="userModal.pageSize"
          show-elevator
          show-total
          @on-change="choseUserModalChange"
          align="right"
          style="margin-top: 10px; margin-right: 20px"
        ></Page>
        <div slot="footer" style="text-align: center"></div>
      </Modal>
    </div>
  </div>
</template>
<script>
export default {
  created() {
    this.getRoles();
  },
  mounted() {},
  methods: {
    getParent(array, childs, ids) {
      //获取整条数据链
      for (let i = 0; i < array.length; i++) {
        let item = array[i];
        if (item.unid === ids) {
          childs.push(item);
          return childs;
        }
        if (item.children && item.children.length > 0) {
          childs.push(item);
          let rs = this.getParent(item.children, childs, ids);
          if (rs) {
            return rs;
          } else {
            childs.remove(item);
          }
        }
      }
      return false;
    },

    //获取选中的组件
    getCheckComps(arr) {
      //获取所有选中节点
      let params = this.$refs.tree.getCheckedNodes();
      //		        console.log(params);
      //所有数据
      let allData = this.comps;
      //循环执行所有选中的节点链，放到arr1数组里
      let arr1 = [];
      for (let i = 0; i < params.length; i++) {
        //单条数据链
        let aData = this.getParent(allData, [], params[i].unid); //方法入口在这里
        for (let y = 0; y < aData.length; y++) {
          //拆分成单个json数组放到arr1里
          arr1.push(aData[y]);
        }
      }
      //arr1去重 es6的set方法
      function dedupe(array) {
        return Array.from(new Set(array));
      }
      arr1 = dedupe(arr1);
      //		        console.log(arr1);
      this.auths = arr1;
    },
    //根据姓名查询角色人员
    searchUserRoles() {
      this.rolePersonModal.pageNum = 1;
      this.getUserRoles();
    },
    serachUsers() {
      this.userModal.pageNum = 1;
      this.getUsers();
    },
    //获取角色人员信息
    getUserRoles() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "role/getUserRoles",
          that.qs({
            pageNum: that.rolePersonModal.pageNum,
            pageSize: that.rolePersonModal.pageSize,
            xm: that.rolePersonModal.xm,
            roleId: that.curRole.id,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.rolePersonModal.pageTotal = res.data.dataCount;
            that.userRoles = res.data.userRoles;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    getUsers() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "role/getUsers",
          that.qs({
            // userType: that.userModal.userType,
            userType: that.userModal.userType,
            roleId: that.curRole.id,
            xm: that.userModal.xm,
            pageNum: that.userModal.pageNum,
            pageSize: that.userModal.pageSize,
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.userModal.pageTotal = res.data.dataCount;
            that.userInfos = res.data.userInfos;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    //选择用户
    mutiSelect(sel) {
      this.selectUsers = sel;
    },
    //选择用户
    mutiSelectUserRoles(sel) {
      this.selectUserRoles = sel;
    },
    //添加角色人员
    joinUserRole() {
      let that = this;
      if (that.selectUsers.length < 1) {
        that.messageError("请选择角色人员");
        return;
      }
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "role/joinUserRole",
          that.qs({
            roleId: that.curRole.id,
            users: JSON.stringify(that.selectUsers),
          })
        )
        .then(function (res) {
          that.selectUsers = [];
          if (res.data.state) {
            that.$Message.success("新增成功");
            that.getUsers();
            that.getUserRoles();
          } else {
            that.messageError(res.data.msg);
          }
          that.loading = false;
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
          that.loading = false;
        });
    },
    //移除角色人员
    removeUserRole(obj) {
      let that = this;
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确认要移除吗?</p>",
        onOk() {
          that.axios
            .post(
              that.interfaceUrl + "role/removeUserRole",
              that.qs({
                userRoleId: obj.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("移除成功");
                that.rolePersonModal.pageNum = 1;
                that.getUserRoles();
              } else {
                that.messageError(res.data.msg);
              }
            })
            .catch(function (e) {
              that.messageError("服务器错误" + e);
            });
        },
      });
    },
    //批量移除角色人员
    batchRemoveUserRole(obj) {
      let ids = "";
      let that = this;
      if(that.selectUserRoles.length<1){
        that.messageError("请选择要移除的角色人员");
        return;
      }
      that.selectUserRoles.forEach(function (o, i) {
        ids += o.id + ",";
      });
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确认要移除所选人员吗?</p>",
        onOk() {
          that.axios
            .post(
              that.interfaceUrl + "role/removeUserRole",
              that.qs({
                ids: ids,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("移除成功");
                that.rolePersonModal.pageNum = 1;
                that.getUserRoles();
              } else {
                that.messageError(res.data.msg);
              }
            })
            .catch(function (e) {
              that.messageError("服务器错误" + e);
            });
        },
      });
    },
    //分页获取角色信息
    getRoles() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "role/getRoles",
          that.qs({
            pageNum: that.pageNum,
            pageSize: that.pageSize,
          })
        )
        .then(function (res) {
          that.loading = false;
          that.pageTotal = res.data.dataCount;
          //console.log(res.data.sysRoles);
          that.roles = res.data.roles;
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    modalCancel() {
      this.roleModal.view = false;
      this.authModal.view = false;
    },
    personModalCancel() {
      this.rolePersonModal.view = false;
    },
    userModalCancel() {
      this.userModal.view = false;
    },
    //获取系统权限组件
    getComps(roleId) {
      let that = this;
      that.spinShow = true;
      that.axios
        .post(
          that.interfaceUrl + "role/getComps",
          that.qs({
            roleId: roleId,
            xtbh: "base",
            subSystemId: 1,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.comps = res.data.comps;
            that.$nextTick(function () {
              that.getCheckComps();
            });
            that.spinShow = false;
          }
        });
    },
    openAuthView(obj) {
      this.authRoleName = "设置权限(" + obj.roleName + ")";
      this.roleId = obj.id;
      this.authModal.view = true;
      this.getComps(obj.id);
    },
    updateRoleView(obj) {
      this.roleModal.id = obj.id;
      this.roleModal.roleName = obj.roleName;
      this.roleModal.roleDesc = obj.roleDesc;
      this.roleModal.title = "修改角色信息";
      this.roleModal.view = true;
    },
    showRolePerson(obj) {
      this.rolePersonModal.title = obj.roleName + "角色信息";
      this.rolePersonModal.view = true;
      this.curRole = obj;
      this.getUserRoles();
    },
    addUser() {
      this.userModal.title = "新增" + this.curRole.roleName + "角色人员";
      this.userModal.view = true;
      this.getUsers();
    },
    addRoleView(obj) {
      this.roleModal.roleName = "";
      this.roleModal.id = "";
      this.roleModal.roleDesc = "";
      this.roleModal.title = "添加角色信息";
      this.roleModal.view = true;
    },
    dealRole() {
      let that = this;
      let flag = true;
      this.$refs["roleComp"].validate((valid) => {
        if (!valid) {
          this.$Modal.error({
            title: "提示",
            content: "表单填写有误",
            closable: true,
          });
          flag = false;
        }
      });
      if (!flag) {
        return;
      }
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "role/dealRole",
          that.qs({
            id: that.roleModal.id,
            roleName: that.roleModal.roleName,
            roleDesc: that.roleModal.roleDesc,
            subSystemId: 1,
          })
        )
        .then(function (res) {
          that.loading = false
          if (res.data.state) {
            that.$Message.success(res.data.msg);
            that.roleModal.view = false;
            that.getRoles();
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    deleteRole(roleId, callback) {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "role/deleteRole",
          that.qs({
            roleId: roleId,
          })
        )
        .then(function (res) {
          callback();
        });
    },
    //保存角色权限
    saveAuth() {
      let that = this;
      that.authLoading = true;
      that.axios
        .post(
          that.interfaceUrl + "role/setRoleAuth",
          that.qs({
            roleId: that.roleId,
            auths: JSON.stringify(that.auths),
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.$Message.success(res.data.msg);
            that.authModal.view = false;
            that.authLoading = false;
          }
        });
    },
    choseRolePageChange(i) {
      this.pageNum = i;
      this.getRoles();
    },
    choseRolePersonChange(i) {
      this.rolePersonModal.pageNum = i;
      this.getUserRoles();
    },
    choseUserModalChange(i) {
      this.userModal.pageNum = i;
      this.getUsers();
    },
    //删除角色
    confirm(obj) {
      var that = this;
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确认要删除吗?</p>",
        loading: true,
        onOk() {
          that.deleteRole(obj.id, function () {
            that.$Modal.remove();
            that.getRoles();
          });
        },
      });
    },
  },
  data() {
    return {
      ruleValidate: {
        roleName: [
          {
            required: true,
            message: "角色名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
      },
      searchData: {
        xm: "",
      },
      selectUsers: [],
      selectUserRoles: [],
      authRoleName: "",
      spinShow: false,
      authLoading: false,
      authModal: {
        view: false,
      },
      roleId: "",
      roleModal: {
        title: "新增角色",
        id: "",
        view: false,
        roleName: "",
        roleDesc: "",
      },
      rolePersonModal: {
        title: "角色人员",
        view: false,
        pageNum: 1,
        pageSize: 10,
        pageTotal: 0,
        xm: "",
      },
      userModal: {
        title: "添加角色人员",
        view: false,
        pageNum: 1,
        pageSize: 10,
        pageTotal: 0,
        xm: "",
        userType: "T",
      },
      activeName: "",
      curRole: "",
      userRoles: [],
      auths: [],
      comps: [],
      pageTotal: 0,
      pageNum: 1,
      pageSize: 15,
      loading: true,
      roles: [],
      userInfos: [],
      userColumns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "账号",
          align: "center",
          key: "username",
        },
        {
          title: "姓名",
          align: "center",
          key: "xm",
        },
      ],
      rolePersonColumns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "账号",
          align: "center",
          key: "account",
        },
        {
          title: "姓名",
          align: "center",
          key: "xm",
        },
        {
          title: "操作",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  style: {
                    marginRight: "3px",
                    float: "left",
                    //										display:this.checkAuth(['roleDeleteRole'])?'block':'none'
                  },
                  on: {
                    click: () => {
                      this.removeUserRole(params.row);
                    },
                  },
                },
                "移除"
              ),
            ]);
          },
        },
      ],
      roleColumns: [
        {
          title: "角色名称",
          align: "center",
          key: "roleName",
        },
        {
          title: "角色描述",
          align: "center",
          key: "roleDesc",
        },
        {
          title: "操作",
          width: 300,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    //										display:this.checkAuth(['roleSetAuth'])?'block':'none'
                  },
                  on: {
                    click: () => {
                      let obj = params.row;
                      this.openAuthView(obj);
                    },
                  },
                },
                "设置权限"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    //										display:this.checkAuth(['roleUpdateRole'])?'block':'none'
                  },
                  on: {
                    click: () => {
                      let obj = params.row;
                      this.showRolePerson(obj);
                    },
                  },
                },
                "查看角色人员"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display:params.row.roleName!='教务' && params.row.roleName!='院系负责人' && params.row.roleName!='授课老师' && params.row.roleName!='管理员' && params.row.roleName!='课程负责人'?'inline-block':'none'
                  },
                  on: {
                    click: () => {
                      let obj = params.row;
                      this.updateRoleView(obj);
                    },
                  },
                },
                "修改"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    color: "#FF7A7A",
                    display:params.row.roleName!='教务' && params.row.roleName!='院系负责人' && params.row.roleName!='授课老师' && params.row.roleName!='管理员' && params.row.roleName!='课程负责人'?'inline-block':'none'
                    //										display:this.checkAuth(['roleDeleteRole'])?'block':'none'
                  },
                  on: {
                    click: () => {
                      this.confirm(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
    };
  },
};
</script>
<style>
</style>
