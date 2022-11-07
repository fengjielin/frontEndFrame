<template>
  <div class="content scheduleInit">
    <ButtonGroup
      style="margin-bottom: 24px; display: flex; justify-content: center"
    >
      <Button
        v-for="(item, index) in btn"
        :key="index"
        :type="activeIndex == index ? 'primary' : 'default'"
        @click="changeBtn(index)"
        >{{ item }}
      </Button>
    </ButtonGroup>
    <div style="margin-bottom: 10px" v-if="activeIndex != 3">
      <label for="">所属学期： </label>
      <Select
        v-model="searchData.termId"
        style="width: 225px"
        @on-change="searchScheduleOverview"
      >
        <Option v-for="item in termList" :value="item.id" :key="item.id"
          >{{ item.termName }}
        </Option>
      </Select>
    </div>
    <!-- 课表初始化 -->
    <div v-show="activeIndex == 0">
      <!-- 功能键区域 -->
      <div
        class="notice_search_area"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div class="search_item">
          <div>
            <label for="">教室：</label>
            <Select
              v-model="searchData.classroomId"
              style="width: 200px"
              @on-change="searchScheduleOverview"
              clearable
              :filterable="true"
            >
              <Option
                v-for="item in classroomList2"
                :value="item.id"
                :key="item.id"
                :label="item.buildingName+'-'+item.className"
              >
              </Option>
            </Select>
          </div>
          <div>
            <label for="">教学班：</label>
            <Select
              v-model="searchData.teachingClassId"
              style="width: 200px"
              @on-change="searchScheduleOverview"
              clearable
              :filterable="true"
            >
              <Option
                v-for="item in teachingClassList"
                :value="item.id"
                :key="item.id"
                :label="item.teachingClassName +'('+ item.courseName + ')'"
              >
              </Option>
            </Select>
          </div>
          <div>
            <label for="">课程：</label>
            <Select
              v-model="searchData.courseId"
              style="width: 200px"
              @on-change="searchScheduleOverview"
              clearable
              :filterable="true"
            >
              <Option
                v-for="item in courseSetList"
                :value="item.id"
                :key="item.id"
                :label="item.courseName"
              >
              </Option>
            </Select>
          </div>
          <div>
            <label for="">授课教师：</label>
            <Select
              v-model="searchData.teacherId"
              style="width: 200px"
              :filterable="true"
              @on-change="searchScheduleOverview"
              clearable
            >
              <Option
                v-for="item in teacherList"
                :value="item.id"
                :key="item.id"
                :label="item.xm"
              ></Option>
            </Select>
          </div>
        </div>
        <div>
          <!-- <Button @click="searchScheduleOverview" type="primary" style="margin: 5px;">搜索</Button> -->
          <Button @click="showClassNumModal" type="primary" style="margin: 5px"
            >查看课时数</Button
          >
          <Button
            @click="showScheduleImport"
            style="margin: 5px"
            type="primary"
            v-if="checkAuth(['KBGL_IMPORT'])"
            >导入院系课表</Button
          >
          <Button
            @click="downloadScheduleTemplate"
            style="margin: 5px"
            type="primary"
            ghost
            v-if="checkAuth(['KBGL_IMPORT'])"
            >下载导入模板</Button
          >
        </div>
      </div>
      <div class="courseInfo mt16">
        <!-- 表格区域 -->
        <div>
          <Table
            border
            :loading="loading"
            :columns="columns"
            :data="tksList"
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

        <!-- 导入的对话框 -->
        <Modal
          v-model="importScheduleInfoModal"
          :closable="true"
          :mask-closable="false"
          title="课表信息导入"
          width="400px"
          @on-cancel="closeScheduleImport"
        >
          <div style="padding: 0 30px">
            <div
              style="
                margin-bottom: 24px;
                display: flex;
                justify-content: center;
              "
            >
              <label for="" style="line-height: 32px">所属学期： </label>
              <Select v-model="importModalTermId" style="width: 225px">
                <Option v-for="item in termList" :value="item.id" :key="item.id"
                  >{{ item.termName }}
                </Option>
              </Select>
            </div>
            <div style="display: flex; justify-content: center">
              <label for="" style="line-height: 32px">课表上传： </label>
              <Upload
                ref="uploadFile"
                :action="actionUrl"
                show-upload-list
                :on-success="handleSuccess"
                :format="['xls', 'xlsx']"
                :on-format-error="formatError"
                :on-remove="removeFile"
                style="width: 225px"
              >
                <!-- 可互动按钮 -->
                <Button
                  v-if="fileNameList.length <= 0"
                  type="primary"
                  ghost
                  icon="ios-cloud-upload-outline"
                  >上传</Button
                >
                <!-- 不可互动按钮 -->
                <Button
                  v-if="fileNameList.length > 0"
                  type="primary"
                  ghost
                  icon="ios-cloud-upload-outline"
                  disabled
                  >上传</Button
                >
              </Upload>
            </div>
          </div>
          <div slot="footer" style="text-align: center">
            <Button @click="closeScheduleImport">取消</Button>
            <Button
              type="primary"
              @click="importScheduleInfo"
              :loading="loading"
              >确认导入</Button
            >
          </div>
        </Modal>

        <!-- 查看课时数 -->
        <Modal
          v-model="classNumModal"
          :closable="true"
          :mask-closable="false"
          title="查看课时数"
          width="1400px"
          @on-cancel="closeClassNumModal"
        >
          <div
            class="notice_search_area"
            style="display: flex; justify-content: flex-end"
          >
            <Form
              :model="searchClassNumData"
              :label-width="100"
              inline
              style="flex: 1"
            >
              <FormItem label="教学班：">
                <Select
                  v-model="searchClassNumData.teachingClassId"
                  style="width: 120px"
                  @on-change="searchClassNum"
                  clearable
                  :filterable="true"
                >
                  <Option
                    v-for="item in teachingClassList"
                    :value="item.id"
                    :key="item.id"
                    :label="item.teachingClassName"
                  >
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="课程：">
                <Select
                  v-model="searchClassNumData.courseId"
                  style="width: 120px"
                  @on-change="searchClassNum"
                  clearable
                  :filterable="true"
                >
                  <Option
                    v-for="item in courseSetList"
                    :value="item.id"
                    :key="item.id"
                    :label="item.courseName"
                  >
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="授课教师：">
                <Select
                  v-model="searchClassNumData.teacherId"
                  style="width: 240px"
                  :filterable="true"
                  @on-change="searchClassNum"
                  clearable
                >
                  <Option
                    v-for="item in teacherList"
                    :value="item.id"
                    :key="item.id"
                    :label="item.xm"
                  >
                  </Option>
                </Select>
              </FormItem>
              <!-- <FormItem label="" style="position: absolute; right: 20px;">
							<Button @click="getClassNum" type="primary" style="margin-right: 5px;">搜索</Button>
						</FormItem> -->
            </Form>
          </div>
          <!-- 表格区域 -->
          <div>
            <Table
              border
              :loading="loading"
              :columns="classNumColumns"
              :data="classNumList"
              show-summary
            >
            </Table>
            <!-- 分页 -->
            <Page
              @on-change="changeClassNumPage"
              :total="classNumPage.totalNum"
              :current="classNumPage.pageNum"
              :page-size="classNumPage.pageSize"
              show-elevator
              show-total
              class="page"
            />
          </div>
          <div slot="footer" style="text-align: center">
            <Button @click="closeClassNumModal">取消</Button>
          </div>
        </Modal>
      </div>
    </div>

    <!-- 教室课表 -->
    <div
      class="schedule_box"
      v-show="activeIndex == 1"
      style="overflow-y: auto"
    >
      <div
        class="searchZone"
        style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        "
      >
        <div>
          <span class="curTime">当前时间：{{ getCurTime }}</span>
          <Select
            v-model="search.classroomWeekly"
            style="width: 88px; margin-left: 10px; margin-right: 10px"
            @on-change="searchClassSchedule"
          >
            <Option
              :value="item.weekNum"
              v-for="(item, index) in weeklys"
              :key="index"
            >
              {{ item.weekName }}
            </Option>
          </Select>
          <CheckboxGroup
            style="display: inline-block"
            v-model="search.classroomWeek"
            @on-change="getSchedule"
          >
            <Checkbox
              :label="item.code"
              v-for="(item, index) in weeks"
              :key="index"
              :disabled="search.classroomWeek[0] == item.code"
              >{{ item.str }}</Checkbox
            >
          </CheckboxGroup>
        </div>
        <div>
          <Select
            style="width: 200px; margin-right: 10px"
            placeholder="请选择楼栋"
            v-model="search.buildingId"
            @on-change="searchClassSchedule"
          >
            <Option
              :value="item.id"
              v-for="(item, index) in buildings"
              :key="index"
              >{{ item.buildingName }}
            </Option>
          </Select>
          <Button type="primary" @click="exportData">
            <Icon type="ios-download-outline"></Icon>导出教室总表
          </Button>
        </div>
      </div>

      <div id="table_box">
        <Table
          ref="table"
          :loading="loading"
          :disabled-hover="true"
          :columns="classroomScheduleColumns"
          :data="classroomScheduleData"
          border
          class="classroomTable"
          :span-method="handleSpan"
        >
        </Table>
      </div>
      <!-- 添加上课信息 -->
      <Modal v-model="classroomModal" :title="title">
        <Form :model="classroomModelData" :label-width="88">
          <FormItem label="授课老师:">
            <Select
              filterable
              size="small"
              @on-change="getCourse"
              v-model="classroomModelData.teacherId"
              style="width: 160px"
            >
              <Option
                :value="item.id"
                v-for="(item, index) in teacherList"
                :key="index"
                :label="item.xm"
              ></Option>
            </Select>
          </FormItem>
          <FormItem label="课程名称:">
            <Select
              size="small"
              v-model="classroomModelData.courseId"
              style="width: 160px"
              @on-change="getClassName"
            >
              <Option
                :value="item.id"
                v-for="(item, index) in courseList2"
                :key="index"
              >
                {{ item.courseName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="班级名称:">
            <Select
              size="small"
              v-model="classroomModelData.teachingClassNameId"
              style="width: 160px"
            >
              <Option
                :value="item.id"
                v-for="(item, index) in classNames2"
                :key="index"
              >
                {{ item.teachingClassName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="节次:">
            <div>
              <CheckboxGroup v-model="classroomModelData.section">
                <Checkbox
                  :label="item.code"
                  v-for="(item, index) in allSection"
                  :key="index"
                >
                  {{ item.name }}
                </Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
          <FormItem label="适用周次:">
            <div>
              <CheckboxGroup v-model="classroomModelData.weekly">
                <Checkbox
                  :label="item.weekNum"
                  v-for="(item, index) in cutOutWeekly"
                  :key="index"
                >
                  {{ item.weekName }}
                </Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
        </Form>
        <div slot="footer" style="text-align: center">
          <Button @click="cancel">取消</Button>
          <Button type="primary" @click="ok" :loading="loading">添加</Button>
        </div>
      </Modal>
    </div>

    <!-- 教师课表 -->
    <div v-if="activeIndex == 2" class="teacherScheduleBox schedule_box">
      <div class="content2">
        <div class="searchZone">
          <span class="curTime">当前时间：{{ getCurTime }}</span>
          <Select
            @on-change="searchClassSchedule"
            v-model="search.teacherWeekly"
            style="width: 160px; margin-left: 10px; margin-right: 10px"
          >
            <Option
              :value="item.weekNum"
              v-for="(item, index) in weeklys"
              :key="index"
            >
              {{ item.weekName }}
            </Option>
          </Select>
          <Select
            filterable
            @on-change="searchClassSchedule"
            v-model="search.teacherId"
            style="width: 160px; margin-left: 10px; margin-right: 10px"
          >
            <Option
              :value="item.id"
              v-for="(item, index) in teacherList"
              :key="index"
              :label="item.xm"
            >
            </Option>
          </Select>
        </div>
        <div>
          <Table
            :disabled-hover="true"
            border
            :loading="loading"
            :columns="teacherScheduleColumns"
            :data="teacherScheduleData"
            :span-method="handleSpan"
            style="margin: 32px 24px 0px"
          ></Table>
        </div>
      </div>
      <div class="adjustCourse">
        <div class="title">新增课程信息</div>

        <div class="adjustToDefault" v-if="adjustTo == 0"></div>

        <div class="adjustToForm" v-if="adjustTo == 2">
          <Form
            :model="adjustCourseData"
            :label-width="55"
            ref="adjustCourseDataRef"
          >
            <FormItem label="课程:">
              <Select
                size="small"
                v-model="adjustCourseData.courseId"
                style="width: 160px"
                @on-change="getClassName"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in courseList"
                  :key="index"
                >
                  {{ item.courseName }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="班级:">
              <Select
                size="small"
                v-model="adjustCourseData.classNameId"
                style="width: 160px"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in classNames"
                  :key="index"
                >
                  {{ item.teachingClassName }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="教室:">
              <Select
                size="small"
                v-model="search.buildingId"
                style="width: 160px"
                placeholder="请选择楼栋"
                @on-change="getClassroom2"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in buildings"
                  :key="index"
                >
                  {{ item.buildingName }}
                </Option>
              </Select>
              <Select
                size="small"
                v-model="adjustCourseData.classroomId"
                style="width: 160px"
                placeholder="请选择教室"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in classroomList"
                  :key="index"
                >
                  {{ item.className }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="星期:">
              {{ adjustCourseData.week | weekStrToCode }}
            </FormItem>
            <FormItem label="节次:">
              <div style="height: 100px; overflow-y: auto">
                <CheckboxGroup v-model="adjustCourseData.section">
                  <Checkbox
                    :label="item.code"
                    v-for="(item, index) in allSection"
                    :key="index"
                  >
                    {{ item.name }}
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
            <FormItem label="周次:">
              <div style="height: 100px; overflow-y: auto">
                <CheckboxGroup v-model="adjustCourseData.weekly">
                  <Checkbox
                    :label="item.weekNum"
                    v-for="(item, index) in cutOutWeekly"
                    :key="index"
                  >
                    {{ item.weekName }}
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
          </Form>
          <div class="footer">
            <Button
              style="margin-right: 20px; background-color: #ff763f; color: #fff"
              @click="sendAdjustToForm"
              >确认添加</Button
            >
            <Button
              style="color: #ff763f; border: 1px solid #ff4900"
              @click="adjustTo = 0"
              >取消</Button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 班级周课表 -->
    <div
      class="schedule_box"
      v-show="activeIndex == 3"
      style="overflow-y: auto"
    >
      <!-- 表格上方功能区 -->
      <div
        class="searchZone"
        style="display: flex; justify-content: space-between; margin-bottom: 10px"
      >
        <span class="curTime">当前时间：{{ getCurTime }}</span>
        <div>
          <label for="">所属学期： </label>
          <Select
            v-model="searchData.termId"
            style="width: 225px"
            @on-change="searchScheduleOverview"
          >
            <Option v-for="item in termList" :value="item.id" :key="item.id"
              >{{ item.termName }}
            </Option>
          </Select>
          <Select
            @on-change="searchClassSchedule"
            v-model="search.weekly"
            style="width: 160px; margin-left: 10px; margin-right: 10px"
          >
            <Option
              :value="item.weekNum"
              v-for="(item, index) in weeklys"
              :key="index"
              >{{ item.weekName }}
            </Option>
          </Select>
          <Select
            filterable
            v-model="search.adminClassId"
            @on-change="searchClassSchedule"
            style="width: 200px"
          >
            <!-- 这个option不可以进行格式化，因为让它可以输入了，如果格式化会出现选项前面有空格的情况 -->
            <Option
              :value="item.adminClass.id"
              v-for="(item, index) in adminClass"
              :key="index"
              >{{ item.adminClass.bjmc }}</Option
            >
          </Select>
        </div>
      </div>
      <!-- 表格区域 -->
      <div style="overflow-y: auto">
        <Table
          :disabled-hover="true"
          border
          :loading="loading"
          :columns="classScheduleColumns"
          :data="classScheduleData"
          :span-method="handleSpan"
        ></Table>
      </div>
    </div>
  </div>
</template>

<script>
// import FileSaver from "file-saver";
// import XLSX from "xlsx";
export default {
  // 课程信息管理
  data() {
    return {
      // 按钮组
      btn: ["课表初始化", "教室课表", "教师课表", "班级周课表"],
      // 用于控制选择了那个按钮
      activeIndex: 0,

      // ==课表初始化====================================================
      termList: [],
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
      },
      loading: false,
      // 新增与修改对话框绑定的数据
      searchData: {
        classroomId: "",
        teachingClassId: "",
        courseId: "",
        teacherId: "",
        termId: "",
      },
      searchClassNumData: {
        teachingClassId: "",
        courseId: "",
        teacherId: "",
      },
      importModalTermId: "",
      fileNameList: [],
      classNumList: [],
      columns: [
        {
          title: "课室",
          key: "className",
          align: "center",
          width: 150,
        },
        {
          title: "教学班",
          key: "teachingClassName",
          align: "center",
          minWidth: 200,
        },
        {
          title: "课程名称",
          key: "courseName",
          align: "center",
          minWidth: 200,
        },
        {
          title: "授课老师",
          key: "XM",
          align: "center",
          width: 130,
        },
        {
          title: "周次",
          key: "weekly",
          align: "center",
          width: 650,
          render: (h, params) => {
            let splitWeekly = params.row.weekly.split(",");
            let hs = [];
            for (let i = 0; i <= 20; i++) {
              let count = 0;
              for (let j = 0; j < splitWeekly.length; j++) {
                if (splitWeekly[j] == i) {
                  count++;
                }
              }
              if (count > 0) {
                var s = h(
                  "div",
                  {
                    style: {
                      width: "25px",
                      height: "24px",
                      marginRight: "5px",
                      paddingTop: "3px",
                      paddingRight: "1px",
                      background: "#1b81ff",
                      borderRadius: "50%",
                      color: "#FFFFFF",
                    },
                  },
                  i + 1
                );
              } else {
                var s = h(
                  "div",
                  {
                    style: {
                      width: "25px",
                      height: "24px",
                      marginRight: "5px",
                      paddingTop: "3px",
                      paddingRight: "1px",
                      background: "#fff",
                      border: "1px solid #E0E0E0",
                      borderRadius: "50%",
                      color: "#010101",
                    },
                  },
                  i + 1
                );
              }
              hs.push(s);
            }
            return h(
              "div",
              {
                style: {
                  display: "Flex",
                },
              },
              hs
            );
          },
        },
        {
          title: "星期",
          key: "week",
          align: "center",
          width: 300,
          render: (h, params) => {
            let splitWeek = params.row.week.split(",");
            let hs = [];
            for (let j = 0; j < splitWeek.length; j++) {
              var wn = this.toWeekName(splitWeek[j]);
              hs.push(wn);
            }
            return h(
              "div",
              {
                style: {
                  display: "Flex",
                },
              },
              hs
            );
          },
        },
        {
          title: "节次",
          key: "section",
          align: "center",
          width: 200,
        },
      ],
      classNumColumns: [
        {
          title: "班级",
          key: "teachingClassName",
          align: "center",
          minWidth: 200,
        },
        {
          title: "课程名称",
          key: "courseName",
          align: "center",
          minWidth: 200,
        },
        {
          title: "授课老师",
          key: "XM",
          align: "center",
          width: 120,
        },
        {
          title: "周次",
          align: "center",
          width: 650,
          render: (h, params) => {
            let splitWeekly = params.row.weekly.split(",");
            let hs = [];
            for (let i = 0; i <= 20; i++) {
              let count = 0;
              for (let j = 0; j < splitWeekly.length; j++) {
                if (i == splitWeekly[j]) {
                  count++;
                }
              }
              if (count > 0) {
                var s = h(
                  "div",
                  {
                    style: {
                      width: "25px",
                      height: "24px",
                      marginRight: "5px",
                      paddingTop: "3px",
                      paddingRight: "1px",
                      background: "#1b81ff",
                      borderRadius: "50%",
                      color: "#FFFFFF",
                    },
                  },
                  i + 1
                );
              } else {
                var s = h(
                  "div",
                  {
                    style: {
                      width: "25px",
                      height: "24px",
                      marginRight: "5px",
                      paddingTop: "3px",
                      paddingRight: "1px",
                      background: "#cccccc",
                      borderRadius: "50%",
                      color: "#010101",
                    },
                  },
                  i + 1
                );
              }
              hs.push(s);
            }
            return h(
              "div",
              {
                style: {
                  display: "Flex",
                },
              },
              hs
            );
          },
        },
        {
          title: "周课时",
          key: "weekClassNum",
          align: "center",
          width: 80,
        },
        {
          title: "总课时",
          key: "sumClassNum",
          align: "center",
          width: 80,
        },
      ],
      classroomList: [],
      teachingClassList: [],
      courseSetList: [],
      tksList: [],
      teacherList: [],
      // 表格绑定的课程信息数据
      // 分页管理
      page: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 0,
      },
      classNumPage: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 10,
      },
      // 控制对话框的显示与隐藏
      showModal: false,

      title: "",
      courseNumModal: false,
      // 控制导入对话框的显示与隐藏
      importScheduleInfoModal: false,
      // 上传的地址
      actionUrl: this.interfaceUrl + "tkScheduleInfo/filesUpload",
      classNumModal: false,
      currentTerm: {},

      // =============================================================

      // 控制调课操作信息的切换
      adjustTo: 0,
      conflict: false,

      // 教室课程中 控制添加上课信息的对话框
      classroomModal: false,

      title: "",

      // 是否同步更新后续周次课表
      isSync: false,

      loading: false,

      // 当前的时间
      curTime: "",
      // 表格上方的搜索
      search: {
        classroomWeekly: "",
        classroomWeek: [],
        buildingId: "",

        weekly: "",
        classNameId: "",
        adminClassId: "",

        teacherWeekly: "",
        teacherId: "",
      },
      // 行政班数据
      adminClass: [],
      // 教室课表
      classroomScheduleColumns: [],

      classroomScheduleData: [],

      // 教师课表
      teacherScheduleColumns: [
        {
          title: "节次",
          key: "name",
          align: "center",
          width: 87,
          className: "codeStyle",
        },
        {
          title: "星期一",
          key: "week1",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            return this.getColumns(h, params, "1", params.row.week1);
          },
        },
        {
          title: "星期二",
          key: "week2",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "2", params.row.week2);
          },
        },
        {
          title: "星期三",
          key: "week3",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "3", params.row.week3);
          },
        },
        {
          title: "星期四",
          key: "week4",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "4", params.row.week4);
          },
        },
        {
          title: "星期五",
          key: "week5",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "5", params.row.week5);
          },
        },
        {
          title: "星期六",
          key: "week6",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "6", params.row.week6);
          },
        },
        {
          title: "星期日",
          key: "week7",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "7", params.row.week7);
          },
        },
      ],
      teacherScheduleData: [],

      // 班级周课表
      classScheduleColumns: [
        {
          title: "节次",
          key: "name",
          align: "center",
          width: 100,
          className: "codeStyle",
        },
        {
          title: "星期一",
          key: "week1",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            return this.getColumns(h, params, "1", params.row.week1);
          },
        },
        {
          title: "星期二",
          key: "week2",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "2", params.row.week2);
          },
        },
        {
          title: "星期三",
          key: "week3",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "3", params.row.week3);
          },
        },
        {
          title: "星期四",
          key: "week4",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "4", params.row.week4);
          },
        },
        {
          title: "星期五",
          key: "week5",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "5", params.row.week5);
          },
        },
        {
          title: "星期六",
          key: "week6",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "6", params.row.week6);
          },
        },
        {
          title: "星期日",
          key: "week7",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "7", params.row.week7);
          },
        },
      ],
      classScheduleData: [],

      // 调课操作信息中的绑定数据
      adjustCourseData: {
        courseId: "",
        classNameId: "",
        classroomId: "",
        week: "",
        section: [],
        weekly: [],
      },
      adjustCourseInfoData: {
        adjustCourseObj: "",
        adjustCourseToObj: "",
        conflictScheduleObj: "",
        sq_arrangementMsg: "",
        bt_arrangementMsg: "",
      },

      // 教室课表 添加上课信息弹窗中的绑定数据
      classroomModelData: {
        teachingClassNameId: "",
        section: [],
        weekly: [],
        week: "",
        teacherId: "",
        courseId: "",
      },

      // 单元格是否进行了已经点击操作，false为已经点击
      again: true,
      // 控制调课操作信息的确认按钮的可用状态
      btnDisabled: true,

      // 一个中转，用于接收后端数据，后再封装到Data中
      allSection: [],
      classScheduleItems: [],
      teacherScheduleItems: [],
      classroomScheduleItems: [],

      // 当前学期
      curTerm: {},
      // 当前周次
      curWeekly: "",
      // 截取当前周次以及后面的周次
      cutOutWeekly: [],

      // 教师列表
      teacherList: [],

      // 星期
      weeks: [
        {
          code: 1,
          str: "星期一",
        },
        {
          code: 2,
          str: "星期二",
        },
        {
          code: 3,
          str: "星期三",
        },
        {
          code: 4,
          str: "星期四",
        },
        {
          code: 5,
          str: "星期五",
        },
        {
          code: 6,
          str: "星期六",
        },
        {
          code: 7,
          str: "星期日",
        },
      ],

      // 周次
      weeklys: [],

      // 楼栋信息
      buildings: [],

      // 教室信息
      classroomList: [],

      // 课程信息
      courseList: [],
      courseList2: [],

      // 班级信息
      classNames: [],
      classNames2: [],
      conflictSchedule: [],

      sortClassroomWeek: [],
      // 冲突数据是否相同重复
      repet: true,

      conflictNumFalg: false,

      classroomList2:[]
    };
  },
  created() {
    this.getTerms();
    this.getCourseInfo();
    this.getClassroom();
    this.getTeachingClass();
    this.getTeacher();

    this.getTeacher2();
    this.getTeachingClass2();
  },
  mounted() {
    // if (sessionStorage.currTerm) {
    //   this.curTerm = JSON.parse(sessionStorage.currTerm);
    // } else {
    //   this.$Message.warning("未选择学期，请在左上角选择所属学期");
    // }
  },
  methods: {
    // 切换按钮
    changeBtn(index) {
      this.activeIndex = index;
      this.loading = false;
      // 1：教室课表，2：教师课表；3：班级周课表
      switch (index) {
        case 0:
          this.page.pageNum = 1;
          this.selectScheduleOverview();
          break;
        case 1:
          this.getBuilding();
          this.getClassName();
          break;
        case 2:
          this.getBuilding();
          this.getTeacher2();
          this.getSchedule();
          break;
        case 3:
          this.getSchedule();
          break;
      }
    },
    searchScheduleOverview() {
      this.getWeekly()
      if (this.activeIndex == 0) {
        this.page.pageNum = 1;
        this.selectScheduleOverview();
      } else {
        this.getSchedule();
      }
    },

    // ======================================================
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
            that.termList = res.data.termList;
            that.termList.sort((a, b) => new Date(a.beginDate).getTime() - new Date(b.beginDate).getTime()); // 升序
            let stamp = new Date().getTime();
            that.termList.forEach((item) => {
              let start = new Date(item.beginDate).getTime();
              let end = new Date(item.endDate).getTime();
              if (start <= stamp && stamp <= end) {
                that.searchData.termId = item.id;
              }
            });
            that.selectScheduleOverview();

            that.getWeekly();
            that.getSection();
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    downloadScheduleTemplate() {
      window.open(
        this.interfaceUrl + "tkScheduleInfo/downloadScheduleTemplate"
      );
    },
    showCourseNum() {
      this.courseNumModal = true;
      this.getCourseNum();
    },
    getCourseNum() {},
    // 打开导入对话框
    showScheduleImport() {
      this.$refs.uploadFile.clearFiles();
      this.importScheduleInfoModal = true;
      this.importModalTermId = this.searchData.termId
    },
    // 关闭导入对话框
    closeScheduleImport() {
      this.importScheduleInfoModal = false;
      this.fileNameList = [];
      this.$refs.uploadFile.clearFiles();
    },
    // 打开查看课时数
    showClassNumModal() {
      this.classNumModal = true;
      this.getClassNum();
    },
    searchClassNum() {
      this.classNumPage.pageNum = 1;
      this.getClassNum();
    },
    // 关闭查看课时数
    closeClassNumModal() {
      this.classNumModal = false;
    },
    getClassNum() {
      // this.currentTerm = JSON.parse(sessionStorage.currTerm);
      let that = this;
      that.loading = true;
      let data = {
        pageNum: that.classNumPage.pageNum,
        pageSize: that.classNumPage.pageSize,
        termId: that.searchData.termId ? that.searchData.termId : "",
        teachingClassId: that.searchClassNumData.teachingClassId
          ? that.searchClassNumData.teachingClassId
          : "",
        courseId: that.searchClassNumData.courseId
          ? that.searchClassNumData.courseId
          : "",
        teacherId: that.searchClassNumData.teacherId
          ? that.searchClassNumData.teacherId
          : "",
      };
      that.axios
        .post(
          that.interfaceUrl + "/tkScheduleInfo/selectClassNum",
          that.qs(data)
        )
        .then(function (res) {
          if (res.data.state) {
            that.classNumPage.totalNum = res.data.total;
            that.classNumList = res.data.classNumList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
        });
    },
    // 获取教室信息
    getClassroom() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "classroom/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 9999,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            if (res.data.classroomList) {
              that.classroomList2 = res.data.classroomList;
            } else {
              that.classroomList2 = [];
            }
          } else {
            that.classroomList2 = [];
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    // 获取教学班的数据
    getTeachingClass() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 9999,
      };
      that.axios
        .post(
          that.interfaceUrl + "tkTeachingClass/selectAllByPage",
          that.qs(data)
        )
        .then(function (res) {
          if (res.data.state) {
            that.teachingClassList = res.data.TeachingClassList;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    // 导入课表信息
    importScheduleInfo() {
      let that = this;
      // if (that.currentTerm.id == undefined || that.currentTerm.id == null) {
      if (!this.importModalTermId) {
        that.$Modal.error({
          title: "提示",
          content: "请选择学期",
          closable: true,
        });
        return;
      }
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
        // termId: that.currentTerm.id,
        termId: this.importModalTermId,
      };
      //console.log(data)
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "tkScheduleInfo/scheduleImport",
          that.qs(data)
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.importScheduleInfoModal = false;
            that.fileNameList = [];
            that.selectScheduleOverview();
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
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    //查找教师
    getTeacher() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 9999,
      };
      that.axios
        .post(that.interfaceUrl + "teacher/selectAllByPage", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.teacherList = res.data.teacherList;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    // 请求课程信息
    getCourseInfo() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 9999,
      };
      that.axios
        .post(that.interfaceUrl + "/courseSet/selectAllByPage", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.courseSetList = res.data.arrCourseSet;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
        });
    },
    selectScheduleOverview() {
      // this.currentTerm = JSON.parse(sessionStorage.currTerm);
      let that = this;
      that.loading = true;
      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,
        termId: that.searchData.termId ? that.searchData.termId : "",
        classroomId: that.searchData.classroomId
          ? that.searchData.classroomId
          : "",
        teachingClassId: that.searchData.teachingClassId
          ? that.searchData.teachingClassId
          : "",
        courseId: that.searchData.courseId ? that.searchData.courseId : "",
        teacherId: that.searchData.teacherId ? that.searchData.teacherId : "",
      };
      that.axios
        .post(
          that.interfaceUrl + "/tkScheduleInfo/selectScheduleOverview",
          that.qs(data)
        )
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.total;
            that.tksList = res.data.tksList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.messageError("服务器错误");
        });
    },
    // 改变页码
    changePage(i) {
      this.page.pageNum = i;
      this.selectScheduleOverview();
    },
    changeClassNumPage(i) {
      this.classNumPage.pageNum = i;
      this.getClassNum();
    },
    // 关闭新增或修改对话框
    modalClose() {
      this.showModal = false;
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
    toWeekName(num) {
      var weekday = new Array(7);
      weekday[0] = "星期一  ";
      weekday[1] = "星期二  ";
      weekday[2] = "星期三  ";
      weekday[3] = "星期四  ";
      weekday[4] = "星期五  ";
      weekday[5] = "星期六  ";
      weekday[6] = "星期日  ";
      return weekday[num - 1];
    },
    // ===============================================

    exportData() {
      let et = XLSX.utils.table_to_book(document.getElementById("table_box"));
      for (let key in et.Sheets.Sheet1) {
        if (
          Object.prototype.toString.call(et.Sheets.Sheet1[key]) ===
          "[object Object]"
        ) {
          et.Sheets.Sheet1[key].v = et.Sheets.Sheet1[key].v
            .toString()
            .replace(/\s+/g, "");
          //在表达的最下面一行会有'暂无筛选结果'，没有找到原因，所以也直接置空。
          if (et.Sheets.Sheet1[key].v == "暂无筛选结果") {
            et.Sheets.Sheet1[key].v = "";
          }
        }
      }
      let etout = XLSX.write(et, {
        bookType: "xlsx",
        bookSST: false,
        type: "array",
      });
      try {
        FileSaver.saveAs(
          new Blob([etout], {
            type: "application/octet-stream",
          }),
          "教室总表.xlsx"
        ); //trade-publish.xlsx 为导出的文件名
      } catch (e) {
        // console.log(e, etout);
      }
      return etout;
    },
    // 教室课表的多选框 与 课表的对应
    setWeekClassroomSchedule() {
      let classroomWeek = this.deepClone(this.search.classroomWeek);
      classroomWeek.sort((a, b) => a - b);
      this.sortClassroomWeek = classroomWeek;
      let week = null;
      this.classroomScheduleColumns = [];
      classroomWeek.forEach((item, i) => {
        switch (item) {
          case 1:
            week = "week1";
            this.setCourse(item, i, week, "星期一");
            break;
          case 2:
            week = "week2";
            this.setCourse(item, i, week, "星期二");
            break;
          case 3:
            week = "week3";
            this.setCourse(item, i, week, "星期三");
            break;
          case 4:
            week = "week4";
            this.setCourse(item, i, week, "星期四");
            break;
          case 5:
            week = "week5";
            this.setCourse(item, i, week, "星期五");
            break;
          case 6:
            week = "week6";
            this.setCourse(item, i, week, "星期六");
            break;
          case 7:
            week = "week7";
            this.setCourse(item, i, week, "星期日");
            break;
        }
      });
    },

    // 不同的星期应该生成不同的课程，不应该放在一起，会出现点击多个星期出现同样的课程安排
    setCourse(item, i, week, str) {
      if (i == 0) {
        let weekClassroomSchedule = {
          title: str,
          align: "center",
          children: [
            {
              title: "",
              key: "className",
              align: "center",
              width: 120,
              renderHeader: (h, params) => {
                return h(
                  "div",
                  {
                    style: {
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      "flex-direction": "column",
                    },
                  },
                  [
                    h(
                      "strong",
                      {
                        style: {
                          "margin-left": "40px",
                        },
                      },
                      "节次"
                    ),

                    h(
                      "strong",
                      {
                        style: {
                          "margin-right": "40px",
                        },
                      },
                      "地点"
                    ),
                    h(
                      "strong",
                      {
                        style: {
                          position: "absolute",
                          transform:
                            "rotate(30deg) translateY(-20px) translateX(-6px)",
                          color: "#e8eaec",
                          left: "0px",
                          top: "38px",
                        },
                      },
                      "_________________"
                    ),
                  ]
                );
              },
            },
          ],
        };
        this.allSection.forEach((e) => {
          let code = {
            title: e.name,
            key: e.code,
            align: "center",
            minWidth: 90,
            render: (h, params) => {
              return this.getClassroomColumns(
                h,
                params,
                week,
                e.code,
                params.row,
                str,
                item
              );
            },
          };
          weekClassroomSchedule.children.push(code);
        });
        this.classroomScheduleColumns.push(weekClassroomSchedule);
      } else {
        let weekClassroomSchedule = {
          title: str,
          align: "center",
          children: [],
        };
        this.allSection.forEach((e) => {
          let code = {
            title: e.name,
            key: e.code,
            align: "center",
            minWidth: 90,
            render: (h, params) => {
              return this.getClassroomColumns(
                h,
                params,
                week,
                e.code,
                params.row,
                str,
                item
              );
            },
          };
          weekClassroomSchedule.children.push(code);
        });
        this.classroomScheduleColumns.push(weekClassroomSchedule);
      }
    },

    // 教室课表，往单元格中渲染固定格式的信息
    getClassroomColumns(h, params, week, section, row, weekStr, item) {
      // 根据先前封装的数据中不同的情况渲染不一样的东西
      let curWeek = row[week] ? row[week][section] : "";
      let temp = null;
      temp = h("div", [
        curWeek.id
          ? h(
              "Dropdown",
              {
                props: {
                  transfer: true,
                  trigger: "click",
                },
              },
              [
                h(
                  "div",
                  {
                    style: {
                      cursor: "pointer",
                      margin: "8px 0",
                    },
                  },
                  [
                    h("div", [
                      h(
                        "div",
                        `${curWeek.courseName}(${this.formatWeekly(
                          curWeek.weeklyTotal
                        )})`
                      ),
                      h("div", curWeek.teacherName),
                      h("div", curWeek.teacherClassName),
                    ]),
                    // curWeek.item.length != 0 ?
                    // h("div", this.renderCell_classroom(h, curWeek)) :
                    // h("div", ""),
                  ]
                ),
                h(
                  "DropdownMenu",
                  {
                    slot: "list",
                  },
                  [
                    h(
                      "DropdownItem",
                      {
                        nativeOn: {
                          click: () => {
                            // console.log(params)
                            // params.column._index
                            // this.sortClassroomWeek
                            // 先判断是否小于于节次长度,说明是sortClassroomWeek中的第一个星期,
                            // 大于节次长度,判断params.column._index - 节次长度 , 一直减到小于节次长度,但不小于0,然后在判断对应于sortClassroomWeek中的第几个
                            let week = null;
                            let index = null;
                            if (
                              params.column._index <= this.allSection.length
                            ) {
                              index = 0;
                              week = `week${this.sortClassroomWeek[index]}`;
                            } else {
                              let len = this.sortClassroomWeek.length;
                              let diff = params.column._index;
                              for (let i = 0; i < len; i++) {
                                diff -= this.allSection.length;
                                if (diff <= this.allSection.length) {
                                  index = i + 1;
                                  break;
                                }
                              }
                              week = `week${this.sortClassroomWeek[index]}`;
                            }
                            this.removeCourse(
                              params.row[week][params.column.key],
                              params
                            );
                          },
                        },
                      },
                      "移除"
                    ),
                  ]
                ),
              ]
            )
          : h(
              "div",
              {
                attrs: {
                  class: "blankBox",
                },
                style: {
                  cursor: "pointer",
                  height: "60px",
                },
                on: {
                  click: () => {
                    this.showClassroomModel(params, weekStr, item);
                  },
                },
              },
              [
                h("Icon", {
                  style: {
                    color: "#ccc",
                  },
                  props: {
                    type: "md-add",
                  },
                }),
              ]
            ),
      ]);
      return temp;
    },

    // 渲染重叠项的数据, 复制班级周课表的
    renderCell_classroom(h, curWeek) {
      // console.log(curWeek)
      let temp = [];
      // 去重
      let curWeekClone = this.deepClone(curWeek.item);
      for (let i = 0; i < curWeekClone.length; i++) {
        for (let j = i + 1; j < curWeekClone.length; j++) {
          let i_info = `${curWeekClone[i].courseName},${curWeekClone[i].teacherName},${curWeekClone[i].className},${curWeekClone[i].teacherClassName}`;
          let j_info = `${curWeekClone[j].courseName},${curWeekClone[j].teacherName},${curWeekClone[j].className},${curWeekClone[j].teacherClassName}`;
          let k_info = `${curWeek.courseName},${curWeek.teacherName},${curWeek.className},${curWeek.teacherClassName}`;
          // 当重复的课程与自身一样
          if (k_info == i_info || k_info == j_info) {
            curWeekClone[i].already = 1;
            curWeekClone[j].already = 1;
          }
          // 当重复的课程里面一样的
          if (i_info == j_info) {
            curWeekClone[j].already = 1;
            curWeekClone[
              i
            ].section = `${curWeekClone[i].section},${curWeekClone[j].section}`;
          }
        }
      }
      for (let i = 0; i < curWeekClone.length; i++) {
        if (curWeekClone[i].already == 1) {
          continue;
        }
        temp.push(
          h(
            "div",
            {
              style: {},
            },
            [
              // 只需要教学班的信息，因为一个教师不可能同时上两门课程
              h("div", curWeekClone[i].teacherClassName),
            ]
          )
        );
      }
      return temp;
    },

    // 显示教室课表的添加上课信息的弹窗
    showClassroomModel(row, weekStr, weekCode) {
      let toWeekly = this.weeklys.find(
        (item) => item.weekNum == this.search.teacherWeekly
      );
      this.title = `添加上课信息 ( ${row.row.className} ${toWeekly.weekName} ${weekStr} ${row.column.title})`;

      let section = this.allSection.find(
        (item) => item.name == row.column.title
      ).code;

      this.classroomModelData.className = "";
      this.classroomModelData.section = [section];
      this.classroomModelData.weekly = [this.search.classroomWeekly];
      this.classroomModelData.week = weekCode;
      this.classroomModelData.classroom_id = row.row.id;
      this.classroomModal = true;
    },
    // 教室课表的对话框的确定跟取消
    ok() {
      let classroomModelData = this.classroomModelData;
      if (
        classroomModelData.teachingClassNameId &&
        classroomModelData.section.length != 0 &&
        classroomModelData.weekly.length != 0 &&
        classroomModelData.teacherId &&
        classroomModelData.courseId
      ) {
        let teachingClassName = this.classNames2.find(
          (item) => item.id == classroomModelData.teachingClassNameId
        );
        classroomModelData.section.sort((a, b) => a - b);
        let isContinuous = this.sectionIsContinuous(classroomModelData.section);
        if (teachingClassName) {
          let data = {
            scheduleId: "", //课表Id 新增则无，调课有
            to_weekly: classroomModelData.weekly.toString(), //调至周次 1,2,3
            to_week: classroomModelData.week, //调至星期
            to_section: classroomModelData.section.toString(), //调至节次 5,6
            to_classroom_id: classroomModelData.classroom_id, //调至教室
            teaching_class: teachingClassName.teachingClassName, //教学班
            teaching_class_id: classroomModelData.teachingClassNameId, //教学班
            teaching_teacher_id: teachingClassName.teachingTeacherId, //调至教师ID
            teaching_teacher_name: teachingClassName.teacherName,
            course_name: teachingClassName.courseName, //课程
            course_id: teachingClassName.courseId, //课程ID
            term_id: this.searchData.termId, //学期
            tkType: "T02", //临时调课T01 新增T02  影响后续的永久调课T03
            addWay: "classroom",
          };
          if (isContinuous) {
            this.adjustTo = 0;
            this.classesInOperation(data);
            this.classroomModal = false;
            this.cancel();
          } else {
            this.$Message.warning("所选节次需要连续，请重新选择");
          }
        }
      } else {
        this.$Modal.warning({
          title: "提示",
          content: "提交的表单不完整，请填充完整",
        });
      }
    },

    cancel() {
      this.classroomModal = false;
      this.classroomModelData.className = "";
      this.classroomModelData.section = [];
      this.classroomModelData.weekly = [];

      this.classNames2 = [];
      this.classroomModelData.teachingClassNameId = "";
      this.courseList2 = [];
      this.classroomModelData.courseId = "";
      this.classroomModelData.teacherId = "";
    },

    // 教师课表和班级课表 往单元格中渲染固定格式的信息
    getColumns(h, params, num, curWeek) {
      let temp = null;
      // console.log(curWeek)
      if (this.activeIndex == 2) {
        temp = h("div", [
          curWeek // 判断单元格内是否值
            ? h(
                "Dropdown",
                {
                  props: {
                    transfer: true,
                    trigger: "click",
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        cursor: "pointer",
                        margin: "8px 0",
                      },
                    },
                    [
                      h("div", [
                        h(
                          "div",
                          curWeek.courseName + "," + curWeek.teacherName
                        ),
                        h(
                          "div",
                          this.formatWeekly(curWeek.weeklyTotal).join(",")
                        ),
                        h(
                          "div",
                          curWeek.buildingName + "," + curWeek.className
                        ),
                        h("div", curWeek.teacherClassName),
                      ]),
                      // curWeek.item.length != 0 ?
                      // h("div", this.renderCell_classroom(h, curWeek)) :
                      // h("div", ""),
                    ]
                  ),
                  this.again // 判断当前点击的单元格是第一次点击还是第二次点击
                    ? h(
                        "DropdownMenu",
                        {
                          slot: "list",
                        },
                        [
                          // h(
                          //   "DropdownItem",
                          //   {
                          //     nativeOn: {
                          //       click: () => {
                          //         this.adjustTo = 1;
                          //         this.again = false;
                          //         this.courseTo(params);
                          //       },
                          //     },
                          //   },
                          //   "调至"
                          // ),
                          h(
                            "DropdownItem",
                            {
                              nativeOn: {
                                click: () => {
                                  this.removeCourse(
                                    params.row[params.column.key],
                                    params
                                  );
                                },
                              },
                            },
                            "移除"
                          ),
                        ]
                      )
                    : h(
                        "div",
                        {
                          style: {
                            cursor: "pointer",
                            position: "absolute",
                            top: "0",
                            width: "100%",
                            height: "80px",
                          },
                          on: {
                            click: (e) => {
                              e.stopPropagation(); // 阻止事件冒泡
                              this.btnDisabled = false;
                              this.isSync = false;
                              this.isConflict(params, true);
                            },
                          },
                        },
                        ""
                      ),
                ]
              )
            : h("div", [
                this.again
                  ? h(
                      "div",
                      {
                        attrs: {
                          class: "blankBox",
                        },
                        style: {
                          cursor: "pointer",
                          // margin: "8px 0",
                          width: "100%",
                          height: "60px",
                          color: "#fff",
                        },
                        on: {
                          click: () => {
                            this.adjustTo = 2;
                            this.addition(params, this.adjustCourseData);
                          },
                        },
                      },
                      [
                        h("Icon", {
                          style: {
                            color: "#ccc",
                          },
                          props: {
                            type: "md-add",
                          },
                        }),
                      ]
                    )
                  : h(
                      "div",
                      {
                        style: {
                          cursor: "pointer",
                          margin: "8px 0",
                          width: "160px",
                          height: "60px",
                          color: "#fff",
                        },
                        on: {
                          click: (e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            this.btnDisabled = false;
                            this.isSync = false;
                            // 当点击第二下的时候，应该是去请求后端，进行判断，第二下点击的位置（周几，第几节，那个教室）是否有课
                            this.isConflict(params);
                          },
                        },
                      },
                      ""
                    ),
              ]),
        ]);
      } else if (this.activeIndex == 3) {
        // console.log(curWeek)
        temp = h("div", [
          curWeek
            ? h(
                "div",
                {
                  style: {
                    margin: "8px 0",
                  },
                },
                [
                  h("div", [
                    h(
                      "div",
                      {
                        style: {
                          marginBottom: "16px",
                        },
                      },
                      [
                        h(
                          "div",
                          curWeek.courseName +
                            "," +
                            this.formatWeekly(curWeek.weeklyTotal).join(",") +
                            "," +
                            curWeek.teacherName
                        ),
                        h(
                          "div",
                          curWeek.buildingName + "," + curWeek.className
                        ),
                        h("div", curWeek.teacherClassName),
                        // h("div", `第${curWeek.section}节`)
                      ]
                    ),

                    curWeek.item.length != 0
                      ? h("div", this.renderCell(h, curWeek))
                      : h("div", ""),
                  ]),
                ]
              )
            : "",
        ]);
      }
      return temp;
    },

    // 渲染重叠项的数据
    renderCell(h, curWeek) {
      // console.log(curWeek)
      let temp = [];
      // 去重
      let curWeekClone = this.deepClone(curWeek.item);
      for (let i = 0; i < curWeekClone.length; i++) {
        for (let j = i + 1; j < curWeekClone.length; j++) {
          let i_info = `${curWeekClone[i].courseName},${curWeekClone[i].teacherName},${curWeekClone[i].className},${curWeekClone[i].teacherClassName}`;
          let j_info = `${curWeekClone[j].courseName},${curWeekClone[j].teacherName},${curWeekClone[j].className},${curWeekClone[j].teacherClassName}`;
          let k_info = `${curWeek.courseName},${curWeek.teacherName},${curWeek.className},${curWeek.teacherClassName}`;
          // 当重复的课程与自身一样
          if (k_info == i_info || k_info == j_info) {
            curWeekClone[i].already = 1;
            curWeekClone[j].already = 1;
          }
          // 当重复的课程里面一样的
          if (i_info == j_info) {
            curWeekClone[j].already = 1;
            // console.log(curWeekClone[j].section)
            curWeekClone[
              i
            ].section = `${curWeekClone[i].section},${curWeekClone[j].section}`;
          }
        }
      }
      for (let i = 0; i < curWeekClone.length; i++) {
        if (curWeekClone[i].already == 1) {
          continue;
        }
        let i_info = `${curWeekClone[i].courseName},${curWeekClone[i].teacherName},${curWeekClone[i].className}`;
        let k_info = `${curWeek.courseName},${curWeek.teacherName},${curWeek.className}`;
        if (i_info === k_info) {
          // 当主课程数据，跟重复数据完全一致时只需显示不同的班级即可，
          temp.push(
            h(
              "div",
              {
                style: {
                  marginBottom: "16px",
                },
              },
              [h("div", curWeekClone[i].teacherClassName)]
            )
          );
          continue;
        }
        // 不然就全部显示
        temp.push(
          h(
            "div",
            {
              style: {
                marginBottom: "16px",
              },
            },
            [
              h(
                "div",
                curWeekClone[i].courseName +
                  "," +
                  this.formatWeekly(curWeekClone[i].weeklyTotal).join(",") +
                  "," +
                  curWeekClone[i].teacherName
              ),
              h(
                "div",
                curWeekClone[i].buildingName + "," + curWeekClone[i].className
              ),
              h("div", curWeekClone[i].teacherClassName),
              // h("div", `(第${curWeekClone[i].section}节)`)
            ]
          )
        );
      }
      return temp;
    },

    // 调至
    // courseTo(params) {
    //   let adjustCourseObj = this.adjustCourseInfoData.adjustCourseObj;
    //   adjustCourseObj = params.row[params.column.key];

    //   adjustCourseObj[`weekStr${params.column._index}`] =
    //     params.row[`weekStr${params.column._index}`];
    //   adjustCourseObj.week = this.weeks.find(
    //     (item) => item.code == adjustCourseObj.week
    //   ).str;
    //   adjustCourseObj.weekName = this.weeklys.find(
    //     (item) => item.weekNum == adjustCourseObj.weekly
    //   ).weekName;

    //   let info = `${adjustCourseObj.courseName},${adjustCourseObj.teacherName},${adjustCourseObj.className},${adjustCourseObj.teacherClassName}`;
    //   let sectionArr = this.isMerge(params, info, adjustCourseObj.section);
    //   adjustCourseObj.sectionID = sectionArr;
    //   this.adjustCourseInfoData.adjustCourseObj = adjustCourseObj;
    // },

    // 添加
    addition(params, adjustCourseData) {
      adjustCourseData.week = params.column._index;
      adjustCourseData.section = [];
      adjustCourseData.section.push(params.row.code);
      adjustCourseData.weekly = [this.search.teacherWeekly];
      this.getCourse();
    },

    // 判断选择调至的课程是否为合并的课程
    isMerge(course, info, section) {
      let curWeekStr = info;
      // 首先判断section的上一行跟下一行是否有值
      let sectionID = [];
      if (this.activeIndex == 1) {
        let lastSec = section + course.mergeNum - 1;
        for (let i = 1; i <= lastSec; i++) {
          if (i >= section) {
            sectionID.push(i);
          }
        }
      }

      if (this.activeIndex == 2) {
        let weekStr = `weekStr${course.column._index}`;
        let index = this.teacherScheduleData.findIndex(
          (item) => item.code == section
        );
        // 利用flag标志，当遍历的节次有课，就push进入一个数组里，并且同时检查下一节是否为空，为空就将flag置为false
        let flag = true;
        this.teacherScheduleData.forEach((item, i) => {
          if (item.code >= section) {
            if (
              this.teacherScheduleData[i] &&
              this.teacherScheduleData[i][weekStr] == curWeekStr
            ) {
              if (flag) {
                let mergeCol = item[`week${course.column._index}MergeCol`];
                if (
                  item[weekStr] == curWeekStr &&
                  mergeCol !== undefined &&
                  mergeCol != 1 &&
                  item[course.column.key]
                ) {
                  sectionID.push(item.code);
                }
              }
              if (
                this.teacherScheduleData[i + 1] &&
                this.teacherScheduleData[i + 1][weekStr] != curWeekStr
              ) {
                flag = false;
              }
            }
          }
        });
      }
      if (sectionID.length == 0 && section) {
        sectionID.push(section);
      }
      return sectionID;
    },

    // 调课操作是否发生冲突
    // isConflict(params, isConflict, flag) {
    //   this.conflict = false;
    //   let adjustCourseToObj = null;
    //   adjustCourseToObj = this.deepClone(
    //     this.adjustCourseInfoData.adjustCourseObj,
    //     {}
    //   );
    //   let toWeekly = this.weeklys.find(
    //     (item) => item.weekNum == this.search.teacherWeekly
    //   );
    //   let toWeek = this.weeks.find((item) => item.str == params.column.title);

    //   adjustCourseToObj.weekName = toWeekly.weekName;
    //   adjustCourseToObj.weekCode = toWeek.code; // 星期
    //   adjustCourseToObj.weekNum = this.search.teacherWeekly; //周次
    //   adjustCourseToObj.week = params.column.title;
    //   adjustCourseToObj.section = params.row.name;

    //   // 计算调至第几节
    //   let sectionArr = this.adjustCourseInfoData.adjustCourseObj.sectionID;
    //   let differenceValue =
    //     this.adjustCourseInfoData.adjustCourseObj.sectionID[0] -
    //     params.row.code;
    //   if (differenceValue > 0) {
    //     adjustCourseToObj.sectionID = sectionArr.map(
    //       (section) => section * 1 - differenceValue
    //     );
    //   } else if (differenceValue < 0) {
    //     adjustCourseToObj.sectionID = sectionArr.map(
    //       (section) => section * 1 - differenceValue
    //     );
    //   }

    //   // 若果调至的课程的节次数大于总的节次数
    //   if (
    //     adjustCourseToObj.sectionID[adjustCourseToObj.sectionID.length - 1] >
    //     this.allSection.length
    //   ) {
    //     this.$Message.error("节次已超过所设定的最大节次数");
    //     this.btnDisabled = true;
    //   } else {
    //     this.adjustCourseInfoData.adjustCourseToObj = adjustCourseToObj;
    //     if (!isConflict) {
    //       adjustCourseToObj.sectionID.forEach((item) => {
    //         let to_section = this.teacherScheduleData.find(
    //           (section) => section.code == item
    //         );
    //         if (to_section[`week${adjustCourseToObj.weekCode}`] && !flag) {
    //           this.$Modal.warning({
    //             title: "提示",
    //             content: `${to_section.name} 出现冲突`,
    //           });
    //           this.btnDisabled = true;
    //           return;
    //         }
    //       });
    //       /**
    //        * 查找冲突课表数据
    //        *
    //        * @param teaching_class_id 需调课的班级Id
    //        * @param weekly 需调至的周次
    //        * @param week 需调至星期
    //        * @param section 需调至节次
    //        * @param classroom_id 调至教室
    //        * @param term_id 学期
    //        * @param scheduleInfoId 需调课的课表Id
    //        *
    //        * @return 单条冲突数据
    //        * TKScheduleOverview/checkeConflictSchedule
    //        */
    //       let data = {
    //         scheduleInfoId: this.adjustCourseInfoData.adjustCourseObj.id,
    //         teaching_class_id:
    //           this.adjustCourseInfoData.adjustCourseObj.teaching_class_id,
    //         weekly: this.search.teacherWeekly,
    //         week: params.column._index,
    //         section: adjustCourseToObj.sectionID,
    //         classroom_id:
    //           this.adjustCourseInfoData.adjustCourseObj.classroom_id,
    //         term_id: JSON.parse(sessionStorage.currTerm).id,
    //       };

    //       let that = this;
    //       that.adjustCourseInfoData.conflictScheduleObj = "";
    //       that.adjustCourseInfoData.sq_arrangementMsg = "";
    //       that.adjustCourseInfoData.bt_arrangementMsg = "";

    //       that.conflictNumFalg = false;
    //       that.axios
    //         .post(
    //           that.interfaceUrl + "TKScheduleOverview/checkeConflictSchedule",
    //           that.qs(data)
    //         )
    //         .then(function (res) {
    //           if (res.data.state) {
    //             if (res.data.conflictSchedule) {
    //               // console.log(res.data.conflictSchedule)
    //               that.repet = true;
    //               let conflictScheduleColone = that.deepClone(
    //                 res.data.conflictSchedule
    //               );
    //               let repetData = [res.data.conflictSchedule[0]];
    //               let repetData0_info = `${repetData[0].courseName},${repetData[0].teacherName},${repetData[0].className},${repetData[0].teacherClassName}`;
    //               for (let i = 0; i < res.data.conflictSchedule.length; i++) {
    //                 let i_info = `${res.data.conflictSchedule[i].courseName},${res.data.conflictSchedule[i].teacherName},${res.data.conflictSchedule[i].className},${res.data.conflictSchedule[i].teacherClassName}`;
    //                 if (repetData0_info !== i_info) {
    //                   that.repet = false;
    //                   continue;
    //                 }
    //               }
    //               // 若果出现冲突，并且冲突数据是相同重复的，就进行合并显示，否则就全部分开显示
    //               if (that.repet) {
    //                 that.btnDisabled = false;
    //                 let section = [];
    //                 res.data.conflictSchedule.forEach((item) => {
    //                   section.push(item.section);
    //                 });
    //                 that.adjustCourseInfoData.conflictScheduleObj = [
    //                   res.data.conflictSchedule[0],
    //                 ];
    //                 that.adjustCourseInfoData.conflictScheduleObj[0].section =
    //                   section;
    //                 that.adjustCourseInfoData.conflictScheduleObj[0].weekName =
    //                   that.weeklys.find(
    //                     (item) =>
    //                       item.weekNum ==
    //                       that.adjustCourseInfoData.conflictScheduleObj[0]
    //                         .weekly
    //                   ).weekName;

    //                 let adjustObjLen =
    //                   that.adjustCourseInfoData.adjustCourseObj.sectionID
    //                     .length;
    //                 let conflictObj =
    //                   that.adjustCourseInfoData.conflictScheduleObj[0].section
    //                     .length;
    //                 if (adjustObjLen != conflictObj) {
    //                   that.btnDisabled = true;
    //                   that.conflictNumFalg = true;
    //                 }
    //                 that.repet = false;
    //               } else {
    //                 // console.log('冲突数据不相同了')
    //                 // console.log(res.data.conflictSchedule)
    //                 that.btnDisabled = true;
    //                 that.conflictNumFalg = true;
    //                 that.adjustCourseInfoData.conflictScheduleObj =
    //                   res.data.conflictSchedule;
    //               }

    //               that.adjustCourseInfoData.bt_arrangementMsg =
    //                 res.data.bt_arrangementMsg;
    //               that.conflict = true;
    //             }

    //             if (res.data.sq_arrangementMsg) {
    //               that.adjustCourseInfoData.sq_arrangementMsg =
    //                 res.data.sq_arrangementMsg;
    //               that.conflict = true;
    //               that.btnDisabled = true;
    //             }

    //             if (flag == "clickE") {
    //               that.repet = false;
    //               that.conflict = true;
    //               that.btnDisabled = false;
    //               let conflictScheduleObj = that.deepClone(
    //                 params.row[params.column.key],
    //                 {}
    //               );

    //               conflictScheduleObj.weekName = that.weeklys.find(
    //                 (item) =>
    //                   item.weekNum == params.row[params.column.key].weekly
    //               ).weekName;
    //               let toWeekly = that.weeklys.find(
    //                 (item) => item.weekNum == that.search.teacherWeekly
    //               );
    //               let toWeek = that.weeks.find(
    //                 (item) => item.str == params.column.title
    //               );
    //               conflictScheduleObj.weekName = toWeekly.weekName;
    //               conflictScheduleObj.weekCode = toWeek.code; // 星期
    //               conflictScheduleObj.weekNum = toWeekly.weekNum; //周次
    //               conflictScheduleObj.week = toWeek.code;

    //               if (!(conflictScheduleObj.section.length instanceof Array)) {
    //                 let info = `${conflictScheduleObj.courseName},${conflictScheduleObj.teacherName},${conflictScheduleObj.className},${conflictScheduleObj.teacherClassName}`;
    //                 let sectionArr = that.isMerge(
    //                   params,
    //                   info,
    //                   conflictScheduleObj.section
    //                 );
    //                 conflictScheduleObj.section = sectionArr;
    //               }

    //               that.adjustCourseInfoData.conflictScheduleObj = "";
    //               let adjustObjStr =
    //                 that.adjustCourseInfoData.adjustCourseToObj.sectionID.toString();
    //               if (that.adjustCourseInfoData.conflictScheduleObj) {
    //                 let conflictObjStr = conflictScheduleObj.section.toString();
    //                 if (adjustObjStr != conflictObjStr) {
    //                   that.adjustCourseInfoData.conflictScheduleObj.push(
    //                     conflictScheduleObj
    //                   );
    //                 }
    //               } else {
    //                 that.adjustCourseInfoData.conflictScheduleObj = [
    //                   conflictScheduleObj,
    //                 ];
    //               }

    //               // 如果冲突数据存在多条，则不允许点击确定
    //               if (
    //                 that.adjustCourseInfoData.conflictScheduleObj.length > 1
    //               ) {
    //                 that.btnDisabled = true;
    //                 that.conflictNumFalg = true;
    //               }
    //               // 如果冲突数据的节次数与别调的课程的节次数量不一致，不允许点击确定
    //               let adjustObjLen =
    //                 that.adjustCourseInfoData.adjustCourseObj.sectionID.length;
    //               let conflictObj =
    //                 that.adjustCourseInfoData.conflictScheduleObj[0].section
    //                   .length;
    //               if (adjustObjLen != conflictObj) {
    //                 that.btnDisabled = true;
    //                 that.conflictNumFalg = true;
    //               }

    //               // console.log([conflictScheduleObj])
    //             }
    //           } else {
    //             that.messageError(res.data.msg);
    //           }
    //         })
    //         .catch(function (e) {
    //           that.messageError("服务器错误" + e);
    //         });
    //     } else {
    //       this.isConflict(params, false, "clickE");
    //       // this.conflict = true;
    //       // let conflictScheduleObj = params.row[params.column.key];
    //       // conflictScheduleObj.weekName = this.weeklys.find(
    //       // 	(item) => item.weekNum == params.row[params.column.key].weekly
    //       // ).weekName;
    //       // let toWeekly = this.weeklys.find(
    //       // 	(item) => item.weekNum == this.search.teacherWeekly
    //       // );
    //       // let toWeek = this.weeks.find(
    //       // 	(item) => item.str == params.column.title
    //       // );
    //       // conflictScheduleObj.weekName = toWeekly.weekName;
    //       // conflictScheduleObj.weekCode = toWeek.code; // 星期
    //       // conflictScheduleObj.weekNum = toWeekly.weekNum; //周次
    //       // conflictScheduleObj.week = toWeek.code;
    //       // let info =
    //       // 	`${conflictScheduleObj.courseName},${conflictScheduleObj.teacherName},${conflictScheduleObj.className},${conflictScheduleObj.teacherClassName}`;
    //       // let sectionArr = this.isMerge(
    //       // 	params,
    //       // 	info,
    //       // 	conflictScheduleObj.section
    //       // );
    //       // conflictScheduleObj.section = sectionArr;
    //       // this.adjustCourseInfoData.conflictScheduleObj = conflictScheduleObj;
    //     }
    //   }
    // },

    // 移除按钮的事件
    removeCourse(obj, params) {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定移除该课程安排吗？",
        onOk: () => {
          /**
           *删除课表数据
           *
           * @param scheduleId 需删除的课表数据的Id
           *
           * @return 是否成功
           * TKScheduleOverview/deleteSchedule
           */
          let sectionArr;
          let info = `${obj.courseName},${obj.teacherName},${obj.className},${obj.teacherClassName}`;
          if (this.activeIndex == 1) {
            sectionArr = this.isMerge(obj, info, obj.section);
          } else if (this.activeIndex == 2) {
            sectionArr = this.isMerge(params, info, obj.section);
          }
          // console.log(sectionArr)
          let data = {
            scheduleId: obj.id,
            section: sectionArr.toString(),
          };
          let that = this;
          that.axios
            .post(
              that.interfaceUrl + "TKScheduleOverview/deleteSchedule",
              that.qs(data)
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success(res.data.msg);
                that.getSchedule();
              } else {
                that.messageError(res.data.msg);
              }
            })
            .catch(function () {
              that.messageError("服务器错误");
            });
        },
      });
    },

    // 调课操作信息中的取消事件
    removeAdjustCourseTo() {
      this.conflictNumFalg = false;
      this.again = true;
      this.btnDisabled = true;
      this.conflict = false;
      this.isSync = false;
      this.adjustTo = 0;
      this.adjustCourseInfoData.adjustCourseObj = "";
      this.adjustCourseInfoData.adjustCourseToObj = "";
      this.adjustCourseInfoData.conflictScheduleObj = "";
      this.adjustCourseInfoData.sq_arrangementMsg = "";
      this.adjustCourseInfoData.bt_arrangementMsg = "";
      this.getSchedule();
    },

    // 调课操作信息中的确认事件
    sendAdjustCourseInfo() {
      this.again = true;
      this.btnDisabled = true;
      this.conflict = false;
      this.adjustTo = 0;
      let adjustCourseObj = this.adjustCourseInfoData.adjustCourseObj;
      let adjustCourseToObj = this.adjustCourseInfoData.adjustCourseToObj;
      let conflictScheduleObj = this.adjustCourseInfoData.conflictScheduleObj;
      let to_weekly = [];
      if (this.isSync) {
        this.weeklys.forEach((item) => {
          if (item.weekNum >= adjustCourseToObj.weekNum)
            to_weekly.push(item.weekNum);
        });
      }

      let data = {
        scheduleId: adjustCourseObj.id, //课表Id 新增则无，调课有
        // term_id: JSON.parse(sessionStorage.currTerm).id,
        term_id: that.searchData.termId ? that.searchData.termId : "",
        course_id: adjustCourseObj.course_id,
        course_name: adjustCourseObj.courseName, //课程
        teaching_teacher_id: adjustCourseObj.teaching_teacher_id,
        teaching_teacher_name: adjustCourseObj.teacherName,
        teaching_class: adjustCourseObj.teacherClassName,
        teaching_class_id: adjustCourseObj.teaching_class_id,
        to_classroom_id: adjustCourseObj.classroom_id,
        to_weekly:
          to_weekly.length != 0 ? to_weekly : adjustCourseToObj.weekNum,
        to_section: adjustCourseToObj.sectionID,
        to_week: adjustCourseToObj.weekCode,
        schedule_conflict_id: conflictScheduleObj
          ? conflictScheduleObj[0].id
          : "",
        tkType: "T01", //临时调课T01 新增T02  影响后续的永久调课T03
      };
      this.loading = true;
      this.classesInOperation(data);
      this.adjustCourseInfoData.adjustCourseObj = "";
      this.adjustCourseInfoData.adjustCourseToObj = "";
      this.adjustCourseInfoData.conflictScheduleObj = "";
      this.adjustCourseInfoData.sq_arrangementMsg = "";
      this.adjustCourseInfoData.bt_arrangementMsg = "";
      this.isSync = false;
    },

    // 判断所选节次是否连续
    sectionIsContinuous(section) {
      let i = section[0];
      let isContinuous = true;
      section.forEach((e) => {
        if (e != i) return (isContinuous = false);
        i++;
      });
      return isContinuous;
    },

    // 调课操作信息中的表单确认事件
    sendAdjustToForm() {
      let adjustCourseData = this.adjustCourseData;
      if (
        adjustCourseData.classNameId &&
        adjustCourseData.classroomId &&
        adjustCourseData.courseId &&
        adjustCourseData.week &&
        adjustCourseData.section.length != 0 &&
        adjustCourseData.weekly.length != 0
      ) {
        adjustCourseData.teachName = this.search.teacher;
        adjustCourseData.section.sort((a, b) => a - b);
        adjustCourseData.weekly.sort((a, b) => a - b);
        let isContinuous = this.sectionIsContinuous(adjustCourseData.section);

        let course_name = this.courseList.find(
          (item) => item.id == adjustCourseData.courseId
        ).courseName;

        let teaching_teacher_name = this.teacherList.find(
          (item) => item.id == this.search.teacherId
        ).xm;
        let teaching_class = this.classNames.find(
          (item) => item.id == adjustCourseData.classNameId
        ).teachingClassName;

        let data = {
          scheduleId: "", //课表Id 新增则无，调课有
          term_id: this.searchData.termId,
          course_id: adjustCourseData.courseId,
          course_name: course_name, //课程
          teaching_teacher_id: this.search.teacherId,
          teaching_teacher_name: teaching_teacher_name,
          teaching_class: teaching_class,
          teaching_class_id: adjustCourseData.classNameId,
          to_classroom_id: adjustCourseData.classroomId,
          to_weekly: adjustCourseData.weekly.toString(),
          to_section: adjustCourseData.section.toString(),
          to_week: adjustCourseData.week,
          tkType: "T02", //临时调课T01 新增T02  影响后续的永久调课T03
          addWay: "teacher",
        };

        if (isContinuous) {
          this.loading = true;
          this.classesInOperation(data);
        } else {
          this.$Message.warning("所选节次需要连续，请重新选择");
        }
      } else {
        this.$Modal.warning({
          title: "提示",
          content: "提交的表单不完整，请填充完整",
        });
      }
    },
    // 新增或调课
    classesInOperation(data) {
      this.conflictNumFalg = false;
      /**
       * 课表概览新增或调课
       * TKScheduleOverview/classesInOperation
       *
       * @param scheduleId 课表Id 新增则无，调课有
       * @param to_weekly 调至周次 1,2,3
       * @param to_week 调至星期
       * @param to_section 调至节次 5,6
       * @param to_classroom_id 调至教室
       * @param teaching_class 教学班
       * @param teaching_class_id 教学班
       * @param teaching_teacher_id 调课教师ID
       * @param teaching_teacher_name 调课教师名称
       * @param schedule_conflict_id 冲突ID
       * @param course_name 课程
       * @param course_id 课程ID
       * @param term_id 学期
       * @param tkType 调课T01 新增T02
       * @param addWay 参数为 （classroom | teacher） 对应教师课表操作 和 教师课表操作
       *
       * @return 单条数据
       */
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "TKScheduleOverview/classesInOperation",
          that.qs(data)
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.getSchedule();
            that.adjustTo = 0;
            // that.$Message.success(res.data.msg)
            that.$Modal.success({
              title: "提示",
              content: res.data.msg,
            });
          } else {
            that.$Modal.warning({
              title: "提示",
              content: res.data.msg,
            });
          }
          that.loading = false;
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    // 行、列合并
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (this.activeIndex == 1) {
        if (row["week1"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 1);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week1"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week1"][column.key].mergeNum == 0
                  ? 0
                  : row["week1"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
        if (row["week2"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 2);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week2"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week2"][column.key].mergeNum == 0
                  ? 0
                  : row["week2"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
        if (row["week3"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 3);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week3"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week3"][column.key].mergeNum == 0
                  ? 0
                  : row["week3"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
        if (row["week4"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 4);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week4"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week4"][column.key].mergeNum == 0
                  ? 0
                  : row["week4"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
        if (row["week5"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 5);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week5"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week5"][column.key].mergeNum == 0
                  ? 0
                  : row["week5"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
        if (row["week6"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 6);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week6"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week6"][column.key].mergeNum == 0
                  ? 0
                  : row["week6"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
        if (row["week0"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 0);
          let colIndex = index * this.allSection.length + column.key * 1;
          if (!Object.is(colIndex, NaN)) {
            if (columnIndex == colIndex) {
              let x = row["week0"][column.key].mergeNum == 0 ? 0 : 1;
              let y =
                row["week0"][column.key].mergeNum == 0
                  ? 0
                  : row["week0"][column.key].mergeNum;
              return [x, y];
            }
          }
        }
      } else if (this.activeIndex == 2 || this.activeIndex == 3) {
        if (columnIndex == 1) {
          //计算合并的行数列数
          let x = row.week1MergeCol == 0 ? 0 : row.week1MergeCol;
          let y = row.week1MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 2) {
          //计算合并的行数列数
          let x = row.week2MergeCol == 0 ? 0 : row.week2MergeCol;
          let y = row.week2MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 3) {
          //计算合并的行数列数
          let x = row.week3MergeCol == 0 ? 0 : row.week3MergeCol;
          let y = row.week3MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 4) {
          //计算合并的行数列数
          let x = row.week4MergeCol == 0 ? 0 : row.week4MergeCol;
          let y = row.week4MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 5) {
          //计算合并的行数列数
          let x = row.week5MergeCol == 0 ? 0 : row.week5MergeCol;
          let y = row.week5MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 6) {
          //计算合并的行数列数
          let x = row.week6MergeCol == 0 ? 0 : row.week6MergeCol;
          let y = row.week6MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 7) {
          //计算合并的行数列数
          let x = row.week7MergeCol == 0 ? 0 : row.week7MergeCol;
          let y = row.week7MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
      }
    },

    // 用于计算合并的规则
    assembleData(data) {
      console.log(data);
      if (this.activeIndex === 1) {
        data.forEach((classroom, i) => {
          // 遍历每一行
          this.search.classroomWeek.forEach((weekNum) => {
            // 遍历所勾选的星期
            let cWeek = classroom[`week${weekNum}`]; // 当前星期存在的课程
            let str = null;
            let index = null;
            if (cWeek) {
              for (let section of Object.keys(cWeek)) {
                //遍历当前星期的节次
                cWeek[section].mergeNum = 1;
                let i = this.allSection[0].code;
                // 判断是否为第一个有课的节次
                if (
                  section == i &&
                  cWeek[section].id &&
                  (cWeek[section * 1 - 1] == undefined ||
                    !cWeek[section * 1 - 1].id)
                ) {
                  // 判断当前节次的下一节次是否存在课程
                  if (
                    cWeek[section * 1 + 1] != undefined &&
                    cWeek[section * 1 + 1].id
                  ) {
                    if (!str && !index) {
                      str = cWeek[section].sectionStr;
                      index = section;
                      continue;
                    }
                  }
                } else if (cWeek[section].id) {
                  if (cWeek[section].sectionStr == str) {
                    cWeek[index].outset = index;
                    cWeek[index].mergeNum++;
                    cWeek[section].mergeNum = 0;
                  } else {
                    str = cWeek[section].sectionStr;
                    index = section;
                  }
                }
              }
            }
          });
        });
        return data;
      } else if (this.activeIndex == 2 || this.activeIndex == 3) {
        data.forEach((e, i) => {
          if (e.weekStr1 && e.week1.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week1MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr1 === data[a].weekStr1) {
                  if (this.activeIndex == 3) {
                    e.week1.item.push(...data[a].week1.item); // 如果发生合并，就把被合并的数据中包含重叠的数据放进合并的第一项中
                  }
                  e.week1MergeCol++;
                  data[a].week1MergeCol = 0;
                  data[a].week1.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr2 && e.week2.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week2MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr2 === data[a].weekStr2) {
                  if (this.activeIndex == 3) {
                    e.week2.item.push(...data[a].week2.item);
                  }
                  e.week2MergeCol++;
                  data[a].week2MergeCol = 0;
                  data[a].week2.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr3 && e.week3.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week3MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr3 === data[a].weekStr3) {
                  if (this.activeIndex == 3) {
                    e.week3.item.push(...data[a].week3.item);
                  }
                  e.week3MergeCol++;
                  data[a].week3MergeCol = 0;
                  data[a].week3.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr4 && e.week4.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week4MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr4 === data[a].weekStr4) {
                  if (this.activeIndex == 3) {
                    e.week4.item.push(...data[a].week4.item);
                  }
                  e.week4MergeCol++;
                  data[a].week4MergeCol = 0;
                  data[a].week4.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr5 && e.week5.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week5MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr5 === data[a].weekStr5) {
                  if (this.activeIndex == 3) {
                    e.week5.item.push(...data[a].week5.item);
                  }
                  e.week5MergeCol++;
                  data[a].week5MergeCol = 0;
                  data[a].week5.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr6 && e.week6.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week6MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr6 === data[a].weekStr6) {
                  if (this.activeIndex == 3) {
                    e.week6.item.push(...data[a].week6.item);
                  }
                  e.week6MergeCol++;
                  data[a].week6MergeCol = 0;
                  data[a].week6.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr7 && e.week7.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week7MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr7 === data[a].weekStr7) {
                  if (this.activeIndex == 3) {
                    e.week7.item.push(...data[a].week7.item);
                  }
                  e.week7MergeCol++;
                  data[a].week7MergeCol = 0;
                  data[a].week7.already = 1;
                } else {
                  break;
                }
              }
            }
          }
        });
        return data;
      }
    },

    // 搜索操作
    searchClassSchedule() {
      if (this.activeIndex == 1) {
        this.getClassroom2();
        this.getSchedule();
      }
      if (this.activeIndex == 2) {
        // this.getClassName()
        this.getCourse();
        this.getSchedule();
      }
      if (this.activeIndex == 3) {
        // this.getClassName()
        this.getSchedule();
      }
    },

    // 获取节次信息
    getSection() {
      let that = this;
      this.axios
        .post(
          that.interfaceUrl + "classtime/getArrClassTimeByPage",
          that.qs({
            pageNum: 1,
            pageSize: 999,
            termId: that.searchData.termId,
          })
        )
        .then((resp) => {
          if (resp.data.state) {
            that.allSection = resp.data.arrClassTime;
            // that.getSchedule();
          } else {
            that.messageError(resp.data.msg);
          }
        });
    },

    // 获取课程安排信息
    getSchedule() {
      let that = this;
      this.loading = true;
      if (
        this.search.classroomWeekly == undefined &&
        this.search.teacherWeekly == undefined &&
        this.search.weekly == undefined
      ) {
      }
      if (this.activeIndex == 1) {
        // 教室课表
        this.classroomScheduleData = [];
        let classroomListCopy = this.deepClone(this.classroomList);
        let allSection = this.deepClone(this.allSection);
        let data = {
          buildingId: this.search.buildingId,
          weekNum: this.search.classroomWeekly,
          termId: this.searchData.termId,
        };
        // console.log(data.weekNum)
        if (typeof data.weekNum == "number") {
          that.axios
            .post(
              that.interfaceUrl +
                "TKScheduleOverview/selectScheduleOverviewClassRoom",
              that.qs(data)
            )
            .then(function (res) {
              if (res.data.state) {
                that.classroomScheduleItems = res.data.tksList
                  ? res.data.tksList
                  : [];
                that.formatTeacthscheduleData(
                  that.classroomScheduleItems,
                  classroomListCopy,
                  allSection
                );
                that.classroomScheduleData =
                  that.assembleData(classroomListCopy);
                that.setWeekClassroomSchedule();
                that.loading = false;
              } else {
                that.loading = false;
                that.messageError(res.data.message);
              }
            })
            .catch(function (e) {
              that.loading = false;
              console.log(e);
              that.messageError("服务器错误" + e);
            });
        } else {
          this.$Message.warning("请选择周次");
        }
      } else if (this.activeIndex == 2) {
        // 教师课表
        this.teacherScheduleData = [];
        // 刷新节次信息
        let allSection = this.deepClone(this.allSection);

        let data = {
          teacherId: this.search.teacherId,
          weekNum: this.search.teacherWeekly,
          termId: this.searchData.termId,
        };

        if (typeof data.weekNum == "number") {
          that.axios
            .post(
              that.interfaceUrl +
                "TKScheduleOverview/selectScheduleOverviewClassRoom",
              that.qs(data)
            )
            .then(function (res) {
              if (res.data.state) {
                that.teacherScheduleItems = res.data.tksList
                  ? res.data.tksList
                  : [];
                that.formatscheduleData(that.teacherScheduleItems, allSection);
                that.teacherScheduleData = that.assembleData(allSection);
                that.loading = false;
              } else {
                that.loading = false;
                that.messageError(res.data.message);
              }
            })
            .catch(function (e) {
              that.loading = false;
              console.log(e);
              that.messageError("服务器错误" + e);
            });
        } else {
          this.$Message.warning("请选择周次");
        }
      } else if (this.activeIndex == 3) {
        let teachingClassIdArr = [];
        that.adminClass.forEach((item) => {
          if (item.adminClass.id == this.search.adminClassId) {
            if (item.teachingClass) {
              item.teachingClass.forEach((e) => {
                teachingClassIdArr.push(e.id);
              });
            }
          }
        });
        this.classScheduleData = [];
        // 刷新节次信息
        let allSection = this.deepClone(this.allSection);
        let data = {
          teachingClassId:
            teachingClassIdArr.length != 0
              ? teachingClassIdArr.toString()
              : "0",
          weekNum: this.search.weekly,
          termId: this.searchData.termId,
        };
        if (typeof data.weekNum == "number") {
          that.axios
            .post(
              that.interfaceUrl +
                "TKScheduleOverview/selectScheduleOverviewClassRoom",
              that.qs(data)
            )
            .then(function (res) {
              if (res.data.state) {
                that.classScheduleItems = res.data.tksList
                  ? res.data.tksList
                  : [];

                let classScheduleItemsColone = that.deepClone(
                  that.classScheduleItems
                );

                that.classScheduleItems.forEach((item) => {
                  item.item = [];
                });
                // 遍历课表数据，将重复的放进各自的数据中
                for (let i = 0; i < that.classScheduleItems.length - 1; i++) {
                  for (
                    let j = i + 1;
                    j < classScheduleItemsColone.length;
                    j++
                  ) {
                    if (
                      that.classScheduleItems[i].week ===
                        classScheduleItemsColone[j].week &&
                      that.classScheduleItems[i].section ===
                        classScheduleItemsColone[j].section
                    ) {
                      that.classScheduleItems[i].item.push(
                        classScheduleItemsColone[j]
                      );
                      that.classScheduleItems[j].item.push(
                        classScheduleItemsColone[i]
                      );
                    }
                  }
                }

                that.formatscheduleData(that.classScheduleItems, allSection);
                that.classScheduleData = that.assembleData(allSection);

                that.loading = false;
              } else {
                that.loading = false;
                that.messageError(res.data.message);
              }
            })
            .catch(function (e) {
              that.loading = false;
              console.log(e);
              that.messageError("服务器错误" + e);
            });
        } else {
          this.$Message.warning("请选择周次");
        }
      }
    },

    // 格式化教室课程表的数据
    formatTeacthscheduleData(
      classroomScheduleItems,
      classroomListCopy,
      allSection
    ) {
      let sectionObj = {};
      allSection.forEach((section) => {
        sectionObj[section.code] = {};
      });
      classroomScheduleItems.forEach((item) => {
        this.search.classroomWeek.forEach((w) => {
          if (item.week === w) {
            let info = `${item.courseName},${item.teacherName},${item.className},${item.teacherClassName}`;
            classroomListCopy.forEach((e) => {
              if (item.classroom_id == e.id) {
                switch (w) {
                  case 1:
                    e.week1 ? "" : (e.week1 = this.deepClone(sectionObj));
                    e.week1[item.section] = item;

                    e.week1[item.section]["sectionStr"] = info;
                    break;
                  case 2:
                    e.week2 ? "" : (e.week2 = this.deepClone(sectionObj));
                    e.week2[item.section] = item;

                    e.week2[item.section]["sectionStr"] = info;
                    break;
                  case 3:
                    e.week3 ? "" : (e.week3 = this.deepClone(sectionObj));
                    e.week3[item.section] = item;

                    e.week3[item.section]["sectionStr"] = info;
                    break;
                  case 4:
                    e.week4 ? "" : (e.week4 = this.deepClone(sectionObj));
                    e.week4[item.section] = item;

                    e.week4[item.section]["sectionStr"] = info;
                    break;
                  case 5:
                    e.week5 ? "" : (e.week5 = this.deepClone(sectionObj));
                    e.week5[item.section] = item;

                    e.week5[item.section]["sectionStr"] = info;
                    break;
                  case 6:
                    e.week6 ? "" : (e.week6 = this.deepClone(sectionObj));
                    e.week6[item.section] = item;

                    e.week6[item.section]["sectionStr"] = info;
                    break;
                  case 7:
                    e.week7 ? "" : (e.week7 = this.deepClone(sectionObj));
                    e.week7[item.section] = item;

                    e.week7[item.section]["sectionStr"] = info;
                    break;
                }
              }
            });
          }
        });
      });
    },

    // 格式化教室与班级周课程表的数据
    formatscheduleData(scheduleItems, allSection) {
      allSection.forEach((sectionItem) => {
        scheduleItems.forEach((scheduleItem) => {
          if (sectionItem.code == scheduleItem.section) {
            // info 用于判断是否应该合并
            let info = `${scheduleItem.courseName},${scheduleItem.teacherName},${scheduleItem.className},${scheduleItem.teacherClassName}`;

            switch (scheduleItem.week) {
              case 1:
                // if (!sectionItem.week1) {
                //   sectionItem.week1 = scheduleItem;
                //   sectionItem.weekStr1 = info;
                // } else {
                //   sectionItem.week1.scheduleItem = scheduleItem;
                // }
                sectionItem.week1 = scheduleItem;
                sectionItem.weekStr1 = info;
                break;
              case 2:
                sectionItem.week2 = scheduleItem;
                sectionItem.weekStr2 = info;
                break;
              case 3:
                sectionItem.week3 = scheduleItem;
                sectionItem.weekStr3 = info;
                break;
              case 4:
                sectionItem.week4 = scheduleItem;
                sectionItem.weekStr4 = info;
                break;
              case 5:
                sectionItem.week5 = scheduleItem;
                sectionItem.weekStr5 = info;
                break;
              case 6:
                sectionItem.week6 = scheduleItem;
                sectionItem.weekStr6 = info;
                break;
              case 7:
                sectionItem.week7 = scheduleItem;
                sectionItem.weekStr7 = info;
                break;
            }
          }
        });
      });
    },

    // 获取周次
    getWeekly() {
      let that = this;
      // 在重新请求时，注意进行参数的初始化
      this.curWeekly = 0
      this.search.classroomWeekly = 0
      this.search.teacherWeekly = 0
      this.search.weekly = 0
      this.adjustCourseData.weekly = 0
      this.axios
        .post(
          that.interfaceUrl + "week/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 999,
            termId: that.searchData.termId,
          })
        )
        .then((resp) => {
          if (resp.data.state) {
            that.weeklys = resp.data.weekList;
            that.compareDate(that.curTime, resp.data.weekList);
            that.getBuilding();
          } else {
            that.messageError(resp.data.msg);
          }
        });
    },

    // 获取课程
    getCourse() {
      // this.courseList =
      let that = this;
      that.adjustCourseData.courseId = "";
      that.adjustCourseData.classNameId = "";
      that.classroomModelData.courseId = "";
      that.classroomModelData.teachingClassNameId = "";
      let teacherId = null;
      if (that.activeIndex == 1) {
        teacherId = that.classroomModelData.teacherId
          ? that.classroomModelData.teacherId
          : "";
      } else {
        teacherId = that.search.teacherId ? that.search.teacherId : "";
      }
      if (teacherId) {
        that.axios
          .post(
            that.interfaceUrl + "courseSet/queryByTeacherId",
            that.qs({
              termId: that.searchData.termId,
              teacherId: teacherId,
            })
          )
          .then(function (res) {
            if (res.data.state) {
              if (that.activeIndex == 1) {
                that.courseList2 = res.data.currTeaCourses;
              } else {
                that.courseList = res.data.currTeaCourses;
              }
              if (res.data.currTeaCourses) {
                that.adjustCourseData.courseId = res.data.currTeaCourses[0].id;
                that.classroomModelData.courseId =
                  res.data.currTeaCourses[0].id;
                that.getClassName();
              }
            } else {
              that.messageError(res.data.msg);
            }
          });
      }
    },

    // 获取教学班级
    getClassName() {
      let that = this;
      let teacherId;
      let courseId;
      if (this.activeIndex == 1) {
        teacherId = that.classroomModelData.teacherId
          ? that.classroomModelData.teacherId
          : "";
        courseId =
          that.classroomModelData.courseId == undefined
            ? ""
            : that.classroomModelData.courseId;
      }
      if (this.activeIndex == 2) {
        teacherId = that.search.teacherId ? that.search.teacherId : "";
        courseId =
          that.adjustCourseData.courseId == undefined
            ? ""
            : that.adjustCourseData.courseId;
      }
      that.axios
        .post(
          that.interfaceUrl + "tkTeachingClass/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 999,
            teachingTeacherId: teacherId,
            courseId: courseId,
            termId: that.searchData.termId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            // console.log(res.data)
            if (res.data.TeachingClassList) {
              if (that.activeIndex == 1 && that.classroomModelData.teacherId) {
                that.classNames2 = res.data.TeachingClassList;
              } else {
                that.classNames = res.data.TeachingClassList;
              }
              if (that.activeIndex == 2) {
                that.adjustCourseData.classNameId =
                  res.data.TeachingClassList[0].id;
              } else if (that.activeIndex == 1) {
                that.classroomModelData.teachingClassNameId =
                  res.data.TeachingClassList[0].id;
              } else {
                that.search.classNameId = res.data.TeachingClassList[0].id;
              }
            } else {
              that.classNames = [];
              if (that.activeIndex == 2) {
                that.adjustCourseData.classNameId = "";
              }
              if (that.activeIndex == 1) {
                that.classroomModelData.teachingClassNameId = "";
              }
            }
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取行政班级
    getTeachingClass2() {
      let that = this;
      that.axios
        .post(that.interfaceUrl + "tkTeachingClass/selectAllBanjiByPage")
        .then(function (res) {
          if (res.data.state) {
            if (res.data.data) {
              console.log(res.data);
              that.adminClass = res.data.data;
              that.search.adminClassId = res.data.data[0].adminClass.id;
              that.search.classNameId = res.data.data[0].teachingClass
                ? res.data.data[0].teachingClass[0].id
                : "";
            }
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取老师
    getTeacher2() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "teacher/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 999,
            termId: that.searchData.termId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.teacherList = res.data.teacherList;
            if (that.search.teacherId == "") {
              that.search.teacherId = res.data.teacherList[0].id;
            }
            if (that.activeIndex == 1) {
              that.getClassName();
            }
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取楼栋信息
    getBuilding() {
      let that = this;
      that.axios
        .post(that.interfaceUrl + "teachingBuilding/selectAll")
        .then(function (res) {
          if (res.data.state) {
            if (res.data.buildings) {
              that.buildings = res.data.buildings;
              that.search.buildingId = res.data.buildings[0].id;
              that.getClassroom2();
            }
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取教室信息
    getClassroom2() {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "/classroom/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 999,
            buildingId: that.search.buildingId,
            termId: that.searchData.termId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.classroomList = res.data.classroomList;
            if (that.activeIndex == 1 && that.classroomList) {
              that.getSchedule();
            }
            if (
              that.adjustCourseData.classroomId == "" ||
              that.activeIndex == 2
            ) {
              that.adjustCourseData.classroomId = res.data.classroomList[0].id;
            }
          } else {
            that.messageError(res.data.msg);
          }
        });
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

    // 格式化日期
    formatDate(timeStamp) {
      let time = new Date(timeStamp),
        y = time.getFullYear(),
        m = time.getMonth() + 1,
        d = time.getDate(),
        h = time.getHours(),
        mm = time.getMinutes(),
        s = time.getSeconds(),
        w = time.getDay();
      if (w == 0) w = 7;
      // 为教室课表的 星期多选框 赋值
      this.search.classroomWeek = [w];

      switch (w) {
        case 7:
          w = "日";
          break;
        case 1:
          w = "一";
          break;
        case 2:
          w = "二";
          break;
        case 3:
          w = "三";
          break;
        case 4:
          w = "四";
          break;
        case 5:
          w = "五";
          break;
        case 6:
          w = "六";
          break;
      }

      return y + "-" + this.add0(m) + "-" + this.add0(d) + " " + "星期" + w;
    },
    add0(m) {
      return m < 10 ? "0" + m : m;
    },

    // 判断当前时间属于第几周
    compareDate(date, weeklys) {
      let stamp = new Date(
        date.split(" ")[0].replace(/-/g, "/").replace(/-/, "/")
      ).getTime();

      if (weeklys) {
        weeklys.forEach((item) => {
          let start = new Date(
            item.beginDate.replace(/-/g, "/").replace(/-/, "/")
          ).getTime();
          let end = new Date(
            item.endDate.replace(/-/g, "/").replace(/-/, "/")
          ).getTime();

          if (start <= stamp && stamp <= end) {
            this.curWeekly = item.weekNum;
            this.search.classroomWeekly = item.weekNum;
            this.search.teacherWeekly = item.weekNum;
            this.search.weekly = item.weekNum;
            console.log('进来了吗');
          }
        });
        this.curWeekly = this.curWeekly ? this.curWeekly : 0;
        this.search.classroomWeekly = this.search.classroomWeekly
          ? this.search.classroomWeekly
          : 0;
        this.search.teacherWeekly = this.search.teacherWeekly
          ? this.search.teacherWeekly
          : 0;
        this.search.weekly = this.search.weekly ? this.search.weekly : 0;

        this.cutOutWeekly = [];
        weeklys.forEach((weekly) => {
          if (weekly.weekNum >= this.curWeekly) {
            this.cutOutWeekly.push(weekly);
          }
        });
      }
    },

    // 将连续的周次合并
    formatWeekly(weekly) {
      let weeklyArr = weekly.split(",");
      let weekUpOne = [];
      weeklyArr.forEach((item) => {
        weekUpOne.push(item * 1 + 1);
      });
      weeklyArr = weekUpOne;
      let ranges = [],
        rstart,
        rend;
      for (let i = 0; i < weeklyArr.length; i++) {
        rstart = weeklyArr[i];
        rend = rstart;
        while (weeklyArr[i + 1] - weeklyArr[i] == 1) {
          rend = weeklyArr[i + 1];
          i++;
        }
        ranges.push(rstart == rend ? rstart + "" : rstart + "-" + rend);
      }
      return ranges;
    },
  },
  filters: {
    weekStrToCode: (value) => {
      switch (value) {
        case 1:
          return "星期一";
        case 2:
          return "星期二";
        case 3:
          return "星期三";
        case 4:
          return "星期四";
        case 5:
          return "星期五";
        case 6:
          return "星期六";
        case 7:
          return "星期日";
      }
    },
  },
  computed: {
    // 获取当前时间
    getCurTime() {
      let time = new Date().getTime();
      this.curTime = this.formatDate(time);
      return this.curTime;
    },
    // 返回调课操作信息的数据格式化
    formatAdjustCourseInfoData() {
      return (data) => {
        if (data.teacherName) {
          return `${data.teacherName} > ${data.weekName} > ${data.week} > 第${data.sectionID}节 > ${data.courseName} > ${data.teacherClassName} > ${data.className}`;
        } else if (data.msg) {
          return `${data.msg}`;
        }
        return "";
      };
    },
  },
};
</script>

<style >
.content .courseInfo {
  height: 100%;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.courseInfo .head-btn {
  display: flex;
  justify-content: flex-end;
}

.courseInfo .ivu-btn {
  margin: 10px;
}

.courseInfo .page {
  text-align: center;
  margin-top: 39px;
}

/* scoped 不能加scoped 否则改不了表格的表头样式 */

.search_item {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.search_item div {
  margin-right: 10px;
  margin-bottom: 2px;
}

/* ============================= */

.scheduleInit .curTime::before {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.schedule_box .ivu-table th {
  height: 62px;
}

.schedule_box .ivu-table td {
  height: 82px;
}

.teacherScheduleBox {
  display: flex;
}

.teacherScheduleBox .content {
  padding: 0;
  padding-bottom: 24px;
}

.teacherScheduleBox {
  display: flex;
}

.teacherScheduleBox .content2 {
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
}
.teacherScheduleBox .searchZone {
  background-color: #55a1ff;
  height: 48px;
  color: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.teacherScheduleBox .adjustCourse {
  width: 300px;
  /* height: 506px; */
  background-color: #fff;
  margin-left: 32px;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  /* 不自动收缩 */
  flex-shrink: 0;
  position: relative;
}

.adjustCourse .title {
  background-color: #ff9d76;
  width: 100%;
  height: 48px;
  text-align: center;
  line-height: 48px;
  color: #fff;
}

.teacherScheduleBox .adjustCourse .ivu-form-item {
  margin-bottom: 16px;
}

.teacherScheduleBox .adjustCourse .adjustTo {
  width: 100%;
  height: 22px;
  position: relative;
  margin: 30px 0;
}

.teacherScheduleBox .adjustCourse .liner {
  width: 100%;
  height: 1px;
  background-color: #ff4900;
  position: relative;
  top: 50%;
}

.teacherScheduleBox .adjustCourse .littleTitle {
  text-align: center;
  width: 70px;
  height: 22px;
  line-height: 22px;
  margin: 0 auto;
  background-color: #fff;
  position: relative;
  z-index: 3;
}

.teacherScheduleBox .adjustCourse .adjustToInfo .info {
  width: 100%;
  overflow-y: auto;
}

.teacherScheduleBox .adjustCourse .adjustToInfo .isConflict {
  text-align: center;
  color: #ff4900;
  margin: 40px 0 30px;
}

.teacherScheduleBox .adjustCourse .adjustToInfo .isConflict i {
  font-size: 24px;
}

.teacherScheduleBox .adjustCourse .adjustToInfo {
  text-align: left;
}

.teacherScheduleBox .adjustCourse .adjustToInfo,
.teacherScheduleBox .adjustCourse .adjustToForm {
  padding: 24px 24px 0;
  /* height: 410px; */
  overflow-y: auto;
}

.teacherScheduleBox .adjustCourse .footer {
  text-align: center;
  margin-top: 50px;
  width: 100%;
}

.teacherScheduleBox .adjustCourse .adjustToDefault {
  text-align: center;
  margin-top: 160px;
}

.teacherScheduleBox .adjustCourse .adjustToInfo .ivu-checkbox-inner {
  width: 14px;
  height: 14px;
  border: 1px solid #ff4900;
}

.blankBox .ivu-icon {
  width: 50px;
  height: 50px;
  display: none;
  font-size: 55px;
}

.blankBox:hover .ivu-icon {
  display: inline-block;
}
</style>
