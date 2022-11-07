<template>
  <div class="content">
		<div
        class="notice_search_area"
        style="
          display: flex;
          justify-content: flex-end;
          text-align: right;
          padding-bottom: 0;
        "
      >
        <Button type="primary" @click="showPitch" style="margin: 5px"
          >新增</Button
        >
      </div>
    <div class="courseTime mt16">
      <Table
        :loading="loading"
        border
        :data="pitchDatas"
        :columns="pitchColumns"
      >
      </Table>
      <!-- iview 分页栏 -->
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
        v-model="pitchModal"
        :title="title"
        width="600px"
        :closable="false"
        @on-cancel="modalClose"
      >
        <div class="modal">
          <Form
            :model="pitchData"
            :rules="pitchRuleValidate"
            ref="pitchTableComp"
            :label-width="100"
          >
            <FormItem v-show="!chgFlag" label="节次名称：" prop="name">
              <Input
                style="width: 200px"
                type="text"
                maxlength="10"
                v-model="pitchData.name"
                placeholder="请输入节次名称"
                class="formInput"
              ></Input>
            </FormItem>
            <FormItem
              v-show="chgFlag"
              label="节次名称："
              prop="name1"
              maxlength="10"
            >
              <Input
                style="width: 200px"
                type="text"
                maxlength="10"
                v-model="pitchData.name"
                placeholder="不输入则不修改"
                class="formInput"
              ></Input>
            </FormItem>
            <FormItem label="节次编号：" prop="code">
              <InputNumber :max="15" :min="1" v-model="pitchData.code" :placeholder="ctCode" style="width: 200px" class="formInput"></InputNumber>
            </FormItem>
            <FormItem label="开始时间：" prop="begintime">
              <TimePicker
                v-model="pitchData.begintime"
                placement="bottom"
                format="HH:mm"
                type="time"
                placeholder="请选择开始时间"
                style="width: 200px"
              ></TimePicker>
            </FormItem>
            <FormItem label="结束时间：" prop="endtime">
              <TimePicker
                v-model="pitchData.endtime"
                placement="bottom"
                format="HH:mm"
                type="time"
                placeholder="请选择结束时间"
                style="width: 200px"
              ></TimePicker>
            </FormItem>
          </Form>
        </div>
        <div slot="footer" style="text-align: center">
          <Button @click="modalClose">取消</Button>
          <Button type="primary" @click="savePitch" :loading="loading"
            >保存</Button
          >
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.getPitch();
  },
  data() {
    return {
      pitchRuleValidate: {
        name: [
          {
            required: true,
            message: "请输入节次名称",
            trigger: "blur",
            type: "string",
          },
        ],
        code:[
          {
            required: true,
            message: "节次编号不能为空",
            trigger: "blur",
            type: "number",
          },
        ],
        begintime: [
          {
            required: true,
            message: "开始时间",
            trigger: "blur",
            type: "date",
          },
        ],
        endtime: [
          {
            required: true,
            message: "结束时间",
            trigger: "blur",
            type: "date",
          },
        ],
      },
      pitchData: {
        name: "",
        code: null,
        begintime: "",
        endtime: "",
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      title: "",
      chgFlag: true,
      ctName: "",
      ctCode: "",
      loading: false,
      pitchModal: false,
      tabIndex: "test1",
      pitchDatas: [],
      pitchColumns: [
        {
          title: "节次名称",
          align: "center",
          key: "name",
          minWidth: 150,
        },
        {
          title: "节次编号",
          key: "code",
          align: "center",
          minWidth: 150,
        },
        {
          title: "开始时间",
          key: "begintime",
          align: "center",
          minWidth: 150,
        },
        {
          title: "结束时间",
          key: "endtime",
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
                  },
                  on: {
                    click: () => {
                      this.showPitch(params.row);
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
                  },
                  on: {
                    click: () => {
                      this.removePitch(params.row);
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
  methods: {
    modalClose() {
      this.pitchModal = false;
      this.$refs["pitchTableComp"].resetFields();
    },
    removePitch(row) {
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "删除将影响课表展示，确定删除吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "classtime/delClassTimeById",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getPitch();
              } else {
                that.messageError(res.data.msg);
              }
            })
            .catch(function (e) {
              that.messageError("服务器错误" + e);
            });
        },
      });
    },
    // 分页相关
    changePage(i) {
      this.page.pageNum = i;
      this.getPitch();
    },

    //获取节次
    getPitch() {
      let that = this;
      this.axios
        .post(
          that.interfaceUrl + "classtime/getArrClassTimeByPage",
          that.qs({
            pageNum: that.page.pageNum,
            pageSize: that.page.pageSize,
          })
        )
        .then((resp) => {
          if (resp.data.state) {
            that.pitchDatas = resp.data.arrClassTime;
            that.page.totalNum = resp.data.total;
          } else {
            that.messageError(resp.data.msg);
          }
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    showPitch(item) {
      let that = this;

      // console.log(item.id);
      if (item.id) {
        that.chgFlag = true;
        that.title = "修改";
        that.pitchData.id = item.id;
        that.pitchData.name = item.name;
        that.pitchData.code = parseInt(item.code);
        that.pitchData.begintime = item.begintime;
        that.pitchData.endtime = item.endtime;
      } else {
        // console.log("新增")
        that.chgFlag = false;
        that.title = "新增";
        that.ctName = "请输入节次名称";
        that.ctCode = "请输入节次编号";
        that.pitchData.id = "";
        that.pitchData.name = "";
        that.pitchData.code = null;
        that.pitchData.begintime = "";
        that.pitchData.endtime = "";
      }
      that.pitchModal = true;
    },
    savePitch() {
      let that = this;
      let flag = true;
      this.$refs["pitchTableComp"].validate((valid) => {
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
      var reg = /^[0-9]\d*$/;
      if (!reg.test(that.pitchData.code)) {
        // that.messageError("请输入节次编号");
        return;
      }
      if (that.pitchData.endtime <= that.pitchData.begintime) {
        that.messageError("开始时间必须小于结束时间");
        return;
      }
      if (that.pitchData.endtime <= that.pitchData.begintime) {
        that.messageError("开始时间必须小于结束时间");
        return;
      }
      let data = {
        id: that.pitchData.id == null ? "" : that.pitchData.id,
        code: that.pitchData.code,
        name: that.pitchData.name,
        begintime: that.pitchData.begintime,
        endtime: that.pitchData.endtime,
      };
      // console.log(that.pitchData.begintime);
      // console.log(that.pitchData.endtime);
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "classtime/saveOrChgClassTime", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.pitchModal = false;
            that.$refs["pitchTableComp"].resetFields();
            if (that.tabIndex == "test1") {
              that.getPitch();
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
  },
};
</script>
<style scoped="">
.content .courseTime {
  height: 100%;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}
.teaTitle {
  text-align: center;
  font-family: "arial, helvetica, sans-serif";
  font-size: 20px;
  margin: 20px;
}

.notice_search_area {
  padding-bottom: 10px;
}

.page {
  text-align: center;
  margin-top: 39px;
}
</style>
<style type="text/css" scoped="">
.ivu-table-cell {
  white-space: pre-line !important;
}

.modal1 {
  padding-left: 20px;
}

.modal {
  margin: 0 130px;
}
</style>
