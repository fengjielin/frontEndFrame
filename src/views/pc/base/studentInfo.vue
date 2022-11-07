<template>
  <div class="content">
    <div class="notice_search_area">
      <Form
        :model="searchData"
        :label-width="100"
        @submit.native.prevent
        inline
      >
        <!-- <FormItem label="学号：">
          <Input
            suffix="ios-search"
            @on-search="searchStudent"
            :search="true"
            type="text"
            v-model="searchData.xh"
            class="wd200"
            placeholder="输入关键字查询"
          ></Input>
        </FormItem>
        <FormItem label="姓名：">
          <Input
            suffix="ios-search"
            @on-search="searchStudent"
            :search="true"
            type="text"
            v-model="searchData.xm"
            class="wd200"
            placeholder="输入关键字查询"
          ></Input>
        </FormItem>
        <FormItem label="手机号码：">
          <Input
            suffix="ios-search"
            @on-search="searchStudent"
            :search="true"
            type="text"
            v-model="searchData.sjhm"
            class="wd200"
            placeholder="输入关键字查询"
          ></Input>
        </FormItem> -->
        <FormItem label="就读状态：" style="margin: 5px 0 0 0">
          <Select
            v-model="searchData.zt"
            @on-change="searchStudent"
            style="width: 200px"
            clearable
          >
            <Option value="S01" key="1">正常</Option>
            <Option value="S02" key="2">退学</Option>
          </Select>
        </FormItem>
        <FormItem style="margin: 5px 0 0px -100px">
          <Input
            suffix="ios-search"
            @on-search="searchStudent"
            :search="true"
            type="text"
            v-model="searchData.keyword"
            class="wd200"
            placeholder="姓名/学号/班级/手机"
          ></Input>
        </FormItem>
      </Form>
      <div>
        <Button
          v-if="checkAuth(['JCXXGL_XSXXGL_ADD'])"
          @click="show"
          type="primary"
          style="margin: 5px"
          >新增</Button
        >
        <Button
          v-if="checkAuth(['JCXXGL_XSXXGL_IMPORT'])"
          @click="showStudentImport"
          style="margin: 5px"
          type="primary"
          >导入</Button
        >
        <Button
          v-if="checkAuth(['JCXXGL_XSXXGL_IMPORT'])"
          @click="downloadStuTemplate"
          style="margin: 5px"
          type="primary"
          ghost
          >下载导入模板</Button
        >
      </div>
    </div>
    <div class="student mt16">
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

    <Modal
      v-model="importStudentModal"
      :closable="true"
      :mask-closable="false"
      :title="'学生导入'"
      width="400px"
      @on-cancel="modalClose"
    >
      <div style="padding: 0 30px">
        <Upload
          ref="stuUpload"
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
        <div style="margin-left: 100px;color: red;margin-top:10px;">
          tips:导入账号的默认密码为gzzj123456
        </div>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="importStudent" :loading="loading"
          >确认导入</Button
        >
      </div>
    </Modal>

    <Modal
      v-model="classModal"
      title="关联班级"
      width="800px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalClose"
    >
      <div class="content">
        <div
          class="notice_search_area"
          style="display: flex; justify-content: flex-end"
        >
          <Form :model="searchData" :label-width="100" inline style="flex: 1">
            <FormItem label="请选择关联班级">
              <Select v-model="data.bjId" style="width: 200px" filterable>
                <Option
                  v-for="(item, index) in teachClasss"
                  :value="item.id"
                  :key="index"
                  >{{ item.teachingClassName }}</Option
                >
              </Select>
              <!-- <Icon type="md-checkmark" @click="addStudentClass" size="18" /> -->
              <Button @click="addStudentClass" style="margin-left: 10px"
                >关联</Button
              >
            </FormItem>
          </Form>
        </div>
        <Table
          :loading="loading"
          :columns="classColumns"
          :data="tableData2"
          border
          style="margin-top: 10px"
        />
        <Page
          @on-change="changeClassPage"
          :total="classPage.totalNum"
          :current="classPage.pageNum"
          :page-size="classPage.pageSize"
          show-elevator
          show-total
          class="page"
        />
      </div>
    </Modal>

    <Modal
      v-model="showModal"
      :title="title"
      width="1000px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalClose"
    >
      <div class="modal">
        <Form
          :model="data"
          :rules="ruleValidate"
          ref="studentComp"
          :label-width="100"
          inline
        >
          <FormItem label="当前班级：" prop="bjId">
            <Select v-model="data.bjId" class="formInput">
              <Option v-for="item in banjis" :value="item.id" :key="item.id">{{
                item.bjmc
              }}</Option>
            </Select>
          </FormItem>
          <FormItem label="学号：" prop="xh">
            <Input
              type="text"
              v-model="data.xh"
              placeholder="请输入学号"
              class="formInput"
            ></Input>
          </FormItem>
          <div >
            <FormItem label="密码：" prop="accountPwd" key="accountPwd" v-if="data.id == ''" style="width:100%">
              <Input
                type="password"
                v-model="data.accountPwd"
                :placeholder="data.placeholder"
                class="formInput"
              ></Input>
            </FormItem>
            <FormItem label="密码：" key="accountPwd2" v-else style="width:100%">
              <Input
                type="password"
                v-model="data.accountPwd"
                :placeholder="data.placeholder"
                class="formInput"
              ></Input>
            </FormItem>
          </div>
          <div>
            <FormItem label="重复密码：" prop="repeatPwd" v-if="data.id == ''">
              <Input
                type="password"
                v-model="data.repeatPwd"
                :placeholder="data.placeholder"
                class="formInput"
              ></Input>
            </FormItem>
          </div>
          <FormItem label="学生姓名：" prop="xm">
            <Input
              type="text"
              v-model="data.xm"
              placeholder="请输入学生姓名"
              class="formInput"
              :maxlength="5"
            ></Input>
          </FormItem>
          <!-- <FormItem label="身份证号：">
            <Input
              type="text"
              v-model="data.sfzh"
              placeholder="请输入身份证号"
              class="formInput"
              :maxlength="18"
            ></Input>
          </FormItem> -->
          <FormItem label="学生性别：" prop="xb">
            <RadioGroup v-model="data.xb" type="button">
              <Radio label="1">男</Radio>
              <Radio label="0">女</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="手机号码：">
            <Input
              type="text"
              v-model="data.sjhm"
              placeholder="请输入手机号码"
              class="formInput"
              :maxlength="11"
            ></Input>
          </FormItem>
          <FormItem label="就读状态：">
            <Select v-model="data.zt" style="width: 200px">
              <Option value="S01" key="1">正常</Option>
              <Option value="S02" key="2">退学</Option>
            </Select>
          </FormItem>
          <FormItem label="退学时间：" v-if="data.zt == 'S02'">
            <DatePicker
              v-model="data.txsj"
              format="yyyy-MM-dd"
              type="date"
              placeholder="请选择退学时间"
              style="width: 200px"
            ></DatePicker>
          </FormItem>

          <!-- <FormItem label="学生头像：">
            <div ref="video_place" class="video_place">
              canvas截取流
              <canvas
                ref="canvas"
                width="200"
                height="200"
                style="opacity: 0"
              ></canvas>
              图片展示
              <div>
                <video
                  ref="video"
                  width="200"
                  height="200"
                  autoplay
                  style="position: absolute; left: 200px"
                ></video>
              </div>
              <Spin fix>
				                <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
				                <div>识别中...</div>
				            </Spin>
              <div
                style="
                  position: absolute;
                  left: 220px;
                  top: 400px;
                  display: flex;
                  justify-content: center;
                "
              >
                <Button type="primary" @click="photograph">确认上传</Button>
                <Button
                  type="primary"
                  @click="closeCamera"
                  style="margin-left: 5px"
                  >关闭</Button
                >
              </div>
            </div>

            <Upload
              ref="upload"
              :before-upload="handleBeforeUpload2"
              :show-upload-list="false"
              :multiple="false"
              :action="uploadActionUrl"
              :on-success="handleSuccess1"
              :format="['jpg', 'jpeg', 'png']"
              style="margin-bottom: 220px"
            >
              <div class="pc_pic">
                <div
                  v-show="showFlag_LogoAdd"
                  title="点击上传图片"
                  class="advert_upload_icon"
                >
                  <Icon type="ios-add" size="20"></Icon>
                </div>
                <div
                  v-show="showFlag_LogoImg"
                  title="点击上传图片"
                  class="advert_upload_img"
                >
                  <img
                    :src="data.userImg"
                    style="width: 150px; height: 200px"
                  />
                </div>
              </div>
            </Upload>
            <span class="upload_tip"
              >建议尺寸150像素X200像素，图片大小不超过5M</span
            >
            <div>
              <Button type="primary" @click="callCamera">开启摄像头上传</Button>
            </div>
          </FormItem> -->
          <!--<FormItem label="曾用名：">
						<Input type="text" v-model="data.everName" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="政治面貌：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="加入时间：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="入学方式：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="入学前学校：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="学生类别：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="学习形式：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="姓名拼音：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="民族：">
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="录取学校：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="入学年月：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="生源类别：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="就读方式：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="健康状况：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="户口所在地：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="户口地址：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="出生地：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="通讯地址：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="电子邮箱：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="是否低保：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="家长：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="家长电话：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="特长：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="学制：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>
					<FormItem label="备注：" >
						<Input type="text" v-model="data.sjhm" placeholder="请输入手机号码" class="formInput" :maxlength="11"></Input>
					</FormItem>-->
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok" :loading="loading">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    let that = this;
    var validatePassCheck = function (rule, value, callback) {
      if (value === "") {
        return callback(new Error("请再次输入密码"));
      } else if (value !== that.data.accountPwd) {
        return callback(new Error("两次密码不一致"));
      } else {
        callback();
      }
    };
    return {
      userInfo: this.$store.state.userInfo,
      showFlag_LogoAdd: true,
      showFlag_LogoImg: false,
      //图标上传url
      uploadActionUrl: this.interfaceUrl + "student/imageUpload",
      classModal: false,
      importStudentModal: false,
      actionUrl: this.interfaceUrl + "student/filesUpload",
      fileNameList: [],
      ruleValidate: {
        xh: [
          {
            required: true,
            message: "学号不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        xm: [
          {
            required: true,
            message: "学生不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        accountPwd: [
          {
            required: true,
            message: "密码不能为空",
            trigger: "blur",
          },
          // {
          //   min: 6,
          //   message: "请输入最少6位",
          // },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            // pattern: "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$",
            pattern: "^(?![A-Za-z0-9]+$)(?![a-z0-9#?!@$%^&*-.]+$)(?![A-Za-z#?!@$%^&*-.]+$)(?![A-Z0-9#?!@$%^&*-.]+$)[a-zA-Z0-9#?!@$%^&*-.]{8,16}$",
            message: "数字+大写字母+小写字母+特殊符号的组合，并且长度在8至16位",
            trigger: "blur",
          },
        ],
        repeatPwd: [
          {
            required: true,
            validator: validatePassCheck,
            trigger: "blur",
          },
          {
            min: 8,
            message: "请输入最少8位",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        sjhm: [
          {
            required: true,
            message: "手机号码不能为空",
            trigger: "blur",
          },
          {
            min: 11,
            message: "请输入最少11位",
          },
          {
            type: "string",
            pattern: /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/,
            message: "手机号码格式不正确",
            trigger: "blur",
          },
        ],
        xb: [
          {
            required: true,
            message: "请选择性别",
            trigger: "change",
          },
        ],
        bjId: [
          {
            required: true,
            type: "number",
            message: "请选择当前班级",
            trigger: "blur",
          },
        ],
      },
      nianjis: [],
      banjis: [],
      teachClasss: [],
      searchData: {
        xh: "",
        xm: "",
        sjhm: "",
        bjmc: "",
        zymc: "",
        njmc: "",
        zt: "",
        keyword: "",
      },
      curDepart: "",
      loading: false,
      showModal: false,
      title: "",
      tableData: [],
      tableData2: [],
      data: {
        userImg: "",
        id: "",
        xh: "",
        xm: "",
        sjhm: "",
        sfzh: "",
        njId: "",
        bjId: "",
        zt: "",
        txsj: new Date(),
        accountPwd: "",
        repeatPwd: "",
        xb: "",
      },
      activeName: "0",
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      classPage: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      classColumns: [
        {
          title: "班级名称",
          key: "teachingClassName",
          align: "center",
        },
        // {
        //   title: "年级",
        //   key: "njmc",
        //   width: 100,
        //   align: "center",
        // },
        // {
        //   title: "专业",
        //   key: "zymc",
        //   align: "center",
        // },
        // {
        //   title: "是否当前",
        //   key: "isCurrent",
        //   align: "center",
        //   render: (h, params) => {
        //     return h("span", params.row.isCurrent == "1" ? "是" : "否");
        //   },
        // },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 300,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.removeStudentClass(params.row);
                    },
                  },
                },
                "移除"
              ),
            ]);
          },
        },
      ],
      columns: [
        {
          title: "学号",
          key: "xh",
          align: "center",
        },
        {
          title: "班级名称",
          key: "bjmc",
          align: "center",
        },
        {
          title: "学生名称",
          key: "xm",
          align: "center",
        },
        {
          title: "性别",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.xb == "1" ? "男" : params.row.xb == "0" ? "女" : ""
            );
          },
        },
        {
          title: "手机号码",
          key: "sjhm",
          align: "center",
        },
        // {
        //   title: "身份证号",
        //   key: "sfzjh",
        //   align: "center",
        // },
        {
          title: "就读状态",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.zt == "S01"
                ? "正常"
                : params.row.zt == "S02"
                ? "退学"
                : ""
            );
          },
        },
        // {
        //   title: "头像是否入库",
        //   align: "center",
        //   render: (h, params) => {
        //     return h("span", params.row.faceToken ? "是" : "否");
        //   },
        // },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h("div", [
              // h(
              //   "Button",
              //   {
              //     props: {
              //       type: "primary",
              //       size: "small",
              //     },
              //     style: {
              //       marginRight: "3px",
              //     },
              //     on: {
              //       click: () => {
              //         this.userAdd(params.row);
              //       },
              //     },
              //   },
              //   "头像入库"
              // ),
              // h(
              //   "a",
              //   {
              //     props: {},
              //     style: {
              //       marginRight: "22px",
              //       color: "#1B81FF",
              //     },
              //     on: {
              //       click: () => {
              //         this.showStudentClass(params.row);
              //       },
              //     },
              //   },
              //   "关联班级"
              // ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["JCXXGL_XSXXGL_UPDATE"])
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
                    display: this.checkAuth(["JCXXGL_XSXXGL_DELETE"])
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
    this.userInfo.isAdmin = 1
    this.getStudent();
    this.getBanji();
  },
  methods: {
    // 调用摄像头
    callCamera() {
      let $ = this.jQuery;
      $(".video_place").show();
      //				this.$refs['video_place'].display = 'block';
      // H5调用电脑摄像头API
      let that = this;
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((success) => {
          // 摄像头开启成功
          this.$refs["video"].srcObject = success;
          // 实时拍照效果
          this.$refs["video"].play();
        })
        .catch((error) => {
          console.error(error);
          that.messageError("摄像头开启失败，请检查摄像头是否可用！");
          console.error("摄像头开启失败，请检查摄像头是否可用！");
        });
    },
    // 拍照
    photograph() {
      let $ = this.jQuery;
      let that = this;
      if ($(".video_place").is(":hidden")) {
        that.messageError("请先开启人脸识别");
        return;
      }
      $(".video_place").hide();
      let ctx = this.$refs["canvas"].getContext("2d");
      // 把当前视频帧内容渲染到canvas上
      ctx.drawImage(this.$refs["video"], 0, 0, 200, 200);
      // 转base64格式、图片格式转换、图片质量压缩
      let imgBase64 = this.$refs["canvas"].toDataURL("image/jpeg", 0.7); // 由字节转换为KB 判断大小

      let str = imgBase64.replace("data:image/jpeg;base64,", "");
      let strLength = str.length;
      let fileLength = parseInt(strLength - (strLength / 8) * 2); // 图片尺寸  用于判断
      let size = (fileLength / 1024).toFixed(2); // 上传拍照信息  调用接口上传图片 .........

      let arr = imgBase64.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let file = new File([u8arr], "aa.jpg", {
        type: mime,
      });

      let formData = new FormData();
      formData.append("file", file);
      $.ajax({
        type: "POST", // 数据提交类型
        url: that.uploadActionUrl, // 发送地址
        data: formData, //发送数据
        async: true, // 是否异步
        processData: false, //processData 默认为false，当设置为true的时候,jquery ajax 提交的时候不会序列化 data，而是直接使用data
        contentType: false,
        success: function (data) {
          if (data.url) {
            that.showFlag_LogoAdd = false;
            that.showFlag_LogoImg = true;
            that.data.userImg = that.interfaceUrl + data.url;
          } else {
            that.messageError("上传失败");
          }
          that.closeCamera();
        },
        error: function (e) {
          that.$Message.warning("请求失败");
          that.spinShow = false;
          //console.log("不成功"+e);
        },
      });

      // 保存到本地
      //				let ADOM = document.createElement('a')
      //				ADOM.href = this.headImgSrc
      //				ADOM.download = new Date().getTime() + '.jpeg'
      //				ADOM.click()
    },
    // 关闭摄像头
    closeCamera() {
      let $ = this.jQuery;
      $(".video_place").hide();
      if (!this.$refs["video"].srcObject) return;
      let stream = this.$refs["video"].srcObject;
      let tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.$refs["video"].srcObject = null;
    },
    //处理上传附件之前的内容
    handleBeforeUpload2(file) {
      let flag = file.size > 5242880;
      if (flag) {
        this.$Message.warning("上传文件大小不能超过5Mb");
        return false;
      }
    },
    handleSuccess1(res, file) {
      this.showFlag_LogoAdd = false;
      this.showFlag_LogoImg = true;
      this.data.userImg = this.interfaceUrl + res.url;
    },
    addStudentClass() {
      let that = this;
      if (that.data.bjId == "") {
        this.$Modal.error({
          title: "提示",
          content: "请选择关联班级",
          closable: true,
        });
        return;
      }
      let data = {
        studentId: that.data.id == null ? "" : that.data.id,
        classesId: that.data.bjId,
      };
      that.axios
        .post(
          that.interfaceUrl + "teachingClassStudent/bindClasses",
          that.qs(data)
        )
        .then(function (res) {
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            // that.getStudentClass();
            that.getTeachingClassStudent();
            that.getStudent();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    showStudentImport() {
      this.$refs.stuUpload.clearFiles();
      this.importStudentModal = true;
    },
    downloadStuTemplate() {
      window.open(this.interfaceUrl + "student/downloadStuTemplate");
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
    importStudent() {
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
        .post(that.interfaceUrl + "student/studentImport", that.qs(data))
        .then(function (res) {
          that.loading = false;
          that.fileNameList = []
          if (res.data.state) {
            that.importStudentModal = false;
            that.getStudent();
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
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    searchStudent() {
      this.page.pageNum = 1;
      this.getStudent();
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
          if (res.data.state) {
            that.nianjis = res.data.nianjiList;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    getBanji(callback) {
      let that = this;
      that.axios
        .post(
          that.interfaceUrl + "banji/selectAllByPage",
          that.qs({
            pageNum: 1,
            pageSize: 10000,
            pastemId:
              that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.banjis = res.data.banJiList;
            callback ? callback() : "";
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    getStudentClass() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "studentClass/selectAllByPage",
          that.qs({
            pageNum: that.classPage.pageNum,
            pageSize: that.classPage.pageSize,
            studentId: that.data.id,
            bjmc: that.searchData.bjmc,
            zymc: that.searchData.zymc,
            njmc: that.searchData.njmc,
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.classPage.totalNum = res.data.dataCount;
            that.tableData2 = res.data.studentClassList;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    getStudent() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "student/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
            pastemId:
              that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
            xh: that.searchData.xh,
            xm: that.searchData.xm,
            sjhm: that.searchData.sjhm,
            bjmc: that.searchData.bjmc,
            zt: that.searchData.zt ? that.searchData.zt : "",
            keyword: that.searchData.keyword ? that.searchData.keyword : "",
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            if (res.data.studentList) {
              res.data.studentList.forEach(function (o, i) {
                o.txsj = o.txsj ? new Date(o.txsj).format("yyyy-MM-dd") : "";
              });
            }
            that.tableData = res.data.studentList;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    changePage(i) {
      this.page.pageNum = i;
      this.getStudent();
    },
    changeClassPage(i) {
      this.classPage.pageNum = i;
      this.getStudentClass();
    },
    userAdd(row) {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "face/userAdd",
          that.qs({
            userInfoId: row.userInfoId,
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("入库成功");
            that.getStudent();
          } else {
            that.$Message.error(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    showStudentClass(row) {
      this.data.id = row.id;
      this.classModal = true;
      // this.getStudentClass();
      this.getTeachingClass();
      this.getTeachingClassStudent();
    },
    show(row) {
      if (row.id) {
        this.title = "修改学生";
        this.data.id = row.id;
        this.data.xh = row.xh;
        this.data.xm = row.xm;
        this.data.xb = row.xb;
        this.data.sjhm = row.sjhm;
        this.data.sfzh = row.sfzjh;
        this.data.accountPwd = "";
        this.data.repeatPwd = "";
        this.data.njId = row.njId;
        this.data.zt = row.zt ? row.zt : "S01";
        if(row.txsj){
          this.data.txsj = new Date(row.txsj);
        }else{
          this.data.txsj = new Date()
        }
        this.data.userId = row.userInfoId;

        if (row.userImg) {
          this.showFlag_LogoAdd = false;
          this.showFlag_LogoImg = true;
          this.data.userImg = this.interfaceUrl + row.userImg;
        } else {
          this.showFlag_LogoAdd = true;
          this.showFlag_LogoImg = false;
        }

        let that = this;
        this.getBanji(function () {
          that.$nextTick(function () {
            that.data.bjId = row.bjId;
          });
        });
        this.data.placeholder = "不输入密码则不修改密码";
      } else {
        this.title = "新增学生";
        this.showFlag_LogoAdd = true;
        this.showFlag_LogoImg = false;
        this.data.userImg = "";
        this.data.id = "";
        this.data.xh = "";
        this.data.xm = "";
        this.data.xb = "";
        this.data.zt = "S01";
        this.data.sfzh = "";
        this.data.accountPwd = "";
        this.data.repeatPwd = "";
        this.data.sjhm = row.sjhm;
        this.data.njId = "";
        this.data.bjId = "";
        this.data.placeholder = "请设置密码";
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["studentComp"].validate((valid) => {
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
      if(that.data.id && that.data.accountPwd){
        let reg = new RegExp("^(?![A-Za-z0-9]+$)(?![a-z0-9#?!@$%^&*-.]+$)(?![A-Za-z#?!@$%^&*-.]+$)(?![A-Z0-9#?!@$%^&*-.]+$)[a-zA-Z0-9#?!@$%^&*-.]{8,16}$")
        if(!reg.test(that.data.accountPwd)){
          return that.$Modal.error({
            title: "提示",
            content: "密码强度过低，需要为 数字+大写字母+小写字母+特殊符号的组合，并且长度在8至16位。"
          })
        }
      }
      if (that.data.zt == "S02") {
        console.log(that.data.txsj);
        if (
          that.data.txsj == null ||
          that.data.txsj == undefined ||
          that.data.txsj == ""
        ) {
          that.$Modal.error({
            title: "提示",
            content: "请选择退学时间",
            closable: true,
          });
          return;
        }
      }
      if (
        that.data.sfzh != null &&
        that.data.sfzh != undefined &&
        that.data.sfzh != ""
      ) {
        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (!reg.test(that.data.sfzh)) {
          that.$Modal.error({
            title: "提示",
            content: "身份证号格式错误",
            closable: true,
          });
          return;
        }
      }
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        xh: that.data.xh,
        xm: that.data.xm,
        xb: that.data.xb,
        userImg: that.data.userImg,
        sfzh: that.data.sfzh ? that.data.sfzh : "",
        password: that.data.accountPwd,
        sjhm: that.data.sjhm ? that.data.sjhm : "",
        bjId: that.data.bjId,
        zt: that.data.zt,
        txsj: that.data.txsj
          ? new Date(that.data.txsj)
          : "",
        userId: this.data.userId ? this.data.userId : "",
      };
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "student/dealStudent", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getStudent();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          console.log(e);
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    modalClose() {
      this.showModal = false;
      this.importStudentModal = false;
      this.fileNameList = []
      this.classModal = false;
      this.$refs["studentComp"].resetFields();
    },
    updateStudentClass(row, type) {
      let that = this;
      let str =
        type == "T01"
          ? "确定删除 " + row.xm + "吗？"
          : type == "T02"
          ? "确定取消设置吗？"
          : "确定将该班级设置为当前班级吗？";
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: str,
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "studentClass/delStudentClass",
              that.qs({
                type: type,
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("操作成功");
                that.page.pageNum = 1;
                that.getStudent();
                that.getStudentClass();
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
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.xm + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "student/delStudent",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getStudent();
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

    // 获取未关联教学班的数据
    getTeachingClass() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 99999,
        studentId: that.data.id,
      };
      that.axios
        .post(
          that.interfaceUrl + "teachingClassStudent/findArrUnBoundClass",
          that.qs(data)
        )
        .then(function (res) {
          console.log(res);
          if (res.data.state) {
            that.teachClasss = res.data.data;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取已关联教学班的数据
    getTeachingClassStudent() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "teachingClassStudent/findAllBoundClass",
          that.qs({
            pageNum: that.classPage.pageNum,
            pageSize: that.classPage.pageSize,
            studentId: that.data.id,
          })
        )
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.classPage.totalNum = res.data.dataCount;
            that.tableData2 = res.data.data;
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },

    removeStudentClass(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定移除关联吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "teachingClassStudent/unBoundClasses",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.classPage.pageNum = 1;
                that.getTeachingClassStudent();
              } else {
                that.$Message.error(res.data.message);
              }
            });
          // .catch(function (e) {
          //   that.messageError("服务器错误" + e);
          // });
        },
      });
    },
  },
};
</script>

<style scoped>
.video_place {
  display: none;
  z-index: 1100;
  position: absolute;
  top: -215px;
}
.advert_upload_icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 150px;
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
  width: 150px;
  height: 200px;
  z-index: 5;
  text-align: center;
  cursor: pointer;
}
.modal {
  padding-left: 100px;
}

.formInput {
  width: 240px;
}

.content .student {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}
.page {
  text-align: center;
  margin-top: 39px;
}
</style>
