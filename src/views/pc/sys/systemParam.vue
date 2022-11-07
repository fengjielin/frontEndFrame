<template>
  <div class="content">
    <div
      class="notice_search_area"
      style="display: flex; justify-content: flex-end"
    >
      <Form :model="searchData" :label-width="90" inline style="flex: 1">
        <FormItem label="参数值：" style="margin-bottom: 0">
          <Input
            suffix="ios-search"
            @on-search="searchParam"
            :search="true"
            type="text"
            v-model="searchData.paramCd"
            class="wd200"
            placeholder="输入关键字查询"
          ></Input>
        </FormItem>
        <FormItem label="参数名称：" style="margin-bottom: 0">
          <Input
            suffix="ios-search"
            @on-search="searchParam"
            :search="true"
            type="text"
            v-model="searchData.paramDesc"
            class="wd200"
            placeholder="输入关键字查询"
          ></Input>
        </FormItem>
      </Form>
      <div>
        <Button
          @click="show"
          type="primary"
          style="margin: 5px 5px"
        >
          新增
        </Button>
      </div>
    </div>
    <div class="params mt16">
      <div class="param_left">
        <Menu
          theme="light"
          :active-name="activeName"
          @on-select="choseParamType"
        >
          <MenuGroup title="参数类型" class="menu">
            <MenuItem name="0" :key="-1">
              <Icon type="md-settings" /> 全部
            </MenuItem>
            <MenuItem
              :name="index + 1"
              v-for="(item, index) in paramTypes"
              :key="item.paramType"
            >
              <Icon type="md-settings" /> {{ item.paramTypeDesc }}
            </MenuItem>
          </MenuGroup>
        </Menu>
      </div>
      <div class="param_right">
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
      v-model="importParamModal"
      :mask-closable="false"
      :title="'参数导入'"
      width="400px"
      :closable="false"
      @on-cancel="modalClose"
    >
      <div style="padding: 0 30px">
        <Upload
          ref="teaUpload"
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
            >上传文件</Button
          >
        </Upload>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="importParam" :loading="loading"
          >确认导入</Button
        >
      </div>
    </Modal>

    <Modal
      v-model="showModal"
      :title="title"
      width="600px"
      :closable="false"
      @on-cancel="modalClose"
    >
      <div class="modal">
        <Form
          :model="data"
          :rules="ruleValidate"
          ref="paramComp"
          :label-width="100"
        >
          <FormItem label="参数类型：" prop="paramType">
            <Select v-model="data.paramType" style="width: 240px">
              <Option
                v-for="item in paramTypes"
                :value="item.paramType"
                :key="item.id"
                >{{ item.paramTypeDesc }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="参数值：" prop="paramCd">
            <Input
              type="text"
              v-model="data.paramCd"
              placeholder="请输入参数值"
              class="formInput"
            ></Input>
          </FormItem>
          <FormItem label="参数描述：" prop="paramDesc">
            <Input
              type="text"
              v-model="data.paramDesc"
              placeholder="请输入参数描述"
              class="formInput"
              :maxlength="5"
            ></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    let that = this;
    return {
      importParamModal: false,
      actionUrl: this.interfaceUrl + "param/filesUpload",
      fileNameList: [],
      ruleValidate: {
        paramDesc: [
          {
            required: true,
            message: "参数描述不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        paramCd: [
          {
            required: true,
            message: "参数值不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        paramType: [
          {
            required: true,
            message: "请选择参数类型",
            trigger: "blur",
          },
        ],
      },
      paramTypes: [],
      curType: "",
      searchData: {
        paramType: "",
        paramCd: "",
        paramDesc: "",
      },
      loading: false,
      showModal: false,
      title: "",
      tableData: [],
      data: {
        id: "",
        paramType: "",
        paramCd: "",
        paramDesc: "",
      },
      activeName: "0",
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "参数名称",
          key: "paramDesc",
          align: "center",
        },
        {
          title: "参数值",
          key: "paramCd",
          align: "center",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 160,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  props: {
                    icon: "md-create",
                    type: "primary",
                    size: "small",
                  },
                  style: {
                    marginRight: "22px",
										color: "#1B81FF",
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
                  props: {
                    icon: "md-close",
                    type: "error",
                    size: "small",
                  },
									style: {
										color: "#FF7A7A",
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
    this.getAllParamType();
  },
  methods: {
    showParamImport() {
      this.$refs.teaUpload.clearFiles();
      this.importParamModal = true;
    },
    downloadTeaTemplate() {
      window.open(this.interfaceUrl + "param/downloadTeaTemplate");
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
    //导入学生信息
    importParam() {
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
        .post(that.interfaceUrl + "param/paramImport", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.importParamModal = false;
            that.getParam();
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
    searchParam() {
      this.page.pageNum = 1;
      this.getParam();
    },
    getAllParamType() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "param/getAllParamType",
          that.qs({
            pageNum: 1,
            pageSize: 100,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.paramTypes = res.data.paramTypes;
            that.getParam();
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    //选择参数类型
    choseParamType(index) {
      this.page.pageNum = 1;
      if (index == 0) {
        this.curType = null;
				this.data.paramType = ""
      } else {
        this.curType = this.paramTypes[index - 1];
        this.data.paramType = this.curType.paramType;
      }
      this.getParam();
    },
    getParam() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "param/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
            paramType: that.data.paramType?that.data.paramType:"",
            paramDesc: that.searchData.paramDesc,
            paramCd: that.searchData.paramCd,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            // console.log(res.data);
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.sysParamDicts;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    changePage(i) {
      this.page.pageNum = i;
      this.getParam();
    },
    show(row) {
      if (row.id) {
        this.title = "修改参数";
        this.data.id = row.id;
        this.data.paramCd = row.paramCd;
        this.data.paramDesc = row.paramDesc;
				this.data.paramType = row.paramType
      } else {
        this.title = "新增参数";
        this.data.id = "";
        this.data.paramCd = "";
        this.data.paramDesc = "";
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["paramComp"].validate((valid) => {
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
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        paramCd: that.data.paramCd,
        paramDesc: that.data.paramDesc,
        paramType: that.data.paramType,
      };
      that.axios
        .post(that.interfaceUrl + "param/dealParam", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getParam();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    modalClose() {
      this.showModal = false;
    },
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.paramDesc + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "param/delParam",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getParam();
              } else {
                that.$Message.error(res.data.message);
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
.content {
  width: 100%;
  padding: 20px;
}
.modal {
  padding-left: 100px;
}
.formInput {
  width: 240px;
}
.params {
  display: flex;
}
.param_right,
.param_left {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}
.param_left {
  width: 333px;
  min-width: 300px;
  min-height: 550px;
  margin-right: 15px;
  overflow-y: auto;
  overflow-x: hidden;
  border-left: 1px solid #dddee1;
  border-bottom: 1px solid #dddee1;
}
.param_right {
  width: 100%;
  min-width: 50%;
}
</style>

<style>
.param_left .ivu-menu-item-group-title {
  border-left: 0;
}
.param_left .menu > ul {
  overflow-y: auto;
  overflow-x: hidden;
  height: 540px;
}
</style>
