<template>
  <div class="content">
    <div class="notice_search_area">
      <Button
        @click="show"
        type="primary"
        style="margin: 5px 5px"
        v-if="checkAuth(['NJXXGL_ADD'])"
        >新增</Button
      >
    </div>
    <div class="nianji mt16">
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
            ref="nianjiComp"
            :label-width="100"
          >
            <FormItem label="年级编号：" prop="nianjiNo">
              <Input
                type="text"
                v-model="data.nianjiNo"
                maxlength="20"
                placeholder="请输入年级编号"
                class="formInput"
              ></Input>
            </FormItem>
            <FormItem label="年级名称：" prop="nianjiName">
              <Input
                type="text"
                v-model="data.nianjiName"
                maxlength="20"
                placeholder="请输入年级名称"
                class="formInput"
              ></Input>
            </FormItem>
            <FormItem label="年级状态：">
              <RadioGroup v-model="data.njzt" type="button">
                <Radio label="1">已毕业</Radio>
                <Radio label="0">未毕业</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="入校日期：" prop="rxrq">
              <DatePicker
                v-model="data.rxrq"
                type="date"
                format="yyyy-MM-dd"
                placeholder="入校日期"
                class="formInput"
              ></DatePicker>
            </FormItem>
            <FormItem label="毕业日期：" prop="byrq" >
              <DatePicker
                v-model="data.byrq"
                type="date"
                format="yyyy-MM-dd"
                placeholder="毕业日期"
                class="formInput"
              ></DatePicker>
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
    return {
      ruleValidate: {
        nianjiNo: [
          {
            required: true,
            message: "年级编号不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        nianjiName: [
          {
            required: true,
            message: "年级名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        rxrq: [
          {
            required: true,
            message: "入校日期不能为空",
            type:'date',
            trigger: "blur",
          },
        ],
        byrq: [
          {
            required: true,
            message: "毕业日期不能为空",
            type:'date',
            trigger: "blur",
          },
        ],
      },
      activeName: "",
      loading: false,
      showModal: false,
      title: "",
      tableData: [],
      data: {
        id: "",
        nianjiNo: "",
        nianjiName: "",
        njzt: "0",
        rxrq: "",
        byrq: "",
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "年级编号",
          key: "njbh",
          align: "center",
          minWidth: 150,
        },
        {
          title: "年级名称",
          key: "njmc",
          align: "center",
          minWidth: 150,
        },
        {
          title: "毕业状态",
          key: "njzt",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            return h("span", params.row.njzt == "1" ? "已毕业" : "未毕业");
          },
        },
        {
          title: "入校日期",
          key: "rxrq",
          align: "center",
          minWidth: 150,
        },
        {
          title: "毕业日期",
          key: "byrq",
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
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                    display: this.checkAuth(["NJXXGL_UPDATE"])
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
                    display: this.checkAuth(["NJXXGL_DELETE"])
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
    this.getNianji();
  },
  methods: {
    getNianji() {
      let that = this;
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "nianji/selectAllByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
          })
        )
        .then(function (res) {
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            that.tableData = res.data.nianjiList;
            that.loading = false;
          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    changePage(i) {
      this.page.pageNum = i;
      this.getNianji();
    },
    show(row) {
      if (row.id) {
        this.title = "修改年级";
        this.data.id = row.id;
        this.data.nianjiNo = row.njbh;
        this.data.nianjiName = row.njmc;
        this.data.njzt = row.njzt;
        this.data.rxrq = row.rxrq;
        this.data.byrq = row.byrq;
      } else {
        this.title = "新增年级";
        this.data.id = "";
        this.data.nianjiNo = "";
        this.data.nianjiName = "";
        this.data.rxrq = "";
        this.data.byrq = "";
        this.data.njzt = "0";
      }
      this.showModal = true;
    },
    ok() {
      let that = this;
      let flag = true;
      this.$refs["nianjiComp"].validate((valid) => {
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
      if (
        that.data.rxrq.getTime() > that.data.byrq.getTime()
      ) {
        this.$Message.warning("入校时间不得晚于毕业时间");
        return;
      }
      let data = {
        id: that.data.id == null ? "" : that.data.id,
        nianjiNo: that.data.nianjiNo,
        nianjiName: that.data.nianjiName,
        njzt: that.data.njzt,
        rxrq: that.data.rxrq
          ? new Date(that.data.rxrq).format("yyyy-MM-dd")
          : "",
        byrq: that.data.byrq
          ? new Date(that.data.byrq).format("yyyy-MM-dd")
          : "",
      };
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "nianji/dealNianji", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.$refs["nianjiComp"].resetFields()
            that.getNianji();
          } else {
            that.loading = false;
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.loading = false;
          that.messageError("服务器错误");
        });
    },
    modalClose() {
      this.$refs["nianjiComp"].resetFields();
      this.showModal = false;
    },
    remove(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.njmc + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "nianji/delNianji",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getNianji();
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
.content .nianji {
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
