<template>
  <div class="content">
    <!-- 按钮区域 -->
    <div class="notice_search_area">
      <Label>课程类别：</Label>
      <Select
        @on-change="getCourseInfo()"
        v-model="searchData.courseType"
        style="width: 150px;margin:0 10px"
        clearable
      >
        <Option
          v-for="item in courseTypes"
          :value="item.paramCd"
          :key="item.id"
          >{{ item.paramDesc }}</Option
        >
      </Select>
      <Input
        @on-search="search"
        :search="true"
        type="text"
        v-model="searchData.keyword"
        placeholder="请输入课程名称"
        maxlength="20"
        style="width:200px;margin-right:5px"
      ></Input>
      <Button
        style="margin: 5px 5px"
        type="primary"
        @click="show()"
        v-if="checkAuth(['KCXXGL_BUILD_ADD'])"
        >新增</Button
      >
      <Button
        style="margin: 5px 5px"
        @click="showCourseInfoImport"
        type="primary"
        v-if="checkAuth(['KCXXGL_IMPORT'])"
        >导入</Button
      >
      <Button
        style="margin: 5px 5px"
        @click="downloadTemplate"
        type="primary"
        ghost
        v-if="checkAuth(['KCXXGL_IMPORT'])"
        >下载导入模板</Button
      >
    </div>

    <div class="courseInfo mt16">
      <!-- 表格区域 -->
      <Table
        border
        :loading="loading"
        :columns="columns"
        :data="courseInfo"
      ></Table>
      <!-- 分页 -->
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

    <!-- 新增与修改的对话框 -->
    <Modal
      v-model="showModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalClose"
    >
      <div style="padding-left: 100px">
        <Form
          :model="data"
          :label-width="100"
          :rules="ruleValidate"
          ref="courseInfoRef"
        >
          <FormItem label="课程编号:" prop="courseCode">
            <Input
              v-model="data.courseCode"
              placeholder="请输入课程编号"
              maxlength="20"
              style="width: 240px"
            ></Input>
          </FormItem>
          <FormItem label="课程名称:" prop="courseName">
            <Input
              v-model="data.courseName"
              placeholder="请输入课程名称"
              maxlength="20"
              style="width: 240px"
            ></Input>
          </FormItem>
          <FormItem label="课程类别:" prop="courseType">
            <Select
              v-model="data.courseType"
              class="formInput"
              style="width: 240px"
            >
              <Option
                v-for="item in courseTypes"
                :value="item.paramCd"
                :key="item.id"
                >{{ item.paramDesc }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="课程性质:" prop="courseNature">
            <Select
              v-model="data.courseNature"
              class="formInput"
              style="width: 240px"
            >
              <Option
                v-for="item in courseNatures"
                :value="item.paramCd"
                :key="item.id"
                >{{ item.paramDesc }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="课程负责人:">
            <Select v-model="data.courseLeader" style="width: 260px" :filterable="true" multiple class="formInput">
              <Option
                  v-for="item in teachers"
                  :value="item.id"
                  :key="item.id"
              >{{ item.xm }}</Option
              >
            </Select>
          </FormItem>
<!--          <div v-if="data.courseType=='C02'">-->
<!--             <FormItem label="所属专业:" prop="majorId"> -->
<!--              <Select v-model="data.majorId" style="width: 300px" :filterable="true" class="formInput">-->
<!--                <Option-->
<!--                    v-for="item in zhuanYeList"-->
<!--                    :value="item.id"-->
<!--                    :key="item.id"-->
<!--                    :label="item.zymc"-->
<!--                ></Option>-->
<!--              </Select>-->
<!--            </FormItem>-->
<!--          </div>-->
          <FormItem label="课程封面:">
            <Upload
              ref="upload"
              :before-upload="handleBeforeUpload1"
              :show-upload-list="false"
              :multiple="false"
              :action="uploadActionUrl"
              :on-success="handleSuccess1"
              :format="['jpg', 'jpeg', 'png']"
              style="margin-bottom: 200px"
            >
              <div class="pc_pic">
                <div
                  v-show="showFlag_LogoAdd"
                  title="点击上传图片"
                  class="advert_upload_icon"
                >
                  <Icon type="ios-add" size="32"></Icon>
                </div>
                <div
                  v-show="showFlag_LogoImg"
                  title="点击上传图片"
                  class="advert_upload_img"
                >
                  <img
                    :src="data.courseLogo"
                    style="width: 200px; height: 200px"
                  />
                </div>
              </div>
            </Upload>
            <span class="upload_tip"
              >建议尺寸200像素X200像素，图片大小不超过80KB</span
            >
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok" :loading="loading">保存</Button>
      </div>
    </Modal>

    <Modal v-model="modal1" title="课程封面" @on-ok="modal1 = flase">
      <img :src="interfaceUrl + data.courseLogo" alt="" />
    </Modal>

    <!-- 导入的对话框 -->
    <Modal
      v-model="importCourseInfoModal"
      :closable="true"
      :mask-closable="false"
      title="课程信息导入"
      width="400px"
      @on-cancel="importCourseInfoModalClose"
    >
      <div style="padding: 0 30px">
        <Upload
          ref="uploadFile"
          :action="actionUrl"
          show-upload-list
          :format="['xls', 'xlsx']"
          :on-success="handleSuccess"
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
        <Button @click="importCourseInfoModalClose">取消</Button>
        <Button type="primary" @click="importCourseSet" :loading="loading"
          >确认导入</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
// import defaultImg from "../../../img/default.jpg";
export default {
  // 课程信息管理
  data() {
    return {
      zhuanYeList:[],
      teachers:[],
      searchData:{
        keyword:'',
        courseType:""
      },
      showFlag_LogoAdd: true,
      showFlag_LogoImg: false,
      modal1: false,
      // 验证规则
      ruleValidate: {
        courseCode: [
          {
            required: true,
            message: "课程编号不能为空",
            trigger: "blur",
          },
        ],
        courseName: [
          {
            required: true,
            message: "课程名称不能为空",
            trigger: "blur",
          },
        ],
        courseType: [
          {
            required: true,
            message: "课程类别不能为空",
            trigger: "blur",
          },
        ],
        courseNature: [
          {
            required: true,
            message: "课程性质不能为空",
            trigger: "blur",
          },
        ],
        // majorId: [
        //   {
        //     required: true,
        //     message: "所属专业不能为空",
        //     trigger: "blur",
        //     type: 'number'
        //   },
        // ],
      },
      fileNameList: [],
      courseTypes: [],
      courseNatures:[
        { paramCd: "Q01", paramDesc: "理论" },
        { paramCd: "Q02", paramDesc: "一体化" },
      ],
      loading: false,
      // 新增与修改对话框绑定的数据
      data: {
        courseCode: "",
        courseName: "",
        courseNature: "",
        // evaluationMode: "考试",
        courseType: "",
        courseLeader:[],
        majorId:''
      },
      defaultImg:"",
      columns: [
        {
          title: "图标",
          width: 70,
          align: "center",
          key: "newsIcon",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src:
                  params.row.courseLogo == null
                    ? this.defaultImg
                    : this.interfaceUrl + params.row.courseLogo,
              },
              style: {
                width: "30px",
                height: "30px",
                "text-align": "center",
              },
            });
          },
        },
        {
          title: "课程编号",
          key: "courseCode",
          align: "center",
          minWidth: 100,
        },
        {
          title: "课程名称",
          key: "courseName",
          align: "center",
          minWidth: 200,
        },
        {
          title: "课程负责人",
          align: "center",
          minWidth: 350,
          render: (h, params) => {
            let courseLeader = this.codeChangeDesc(params.row.courseLeader,this.teachers);
            return h("span",courseLeader)
          }
        },
        // {
        //   title: "所属专业",
        //   key: "majorName",
        //   align: "center",
        //   width: 300,
        // },
        {
          title: "课程类别",
          key: "paramDesc",
          align: "center",
          width: 120,
        },
        {
          title: "课程性质",
          key: "courseNature",
          align: "center",
          width: 120,
          render: (h, params) => {
            let str = ''
            if(params.row.courseNature == 'Q01'){
              str = '理论'
            }else{
              str = '一体化'
            }
            return h('span',str)
          }
        },
        {
          title: "操作",
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
                    display: this.checkAuth(["KCXXGL_UPDATE"])
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
                    display: this.checkAuth(["KCXXGL_BUILD_DELETE"])
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
      // 表格绑定的课程信息数据
      courseInfo: [],
      // 分页管理
      page: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 10,
      },
      // 控制对话框的显示与隐藏
      showModal: false,

      title: "",
      // 控制导入对话框的显示与隐藏
      importCourseInfoModal: false,
      // 上传的地址
      actionUrl: this.interfaceUrl + "courseSet/filesUpload",

      //课程封面上传
      uploadActionUrl: this.interfaceUrl + "courseSet/courseLogoUpload",
      uploadList: [],
      showPercent: "",
      percentage: "",
    };
  },
  mounted() {
    this.getTeachers();
    this.getCourseInfo();
    this.getParamsByParamType();
    this.getZhuanye()
  },
  methods: {
    // 获取专业
    getZhuanye() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 1000,
      };
      that.axios
        .post(that.interfaceUrl + "zhuanye/selectAllByPage", that.qs(data))
        .then(function (res) {
          console.log(res.data);
          if (res.data.state) {
            if(res.data.zhuanYeList){
              that.zhuanYeList = res.data.zhuanYeList
            }else{
              that.zhuanYeList = []
            }
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    codeChangeDesc(key, list) {
      if(key == null || list == null) {
        return ""
      }
      let str = "";
      let courseLeaderArray = key.split(",");
      for(var item of list) {
        for(var courseLeader of courseLeaderArray){
          if(item.id == courseLeader) {
            str += item.xm+",";
          }
        }
      }
      if(str != ""){
        str = str.substring(0,str.lastIndexOf(","));
      }
      return str;
    },
    getTeachers() {
      let that = this;
      that.axios
          .post(
              that.interfaceUrl + "teacher/selectAllByPage",
              that.qs({
                pageNum: 1,
                pageSize: 1000,
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
     // 点击搜索
    search() {
      this.page.pageNum = 1;
      this.getCourseInfo();
    },

    //附件上传获取进度
    handleProgress(progressEvent) {
      this.showPercent = true;
      this.$forceUpdate();
      this.percentage = parseInt(progressEvent.percent);
    },
    handleRemove(file) {
      this.$forceUpdate();
      const fileList = this.uploadList;
      this.uploadList.splice(fileList.indexOf(file), 1);
      this.$refs["upload"].fileList = [];
    },
    handleSuccess(res, file) {
      this.$forceUpdate();
      let that = this;
      let liveName = file.name;
      let suffix = liveName.substr(liveName.lastIndexOf(".") + 1);
      file.attachUrl = res.url;
      file.attachName = file.name;
      this.$refs["upload"].fileList.forEach(function (o, i) {
        if (!that.uploadList.includes(o)) {
          that.uploadList.push(o);
        }
      });
      this.showPercent = false;
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: "材料格式错误",
        desc: "请上传图片文件",
      });
    },
    //处理上传附件之前的内容
    handleBeforeUpload(file) {
      let flag = file.size > 2048000000;
      if (flag) {
        this.$Message.warning("上传文件大小不能超过2GB");
        return false;
      }
    },

    //处理上传附件之前的内容
    handleBeforeUpload1(file) {
      let flag = file.size > 5242880;
      if (flag) {
        this.$Message.warning("上传文件大小不能超过5Mb");
        return false;
      }
    },
    handleSuccess1(res, file) {
      (this.showFlag_LogoAdd = false),
        (this.showFlag_LogoImg = true),
        (this.data.courseLogo = this.interfaceUrl + res.url);
      this.$forceUpdate();
    },

    jumpDocDetail(id) {
      console.log(id);
      this.$router.push({
        name: "attachDetail",
        query: {
          attachId: id,
        },
      });
    },

    showCover(row) {
      this.modal1 = true;
    },

    //处理上传附件之前的内容
    formatError() {
      this.$Modal.error({
        title: "提示",
        content: "只能上传xls、xlsx文件",
        closable: true,
      });
    },
    removeFile(file, fileList) {
      let tempList = [];
      fileList.forEach(function (o, i) {
        tempList.push(o.response.newFileName);
      });
      this.fileNameList = tempList;
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
    downloadTemplate() {
      window.open(this.interfaceUrl + "courseSet/downloadCourseSetTemplate");
    },
    //导入课程信息
    importCourseSet() {
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
        .post(that.interfaceUrl + "courseSet/courseInfoImport", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.importCourseInfoModal = false;
            that.fileNameList = [];
            that.$refs.uploadFile.clearFiles();
            that.getCourseInfo();
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
            that.messageError(res.data.Message);
          }
          that.loading = false;
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    // 请求课程信息
    getCourseInfo() {
      let that = this;
      that.loading = true;
      let data = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
        courseName:this.searchData.keyword,
        courseType: this.searchData.courseType?this.searchData.courseType:"" // 课程类别 C01公共 C02专业
      };
      that.axios
        .post(that.interfaceUrl + "/courseSet/selectAllByPage", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.count;
            that.courseInfo = res.data.arrCourseSet;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
            that.loading = false;
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
          that.loading = false;
        });
    },
    // 改变页码
    changePage(i) {
      this.page.pageNum = i;
      this.getCourseInfo();
    },
    // 打开导入的对话框
    showCourseInfoImport() {
      this.importCourseInfoModal = true;
    },
    // 关闭导入的对话框
    importCourseInfoModalClose() {
      this.importCourseInfoModal = false;
      this.fileNameList = [];
      this.$refs.uploadFile.clearFiles();
    },
    // 打开新增或修改对话框
    show(row) {
      if (row) {
        this.title = "修改课程信息";
        this.data.id = row.id;
        this.data.courseCode = row.courseCode;
        this.data.courseName = row.courseName;
        this.data.courseType = row.courseType;
        this.data.courseNature = row.courseNature;
        this.data.courseLogo = row.courseLogo?this.interfaceUrl + row.courseLogo:this.defaultImg;
        this.data.courseLeader = row.courseLeader?row.courseLeader.split(",").map(Number):""
        this.showFlag_LogoAdd = false;
        this.showFlag_LogoImg = true;

        this.data.majorId = row.majorId?row.majorId:""
      } else {
        this.title = "新增课程信息";
        this.data.id = "";
        this.data.courseCode = "";
        this.data.courseName = "";
        this.data.courseType = "";
        this.data.courseNature = "";
        this.data.courseLeader = []
        this.showFlag_LogoAdd = true;
        this.showFlag_LogoImg = false;
      }
      this.showModal = true;
    },
    // 关闭新增或修改对话框
    modalClose() {
      this.$refs["courseInfoRef"].resetFields();
      this.showModal = false;
    },
    // 新增与删除的保存按钮
    ok() {
      let that = this;
      this.$refs["courseInfoRef"].validate((valid) => {
        if (!valid) {
          this.$Modal.error({
            title: "提示",
            content: "表单填写有误",
            closable: true,
          });
          return;
        }
        let data = {
          id: this.data.id,
          courseCode: this.data.courseCode,
          courseName: this.data.courseName,
          courseType: this.data.courseType,
          courseNature:this.data.courseNature,
          courseLogo: this.data.courseLogo,
          courseLeader:this.data.courseLeader?this.data.courseLeader:"",
          // evaluationMode: this.data.evaluationMode,
          majorId: this.data.majorId?this.data.majorId:"", //专业id
        };
        // 请求后端
        that.loading = true
        that.axios
          .post(
            that.interfaceUrl + "/courseSet/saveOrUpdateCourseSet",
            that.qs(data)
          )
          .then(function (res) {
            that.loading = false
            if (res.data.state) {
              that.$Message.success("保存成功");
              that.data.courseLogo = ''
              that.modalClose();
              that.getCourseInfo();
            } else {
              that.messageError(res.data.msg);
            }
          })
          .catch(function () {
            that.loading = false
            that.messageError("服务器错误");
          });
      });
    },
    // 移除操作
    remove(row) {
      let that = this;
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.courseName + " 吗？",
        onOk: () => {
          that.axios
            .post(
              that.interfaceUrl + "courseSet/delCourseSet",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getCourseInfo();
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

    getParamsByParamType() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "/param/getParamsByParamType",
          that.qs({
            paramType: "DM_Course_Type",
          })
        )
        .then(function (res) {
          if (res.data.state) {
            console.log(res.data);
            that.courseTypes = res.data.sysParamDicts;
          } else {
            that.$Message.error(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
  },
};
</script>

<style scoped>
.notice_search_area{
  align-items: center;
}
.advert_upload_icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  line-height: 200px;
  z-index: 3;
  text-align: center;
  border: 1px dashed #cccccc;
  background: #ffffff;
  cursor: pointer;
}
.advert_upload_img {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  z-index: 5;
  text-align: center;
  cursor: pointer;
}

.content .courseInfo {
  height: 100%;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.courseInfo .ivu-btn {
  margin: 10px;
}

.courseInfo .page {
  text-align: center;
  margin-top: 39px;
}
</style>
