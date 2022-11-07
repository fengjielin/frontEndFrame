<template>
  <div class="content">
    <div class="notice_search_area">
      <Button
        @click="show"
        type="primary"
        style="margin: 5px 5px"
        v-if="checkAuth(['JCXXGL_TERM_ADD'])"
        >新增</Button
      >
    </div>
    <div class="term mt16">
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
          ref="termComp"
          :label-width="100"
        >
          <FormItem label="学期名称：" prop="termName">
            <Input
              type="text"
              v-model="data.termName"
              placeholder="请输入学期名称"
              class="formInput"
              maxlength="20"
            ></Input>
          </FormItem>
          <FormItem label="学期简称：" prop="termAbbreviation">
            <Input
              type="text"
              v-model="data.termAbbreviation"
              placeholder="请输入学期名称"
              class="formInput"
              maxlength="20"
            ></Input>
          </FormItem>
          <FormItem label="开始时间：" prop="beginDate">
            <DatePicker
              type="date"
              format="yyyy-MM-dd"
              v-model="data.beginDate"
              placement="bottom-end"
              placeholder="开始时间"
              style="width: 200px"
            ></DatePicker>
          </FormItem>
          <FormItem label="结束时间：" prop="endDate">
            <DatePicker
              type="date"
              format="yyyy-MM-dd"
              v-model="data.endDate"
              placement="bottom-end"
              placeholder="结束时间"
              style="width: 200px"
            ></DatePicker>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok" :loading="loading">保存</Button>
      </div>
    </Modal>

    <Modal
      v-model="showWeekModal"
      title="学期周计划"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalCloseWeek"
    >
      <div>
        <Table
          :loading="loading"
          :columns="weekColumns"
          :data="weekTableData"
          border
        />
        <Page
          @on-change="changePageWeek"
          :total="pageWeek.totalNum"
          :current="pageWeek.pageNum"
          :page-size="pageWeek.pageSize"
          show-elevator
          show-total
          class="page"
        />
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="modalCloseWeek">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ruleValidate: {
        beginDate: [
          {
            required: true,
            message: "请选择开始时间",
            trigger: "change",
            type: "date",
          },
        ],
        endDate: [
          {
            required: true,
            message: "请选择结束时间",
            trigger: "change",
            type: "date",
          },
        ],
        termName: [
          {
            required: true,
            message: "学期名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        termAbbreviation: [
          {
            required: true,
            message: "学期简称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
      },
      activeName: "",
      loading: false,
      showModal: false,
      showWeekModal: false,
      title: "",
      tableData: [],
      data: {
        id: "",
        termName: "",
        beginDate: "",
        endDate: "",
        termAbbreviation:""
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      pageWeek: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "学期名称",
          key: "termName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "学期简称",
          key: "termAbbreviation",
          align: "center",
          minWidth: 150,
        },
        {
          title: "开始时间",
          key: "beginDate",
          align: "center",
          width: 200,
        },
        {
          title: "结束时间",
          key: "endDate",
          align: "center",
          width: 200,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 250,
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
                      this.getWeek(params.row.id);
                    },
                  },
                },
                "学期周计划"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["JCXXGL_TERM_UPDATE"])
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
                    display: this.checkAuth(["JCXXGL_TERM_DELETE"])
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

      termId: "",
      weekTableData: [],
      weekColumns: [
        {
          title: "周次名称",
          key: "weekName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "开始时间",
          key: "beginDate",
          align: "center",
          minWidth: 150,
        },
        {
          title: "结束时间",
          key: "endDate",
          align: "center",
          minWidth: 150,
        },
      ],
    };
  },
  mounted() {
    this.getTerms();
  },
  methods: {
    getTerms() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "term/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.termList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    getWeek(row) {
      this.termId = row;
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "week/selectAllByPage",
          that.qs({
            pageNum: that.pageWeek.pageNum,
            pageSize: that.pageWeek.pageSize,
            termId: this.termId,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.pageWeek.totalNum = res.data.dataCount;
            that.weekTableData = res.data.weekList;
            that.showWeekModal = true;
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
      this.getTerms();
    },
    show(row) {
      if (row.id) {
        this.title = "修改学期";
        this.data.id = row.id;
        this.data.termName = row.termName;
        this.data.termAbbreviation = row.termAbbreviation;
        this.data.beginDate = new Date(row.beginDate);
        this.data.endDate = new Date(row.endDate);
      } else {
        this.title = "新增学期";
        this.data.id = "";
        this.data.termName = "";
        this.data.termAbbreviation = "";
        this.data.beginDate = "";
        this.data.endDate = "";
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["termComp"].validate((valid) => {
        if (!valid) {
          this.$Modal.error({
            title: "提示",
            content: "表单填写有误",
            closable: true,
          });
          flag = false;
        }
      });
      if (that.data.beginDate.getTime() >= that.data.endDate.getTime()) {
        this.$Message.warning("结束时间必须大于开始时间");
        return;
      }
      if (
        that.data.endDate.getTime() - that.data.beginDate.getTime() <
        7 * 24 * 60 * 60 * 1000
      ) {
        this.$Message.warning("开始时间与结束时间间隔不得小于7天");
        return;
      }
      if (!flag) {
        return;
      }
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        termName: that.data.termName,
        beginDate: that.data.beginDate,
        endDate: that.data.endDate,
        termAbbreviation: that.data.termAbbreviation// 学期简称
      };
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "term/dealTerm", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.$refs["termComp"].resetFields();
            that.getTerms();
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
      this.$refs["termComp"].resetFields();
      this.showModal = false;
    },
    showWeek(row) {
      this.getWeek();
    },
    modalCloseWeek() {
      this.showWeekModal = false;
    },
    changePageWeek(i) {
      this.pageWeek.pageNum = i;
      this.getWeek(this.termId);
    },
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.termName + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "term/delTerm",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getTerms();
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
/* .content {
  width: 100%;
  height: 835px;
  background-color: #f3f8ff;
} */
.content .term {
  height: 100%;
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
