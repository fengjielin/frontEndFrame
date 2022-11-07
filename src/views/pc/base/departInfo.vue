<template>
  <div class="content">
    <div
      class="notice_search_area"
      style="display: flex; justify-content: flex-end"
    >
      <Button
        @click="showDepartImport"
        style="margin: 5px 5px"
        type="primary"
        v-if="checkAuth(['JCXXGL_BMGL_IMPORT'])"
        >导入</Button
      >
      <Button
        @click="downloadDepartTemplate"
        style="margin: 5px 5px"
        type="primary"
        ghost
        v-if="checkAuth(['JCXXGL_BMGL_IMPORT'])"
        >下载导入模板</Button
      >
    </div>
    <div class="depart mt16">
      <div class="depart_left">
        <Menu theme="light">
          <MenuGroup title="部门名称" style="position: relative" class="tree_menu">
            <div
              class="add-area"
              style="position: absolute; right: 8px; top: 8px; border: none"
            >
              <div class="add-area-icon">
                <Tooltip content="新增部门" placement="bottom">
                  <Icon
                    type="ios-add-circle-outline"
                    color="#2d8cf0"
                    v-if="checkAuth(['JCXXGL_BMGL_ADD'])"
                    @click="show()"
                  ></Icon>
                </Tooltip>
              </div>
              <div class="add-area-icon">
                <Tooltip content="删除" placement="bottom">
                  <Icon
                    type="ios-trash"
                    color="#F1524D"
                    v-if="checkAuth(['JCXXGL_BMGL_DELETE'])"
                    @click="remove(currentData)"
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
      <div class="depart_right">
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
          ref="departComp"
          :label-width="100"
        >
          <FormItem label="所属学院：" prop="pastemId">
            <Select
              v-model="data.pastemId"
              style="width: 200px"
              @on-change="clearDepart"
            >
              <Option
                v-for="item in pastemList"
                :value="item.id"
                :key="item.id"
                >{{ item.xbmc }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="上级部门：">
            <Select v-model="data.parentId" style="width: 200px" clearable>
              <Option
                v-show="data.pastemId ? data.pastemId == item.pastemId : true"
                v-for="item in departList"
                :value="item.id"
                :key="item.id"
                >{{ item.bmmc }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="部门编号：" prop="departNo">
            <Input
              type="text"
              v-model="data.departNo"
              placeholder="请输入部门编号"
              class="formInput"
              maxlength="30"
            ></Input>
          </FormItem>
          <FormItem label="部门名称：" prop="departName">
            <Input
              type="text"
              v-model="data.departName"
              placeholder="请输入部门名称"
              class="formInput"
              maxlength="30"
            ></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok" :loading="loading">保存</Button>
      </div>
    </Modal>
    <Modal
      v-model="importDepartModal"
      :title="'部门导入'"
      width="400px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalClose"
    >
      <div style="padding: 0 30px">
        <Upload
          ref="departUpload"
          :action="actionUrl"
          show-upload-list
          :on-success="handleSuccess"
          :format="['xls', 'xlsx']"
          :on-format-error="formatError"
          :on-remove="removeFile"
          style="padding-left: 20px"
        >
          <Button
            type="primary"
            ghost
            icon="ios-cloud-upload-outline"
            style="margin-left: 80px"
            :disabled='fileNameList.length > 0'
            >上传文件</Button
          >
        </Upload>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="importDepart" :loading="loading"
          >确认导入</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      importDepartModal: false,
      actionUrl: this.interfaceUrl + "depart/filesUpload",
      fileNameList: [],
      ruleValidate: {
        departNo: [
          { required: true, message: "部门编号不能为空", trigger: "blur" },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        departName: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        pastemId: [
          {
            required: true,
            type: "number",
            message: "请选择所属学院",
            trigger: "blur",
          },
        ],
      },
      userInfo: this.$store.state.userInfo,
      pastemList: [],
      departList: [],
      SelectClass: "ivu-tree-title ivu-tree-title-selected",
      DefineClass: "ivu-tree-title",
      activeName: "",
      loading: false,
      selectedId: "",
      selectedType: "",
      treeData: [],
      currentRoot: null,
      currentNode: null,
      currentData: "",
      showModal: false,
      title: "",
	  menuPastemId:"",
      tableData: [],
      data: {
        id: "",
        departNo: "",
        departName: "",
        pastemId: "",
        parentId: "",
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "部门编号",
          key: "bmbh",
          align: "center",
          width:300
        },
        {
          title: "部门名称",
          key: "bmmc",
          align: "center",
        },
        {
          title: "上级部门",
          key: "sjbmmc",
          align: "center",
        },
        {
          title: "所属学院",
          key: "pastemName",
          align: "center",
          width:200
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
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["JCXXGL_BMGL_UPDATE"])
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
                  style: {
                    color: "#FF7A7A",
                    display: this.checkAuth(["JCXXGL_BMGL_DELETE"])
                      ? "inline-block"
                      : "none",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
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
    this.userInfo.isAdmin = 1;
    this.getDepart();
    this.getAllDepart();
    this.getAllSchool();
    this.getTreeDepart();
  },
  methods: {
    clearDepart() {
      this.data.parentId = "";
    },
    //获取所有学院信息
    getAllSchool() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "pastem/getAllPastem",
          that.qs({
            isParent: "1",
            type: "P01",
            pastemId:
              that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
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
    //获取所有部门信息
    getAllDepart() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "depart/getAllDepart",
          that.qs({
            //					pastemId:that.data.pastemId?that.data.pastemId:that.userInfo.pastemId,
            isAdmin: that.userInfo.isAdmin,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            if(res.data.departList){
              that.departList = res.data.departList;
              that.departList.sort((a, b) => a.bmmc.localeCompare(b.bmmc)) // 升序
            }
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    //获取树结构院系
    getTreeDepart() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "depart/getTreeDepartment",
          that.qs({
            pastemId: that.userInfo.pastemId,
            isAdmin: 
            that.userInfo.isAdmin,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            res.data.pastemList.forEach(function (o, i) {
              if (o.departments) {
                o.children = o.departments;
              }
            });
            that.treeData = res.data.pastemList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
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
              this.selectedId = data.id;
              this.data.parentId = data.id;
              if (data.selectedType) {
                this.userInfo.pastemId = data.id;
              } else {
                this.data.pastemId = data.pastemId;
				this.data.menuPastemId = data.pastemId;
              }
              this.selectedType = data.type;
              this.page.pageNum = 1;
              this.getDepart();
              //								this.getAllDepart();
            },
          },
        },
        [
          h("span", [h("span", data.xbmc ? data.xbmc : data.bmmc)]),
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
    showDepartImport() {
      this.$refs.departUpload.clearFiles();
      this.importDepartModal = true;
    },
    downloadDepartTemplate() {
      window.open(this.interfaceUrl + "depart/downloadDepartTemplate");
    },
    formatError() {
      this.$Modal.error({
        title: "提示",
        content: "只能上传xls、xlsx文件",
        closable: true,
      });
    },
    handleBeforeUpload(file) {
      let flag = file.size > 5048000;
      if (flag) {
        this.$Message.warning("上传文件大小不能超过5Mb");
        return false;
      }
    },
    handleSuccess(response, file, fileList) {
      if (response.state) {
        let tempList = [];
        fileList.forEach(function (o, i) {
          tempList.push(o.response.newFileName);
        });
        this.fileNameList = tempList;
      } else {
        that.messageError(response.message);
      }
    },
    removeFile(file, fileList) {
      let tempList = [];
      fileList.forEach(function (o, i) {
        tempList.push(o.response.newFileName);
      });
      this.fileNameList = tempList;
    },
    //导入部门信息
    importDepart() {
      let that = this;
      if (that.fileNameList == null || that.fileNameList.length < 1) {
        that.$Modal.error({
          title: "提示",
          content: "请上传文件",
          closable: true,
        });
        return;
      }
      let data = {
        fileNameList: that.fileNameList,
      };
      //console.log(data)
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "depart/departImport", that.qs(data))
        .then(function (res) {
          that.loading = false;
          that.fileNameList = []
          if (res.data.state) {
            that.importDepartModal = false;
            that.getTreeDepart()
            that.getDepart();
            if (res.data.Message != null && res.data.Message.length > 0) {
              let str = "";
              res.data.Message.forEach(function (o, i) {
                str += o + "<br/>";
              });
              that.$Modal.info({
                content: str,
              });
            }
          } else {
            that.messageError(res.data.message);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    getDepart() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "depart/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
            pastemId:
              that.userInfo.isAdmin == "1"
                ? that.selectedType
                  ? that.selectedId
                  : ""
                : that.userInfo.pastemId,
            parentId: that.selectedType
              ? ""
              : that.selectedId
              ? that.selectedId
              : "",
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.departList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    changePage(i) {
      this.page.pageNum = i;
      this.getDepart();
    },
    show(row) {
      if (row) {
        this.title = "修改部门";
        this.data.id = row.id;
        this.data.departNo = row.bmbh;
        this.data.departName = row.bmmc;
        this.data.pastemId = row.pastemId;
        this.data.parentId = row.sjbmId;
      } else {
        this.title = "新增部门";
        this.data.id = "";
        this.data.departNo = "";
        this.data.departName = "";
		this.data.pastemId = this.data.menuPastemId;
        if (this.selectedType) {
          this.data.pastemId = this.selectedId;
        }
        //					this.data.pastemId = this.selectedType?this.selectedId?this.selectedId:"":"";
        this.data.parentId = this.selectedType
          ? ""
          : this.selectedId
          ? this.selectedId
          : "";
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["departComp"].validate((valid) => {
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
      if (that.data.id && that.data.id == that.data.parentId) {
        that.messageError("上级不能是自己");
        this.saveFlag = false;
        return;
      }
      this.loading= true
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        departNo: that.data.departNo,
        departName: that.data.departName,
        pastemId: that.data.pastemId,
        parentId: that.data.parentId ? that.data.parentId : "",
      };
      that.axios
        .post(that.interfaceUrl + "depart/dealDepart", that.qs(data))
        .then(function (res) {
          that.loading= false
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getDepart();
            that.getAllDepart();
            that.getAllSchool();
            that.getTreeDepart();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading= false
          that.messageError("服务器错误" + e);
        });
    },
    modalClose() {
      this.$refs["departComp"].resetFields();
      this.showModal = false;
      this.importDepartModal = false;
      this.fileNameList = []
    },
    remove(row) {
      let that = this;
      if (!row) {
        that.$Message.error("请选择要删除的部门");
        return;
      }
      if (row.type) {
        that.$Message.error("请选择要删除的部门");
        return;
      }
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content:
          "删除父级，其所有子级也会被删除,确定删除 " + row.bmmc + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "depart/delDepart",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getDepart();
                that.getAllDepart();
                that.getAllSchool();
                that.getTreeDepart();
              } else {
                that.$Message.error(res.data.msg);
              }
            })
            .catch(function () {
              that.messageError("服务器错误");
            });
        },
      });
    },
  },
};
</script>

<style scoped>
.modal {
  padding-left: 100px;
}
.formInput {
  width: 240px;
}

.content .depart {
  display: flex;
}

.depart_left,
.depart_right {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.depart_left {
  width: 333px;
  min-width: 300px;
  min-height: 600px;
  margin-right: 15px;
  overflow-y: auto;
  overflow-x: hidden;

  border-left: 1px solid #dddee1;
  border-bottom: 1px solid #dddee1;
}
.depart_right {
  width: 100%;
  min-width: 50%;
}

.page {
  text-align: center;
  margin-top: 39px;
}
</style>

<style>
.depart_left .ivu-menu-item-group-title {
  border-left: 0;
}
.depart_left .tree_menu > ul {
  overflow-y: auto;
  overflow-x: hidden;
  height:550px;
  padding: 0 9px !important;
}
</style>
