<template>
  <div class="content">
    <div class="notice_search_area">
      <!-- 搜索与新增区域 -->
      <Form
        :model="searchData"
        :label-width="100"
        inline
        @submit.native.prevent
        style="display: flex; justify-content: flex-end; width: 100%"
      >
        <div>
          <!-- <FormItem label="授课老师：" style="margin-bottom: 0">
            <Select
              v-model="searchData.teachingTeacherId"
              style="width: 240px"
              :filterable="true"
              @on-change="searchTeachingClass"
              clearable
            >
              <Option
                v-for="item in teacherList"
                :value="item.id"
                :key="item.id"
                >{{ item.xm }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="所授课程：" style="margin-bottom: 0">
            <Select
              v-model="searchData.courseId"
              placeholder="请选择所授课程"
              @on-change="searchTeachingClass"
              clearable
              style="width: 250px"
            >
              <Option
                v-for="item in courseList"
                :value="item.id"
                :key="item.id"
              >
                {{ item.courseName }}
              </Option>
            </Select>
          </FormItem> -->

          <FormItem label="所属学期：" style="margin: 5px 5px 5px 0">
            <Select
              v-model="searchData.termId"
              style="width: 240px"
              @on-change="searchTeachingClass"
              clearable
            >
              <Option
                v-for="item in termTableData"
                :value="item.id"
                :key="item.id"
                >{{ item.termName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem style="margin: 5px 5px 5px -100px">
            <Input
              @on-search="searchTeachingClass"
              :search="true"
              type="text"
              v-model="searchData.keyword"
              class="wd200"
              placeholder="请输入关键词"
              maxlength="20"
            ></Input>
          </FormItem>
        </div>
        <div>
          <Button
            @click="show"
            type="primary"
            style="margin: 5px"
            v-if="checkAuth(['JCXXGL_JXBGL_ADD'])"
            >新增</Button
          >
          <Button
            @click="showScheduleImport"
            type="primary"
            style="margin: 5px"
            >导入班级学生</Button
          >
          <Button
            @click="downloadScheduleTemplate"
            type="primary"
            style="margin: 5px"
            ghost
            >下载班级学生模版</Button
          >
        </div>
      </Form>
    </div>
    <div class="teachingClass mt16">
      <!-- 表格 -->
      <Table :loading="loading" :columns="columns" :data="tableData" border />
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
    <!-- 关联行政班的弹出框 -->
    <Modal
      v-model="showAdmModal"
      title="关联行政班"
      width="1260px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="showAdmModalClose"
      footer-hide
    >
      <div class="modal">
        <div class="banji_stu_box">
          <div class="banji_stu" :class="{ open_bound: banjiStu }">
            <div class="banji_stu_left">
              <div style="display: flex; justify-content: space-between">
                <div style="height: 32px"></div>
                <Button
                  type="primary"
                  @click="openNotBoundStu"
                  style="margin-left: 10px"
                  icon="ios-arrow-back"
                  v-if="!banjiStu"
                >
                  选择行政班关联
                </Button>
              </div>
              <div class="table_box mt16">
                <!-- 已关联行政班表格 -->
                <Table
                  size="small"
                  :loading="loading"
                  border
                  :columns="selectedClassColumns"
                  :data="selectedClass"
                  max-height="460"
                ></Table>
              </div>
            </div>
            <div class="banji_stu_right">
              <div style="display: flex; justify-content: space-between">
                <div>
                  <label>行政班名称:</label>
                  <Input
                    @on-search="searchBanji"
                    v-model="searchData.bjmc"
                    :search="true"
                    type="text"
                    style="width: 200px"
                    placeholder="输入行政班名称查询"
                    maxlength="20"
                  ></Input>
                </div>
                <Button
                  type="primary"
                  @click="openNotBoundStu"
                  style="margin-left: 10px"
                  icon="ios-arrow-forward"
                  v-if="banjiStu"
                >
                  选择行政班关联
                </Button>
              </div>
              <div class="table_box mt16">
                <!-- 未关联行政班表格 -->
                <Table
                  ref="class_selection"
                  size="small"
                  :loading="loading"
                  border
                  :columns="classColumns"
                  :data="unSelectedClass"
                  style="margin-top: 10px; margin-bottom: 10px"
                  max-height="460"
                ></Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 修改的弹出框 -->
    <Modal
      v-model="showUpdeteModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="updeteModalClose"
    >
      <div class="modal" style="margin: 0 105px">
        <Form
          :model="data"
          :rules="ruleValidate"
          ref="teachingClassComp"
          :label-width="110"
        >
          <FormItem label="所属学期：" prop="termId">
            <Select
              v-model="data.termId"
              style="width: 240px"
              @on-search="searchTeachingClass"
              clearable
            >
              <Option
                v-for="item in termTableData"
                :value="item.id"
                :key="item.id"
                >{{ item.termName }}
              </Option>
            </Select>
          </FormItem>
          <!-- <FormItem label="教学班编号：" prop="classNo">
            <Input
              type="text"
              v-model="data.classNo"
              placeholder="请输入教学班名称"
              class="formInput"
              maxlength="20"
            ></Input>
          </FormItem> -->
          <FormItem label="教学班名称：" prop="className">
            <Input
              type="text"
              v-model="data.className"
              placeholder="请输入教学班名称"
              class="formInput"
              maxlength="20"
            ></Input>
          </FormItem>
          <FormItem label="授课老师：" prop="teacher">
            <Select v-model="data.teacher" style="width: 240px" filterable>
              <Option
                v-for="item in teacherList"
                :value="item.id"
                :key="item.id"
                :label="item.xm"
              >
              </Option>
            </Select>
          </FormItem>
          <FormItem label="所授课程：" prop="courseName">
            <Select
              v-model="data.courseName"
              placeholder="请选择所授课程"
              style="width: 240px"
              filterable
            >
              <Option
                v-for="item in courseList"
                :value="item.id"
                :key="item.id"
                :label="item.courseName"
              >
              </Option>
            </Select>
          </FormItem>
          <FormItem label="所属专业：" prop="zhuanyeId">
            <Select
              v-model="data.zhuanyeId"
              placeholder="请选择所属专业"
              style="width: 240px"
              filterable
            >
              <Option
                v-for="item in zhuanYeList"
                :value="item.id"
                :key="item.id"
                :label="item.zymc"
              >
              </Option>
            </Select>
          </FormItem>
          <!-- <FormItem label="班级人数：" prop="classroomPeopleNum">
            <InputNumber
              :min="1"
              :max="500"
              v-model="data.classroomPeopleNum"
            ></InputNumber>
          </FormItem> -->
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="updeteModalClose">取消</Button>
        <Button type="primary" @click="ok" :loading="loading">保存</Button>
      </div>
    </Modal>

    <!-- 班级学生的弹出框 -->
    <Modal
      v-model="showStuModal"
      title="班级学生"
      width="1260px"
      :closable="true"
      :mask-closable="false"
      footer-hide
      @on-cancel="showStuModalClose"
    >
      <div class="modal">
        <div class="banji_stu_box">
          <div class="banji_stu" :class="{ open_bound: banjiStu }">
            <div class="banji_stu_left">
              <div style="display: flex; justify-content: space-between">
                <div>
                  <!-- <label>学生名称:</label>
                  <Input
                    @on-search="searchfindArrBoundStu"
                    v-model="searchData.studentName2"
                    :search="true"
                    type="text"
                    style="width: 200px"
                    placeholder="输入学生名称查询"
                    maxlength="20"
                  ></Input> -->
                </div>
                <div>
                  <Button
                    type="error"
                    @click="unBoundStu"
                    style="margin-left: 10px"
                  >
                    批量解除关联
                  </Button>
                  <Button
                    type="primary"
                    @click="openNotBoundStu"
                    style="margin-left: 10px"
                    icon="ios-arrow-back"
                    v-if="!banjiStu"
                  >
                    选择关联学生
                  </Button>
                </div>
              </div>
              <div class="table_box mt16">
                <!-- 已关联表格 -->
                <Table
                  size="small"
                  :loading="loading"
                  border
                  :columns="selectedStuColumns"
                  :data="selectedStu"
                  @on-selection-change="selectedMutiSelect"
                ></Table>
              </div>
              <!-- 分页 -->
              <Page
                @on-change="changeSelectedStuPage"
                :total="SelectedStuPage.totalNum"
                :current="SelectedStuPage.pageNum"
                :page-size="SelectedStuPage.pageSize"
                show-elevator
                show-total
                style="text-align: center; margin-top: 16px"
              />
            </div>
            <div class="banji_stu_right">
              <div style="display: flex; justify-content: space-between">
                <div>
                  <label>学生名称:</label>
                  <Input
                    @on-search="searchfindArrUnBoundStu"
                    v-model="searchData.studentName"
                    :search="true"
                    type="text"
                    style="width: 200px"
                    placeholder="输入学生名称/学号查询"
                    maxlength="20"
                  ></Input>
                </div>
                <div>
                  <Button
                    type="primary"
                    @click="bindStu"
                    style="margin-left: 10px"
                  >
                    批量关联
                  </Button>
                  <Button
                    type="primary"
                    @click="openNotBoundStu"
                    style="margin-left: 10px"
                    icon="ios-arrow-forward"
                    v-if="banjiStu"
                  >
                    选择关联学生
                  </Button>
                </div>
              </div>
              <div class="table_box mt16">
                <!-- 未关联表格 -->
                <Table
                  ref="class_selection"
                  size="small"
                  :loading="loading"
                  border
                  :columns="unSelectedStuColumns"
                  :data="unSelectedStu"
                  @on-selection-change="unSelectedMutiSelect"
                  style="margin-top: 10px; margin-bottom: 10px"
                ></Table>
              </div>
              <!-- 分页 -->
              <Page
                @on-change="changeunSelectedStuPage"
                :total="unSelectedStuPage.totalNum"
                :current="unSelectedStuPage.pageNum"
                :page-size="unSelectedStuPage.pageSize"
                show-elevator
                show-total
                style="text-align: center; margin-top: 16px"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 导入的对话框 -->
    <Modal
      v-model="importScheduleInfoModal"
      :closable="true"
      :mask-closable="false"
      title="班级学生导入"
      width="400px"
      @on-cancel="closeScheduleImport"
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
            style="width: 110px; margin-left: 80px"
            >上传</Button
          >
          <!-- 不可互动按钮 -->
          <Button
            v-if="fileNameList.length > 0"
            type="primary"
            ghost
            icon="ios-cloud-upload-outline"
            disabled
            style="width: 110px; margin-left: 80px"
            >上传</Button
          >
        </Upload>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="closeScheduleImport">取消</Button>
        <Button type="primary" @click="importScheduleInfo" :loading="loading"
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
      // 控制导入对话框的显示与隐藏
      importScheduleInfoModal: false,
      // 上传的地址
      actionUrl: this.interfaceUrl + "teachingClassStudent/filesUpload",
      fileNameList: [],

      // 校验规则
      ruleValidate: {
        teacher: [
          {
            required: true,
            message: "授课老师不能为空",
            trigger: "blur",
            type: "number",
          },
        ],
        className: [
          {
            required: true,
            message: "教学班名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        courseName: [
          {
            required: true,
            message: "所授课程不能为空",
            type: "number",
            trigger: "blur",
          },
        ],
        classroomPeopleNum: [
          {
            required: true,
            message: "班级人数不能为空",
            type: "number",
            trigger: "blur",
          },
        ],
        termId: [
          {
            required: true,
            message: "所属学期不能为空",
            type: "number",
            trigger: "blur",
          },
        ],
        classNo: [
          {
            required: true,
            message: "教学班编号不能为空",
            trigger: "blur",
          },
        ],
        zhuanyeId: [
          {
            required: true,
            message: "所属专业不能为空",
            type: "number",
            trigger: "blur",
          },
        ],
      },
      // 新增与修改表单绑定的数据
      data: {
        className: "",
        teacher: "",
        courseName: "",
        classroomPeopleNum: 0,
        termId: "",
        classNo: "",
        zhuanyeId:""
      },

      courseList: [],
      teacherList: [],

      // 返回的已关联行政班列表
      AdminTeachingClassList: [],
      // 当前点击关联行政班的教学班id
      curSelTeachingClassId: 0,
      // 以选择关联的行政班的id集合
      adminClassId: [],

      // 专业列表
      zhuanYeList: [],
      xzclassList: [],

      selectClassStudents: [],
      selectStudents: [],
      students: [],

      // 已关联的行政班
      selectedClass: [],
      // 未关联的行政班
      unSelectedClass: [],
      allUnSelectedClass: [],
      // 未关联表格中已选中的数据
      selectClass: [],

      allClassStudents: [],
      curTeacher: {
        teacherId: "",
        xm: "",
      },
      // 搜索框绑定的数据
      searchData: {
        teachingClassName: "", //教学班名
        teachingTeacherId: "", //教师id
        courseId: "", //课程id
        bjmc: "",
        termId: "",
        keyword: "",
        studentName:""
      },

      loading: false,
      showModal: false,
      showUpdeteModal: false,
      showAdmModal: false,
      title: "",
      // 教学班表格的数据数组
      tableData: [],

      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 未关联的行政班的分页
      unSelectedClassPage: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 已关联的行政班的分页
      SelectedClassPage: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },

      // 未关联行政班表格数据
      classColumns: [
        // {
        // 	type: 'selection',
        // 	width: 60,
        // 	align: 'center'
        // },
        {
          title: "行政班名称",
          key: "bjmc",
          align: "center",
          minWidth: 150,
        },
        {
          title: "班主任",
          key: "bzrmc",
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
                  props: {
                    // type: "primary",
                    size: "small",
                  },
                  style: {
                    color: "#1B81FF",
                  },
                  on: {
                    click: () => {
                      // <Button @click="handleRelevance" style="margin-left:10px">关联</Button>
                      this.handleRelevance(params.row);
                    },
                  },
                },
                "关联"
              ),
            ]);
          },
        },
      ],
      // 已关联行政班表格数据
      selectedClassColumns: [
        // {
        // 	type: 'index',
        // 	width: 60,
        // 	align: 'center'
        // },
        {
          title: "行政班名称",
          key: "bjmc",
          align: "center",
          minWidth: 150,
        },
        {
          title: "班主任",
          key: "bzrmc",
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
                  props: {
                    // type: "primary",
                    size: "small",
                  },
                  style: {
                    color: "#FF7A7A",
                  },
                  on: {
                    click: () => {
                      // <Button @click="handleRelevanceRemove" style="margin-left:10px">移除关联</Button>
                      this.handleRelevanceRemove(params.row);
                    },
                  },
                },
                "移除关联"
              ),
            ]);
          },
        },
      ],

      // 表格的数据
      columns: [
        {
          title: "所属学期",
          key: "termName",
          align: "center",
          minWidth: 150,
        },
        // {
        //   title: "教学班编号",
        //   key: "",
        //   align: "center",
        //   minWidth: 150,
        // },
        {
          title: "教学班名称",
          key: "teachingClassName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "授课老师",
          key: "teacherName",
          align: "center",
          minWidth: 100,
        },
        {
          title: "所授课程",
          key: "courseName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "所属专业",
          key: "majorName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "班级人数",
          key: "classroomPeopleNum",
          align: "center",
          width: 100,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 300,
          render: (h, params) => {
            return h("span", [
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                  },
                  on: {
                    click: () => {
                      this.showAdm(params.row);
                    },
                  },
                },
                "关联行政班"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                  },
                  on: {
                    click: () => {
                      // this.showAdm(params.row);
                      this.showStu(params.row);
                    },
                  },
                },
                "班级学生"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["JCXXGL_JXBGL_UPDATE"])
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
                    display: this.checkAuth(["JCXXGL_JXBGL_DELETE"])
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

      termTableData: [],
      showStuModal: false,
      // 已关联学生
      selectedStu: [],
      // 未关联学生
      unSelectedStu: [],

      classId: "",

      // 未关联学生表格数据
      unSelectedStuColumns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "学生姓名",
          key: "xm",
          align: "center",
          minWidth: 150,
        },
        {
          title: "学号",
          key: "xh",
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
                  props: {
                    size: "small",
                  },
                  style: {
                    color: "#1B81FF",
                    display: this.checkAuth(["JCXXGL_JXBGL_STUDENT"])
                      ? "inline-block"
                      : "none",
                  },
                  on: {
                    click: () => {
                      // <Button @click="handleRelevance" style="margin-left:10px">关联</Button>
                      this.bindStu(params.row);
                    },
                  },
                },
                "关联"
              ),
            ]);
          },
        },
      ],
      // 已关联学生表格数据
      selectedStuColumns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "学生姓名",
          key: "xm",
          align: "center",
          minWidth: 150,
        },
        {
          title: "学号",
          key: "xh",
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
                  props: {
                    size: "small",
                  },
                  style: {
                    color: "#FF7A7A",
                    display: this.checkAuth(["JCXXGL_JXBGL_DEL_STU"])
                      ? "inline-block"
                      : "none",
                  },
                  on: {
                    click: () => {
                      this.unBoundStu(params.row);
                    },
                  },
                },
                "移除关联"
              ),
            ]);
          },
        },
      ],
      // 未关联的学生的分页
      unSelectedStuPage: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 已关联的学生的分页
      SelectedStuPage: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      unSelectedStuMutiSelect: [],
      selectedStuMutiSelect: [],
      banjiStu: false,
    };
  },

  mounted() {
    this.getTeacher();
    // this.getBanji();
    this.getCourses();
    this.getTerms();
    this.getZhuanye();
  },
  methods: {
    getZhuanye() {
      let data = {
        pageNum: 1,
        pageSize: 9999999,
      };
      this.axios
        .post(this.interfaceUrl + "zhuanye/selectAllByPage", this.qs(data))
        .then((res) => {
          if (res.data.state) {
            this.zhuanYeList = res.data.zhuanYeList;
          } else {
            this.messageError(res.data.msg);
          }
        })
        .catch(() => {
          this.messageError("服务器错误");
        });
    },
    // 打开导入对话框
    showScheduleImport() {
      this.$refs.uploadFile.clearFiles();
      this.importScheduleInfoModal = true;
    },
    // 关闭导入对话框
    closeScheduleImport() {
      this.importScheduleInfoModal = false;
      this.fileNameList = [];
      this.$refs.uploadFile.clearFiles();
    },
    downloadScheduleTemplate() {
      window.open(
        this.interfaceUrl + "teachingClassStudent/downloadBanjiTemplate"
      );
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

    // 导入课表信息
    importScheduleInfo() {
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
        .post(
          that.interfaceUrl + "teachingClassStudent/teachingClassStudentImport",
          that.qs(data)
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.importScheduleInfoModal = false;
            that.fileNameList = [];
            that.getTeachingClass();
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
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    unSelectedMutiSelect(sel) {
      this.unSelectedStuMutiSelect = sel;
    },
    selectedMutiSelect(sel) {
      this.selectedStuMutiSelect = sel;
    },
    searchfindArrUnBoundStu() {
      this.unSelectedStuPage.pageNum = 1;
      this.findArrUnBoundStu();
    },
    // 查询未绑定学生
    findArrUnBoundStu() {
      let that = this;
      that.loading = true
      let data = {
        pageNum: this.unSelectedStuPage.pageNum,
        pageSize: this.unSelectedClassPage.pageSize,
        teachingClassId: this.classId,
        xm: this.searchData.studentName
      };
      that.axios
        .post(
          that.interfaceUrl + "teachingClassStudent/findArrUnBoundStu",
          that.qs(data)
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.unSelectedStuPage.totalNum = res.data.dataCount;
            that.unSelectedStu = res.data.data;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 查询已绑定学生
    findAllBoundStu() {
      let that = this;
      that.loading = true
      let data = {
        pageNum: this.SelectedStuPage.pageNum,
        pageSize: this.SelectedClassPage.pageSize,
        teachingClassId: this.classId,
      };
      that.axios
        .post(
          that.interfaceUrl + "teachingClassStudent/findAllBoundStu",
          that.qs(data)
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.SelectedStuPage.totalNum = res.data.dataCount;
            that.selectedStu = res.data.data;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    setPageNum(page){
      // 判断页面位置，当删除表格的一个元素后，页面数据刚好等于分页尺寸的倍数时，页码才进行减一, 处理每次删除表格中的数据项，都需要跳回第一页的情况
      if (page.pageNum !== 1 && (page.totalNum - 1) % page.pageSize === 0) {
        page.pageNum -= 1;
      }
    },

    // 将学生绑定到教学班
    bindStu(row) {
      let idArr = [];
      if (!row.id) {
        this.unSelectedStuMutiSelect.forEach((item) => {
          idArr.push(item.id);
        });
        if (idArr.length == 0) {
          this.$Message.error({
            title: "提示",
            content: "请选择要关联的学生",
          });
          return;
        }
      }
      let that = this;
      let data = {
        classId: this.classId, // 教学班id
        studentId: row.id ? row.id : idArr, //学生id
      };
      that.axios
        .post(that.interfaceUrl + "teachingClassStudent/bindStu", that.qs(data))
        .then(function (res) {
          console.log(res);
          if (res.data.state) {
            that.unSelectedStuMutiSelect = [];
            that.selectedStuMutiSelect = [];
            that.setPageNum(that.unSelectedStuPage);
            that.findArrUnBoundStu();
            that.findAllBoundStu();
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    // 学生解绑教学班
    unBoundStu(row) {
      let idArr = [];
      if (!row.id) {
        this.selectedStuMutiSelect.forEach((item) => {
          idArr.push(item.id);
        });
        if (idArr.length == 0) {
          this.$Message.error({
            title: "提示",
            content: "请选择要解除关联的学生",
          });
          return;
        }
      }

      let that = this;
      let data = {
        id: row.id ? row.id : idArr,
      };
      that.axios
        .post(
          that.interfaceUrl + "teachingClassStudent/unBoundStu",
          that.qs(data)
        )
        .then(function (res) {
          console.log(res);
          if (res.data.state) {
            that.unSelectedStuMutiSelect = [];
            that.selectedStuMutiSelect = [];
            that.setPageNum(that.SelectedStuPage);
            that.findArrUnBoundStu();
            that.findAllBoundStu();
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    showStu(row) {
      this.classId = row.id;
      this.searchData.studentName = ''
      this.findArrUnBoundStu();
      this.findAllBoundStu();
      this.showStuModal = true;
    },

    showStuModalClose() {
      this.showStuModal = false;
      this.banjiStu = false;
      this.getTeachingClass()
      this.unSelectedStuPage.pageNum = 1;
      this.SelectedStuPage.pageNum = 1;
    },

    changeunSelectedStuPage(i) {
      this.unSelectedStuPage.pageNum = i;
      this.findArrUnBoundStu();
    },
    changeSelectedStuPage(i) {
      this.SelectedStuPage.pageNum = i;
      this.findAllBoundStu();
    },
    openNotBoundStu() {
      this.banjiStu = !this.banjiStu;
    },

    // 关联行政班按钮的点击事件
    showAdm(row) {
      this.adminClassId = [];
      this.searchData.bjmc = ''
      this.showAdmModal = true;
      this.curSelTeachingClassId = row.id;
      this.getTeachingClass(true)
    },
    // 点击关联按钮
    handleRelevance(row) {
      this.adminClassId.push(row.id);
      this.relevance();
    },
    // 点击移除关联按钮
    handleRelevanceRemove(row) {
      let index = this.selectedClass.findIndex((item0) => item0.id === row.id);
      this.adminClassId.splice(index, 1);
      this.relevance();
    },
    // 关联行政部的保存按钮
    relevance() {
      let that = this;
      let data = {
        teachingClassId: this.curSelTeachingClassId,
        adminClassId: this.adminClassId,
      };
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "tkTeachingClass/relationTCAndBJ",
          that.qs(data)
        )
        .then(function (res) {
          // console.log(res)
          that.loading = false;
          that.getTeachingClass(true);
          if (res.data.state) {
            that.$Message.success("保存成功");
            // that.showAdmModal = false;
            // that.getTeachingClass();
            // that.adminClassId = [];
            // that.selectedClass = [];
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 点击搜索
    searchTeachingClass() {
      this.page.pageNum = 1;
      this.getTeachingClass();
    },

    //模糊查找行政班级
    searchBanji() {
      this.page.pageNum = 1;
      // console.log(this.searchData);
      this.getBanji();
    },

    // 获取行政班级
    getBanji() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 999999999,

        bjmc: that.searchData.bjmc ? that.searchData.bjmc : "",

        teachingClassId: that.curSelTeachingClassId,
      };
      that.axios
        .post(that.interfaceUrl + "banji/selectAllByPage", that.qs(data))
        .then(function (res) {
          // console.log(res)
          if (res.data.state) {
            if (res.data.dataCount) {
              that.unSelectedClassPage.totalNum = res.data.dataCount;
              that.unSelectedClass = res.data.banJiList;
              if (that.allUnSelectedClass.length == 0) {
                that.allUnSelectedClass = [...res.data.banJiList];
              }
            } else {
              that.unSelectedClass = [];
            }
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    // 获取所授课程
    getCourses() {
      let that = this;
      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,
      };
      that.axios
        .post(that.interfaceUrl + "tkTeachingClass/findCourses", that.qs(data))
        .then(function (res) {
          // console.log(res)
          if (res.data.state) {
            that.courseList = res.data.AdminTeachingClassList;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    // 获取教学班的数据
    getTeachingClass(relevance) {
      let that = this;
      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,

        keyword: that.searchData.keyword ? that.searchData.keyword : "",

        teachingClassName: that.searchData.teachingClassName
          ? that.searchData.teachingClassName
          : "",
        teachingTeacherId: that.searchData.teachingTeacherId
          ? that.searchData.teachingTeacherId * 1
          : "",
        courseId: that.searchData.courseId ? that.searchData.courseId * 1 : "",
        termId: that.searchData.termId ? that.searchData.termId : "",
      };
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "tkTeachingClass/selectAllByPage",
          that.qs(data)
        )
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.TeachingClassList;
            that.AdminTeachingClassList = res.data.AdminTeachingClassList
              ? res.data.AdminTeachingClassList
              : [];
            that.loading = false;
            if (relevance) {
              that.getBanji();
            }
            that.selectedClass = that.AdminTeachingClassList[that.curSelTeachingClassId]
              ? that.deepClone(that.AdminTeachingClassList[that.curSelTeachingClassId], [])
              : [];
            that.adminClassId = [];
            that.selectedClass.forEach((item) => {
              that.adminClassId.push(item.id);
            });
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    changePage(i) {
      this.page.pageNum = i;
      this.getTeachingClass();
    },

    // 未关联行政班的分页
    changeunSelectedClassPage(i) {
      this.unSelectedClassPage.pageNum = i;
      this.getBanji();
    },

    // 已关联行政班的分页
    changeSelectedClassPage(i) {
      this.unSelectedClassPage.pageNum = i;
      this.getBanji();
    },

    // 获取授课老师
    getTeacher() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 9999,
      };
      that.axios
        .post(that.interfaceUrl + "teacher/selectAllByPage", that.qs(data))
        .then(function (res) {
          // console.log(res)
          if (res.data.state) {
            that.teacherList = res.data.teacherList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    getTerms() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "term/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 999,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.termTableData = res.data.termList?res.data.termList:[];
            that.termTableData.sort((a, b) => new Date(a.beginDate).getTime() - new Date(b.beginDate).getTime());
            let stamp = new Date().getTime();
            that.termTableData.forEach((item) => {
              let start = new Date(item.beginDate).getTime();
              let end = new Date(item.endDate).getTime();
              if (start <= stamp && stamp <= end) {
                that.searchData.termId = item.id;
                that.data.termId = item.id;
              }
            });
            that.getTeachingClass();
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 点击新增按钮和修改按钮
    show(row) {
      if (row.id) {
        // console.log(row.teachingTeacherId)
        this.title = "修改教学班";
        this.data.id = row.id;
        this.data.classNum = row.teachingClassNum;
        this.data.className = row.teachingClassName;
        this.data.courseName = row.courseId;
        // this.data.teacher = row.teachingTeacherId+'';
        this.data.teacher = row.teachingTeacherId;
        this.data.classroomPeopleNum = row.classroomPeopleNum;
        this.data.termId = row.termId * 1;
        this.data.classNo = row.classNo;
        this.data.zhuanyeId = row.majorId;
      } else {
        this.title = "新增教学班";
        this.data.id = "";
        this.data.classNum = "";
        this.data.className = "";
        this.data.courseName = "";
        this.data.teacher = "";
        this.data.classroomPeopleNum = 0;
        this.$nextTick(function () {
          this.data.teacherId = "";
        });
        this.data.courseNameId = "";
        this.curTeacher.xm = "";
        // this.data.termId = "";
        this.data.classNo = "";
        this.data.zhuanyeId = "";
      }
      this.showUpdeteModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["teachingClassComp"].validate((valid) => {
        console.log(valid);
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
        classNum: that.data.classNum,
        teachingClassName: that.data.className,
        teachingTeacherId: that.data.teacher * 1,
        courseId: that.data.courseName,
        classroomPeopleNum: that.data.classroomPeopleNum,
        termId: that.data.termId,
        majorId: this.data.zhuanyeId
      };
      // console.log(data)
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "tkTeachingClass/dealTeachingClass",
          that.qs(data)
        )
        .then(function (res) {
          // console.log(data)
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showUpdeteModal = false;
            that.getTeachingClass();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.loading = false;
          that.messageError("服务器错误");
        });
    },

    modalClose() {
      this.showModal = false;
    },
    updeteModalClose() {
      this.showUpdeteModal = false;
      this.$refs["teachingClassComp"].resetFields();
    },
    showAdmModalClose() {
      this.selectedClass = [];
      this.adminClassId = [];
      this.showAdmModal = false;
      this.banjiStu = false;
    },

    // 删除按钮的点击事件
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.teachingClassName + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "tkTeachingClass/deleteById",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getTeachingClass();
              } else {
                that.$Message.error(res.data.msg);
              }
            })
            .catch(function (e) {
              that.loading = false;
              that.messageError("服务器错误" + e);
            });
        },
      });
    },
    formatDate(timeStamp) {
      let time = new Date(timeStamp),
        y = time.getFullYear(),
        m = time.getMonth() + 1,
        d = time.getDate(),
        h = time.getHours(),
        mm = time.getMinutes(),
        s = time.getSeconds();
      return (
        y +
        "-" +
        this.add0(m) +
        "-" +
        this.add0(d) +
        " " +
        this.add0(h) +
        ":" +
        this.add0(mm) +
        ":" +
        this.add0(s)
      );
    },
    add0(m) {
      return m < 10 ? "0" + m : m;
    },

    // 实现深拷贝
    deepClone(origin, target) {
      let newTarget = target || [];
      // 1.遍历对象
      for (let prop in origin) {
        // 2.判断是否为引用值
        if (origin[prop] !== "null" && typeof origin[prop] == "object") {
          // 3.判断引用值是数组还是对象
          // 4.建立新的数组或对象
          newTarget[prop] =
            Object.prototype.toString.call(origin[prop]) == "[object Array]"
              ? []
              : {};
          // 5.递归调用，实现多层拷贝
          this.deepClone(origin[prop], newTarget[prop]);
        } else {
          newTarget[prop] = origin[prop];
        }
      }
      return newTarget;
    },
  },
};
</script>

<style scoped>
.content .teachingClass {
  height: 100%;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.modal {
  padding-left: 0px;
}

.formInput {
  width: 240px;
}

.page {
  text-align: center;
  margin-top: 39px;
}

.banji_stu_right {
  width: 0;
  height: 0;
  overflow: hidden;
}
.open_bound {
  display: flex;
  justify-content: center;
  transition: all 0.4s;
}
.open_bound .banji_stu_left {
  width: 600px;
  border-right: 1px solid #dcdee2;
  padding-right: 16px;
}
.open_bound .banji_stu_right {
  width: auto;
  height: auto;
  padding-left: 16px;
  flex-shrink: 0;
  flex: 1;
}
</style>
