<template>
  <div class="content">
    <div class="notice_search_area">
      <Form
        :model="searchData"
        :label-width="50"
        inline
        @submit.native.prevent
        style="display: flex; justify-content: flex-end; width: 100%"
      >
        <div>
          <!--
							<FormItem label="工号" style=" margin-bottom: 0;">
								<Input suffix="ios-search" @on-search="searchTeacher" :search="true" type="text"
									v-model="searchData.gh" class="wd200" placeholder="输入关键字查询" maxlength="20"></Input>
							</FormItem>
							<FormItem label="姓名" style=" margin-bottom: 0;">
								<Input suffix="ios-search" @on-search="searchTeacher" :search="true" type="text"
									v-model="searchData.xm" class="wd200" placeholder="输入关键字查询" maxlength="20"></Input>
							</FormItem> -->
          <FormItem style="margin:5px 0 5px 0" :label-width="0">
            <Input
              suffix="ios-search"
              @on-search="searchTeacher"
              :search="true"
              type="text"
              v-model="searchData.keyword"
              class="wd200"
              placeholder="工号/姓名/手机"
              maxlength="20"
            ></Input>
          </FormItem>
        </div>
        <div>
          <Button
            @click="show"
            type="primary"
            style="margin: 5px"
            v-if="checkAuth(['JSJBDM_ADD'])"
            >新增</Button
          >
          <Button
            @click="showTeacherImport"
            style="margin: 5px"
            type="primary"
            v-if="checkAuth(['JSJBDM_IMPORT'])"
            >导入</Button
          >
          <Button
            @click="downloadTeaTemplate"
            style="margin: 5px"
            type="primary"
            ghost
            v-if="checkAuth(['JSJBDM_IMPORT'])"
            >下载导入模板</Button
          >
        </div>
      </Form>
    </div>
    <div class="teacher mt16">
      <div class="teacher_left">
        <Menu theme="light">
          <MenuGroup title="院系名称" style="position: relative" class="tree_menu">
            <Tree
              style="padding-left: 15px; padding-top: 10px;overflow: auto;min-height: 550px;"
              :data="treeData"
              :loading="loading"
              :render="renderContent"
            ></Tree>
          </MenuGroup>
        </Menu>
      </div>
      <div class="teacher_right">
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
        v-model="importTeacherModal"
        :closable="true"
        :mask-closable="false"
        :title="'教师导入'"
        width="400px"
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
          <div style="margin-left: 100px;color: red;margin-top:10px;">
            tips:导入账号的默认密码为gzzj123456
          </div>
        </div>
        <div slot="footer" style="text-align: center">
          <Button @click="modalClose">取消</Button>
          <Button type="primary" @click="importTeacher" :loading="loading"
            >确认导入</Button
          >
        </div>
      </Modal>

      <Modal
        v-model="showModal"
        :title="title"
        width="1200px"
        :closable="true"
        :mask-closable="false"
        @on-cancel="modalClose"

      >
        <div class="modal">
          <Form
            :model="data"
            :rules="ruleValidate"
            ref="teacherComp"
            :label-width="100"
            style="display:flex"
          >
            <div>
            <!-- <FormItem label="所属部门：" prop="departId">
              <Select filterable v-model="data.departId" class="formInput">
                <Option
                  v-for="item in departs"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.bmmc }}</Option
                >
              </Select>
            </FormItem> -->
			<FormItem label="所属院系：" prop="pastemId">
			  <Select filterable v-model="data.pastemId" class="formInput">
			    <Option
			      v-for="item in pastems"
			      :value="item.id"
			      :key="item.id"
			      >{{ item.xbmc }}</Option
			    >
			  </Select>
			</FormItem>
            <FormItem label="教师工号：" prop="gh">
              <Input
                type="text"
                v-model="data.gh"
                placeholder="请输入教师工号"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="密码：" prop="accountPwd" key="accountPwd" v-if="data.id == ''">
              <Input
                type="password"
                v-model="data.accountPwd"
                :placeholder="data.placeholder"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="密码：" key="accountPwd2" v-else>
              <Input
                type="password"
                v-model="data.accountPwd"
                :placeholder="data.placeholder"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="重复密码：" prop="repeatPwd" v-if="data.id == ''">
              <Input
                type="password"
                v-model="data.repeatPwd"
                :placeholder="data.placeholder"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="教师姓名：" prop="xm">
              <Input
                type="text"
                v-model="data.xm"
                placeholder="请输入教师姓名"
                class="formInput"
                :maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="教师性别：">
              <RadioGroup v-model="data.sex" type="button">
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
            <FormItem label="所属角色：" prop="roleId">
              <div style="width:425px">
              <div
                style="
                  border-bottom: 1px solid #e9e9e9;
                  padding-bottom: 6px;
                  margin-bottom: 6px;
                "
              >
                <Checkbox
                  :indeterminate="indeterminate"
                  :value="checkAll"
                  @click.prevent.native="handleCheckAll"
                  >全选</Checkbox
                >
              </div>
              <CheckboxGroup
                v-model="data.roleId"
                @on-change="checkAllGroupChange"
              >
                <Checkbox
                  :label="item.id"
                  v-for="item in rolesList"
                  :key="item.id"
                  >{{ item.roleName }}</Checkbox
                >
              </CheckboxGroup>
              </div>
            </FormItem>
            </div>
            <div>
            <FormItem label="可查看专业范围：">
              <!-- <Select v-model="data.zhunayeId" multiple style="width: 260px">
                <Option
                  v-for="item in zhuanYeList"
                  :value="item.id"
                  :key="item.id"
                  >{{ item.zymc }}</Option
                >
              </Select> -->
              <div
                style="
                  border-bottom: 1px solid #e9e9e9;
                  padding-bottom: 6px;
                  margin-bottom: 6px;
                "
              >
                <Checkbox
                  :indeterminate="indeterminate2"
                  :value="checkAll2"
                  @click.prevent.native="handleCheckAll2"
                  >全选</Checkbox
                >
              </div>
              <div v-for="item in zhuanYeList" :key="item.id" :label="item.id">
                <strong>{{ item[0].pastemName}}</strong>
                <CheckboxGroup
                  v-model="data.zhunayeId"
                  @on-change="checkAllGroupChange2"
                >
                  <Checkbox
                    v-for="i in item"
                    :label="i.id"
                    :key="i.id"
                    >{{ i.zymc }}</Checkbox
                  >
                </CheckboxGroup>
              </div>

            </FormItem>
            </div>
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
    var validatePassCheck = function (rule, value, callback) {
      // console.log(value)
      if (value === "") {
        return callback(new Error("请再次输入密码"));
      } else if (value !== that.data.accountPwd) {
        return callback(new Error("两次密码不一致"));
      } else {
        callback();
      }
    };
    return {
      indeterminate: false,
      checkAll: false,
      roleIdList: [],
      zhunayeIdList: [],

      indeterminate2: false,
      checkAll2: false,

      userInfo: this.$store.state.userInfo,
      treeData: [],
      SelectClass: "ivu-tree-title ivu-tree-title-selected",
      DefineClass: "ivu-tree-title",
      showFlag_LogoAdd: true,
      showFlag_LogoImg: false,
      importTeacherModal: false,
      //图标上传url
      uploadActionUrl: this.interfaceUrl + "teacher/imageUpload",
      actionUrl: this.interfaceUrl + "teacher/filesUpload",
      initPermissions: "授课老师",
      fileNameList: [],
      ruleValidate: {
        gh: [
          {
            required: true,
            message: "教师工号不能为空",
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
            message: "教师不能为空",
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
            // pattern: "[^\\s+]",
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
        sex: [
          {
            required: true,
            message: "请选择性别",
            trigger: "change",
          },
        ],
        // departId: [
        //   {
        //     required: true,
        //     message: "请选择所属部门",
        //     trigger: "blur",
        //   },
        // ],
		pastemId: [
		  {
		    required: true,
		    message: "请选择所属院系",
		    trigger: "blur",
			type: "number",
		  },
		],
        roleId: [
          {
            required: true,
            type: "array",
            message: "请选择所属角色",
            trigger: "blur",
          },
        ],
        zhunayeId: [
          {
            required: true,
            type: "array",
            message: "请选择可查看的专业范围",
            trigger: "blur",
          },
        ],
      },
      departs: [],
	  pastems: [],
      searchData: {
        gh: "",
        xm: "",
        sjhm: "",
        keyword: "",
		pastemId:"",
      },
      curDepart: "",
      selectedType: "",
      loading: false,
      showModal: false,
      title: "",
      tableData: [],
      data: {
        userImg: "",
        id: "",
        gh: "",
        xm: "",
        sjhm: "",
        departId: "",
        accountPwd: "",
        repeatPwd: "",
        sex: "",
        roleId: [],
        zhunayeId: [],
        pastemId:"",
      },
      activeName: "0",
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "教师工号",
          key: "gh",
          align: "center",
          minWidth: 150,
        },
        {
          title: "教师姓名",
          key: "xm",
          align: "center",
          minWidth: 120,
        },
        // {
        //   title: "性别",
        //   align: "center",
        //   minWidth: 80,
        //   render: (h, params) => {
        //     return h(
        //       "span",
        //       params.row.xb == "1" ? "男" : params.row.xb == "0" ? "女" : ""
        //     );
        //   },
        // },
        {
          title: "手机号码",
          key: "sjhm",
          align: "center",
          minWidth: 130,
        },
        {
          title: "所属角色",
          key: "roleName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "可查看的专业范围",
          key: "zhuanYeName",
          align: "center",
          minWidth: 160,
          render: (h, params) => {
            if(params.row.zhuanYeName){
              return this.setTooltip(h, params.row.zhuanYeName,16)
            }
          }
        },
        // {
        //   title: "头像是否入库",
        //   key: "sjhm",
        //   align: "center",
        //   minWidth: 150,
        //   render: (h, params) => {
        //     return h("span", "");
        //   },
        // },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h("span", [
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
              //         // this.show(params.row);
              //       },
              //     },
              //   },
              //   "头像入库"
              // ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["JSJBDM_UPDATE"])
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
                    display: this.checkAuth(["JSJBDM_DELETE"])
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

      // 所属角色
      rolesList: [],

      // 可查看专业
      zhuanYeList: [],
    };
  },
  mounted() {
    this.userInfo.isAdmin = 1
    // this.getDeparts();
	this.getPastems();
    // this.getTreeDepart();
	this.getAllTeacher();
	this.getTreePastem();
    this.getRoles();
    this.getZhuanye();
  },
  methods: {
    // 角色的复选框
    handleCheckAll() {
      if (this.indeterminate) {
        this.checkAll = false;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;

      if (this.checkAll) {
        this.data.roleId = this.roleIdList;
      } else {
        this.data.roleId = [];
      }
    },
    checkAllGroupChange(data) {
      if (data.length === this.roleIdList.length) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (data.length > 0) {
        this.indeterminate = true;
        this.checkAll = false;
      } else {
        this.indeterminate = false;
        this.checkAll = false;
      }
    },

    // 专业的复选框
    handleCheckAll2() {
      if (this.indeterminate2) {
        this.checkAll2 = false;
      } else {
        this.checkAll2 = !this.checkAll2;
      }
      this.indeterminate2 = false;

      if (this.checkAll2) {
        this.data.zhunayeId = this.zhunayeIdList;
      } else {
        this.data.zhunayeId = [];
      }
    },
    checkAllGroupChange2(data) {
      if (data.length === this.zhunayeIdList.length) {
        this.indeterminate2 = false;
        this.checkAll2 = true;
      } else if (data.length > 0) {
        this.indeterminate2 = true;
        this.checkAll2 = false;
      } else {
        this.indeterminate2 = false;
        this.checkAll2 = false;
      }
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

              this.page.pageNum = 1;

              this.selectedType = data.type;
              if (!this.selectedType) {
                this.curDepart = data;
                this.data.departId = data.id;
                this.searchData.pastemId = '';
              } else {
                this.userInfo.pastemId = data.id;
                this.curDepart = null;
                this.data.departId = "";
                this.searchData.pastemId = data.id;
              }
              this.getTeacher();
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
    // 调用摄像头
    callCamera() {
      let $ = this.jQuery;
      $(".video_place").show();
      //this.$refs['video_place'].display = 'block';
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
      let imgBase64 = this.$refs["canvas"].toDataURL("image/jpeg", 0.7);

      // 由字节转换为KB 判断大小
      let str = imgBase64.replace("data:image/jpeg;base64,", "");
      let strLength = str.length;
      let fileLength = parseInt(strLength - (strLength / 8) * 2); // 图片尺寸  用于判断
      let size = (fileLength / 1024).toFixed(2);

      // 上传拍照信息  调用接口上传图片 .........
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
          // console.log(res);
          if (res.data.state) {
            that.$Message.success("入库成功");
            that.getTeacher();
          } else {
            that.$Message.error(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
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
      (this.showFlag_LogoAdd = false),
        (this.showFlag_LogoImg = true),
        (this.data.userImg = this.interfaceUrl + res.url);
    },
    showTeacherImport() {
      // if(!this.curDepart){
      //   this.$Message.warning("请选择部门")
      //   return
      // }
	  if(!this.searchData.pastemId){
	  		  this.$Modal.warning({
	  		    title: "提示",
	  		    content: "请选择院系",
	  		    closable: true,
	  		  });
	  		  return;
	  }
      this.$refs.teaUpload.clearFiles();
      this.importTeacherModal = true;
    },
    downloadTeaTemplate() {
      window.open(this.interfaceUrl + "teacher/downloadTeaTemplate");
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
    //导入教师信息
    importTeacher() {
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
        initPermissions: that.initPermissions,
        // bmId:this.curDepart.id,
		pastemId: this.searchData.pastemId
      };
      //console.log(data)
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "teacher/teacherImport", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.importTeacherModal = false;
            that.fileNameList = []
            that.getTeacher();
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
    searchTeacher() {
      this.page.pageNum = 1;
      this.getTeacher();
    },
    //获取树结构院系
    // getTreeDepart() {
    //   let that = this;
    //   that.loading = true;
    //   that.axios
    //     .post(
    //       that.interfaceUrl + "depart/getTreeDepartment",
    //       that.qs({
    //         pastemId: that.userInfo.pastemId,
    //         isAdmin: that.userInfo.isAdmin,
    //       })
    //     )
    //     .then(function (res) {
    //       that.loading = false;
    //       if (res.data.state) {
    //         if(res.data.pastemList){
    //           res.data.pastemList.forEach(function (o, i) {
    //             if (o.departments) {
    //               o.children = o.departments;
    //             }
    //           });
    //           that.treeData = res.data.pastemList;
    //         }
    //       } else {
    //         that.messageError(res.data.msg);
    //       }
    //     });
    // },

	//获取树结构院系
	getTreePastem() {
	  let that = this;
	  that.loading = true;
	  that.axios
	    .post(
	      that.interfaceUrl + "pastem/getTreePastem",
	      that.qs({
	      })
	    )
	    .then(function (res) {
	      if (res.data.state) {
	        that.treeData = res.data.pastemList;
	        that.getPastems()
	      } else {
	        that.messageError(res.data.msg);
	      }
	    });
	},

	// 获取全部院系
	getPastems() {
	  let that = this;
	  that.loading = true;
	  that.axios
	    .post(
	      that.interfaceUrl + "pastem/selectAllByPage",
	      that.qs({
	        pageNum: that.page.pageNum,
	        pageSize: 9999999,
	      })
	    )
	    .then(function (res) {
	      that.loading = false;
	      if (res.data.state) {
	        that.pastems = res.data.pastemList;
	      } else {
	        that.messageError(res.data.msg);
	      }
	    });
	},

    // getDeparts() {
    //   let that = this;
    //   that.loading = true;
    //   that.axios
    //     .post(
    //       that.interfaceUrl + "depart/selectAllByPage",
    //       that.qs({
    //         pageNum: 1,
    //         pageSize: 100,
    //         // pastemId:
    //         //   that.userInfo.isAdmin == "1" ? "" : that.userInfo.pastemId,
    //       })
    //     )
    //     .then(function (res) {
    //       // 返回部门的数据
    //       if (res.data.state) {
    //         if(res.data.departList){
    //           that.departs = res.data.departList;
    //           that.departs.sort((a, b) => a.bmmc.localeCompare(b.bmmc)) // 升序
    //         }

    //         //						if(res.data.departList.length > 0) {
    //         //							that.curDepart = res.data.departList[0];
    //         //						}
    //         //						that.$nextTick(function() {
    //         //							that.activeName = 0;
    //         //							that.data.departId = that.curDepart.id;
    //         //						})
    //         // that.getTeacher();
    //         that.getAllTeacher();
    //         that.loading = false;
    //       } else {
    //         that.messageError(res.data.msg);
    //       }
    //     })
    //     .catch(function (e) {
    //       that.messageError("服务器错误" + e);
    //     });
    // },

    //选择系部
    choseDepart(index) {
      this.page.pageNum = 1;
      if (index == 0) {
        this.curDepart = null;
      } else {
        this.curDepart = this.departs[index - 1];
        this.data.departId = this.curDepart.id;
      }

      this.getTeacher();
    },
    getTeacher() {
      let that = this;
      that.loading = true;
      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,
        departId: that.curDepart ? that.curDepart.id : "",
        pastemId: this.searchData.pastemId?this.searchData.pastemId:'',

        //查询所需的三个参数
        /* gh: that.searchData.gh,
					xm: that.searchData.xm, */
        sjhm: that.searchData.sjhm,
        keyword: that.searchData.keyword ? that.searchData.keyword : "",
      };
      if(that.searchData.keyword){
        // data.departId = ""
        // data.pastemId = ""
      }
      that.axios
        .post(that.interfaceUrl + "teacher/selectAllByPage", that.qs(data))
        .then(function (res) {
          // console.log(data)
          if (res.data.state) {
            // console.log(res.data);
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.teacherList;
            that.loading = false;
          } else {
            that.loading = false;
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.loading = false;
          that.messageError("服务器错误" + e);
        });
    },
    getAllTeacher() {
      let that = this;
      that.loading = true;
      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,
      };
      that.axios
        .post(that.interfaceUrl + "teacher/selectAllByPage", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.teacherList;
            that.loading = false;
          } else {
            that.loading = false;
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
      if(this.curDepart || this.searchData.pastemId){
        this.getTeacher();
      }else{
        this.getAllTeacher();
      }
    },
    show(row) {
      this.$refs["teacherComp"].resetFields();
      if (row.id) {
        this.title = "修改教师";
        this.data.id = row.id;
        this.data.gh = row.gh;
        this.data.xm = row.xm;
        this.data.sex = row.xb;
        this.data.sjhm = row.sjhm;
        this.data.accountPwd = "";
        this.data.repeatPwd = "";
		this.data.pastemId = row.pastemId;
        // this.data.departId = row.departId;
        this.data.placeholder = "不输入密码则不修改密码";
        this.data.roleId = row.roleIdStr?row.roleIdStr.split(","):[];
        let zhunayeId = [];
        if (row.zhuanYeIdStr) {
          row.zhuanYeIdStr.split(",").forEach((item) => {
            zhunayeId.push(item * 1);
          });
        }
        this.data.zhunayeId = zhunayeId;

        if (this.data.roleId.length === this.roleIdList.length) {
          this.indeterminate = false;
          this.checkAll = true;
        } else if (this.data.roleId.length > 0) {
          this.indeterminate = true;
          this.checkAll = false;
        } else {
          this.indeterminate = false;
          this.checkAll = false;
        }

        if (this.data.zhunayeId.length === this.zhunayeIdList.length) {
          this.indeterminate2 = false;
          this.checkAll2 = true;
        } else if (this.data.zhunayeId.length > 0) {
          this.indeterminate2 = true;
          this.checkAll2 = false;
        } else {
          this.indeterminate2 = false;
          this.checkAll2 = false;
        }

        if (row.userImg) {
          this.showFlag_LogoAdd = false;
          this.showFlag_LogoImg = true;
          this.data.userImg = this.interfaceUrl + row.userImg;
        } else {
          this.showFlag_LogoAdd = true;
          this.showFlag_LogoImg = false;
        }
      } else {
        this.title = "新增教师";
        this.showFlag_LogoAdd = true;
        this.showFlag_LogoImg = false;
        this.data.id = "";
        this.data.gh = "";
        this.data.xm = "";
        this.data.sex = "";
        this.data.accountPwd = "";
        this.data.repeatPwd = "";
        this.data.sjhm = row.sjhm;
        this.data.placeholder = "请设置密码";
        this.data.roleId = [];
        this.data.zhunayeId = [];

        this.indeterminate = false;
        this.checkAll = false;
        this.indeterminate2 = false;
        this.checkAll2 = false;
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["teacherComp"].validate((valid) => {
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
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        gh: that.data.gh,
        xm: that.data.xm,
        xb: that.data.sex?that.data.sex:"",
        userImg: that.data.userImg,
        password: that.data.accountPwd,
        sjhm: that.data.sjhm?that.data.sjhm:"",
        // departId: that.data.departId,
		pastemId: that.data.pastemId,
        initPermissions: that.initPermissions,
        majorStr: that.data.zhunayeId, // 专业Id数组
        roleIdStr: that.data.roleId, // 角色权限Id数组
      };
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "teacher/dealTeacher", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.loading = false;
            that.showModal = false;
            if(that.curDepart || that.searchData.pastemId){
              that.getTeacher();
            }else{
              that.getAllTeacher();
            }
          } else {
            that.loading = false;
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
      this.importTeacherModal = false;
      this.fileNameList = [];
	  let pastemId = this.data.pastemId;
      this.$refs["teacherComp"].resetFields();
	  this.data.pastemId = pastemId;
    },

    remove(row) {
      let that = this;

      let data = {
        id: row.id,
      };
      that.axios
        .post(that.interfaceUrl + "teacher/delTeacherCheck", that.qs(data))
        .then(function (res) {
          // console.log(res)
          if (res.data.state == false) {
            // 验证查验到了教学班
            // console.log(res.data.msg)
            that.$Modal.warning({
              closable: true,
              title: "提示",
              content: res.data.msg,
            });
          } else {
            /* that.messageError(res.data.msg); */
            that.$Modal.confirm({
              closable: true,
              title: "提示",
              content: "确定删除 " + row.xm + " 吗？",
              onOk: function () {
                that.axios
                  .post(
                    that.interfaceUrl + "teacher/delTeacher",
                    that.qs({
                      id: row.id,
                    })
                  )
                  .then(function (res) {
                    if (res.data.state) {
                      that.$Message.success("删除成功");
                      that.page.pageNum = 1;
                      that.getAllTeacher();
                    } else {
                      that.$Message.error(res.data.message);
                    }
                  })
                  .catch(function (e) {
                    that.messageError("服务器错误" + e);
                  });
              },
            });
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    // 获取角色
    getRoles() {
      let that = this;
      that.roleIdList = [];
      let data = {
        pageNum: 1,
        pageSize: 100,
      };
      that.axios
        .post(that.interfaceUrl + "role/getRoles", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            if(res.data.roles){
              that.rolesList = res.data.roles;
              that.rolesList.forEach((item) => {
                that.roleIdList.push(item.id);
              });
            }
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },

    // 获取专业
    getZhuanye() {
      let that = this;
      let data = {
        pageNum: 1,
        pageSize: 100,
      };
      that.axios
        .post(that.interfaceUrl + "zhuanye/selectAllOrderByParentId", that.qs(data))
        .then(function (res) {
          console.log(res.data);
          if (res.data.state) {
            if(res.data.data){
              that.zhuanYeList = res.data.data
              that.zhuanYeList.forEach((item) => {
                item.forEach(i=> {
                  that.zhunayeIdList.push(i.id);
                })
              });
            }
          } else {
            that.messageError(res.data.msg);
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
.content .teacher {
  display: flex;
}

.teacher_left,
.teacher_right {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.teacher_left {
  width: 333px;
  min-width: 300px;
  min-height: 600px;
  margin-right: 15px;
  overflow-y: auto;
  overflow-x: hidden;

  border-left: 1px solid #dddee1;
  border-bottom: 1px solid #dddee1;
}
.teacher_right {
  width: 100%;
  min-width: 50%;
}

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

.page {
  text-align: center;
  margin-top: 39px;
}
</style>

<style>
.teacher_left .ivu-menu-item-group-title {
  border-left: 0;
}
.teacher_left .tree_menu > ul {
  overflow-y: auto;
  overflow-x: hidden;
  height:550px;
  padding: 0 9px !important;
}
</style>
