<template>
  <div class="content">
    <div class="notice_search_area">
      <!-- <Input
        style="width: 200px; margin: 5px"
        suffix="ios-search"
        @on-search="searchPastem"
        :search="true"
        type="text"
        v-model="searchData.xbmc"
        class="wd200"
        placeholder="输入关键字查询"
      ></Input> -->
      <Button
        style="margin: 5px 5px"
        type="primary"
        v-if="checkAuth(['JCXXGL_ZYGL_ADD'])"
        @click="show"
        >新增</Button
      >
    </div>
    <div class="pastem mt16">
      <div class="specialty_left">
        <Menu theme="light">
          <MenuGroup title="院系名称" style="position: relative" class="tree_menu">
            <Tree
              style="padding-left: 32px; padding-top: 25px;overflow: auto;min-height: 550px;"
              :data="treeData"
              :loading="loading"
              :render="renderContent"
            ></Tree>
          </MenuGroup>
        </Menu>
      </div>
      <div class="pastem_right">
        <Table :loading="loading" :columns="columns" :data="tableData" border />
        <Page
          @on-change="changePage"
          :total="page.totalNum"
          :current="page.pageNum"
          :page-size="page.pageSize"
          show-elevator
          show-total
          class="page"
        />
      </div>
    </div>
    <Modal
      v-model="showModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalClose"
    >
      <div class="modal">
        <Form
          :model="data"
          :rules="ruleValidate"
          ref="pastemComp"
          :label-width="100"
        >
          <FormItem label="所属院系：" prop="parentId">
            <Select v-model="data.parentId" class="formInput">
              <Option v-for="item in pastemList2" :value="item.id" :key="item.id"
                >{{ item.xbmc }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="专业编号：" prop="pastemNo">
            <Input
              type="text"
              v-model="data.pastemNo"
              placeholder="请输入专业编号"
              class="formInput"
              maxlength="30"
            ></Input>
          </FormItem>
          <FormItem label="专业名称：" prop="pastemName">
            <Input
              type="text"
              v-model="data.pastemName"
              placeholder="请输入专业名称"
              class="formInput"
              maxlength="30"
            ></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok" :loading="saveFlag">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ruleValidate: {
        pastemNo: [
          {
            required: true,
            message: "专业编号不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        pastemName: [
          {
            required: true,
            message: "专业名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        parentId: [
          {
            required: true,
            type: "number",
            message: "请选择专业类型",
            trigger: "blur",
          },
        ],
      },
      SelectClass: "ivu-tree-title ivu-tree-title-selected",
      DefineClass: "ivu-tree-title",
      searchData: {
        xbmc: "",
      },
      userInfo: this.$store.state.userInfo,
      pastemList: [],
      pastemList2: [],
      selectedId: "",
      selectedType: "",
      treeData: [],
      loading: false,
      currentRoot: null,
      currentNode: null,
      currentData: "",
      showModal: false,
      saveFlag: false,
      title: "",
      tableData: [],
      data: {
        id: "",
        pastemNo: "",
        pastemName: "",
        type: "P01",
        parentId: "",
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "序号",
          type: "index",
          align: "center",
          width: 75,
        },
        {
          title: "专业编号",
          key: "zybh",
          align: "center",
          minWidth: 150,
        },
        {
          title: "专业名称",
          key: "zymc",
          align: "center",
          minWidth: 150,
        },
        {
          title: "所属院系",
          key: "pastemName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h("span", [
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["JCXXGL_ZYGL_UPDATE"])
                      ? "inline-block"
                      : "none",
                  },
                  on: {
                    click: () => {
                      this.show(params.row);
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
                    display: this.checkAuth(["JCXXGL_ZYGL_DELETE"])
                      ? "inline-block"
                      : "none",
                  },
                  on: {
                    click: () => {
                      this.removePastem(params.row);
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
  mounted() {
    this.getTreePastem();
    this.getAllPastem();
    this.selectAllXbByPage()
  },
  methods: {
    renderContent(h, { root, node, data }) {
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            width: "100%",
            cursor: "pointer",
          },
          class: ["ivu-tree-title"],
          on: {
            click: (event) => {
              var dom = document.getElementsByClassName("ivu-tree-title");
              for (let i = 0; i < dom.length; i++) {
                dom[i].className = this.DefineClass;
              }
              if (event.target.className == "ivu-tree-title") {
                event.target.className = this.SelectClass;
              }
              if (
                event.target.parentNode.parentNode.className == "ivu-tree-title"
              ) {
                event.target.parentNode.parentNode.className = this.SelectClass;
              }
              this.currentRoot = root;
              this.currentNode = node;
              this.currentData = data;
              this.userInfo.pastemId = data.id;
              this.data.parentId = data.id;
              this.selectedType = data.type;
              //缓存一下breads，刷新时就可以出来了
              // this.getPastem();
              this.selectAllByPage();
            },
          },
        },
        [
          h("span", [h("span", data.xbmc)]),
          h("span", {
            style: {
              display: "inline-block",
              float: "right",
              marginRight: "32px",
              cursor: "pointer",
            },
          }),
        ]
      );
    },
    append(data) {
      const children = data.children || [];
      children.push({
        title: "appended node",
        expand: true,
      });
      this.$set(data, "children", children);
    },
    remove(root, node, data) {
      const parentKey = root.find((el) => el === node).parent;
      const parent = root.find((el) => el.nodeKey === parentKey).node;
      const index = parent.children.indexOf(data);
      parent.children.splice(index, 1);
    },
    //获取树结构专业
    getTreePastem() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "pastem/getTreePastem",
          that.qs({
            /* pastemId: that.userInfo.pastemId ? that.userInfo.pastemId : "",
					isAdmin: that.userInfo.isAdmin ? that.userInfo.pastemId : "" */
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.treeData = res.data.pastemList;
            that.currentData = res.data.pastemList[0]
            that.loading = false;
            that.selectAllByPage();
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    selectAllXbByPage(){
      let data = {
        pageNum:1,
        pageSize:9999
      }
      let that = this
      that.axios
        .post(
          that.interfaceUrl + "/pastem/selectAllXbByPage",
          that.qs(data)
        )
        .then(function (res) {
          if (res.data.state) {
            that.pastemList2 = res.data.pastemList;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    
    //搜索
    searchPastem() {
      this.page.pageNum = 1;
      this.selectAllByPage();
    },
    //获取所有专业信息
    getAllPastem() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "pastem/getAllPastem",
          that.qs({
            // pastemId: that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.pastemList = res.data.pastemList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    changePage(i) {
      this.page.pageNum = i;
      this.selectAllByPage();
    },
    show(row) {
      if (row.id) {
        this.title = "修改专业";
        this.data.id = row.id;
        this.data.pastemNo = row.zybh;
        this.data.pastemName = row.zymc;
        this.data.parentId = row.pastemId;
      } else {
        this.title = "新增专业";
        this.data.id = "";
        this.data.pastemNo = "";
        this.data.pastemName = "";
        this.data.parentId = this.currentData.id;
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.saveFlag = true;
      this.$refs["pastemComp"].validate((valid) => {
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
        this.saveFlag = false;
        return;
      }
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        zybh: that.data.pastemNo,
        zymc: that.data.pastemName,
        // parentId: that.data.parentId ? that.data.parentId : "",
        // type: that.data.type,
        pastemId: that.data.parentId,
      };
      this.dealZhuanye(data);
      // that.axios
      //   .post(that.interfaceUrl + "pastem/dealPastem", that.qs(data))
      //   .then(function (res) {
      //     if (res.data.state) {
      //       that.$Message.success("保存成功");
      //       that.showModal = false;
      //       that.getPastem();
      //       that.getTreePastem();
      //       that.getAllPastem();
      //     } else {
      //       that.messageError(res.data.msg);
      //     }
      //   })
      //   .catch(function () {
      //     that.messageError("服务器错误");
      //   });
      this.saveFlag = false;
    },
    modalClose() {
      this.$refs["pastemComp"].resetFields();
      this.showModal = false;
    },
    removePastem(row) {
      let that = this;
      if (!row) {
        that.$Message.error("请选择要删除的专业");
        return;
      }
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.zymc + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "zhuanye/delZhuanye",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                // that.getPastem();
                // that.getTreePastem();
                that.selectAllByPage();
              } else {
                that.$Message.error(res.data.msg);
              }
            })
            .catch(function (e) {
              that.messageError("服务器错误" + e);
            });
        },
      });
    },

    selectAllByPage() {
      let that = this;
      let data = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
        pastemId: that.currentData.id ? that.currentData.id : "",
        type: that.currentData.type ? that.currentData.type : "",
      };
      console.log(data);
      that.axios
        .post(that.interfaceUrl + "zhuanye/selectAllByPage", that.qs(data))
        .then(function (res) {
          console.log(res);
          if (res.data.state) {
            that.tableData = res.data.zhuanYeList;
            that.page.totalNum = res.data.dataCount;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
        });
    },
    dealZhuanye(data) {
      let that = this;
      that.axios
        .post(that.interfaceUrl + "zhuanye/dealZhuanye", that.qs(data))
        .then(function (res) {
          console.log(res);
          if (res.data.state) {
            that.$Message.success("操作成功")
            that.showModal = false;
            // that.getPastem();
            // that.getTreePastem();
            that.selectAllByPage();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
        });
    },
  },
};
</script>

<style scoped>
.content .pastem {
  display: flex;
}

.specialty_left,
.pastem_right {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.specialty_left {
  width: 333px;
  min-width: 300px;
  min-height: 600px;
  margin-right: 15px;
  overflow-y: auto;
  overflow-x: hidden;

  border-left: 1px solid #dddee1;
  border-bottom: 1px solid #dddee1;
}
.pastem_right {
  width: 100%;
  min-width: 50%;
}

.modal {
  padding-left: 100px;
}

.formInput {
  width: 240px;
}

.page {
  text-align: center;
  margin-top: 39px;
}
</style>

<style>
.specialty_left .ivu-menu-item-group-title {
  border-left: 0;
}
.specialty_left .tree_menu > ul {
  overflow-y: auto;
  overflow-x: hidden;
  height:550px;
  padding: 0 9px !important;
}
</style>