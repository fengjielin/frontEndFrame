<template>
  <div class="content">
    <div class="notice_search_area">
      <Input
        style="width: 200px; margin: 5px"
        suffix="ios-search"
        @on-search="searchPastem"
        :search="true"
        type="text"
        v-model="searchData.keyword"
        class="wd200"
        placeholder="请输入关键字"
        maxlength="30"
      ></Input>
    </div>
    <div class="pastem mt16">
      <div class="pastem_left">
        <Menu theme="light">
          <MenuGroup title="院系名称" style="position: relative" class="tree_menu">
            <div
              class="add-area"
              style="position: absolute; right: 8px; top: 8px; border: none"
            >
              <div class="add-area-icon" v-if="userInfo.isAdmin">
                <Tooltip content="新增学院" placement="bottom">
                  <Icon
                    type="ios-add-circle-outline"
                    color="#2d8cf0"
                    @click="addSchool()"
                    v-if="checkAuth(['JCXXGL_PASTEM_ADD'])"
                  ></Icon>
                </Tooltip>
              </div>
              <div class="add-area-icon">
                <Tooltip content="新增系部" placement="bottom">
                  <Icon
                    type="ios-list"
                    color="#2d8cf0"
                    @click="addPastem()"
                    v-if="checkAuth(['JCXXGL_PASTEM_ADD'])"
                  ></Icon>
                </Tooltip>
              </div>
              <div class="add-area-icon">
                <Tooltip content="删除" placement="bottom">
                  <Icon
                    type="ios-trash"
                    color="#F1524D"
                    @click="removePastem(currentData)"
                    v-if="checkAuth(['JCXXGL_PASTEM_DELETE'])"
                  ></Icon>
                </Tooltip>
              </div>
            </div>
            <Tree
              style="padding-left: 15px; padding-top: 10px;overflow: auto;min-height: 550px;"
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
          <FormItem label="上级学院：" v-if="data.type == 'P02'">
            {{currentData.xbmc}}
<!--            <Select v-model="data.parentId" style="width: 200px">-->
<!--              <Option v-for="item in pastemList" :value="item.id" :key="item.id"-->
<!--                >{{ item.xbmc }}-->
<!--              </Option>-->
<!--            </Select>-->
          </FormItem>
          <FormItem label="院系编号：" prop="pastemNo">
            <Input
              type="text"
              v-model="data.pastemNo"
              placeholder="请输入院系编号"
              maxlength="30"
              class="formInput"
            ></Input>
          </FormItem>
          <FormItem label="院系名称：" prop="pastemName">
            <Input
              type="text"
              v-model="data.pastemName"
              placeholder="请输入院系名称"
              maxlength="30"
              class="formInput"
            ></Input>
          </FormItem>
          <div v-if="!data.id">
            <FormItem label="院系类型：" prop="type">
              <Select v-model="data.type" style="width: 200px" >
                <Option value="P01" :key="-1" v-if="data.type == 'P01'">学院</Option>
                <Option value="P02" :key="-2" v-else>系部</Option>
              </Select>
            </FormItem>
          </div>
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
            message: "院系编号不能为空",
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
            message: "院系名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        type: [
          {
            required: true,
            message: "请选择院系类型",
            trigger: "blur",
          },
        ],
      },
      SelectClass: "ivu-tree-title ivu-tree-title-selected",
      DefineClass: "ivu-tree-title",
      searchData: {
        keyword: "",
      },
      userInfo: this.$store.state.userInfo,
      pastemList: [],
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
          title: "院系编号",
          key: "xbbh",
          align: "center",
          width: 300,
        },
        {
          title: "院系名称",
          key: "xbmc",
          align: "center",
          minWidth: 150,
        },
        {
          title: "院系类型",
          key: "type",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h("span", params.row.type == "P01" ? "学院" : "系部");
          },
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
                    display: this.checkAuth(["JCXXGL_PASTEM_UPDATE"])
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
                    display: this.checkAuth(["JCXXGL_PASTEM_DELETE"])
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
      // 用来在刚进入页面时左侧树的默认选中
      treeSelectFlag: true,
    };
  },
  mounted() {
    this.getPastem();
    this.getTreePastem();
    this.getAllPastem();
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
              this.treeSelectFlag = false;
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
              this.page.pageNum = 1;
              this.getPastem();
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
    //获取树结构院系
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
            // that.userInfo.pastemId = res.data.pastemList[0].id
            that.getPastem()
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    //搜索
    searchPastem() {
      this.page.pageNum = 1;
      this.getPastem();
    },
    //获取所有院系信息
    getAllPastem() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "pastem/getAllPastem",
          that.qs({
            // pastemId:
            //   that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            if(that.pastemList.length == 0) {
            }
            that.pastemList = res.data.pastemList;
            that.tableData = res.data.pastemList;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    getPastem() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "pastem/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
            parentId: that.userInfo.pastemId ? that.userInfo.pastemId : "",
            keyword: that.searchData.keyword ? that.searchData.keyword : "",
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.pastemList;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    changePage(i) {
      this.page.pageNum = i;
      this.getPastem();
    },
    addPastem() {
      if(!this.data.parentId) {
        this.$Message.error("请选择上级学院")
        return
      }
      if(this.selectedType != 'P01'){
        this.$Message.error("请选择学院新增")
        return
      }
      this.data.type = "P02";
      this.show();
    },
    addSchool() {
      this.data.type = "P01";
      this.show();
    },
    show(row) {
      if (row) {
        this.title = "修改院系";
        if (row.type == "P02") {
          this.data.type = "P02";
          this.data.parentId = row.parentId;
        } else {
          this.data.type = "P01";
          this.data.parentId = ''
        }
        this.data.id = row.id;
        this.data.pastemNo = row.xbbh;
        this.data.pastemName = row.xbmc;
      } else {
        this.title = "新增院系";
        this.data.id = "";
        this.data.pastemNo = "";
        this.data.pastemName = "";
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
      if (that.data.id && that.data.id == that.data.parentId) {
        that.messageError("上级不能是自己");
        this.saveFlag = false;
        return;
      }
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        pastemNo: that.data.pastemNo,
        pastemName: that.data.pastemName,
        parentId: that.data.parentId ? that.data.parentId : "",
        type: that.data.type,
      };
      that.axios
        .post(that.interfaceUrl + "pastem/dealPastem", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getPastem();
            that.getTreePastem();
            that.getAllPastem();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
        });
      this.saveFlag = false;
    },
    modalClose() {
      this.$refs["pastemComp"].resetFields();
      this.showModal = false;
    },
    removePastem(row) {
      let that = this;
      if (!row) {
        that.$Message.error("请选择要删除的院系");
        return;
      }
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content:
          "删除父级，其所有子级也会被删除，确定删除 " + row.xbmc + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "pastem/delPastem",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.currentData = ''
                that.page.pageNum = 1;
                that.getPastem();
                that.getTreePastem();
                that.getAllPastem();
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
  },
};
</script>

<style scoped>
.content .pastem {
  display: flex;
}

.pastem_left,
.pastem_right {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.pastem_left {
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
.pastem_left .ivu-menu-item-group-title {
  border-left: 0;
}
.pastem_left .tree_menu > ul {
  overflow-y: auto;
  overflow-x: hidden;
  height:550px;
  padding: 0 9px !important;
}
</style>
