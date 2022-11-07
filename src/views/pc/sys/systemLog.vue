<template>
  <div class="content">
    <div class="notice_search_area">
      <div class="input">
        <span style="margin-right: 8px">日期范围：</span>
        <DatePicker
          v-model="keywords.date"
          type="daterange"
          placeholder="全部"
          style="width: 190px"
        />
      </div>
      <div class="input">
        <Input
          v-model="keywords.name"
          placeholder="操作者"
          clearable
          style="width: 150px"
        />
      </div>
      <div class="input">
        <Select
          placeholder="操作信息类型"
          v-model="keywords.type"
          @on-change="search"
          class="formInput"
          style="width: 200px"
        >
          <Option value="-1" :key="-1">全部</Option>
          <Option value="1" key="1">正常</Option>
          <Option value="2" key="2">异常</Option>
        </Select>
      </div>
      <Button @click="search" type="primary" style="margin: 0 5px"
        >查询</Button
      >
    </div>
    <div class="systemLog mt16">
      <Table
        :loading="loading"
        :columns="columns"
        :data="tableData"
        border
        stripe
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      tableData: [],
      keywords: {
        name: "",
        keyword: "",
        date: "",
        type: -1,
      },
      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },
      columns: [
        {
          title: "操作者",
          key: "userInfo",
          align: "center",
          width: 200,
          tooltip:true,
        },
        {
          title: "操作",
          key: "czrn",
          align: "center",
          tooltip:true,
        },
        {
          title: "操作类型",
          key: "type",
          align: "center",
          width: 125,
          render: (h, params) => {
            return h("span", params.row.type == "1" ? "正常" : "异常");
          },
        },
        {
          title: "异常信息",
          key: "exceptionMsg",
          align: "center",
          tooltip:true,
        },
        {
          title: "操作方法",
          key: "actionMethod",
          align: "center",
          tooltip:true,
        },
        {
          title: "参数",
          key: "params",
          align: "center",
          tooltip:true,
        },
        {
          title: "操作时间",
          key: "czsj",
          align: "center",
          width: 160,
        },
        {
          title: "IP地址",
          key: "ipdz",
          align: "center",
          width: 130,
        },
      ],
    };
  },
  mounted() {
    this.getSysLog();
  },
  methods: {
    getSysLog() {
      let that = this;
      that.loading = true;
      let data = {
        pageSize: that.page.pageSize,
        pageNum: that.page.pageNum,
        begin:
          that.keywords.date[0] == ""
            ? ""
            : new Date(that.keywords.date[0]).format("yyyy-MM-dd"),
        end:
          that.keywords.date[1] == ""
            ? ""
            : new Date(that.keywords.date[1]).format("yyyy-MM-dd"),
        name: that.keywords.name,
        type: that.keywords.type == "-1" ? "" : that.keywords.type,
      };
      that.axios
        .post(that.interfaceUrl + "systemLog/getSysLog", that.qs(data))
        .then(function (res) {
          if (res.data.state) {
            that.tableData = res.data.sysLogList;
            that.page.totalNum = res.data.dataCount;
          }
          that.loading = false;
        })
        .catch(function (e) {
          that.messageError("服务器错误" + e);
        });
    },
    search() {
      this.page.pageNum = 1;
      this.getSysLog();
    },
    changePage(i) {
      this.page.pageNum = i;
      this.getSysLog();
    },
  },
};
</script>

<style scoped>
.content .systemLog {
  height: auto;
  min-width: 50%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.input {
  float: left;
  margin-right: 5px;
}

.page {
  text-align: center;
  margin-top: 39px;
  overflow: hidden;
}

.systemLog .ivu-table th {
  height: 48px;
}

.systemLog .ivu-table .ivu-table-body td {
  max-height: 82px;
}
</style>
