<template>
  <div class="content">
    <div class="notice_search_area">
      <Form
        :model="searchData"
        :label-width="60"
        inline
        style="display: flex; justify-content: flex-end; width: 100%"
        @submit.native.prevent
      >
        <div>
          <!-- <FormItem label="年级：" style="margin-bottom: 0px">
            <Select
              v-model="searchData.njmc"
              style="width: 120px"
              clearable
              @on-change="searchBanji"
            >
              <Option v-for="item in nianjis" :value="item.id" :key="item.id">{{
                item.njmc
              }}</Option>
            </Select>
          </FormItem>
          <FormItem label="院系：" style="margin-bottom: 0px">
            <Select
              v-model="searchData.ssyx"
              style="width: 260px"
              clearable
              @on-change="searchBanji"
            >
              <Option v-for="item in yuanxis" :value="item.id" :key="item.id">{{
                item.xbmcAndPastemName
              }}</Option>
            </Select>
          </FormItem> -->
          <FormItem style="margin: 5px;margin-left: -70px; margin-bottom: 0px">
            <Input
              search
              placeholder="请输入关键词"
              v-model="searchData.keyword"
              @on-search="searchBanji"
              maxlength="20"
            />
          </FormItem>
        </div>
        <div>
          <Button
            @click="show"
            type="primary"
            style="margin: 5px"
            v-if="checkAuth(['BJXXGL_ADD'])"
            >新增</Button
          >
          <Button
            @click="showBanjiImport"
            style="margin: 5px"
            type="primary"
            v-if="checkAuth(['BJXXGL_IMPORT'])"
            >导入</Button
          >
          <Button
            @click="downloadBanjiTemplate"
            style="margin: 5px"
            type="primary"
            ghost
            v-if="checkAuth(['BJXXGL_IMPORT'])"
            >下载导入模板</Button
          >
        </div>
      </Form>
    </div>
    <div class="banji mt16">
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

      <!-- 新增的弹窗 -->
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
            ref="banjiComp"
            :label-width="100"
          >
            <FormItem label="班级编号：" prop="bjbh">
              <Input
                type="text"
                v-model="data.bjbh"
                placeholder="请输入班级编号"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="班级名称：" prop="bjmc">
              <Input
                type="text"
                v-model="data.bjmc"
                placeholder="请输入班级名称"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <!-- <FormItem label="班级简称：" prop="bjjc">
              <Input
                type="text"
                v-model="data.bjjc"
                placeholder="请输入班级名称"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="班级别称：" prop="bjbc">
              <Input
                type="text"
                v-model="data.bjbc"
                placeholder="请输入班级名称"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem> -->
            <FormItem label="班主任：" prop="bzrId">
              <Select v-model="data.bzrId" :filterable="true" class="formInput">
                <Option
                  v-for="item in teachers"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.xm }}</Option
                >
              </Select>
            </FormItem>
            <FormItem label="所属年级：" prop="njId">
              <Select v-model="data.njId" class="formInput">
                <Option
                  v-for="item in nianjis"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.njmc }}</Option
                >
              </Select>
            </FormItem>
            <FormItem label="所属专业：" prop="sszy">
              <Select v-model="data.sszy" class="formInput">
                <Option
                  v-for="item in zhuanyes"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.zymc }}</Option
                >
              </Select>
            </FormItem>
            <!-- <FormItem label="所属院系：" prop="ssyx">
              <Select v-model="data.ssyx" class="formInput">
                <Option
                  v-for="item in yuanxis"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.xbmcAndPastemName }}</Option
                >
              </Select>
            </FormItem> -->
            <!--  <FormItem label="班级人数：" prop="bjrs">
              <InputNumber
                :min="0"
                :max="500"
                v-model="data.bjrs"
              ></InputNumber>
            </FormItem> -->
          </Form>
        </div>
        <div slot="footer" style="text-align: center">
          <Button @click="modalClose">取消</Button>
          <Button type="primary" @click="ok" :loading="loading">保存</Button>
        </div>
      </Modal>
      <!-- 导入的弹窗 -->
      <Modal
        v-model="importBanjiModal"
        :mask-closable="false"
        :title="'班级导入'"
        width="400px"
        :closable="false"
        @on-cancel="modalClose"
      >
        <div style="padding: 0 30px">
          <Upload
            ref="uploadFile"
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
          <Button type="primary" @click="importBanji" :loading="loading"
            >确认导入</Button
          >
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: this.$store.state.userInfo,
      importBanjiModal: false,
      actionUrl: this.interfaceUrl + "banji/filesUpload",
      fileNameList: [],
      // 验证规则
      ruleValidate: {
        bjbh: [
          {
            required: true,
            message: "班级编号不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        bjmc: [
          {
            required: true,
            message: "班级名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        bjjc: [
          {
            required: true,
            message: "班级简称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        bjbc: [
          {
            required: true,
            message: "班级别称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        njId: [
          {
            required: true,
            message: "请选择所属年级",
            trigger: "blur",
            type:"number"
          },
        ],
        bzrId: [
          {
            required: true,
            message: "请选择班主任",
            type: "number",
            trigger: "blur",
          },
        ],
        bjrs: [
          {
            required: true,
            message: "班级人数不能为空",
            type: "number",
            trigger: "blur",
          },
        ],
        sszy: [
          {
            required: true,
            message: "请选择所属专业",
            trigger: "blur",
            type:"number"
          },
        ],
        ssyx: [
          {
            required: true,
            type: "number",
            message: "请选择所属院系",
            trigger: "blur",
          },
        ],
      },
      activeName: "",
      loading: false,
      showModal: false,
      title: "",
      //表格绑定的数据
      tableData: [],
      zhuanyes: [],
      nianjis: [],
      yuanxis: [],
      teachers: [],

      // 新增弹窗表单绑定的数据
      data: {
        id: "",
        bjbh: "",
        bjmc: "",
        bjdd: "",
        njId: "",
        bzrId: "",
        bjjc: "",
        bjbc: "",
        bjrs: 0,
        ssyx: "",
        sszy: "",
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 搜索框绑定的数据
      searchData: {
        njmc: "",
        bzrmc: "",
        bjmc: "",
        ssyx: "",
        keyword: "",
      },
      columns: [
        {
          title: "班级编号",
          key: "bjbh",
          width: 202,
          align: "center",
        },
        {
          title: "班级名称",
          key: "bjmc",
          minWidth: 202,
          align: "center",
        },
        // {
        //   title: "班级简称",
        //   key: "bjjc",
        //   align: "center",
        //   minWidth: 150,
        // },
        // {
        //   title: "班级别称",
        //   key: "bjbc",
        //   align: "center",
        //   minWidth: 150,
        // },
        {
          title: "班主任",
          key: "bzrmc",
          width: 202,
          align: "center",
        },
        {
          title: "所属年级",
          key: "njmc",
          width: 202,
          align: "center",
        },
        {
          title: "所属专业",
          key: "zymc",
          align: "center",
          minWidth: 150,
        },
        // {
        //   title: "场室",
        //   key: "bjdd",
        //   align: "center",
        //   minWidth: 150,
        // },
        // {
        //   title: "所属院系",
        //   key: "yxName",
        //   align: "center",
        //   minWidth: 150,
        // },
        // {
        //   title: "班级人数",
        //   key: "bjrs",
        //   width: 100,
        //   align: "center",
        // },
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
                    display: this.checkAuth(["BJXXGL_UPDATE"])
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
                    display: this.checkAuth(["BJXXGL_DELETE"])
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
    this.getBanji();
    this.getNianji();
    this.getTeachers();
    // this.getYuanxi();
    this.getAllZhuanye();
  },
  methods: {
    showBanjiImport() {
      this.$refs.uploadFile.clearFiles();
      this.importBanjiModal = true;
    },
    downloadBanjiTemplate() {
      window.open(this.interfaceUrl + "banji/downloadBanjiTemplate");
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
    //导入班级信息
    importBanji() {
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
        .post(that.interfaceUrl + "banji/banjiImport", that.qs(data))
        .then(function (res) {
          that.fileNameList = []
          that.loading = false;
          if (res.data.state) {
            that.importBanjiModal = false;
            that.getBanji();
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

    //模糊查找班级
    searchBanji() {
      this.page.pageNum = 1;
      // console.log(this.searchData);
      this.getBanji();
      // this.getTeachers();
    },
    getTeachers() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "teacher/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 1000,
            // pastemId:
            //   that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.teachers = res.data.teacherList;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    getNianji() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "nianji/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 100,
          })
        )
        .then(function (res) {
          // console.log(res)
          if (res.data.state) {
            that.nianjis = res.data.nianjiList;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    getYuanxi() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "/pastem/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 100,
          })
        )
        .then(function (res) {
          // console.log(res)
          if (res.data.state) {
            if (res.data.pastemList) {
              let yuanxisArr = [];
              res.data.pastemList.forEach((item) => {
                if (item.type == "P02") {
                  yuanxisArr.push(item);
                }
              });
              that.yuanxis = yuanxisArr;
            }
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    getBanji() {
      let that = this;
      that.loading = true;
      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,
        njId: that.searchData.njmc ? that.searchData.njmc : "",
        zymc: that.searchData.zymc ? that.searchData.zymc : "",
        bjmc: that.searchData.bjmc ? that.searchData.bjmc : "",
        bzrmc: that.searchData.bzrmc,
        pastemId: that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
        ssyx: that.searchData.ssyx ? that.searchData.ssyx : "",
        keyword: that.searchData.keyword ? that.searchData.keyword : "",
      };
      that.axios
        .post(that.interfaceUrl + "banji/selectAllByPage", that.qs(data))
        .then(function (res) {
          // console.log(data)
          // console.log(res)
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.banJiList;
            // console.log(that.tableData)
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
      this.getBanji();
    },
    show(row) {
      // console.log(row);
      if (row.id) {
        this.title = "修改班级";
        this.data.id = row.id;
        this.data.bjbh = row.bjbh;
        this.data.bjmc = row.bjmc;
        this.data.zyId = row.zyId;
        this.data.njId = row.njId;
        this.data.bzrId = row.bzrId * 1;
        this.data.bjdd = row.bjdd;

        this.data.bjjc = row.bjjc;
        this.data.bjbc = row.bjbc;
        this.data.bjrs = row.bjrs * 1;
        // this.data.ssyx = row.ssyx * 1;
        this.data.sszy = row.zyId;
        // console.log(row)
      } else {
        this.title = "新增班级";
        this.data.id = "";
        this.data.bjbh = "";
        this.data.bjmc = "";
        this.data.zyId = "";
        this.data.njId = "";
        this.data.bzrId = "";
        this.data.bjdd = "";

        this.data.bjjc = "";
        this.data.bjbc = "";
        this.data.bjrs = 0;
        // this.data.ssyx = "";
        this.data.sszy = "";
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["banjiComp"].validate((valid) => {
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
        bjbh: that.data.bjbh,
        // bjdd: that.data.bjdd,
        bjmc: that.data.bjmc,
        njId: that.data.njId,
        bzrId: that.data.bzrId,

        bjjc: that.data.bjjc,
        bjbc: that.data.bjbc,
        ssyx: that.data.ssyx,
        zyId: that.data.sszy,
        // bjrs: that.data.bjrs,
      };
      // console.log("data:", data)
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "banji/dealBanji", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getBanji();
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
      this.importBanjiModal = false;
      this.fileNameList = [];
      this.$refs.uploadFile.clearFiles();
      this.$refs["banjiComp"].resetFields();
    },
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.bjmc + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "banji/delBanji",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getBanji();
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

    getAllZhuanye() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 9999,
      };
      that.axios
        .post(that.interfaceUrl + "zhuanye/selectAllByPage", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            if(res.data.zhuanYeList){
              that.zhuanyes = res.data.zhuanYeList;
              that.zhuanyes.sort((a, b) => a.zymc.localeCompare(b.zymc)) // 升序
            }
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
.content .banji {
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
</style>
