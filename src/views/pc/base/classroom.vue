<template>
  <div class="content">
    <div
      class="notice_search_area"
      style="display: flex; align-items: center;"
    >
      <div class="notice_search_area">
        <Form
          :model="searchData"
          :label-width="60"
          inline
          @submit.native.prevent
          style="display: flex; justify-content: space-between; width: 100%"
        >
          <div>
            <FormItem label="楼栋：" style="margin-bottom: 0px">
              <Select
                v-model="searchData.bId"
                style="width: 120px"
                clearable
                @on-change="searchClassroom"
              >
                <Option
                  v-for="item in arrBuilding"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.buildingName }}</Option
                >
              </Select>
            </FormItem>
          </div>
        </Form>
      </div>
      <div>
        <Button @click="show" type="primary" style="margin: 5px 5px" v-if="checkAuth(['JSGL_ADD'])"
          >新增</Button
        >
        <Button
          @click="showClassroomImport"
          style="margin: 5px 5px"
          type="primary"
					v-if="checkAuth(['JSGL_IMPORT'])"
          >导入</Button
        >
        <Button
          @click="downloadClassroomTemplate"
          style="margin: 5px 5px"
          type="primary"
          ghost
					v-if="checkAuth(['JSGL_IMPORT'])"
          >下载导入模板</Button
        >
      </div>
    </div>
    <div class="classroom mt16">
      <div class="domitory_right">
        <Table
          :loading="loading"
          :columns="columns"
          :data="tableData"
          border
        />
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

      <Modal
        v-model="importClassroomModal"
        :mask-closable="false"
        :title="'教室导入'"
        width="400px"
        :closable="true"
        @on-cancel="modalClose"
      >
        <div style="padding: 0 30px">
          <Upload
            ref="domitoryUpload"
            :action="actionUrl"
            show-upload-list
            :on-success="handleSuccess"
            :format="['xls', 'xlsx']"
            :on-format-error="formatError"
            :on-remove="removeFile"
            style="padding-left: 20px"
          >
            <!-- 可互动按钮 -->
            <Button
              v-if="fileNameList.length <= 0"
              type="primary"
              ghost
              icon="ios-cloud-upload-outline"
              style="margin-left: 80px"
              >上传文件</Button
            >
            <!-- 不可互动按钮 -->
            <Button
              v-if="fileNameList.length > 0"
              type="primary"
              ghost
              icon="ios-cloud-upload-outline"
              style="margin-left: 80px"
              disabled
              >上传文件</Button
            >
          </Upload>
        </div>
        <div slot="footer" style="text-align: center">
          <Button @click="modalClose">取消</Button>
          <Button type="primary" @click="importClassroom" :loading="loading"
            >确认导入</Button
          >
        </div>
      </Modal>

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
            ref="classroomComp"
            :label-width="100"
          >
            <FormItem label="楼栋：" prop="buildingId">
              <Select
                v-model="data.buildingId"
                style="width: 200px"
                @on-change="handleSelectBuilding"
              >
                <Option
                  v-for="item in buildings"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.buildingName }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="楼层：" prop="floorId">
              <Select v-model="data.floorId" style="width: 200px">
                <Option v-for="item in floors" :value="item.id" :key="item.id"
                  >{{ item.floorName }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="教室简称：" prop="classProfile">
              <Input
                type="text"
                v-model="data.classProfile"
                placeholder="请输入教室简称"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="教室名称：" prop="className">
              <Input
                type="text"
                v-model="data.className"
                placeholder="请输入教室名称"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="容纳人数：">
              <InputNumber
                :min="0"
                :max="1000"
                v-model="data.accomNum"
              ></InputNumber>
            </FormItem>
          </Form>
        </div>
        <div slot="footer" style="text-align: center">
          <Button @click="modalClose">取消</Button>
          <Button type="primary" @click="ok" :loading="loading">保存</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    let that = this;
    var numValid = function (rule, value, callback) {
      // console.log(value)
      if (value <= 0) {
        return callback(new Error("请输入大于0的数"));
      } else {
        callback();
      }
    };
    return {
      importClassroomModal: false,
      actionUrl: this.interfaceUrl + "classroom/filesUpload",
      fileNameList: [],
      ruleValidate: {
        className: [
          {
            required: true,
            message: "教学名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        classProfile: [
          {
            required: true,
            message: "教学简称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        accomNum: [
          {
            required: true,
            message: "容纳人数不能为空",
            type: "number",
            trigger: "blur",
          },
          { validator: numValid, trigger: "blur" },
        ],
        floorId: [
          {
            required: true,
            message: "楼层不能为空",
            type: "number",
            trigger: "blur",
          },
        ],
      },
      buildings: [],
      floors: [],

      curBuilding: "",
      arrBuilding: [],
      loading: false,
      showModal: false,
      title: "",
      tableData: [],
      data: {
        id: "",
        zybh: "",
        className: "",
        building: "",

        floorId: "",
        accomNum: 1,
        classProfile: "",
      },
      searchData: {
        bId: "",
      },
      activeName: "0",
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      floorList: [],
      columns: [
        {
          title: "楼栋",
          key: "buildingName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "楼层",
          key: "floorName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "教室简称",
          key: "classProfile",
          align: "center",
          minWidth: 150,
        },
        {
          title: "教室名称",
          key: "className",
          align: "center",
          minWidth: 150,
        },
        {
          title: "容纳人数",
          key: "accomNum",
          align: "center",
          minWidth: 150,
          render:(h,params)=>{
            return h("span",params.row.accomNum?params.row.accomNum:0)
          }
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
										display: this.checkAuth(["JSGL_UPDATE"])
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
										display: this.checkAuth(["JSGL_DELETE"])
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
    this.getBuildings();
    this.getClassroom();
    this.getFloor();
  },
  methods: {
    searchClassroom() {
      this.page.pageNum = 1;
      this.getClassroom();
    },
    showClassroomImport() {
      this.$refs.domitoryUpload.clearFiles();
      this.importClassroomModal = true;
    },
    downloadClassroomTemplate() {
      window.open(this.interfaceUrl + "classroom/downloadClassroomTemplate");
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
    importClassroom() {
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
        .post(that.interfaceUrl + "classroom/classroomImport", that.qs(data))
        .then(function (res) {
          that.fileNameList = []
          that.loading = false;
          if (res.data.state) {
            that.importClassroomModal = false;
            that.getClassroom();
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

    // 获取楼栋信息
    getBuildings() {
      let that = this;
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "teachingBuilding/selectAll", that.qs({}))
        .then(function (res) {
          // console.log(res.data)
          if (res.data.state) {
            if(res.data.buildings){
              that.buildings = res.data.buildings;
              if (res.data.buildings) {
                that.arrBuilding = res.data.buildings;
                that.curBuilding = res.data.buildings[0];
                that.data.buildingId = that.curBuilding.id;
              }
              that.$nextTick(function () {
                that.activeName = 0;
              });
              that.getClassroom();
              that.loading = false;
            }
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    // 获取根据楼栋楼层
    getFloor() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 999,
      };
      that.axios
        .post(that.interfaceUrl + "floor/selectAllByPage", that.qs(data))
        .then(function (res) {
          // console.log(res.data)
          if (res.data.state) {
            // 楼层数据
            that.floorList = res.data.floors;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取教室信息
    getClassroom() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "classroom/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
            buildingId: that.searchData.bId ? that.searchData.bId : "",
          })
        )
        .then(function (res) {
          // console.log(res.data)
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            if (res.data.classroomList) {
              that.tableData = res.data.classroomList;
            } else {
              that.tableData = [];
            }
            that.loading = false;
          } else {
            that.tableData = [];
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    changePage(i) {
      this.page.pageNum = i;
      this.getClassroom();
    },

    handleSelectBuilding() {
      this.selectFloor(this.data.buildingId);
    },
    selectFloor(buildingId) {
      this.floors = [];
      if (this.floorList) {
        this.floorList.forEach((item) => {
          if (item.teachingBuildId == buildingId) {
            this.floors.push(item);
          }
        });
      }
      
    },

    show(row) {
      // console.log(row)
      // console.log(this.floorList)
      if(this.arrBuilding.length == 0) {
        this.$Message.error("系统未创建楼栋信息，请先创建楼栋")
        return; 
      }
      if (row.id) {
        this.title = "修改教室";
        this.data.id = row.id;
        this.data.className = row.className;
        this.data.classProfile = row.classProfile;
        this.data.accomNum = row.accomNum?row.accomNum:0;
        this.data.buildingId = row.teachingBuildingId * 1;
        this.selectFloor(this.data.buildingId);
        this.data.floorId = row.floorId;
      } else {
        this.title = "新增教室";
        this.data.id = "";
        this.data.className = "";
        this.data.buildingId = this.arrBuilding[0].id;
        this.selectFloor(this.data.buildingId);
        this.data.floorId = this.floors[0]?this.floors[0].id:"";
        this.data.classProfile = "";
        this.data.accomNum = 0;
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;

      this.$refs["classroomComp"].validate((valid) => {
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
        className: that.data.className,
        buildingId: that.data.buildingId,

        floorId: that.data.floorId,
        accomNum: that.data.accomNum?that.data.accomNum:'',
        classProfile: that.data.classProfile,
      };
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "classroom/dealClassroom", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getClassroom();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    modalClose() {
      this.showModal = false;
      this.importClassroomModal = false;
      this.fileNameList = [];
      // this.$refs.uploadFile.clearFiles();
    },
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.className + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "classroom/delClassroom",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getClassroom();
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
.content .classroom {
  height: 100%;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
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

.domitory_left {
  min-width: 240px;
  float: left;
  margin-right: 10px;
  min-height: 600px;
  background: #fff;
}
</style>
