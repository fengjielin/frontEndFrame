<template>
  <div class="content">
    <div
      class="notice_search_area"
      style="display: flex; justify-content: flex-end"
    >
      <Button @click="show" type="primary" style="margin: 5px 5px" v-if="checkAuth(['LDGL_FLOOR_ADD'])"
        >新增楼层</Button
      >
    </div>
    <div class="teachingBuilding mt16">
      <div class="building_left">
        <Menu
          theme="light"
          :active-name="activeName"
          @on-select="choseBuilding"
          style="height: 600px"
        >
          <MenuGroup title="楼栋名称" style="position: relative" class="tree_menu">
            <div
              class="add-area"
              style="position: absolute; right: 8px; top: 8px; border: none"
            >
              <div class="add-area-icon">
                <Tooltip content="新增楼栋" placement="bottom" transfer>
                  <Icon
                    type="ios-add-circle-outline"
                    color="#2d8cf0"
                    @click="showBuilding()"
										v-if="checkAuth(['LDGL_BUILD_ADD'])"
                  ></Icon>
                </Tooltip>
              </div>
            </div>
            <MenuItem
              :name="index"
              v-for="(item, index) in buildings"
              :key="item.id"
              style="display: flex; justify-content: space-between"
            >
              <div>{{ item.buildingName }} ({{ item.buildingNum }})</div>
              <div>
                <Button
                  shape="circle"
                  icon="ios-create-outline"
                  @click="showBuilding(item)"
									v-if="checkAuth(['LDGL_BUILD_UPDATE'])"
                  size="small"
                ></Button>
                <Button
                  shape="circle"
                  icon="ios-trash"
                  @click="removeBuilding(item)"
									v-if="checkAuth(['LDGL_BUILD_DELETE'])"
                  size="small"
                ></Button>
              </div>
            </MenuItem>
          </MenuGroup>
        </Menu>
      </div>
      <div class="building_right">
        <Table
          :loading="loading"
          :columns="columns"
          :data="tableData"
          border
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

        <!-- 新增与修改楼层的弹窗 -->
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
              ref="teachingBuildingComp"
              :label-width="100"
            >
              <FormItem label="所属楼栋：">
                <Select v-model="data.buildingId" style="width: 240px">
                  <Option
                    v-for="item in buildings"
                    :value="item.id"
                    :key="item.id"
                  >
                    {{ item.buildingName }}
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="楼层编号：" prop="floorNum">
                <InputNumber
                  :max="20"
                  :min="1"
                  v-model="data.floorNum"
                  placeholder="楼层编号"
                  class="formInput"
                  oninput="if(value.length>10) value=value.slice(0,10)"
                ></InputNumber>
              </FormItem>
              <FormItem label="楼层名称：" prop="floorName">
                <Input
                  type="text"
                  v-model="data.floorName"
                  placeholder="楼层名称"
                  class="formInput"
                  maxlength="10"
                ></Input>
              </FormItem>
            </Form>
          </div>
          <div slot="footer" style="text-align: center">
            <Button @click="modalClose">取消</Button>
            <Button type="primary" @click="ok" :loading="loading">保存</Button>
          </div>
        </Modal>
      </div>

      <!-- 新增与修改楼栋的弹窗 -->
      <Modal
        v-model="showBuildingModal"
        :title="title"
        width="600px"
        :closable="true"
        :mask-closable="false"
        @on-cancel="modalBuildingClose"
      >
        <div class="modal">
          <Form
            :model="BuildingData"
            :rules="ruleValidate"
            ref="buildingRef"
            :label-width="100"
          >
            <FormItem label="楼栋编号：" prop="buildingNum">
              <Input
                type="text"
                v-model="BuildingData.buildingNum"
                placeholder="楼栋编号"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
            <FormItem label="楼栋名称：" prop="buildingName">
              <Input
                type="text"
                v-model="BuildingData.buildingName"
                placeholder="楼栋名称"
                class="formInput"
                maxlength="20"
              ></Input>
            </FormItem>
          </Form>
        </div>
        <div slot="footer" style="text-align: center">
          <Button @click="modalBuildingClose">取消</Button>
          <Button type="primary" @click="buildingSend" :loading="loading"
            >保存</Button
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
      ruleValidate: {
        buildingNum: [
          {
            required: true,
            message: "教学楼编号不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        buildingName: [
          {
            required: true,
            message: "教学楼名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: "[^\\s+]",
            message: "不能输入空格字符串",
            trigger: "blur",
          },
        ],
        floorNum: [
          {
            required: true,
            message: "楼层编号不能为空",
            trigger: "blur",
            type: "number",
          },
          {
            type: "number",
            pattern: "[^\\s+]",
            message: "不能输入空格",
            trigger: "blur",
          },
        ],
        floorName: [
          {
            required: true,
            message: "楼层名称不能为空",
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

      loading: false,
      // 控制新增与修改楼层的弹窗
      showModal: false,
      // 控制新增与修改楼栋的弹窗
      showBuildingModal: false,
      title: "",

      // 绑定给表格的数据
      tableData: [],

      // 新增与修改楼层表单绑定的数据
      data: {
        id: "",
        buildingNum: "",
        buildingName: "",
        buildingId: "", //所属楼栋id
        floorNum: 0, //楼层编号
        floorName: "", //楼层名称
      },

      // 新增与修改楼栋表单绑定的数据
      BuildingData: {
        id: "",
        buildingNum: "",
        buildingName: "",
      },

      page: {
        totalNum: 0,
        pageNum: 1,
        pageSize: 10,
      },

      columns: [
        {
          title: "楼栋名称",
          key: "buildingName",
          align: "center",
          minWidth: 150,
        },
        {
          title: "楼层编号",
          key: "floorNum",
          align: "center",
          minWidth: 150,
        },
        {
          title: "楼层名称",
          key: "floorName",
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
										display: this.checkAuth(["LDGL_FLOOR_UPDATE"])
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
										display: this.checkAuth(["LDGL_FLOOR_DELETE"])
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

      // 向后端请求的楼栋数据
      buildings: [],

      // Menu组件当前激活的name
      activeName: "0",

      // 当前选中的楼栋
      curBuilding: "",

      // 用于处理点击菜单中的编辑与移除时出现请求的情况
      index2: 0,

      teachingBuildId: 0,

      oTeachingBuildId: 1,
      nTeachingBuildId: 1,
      firstInto: false,
    };
  },
  mounted() {
    this.firstInto = true;
    this.getBuilding();
    this.getFloor();
  },
  methods: {
    // 删除楼栋绑定的点击事件
    removeBuilding(row) {
      let that = this;
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.buildingName + " 吗？",
        onOk: function () {
          // console.log("移除楼栋操作")

          // 参数id传给后端
          // console.log("id:", row.id)

          that.axios
            .post(
              that.interfaceUrl + "teachingBuilding/delTeachingBuilding",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              // console.log(res)
              if (res.data.state) {
                that.$Message.success("操作成功");
                that.showBuildingModal = false;
                that.getBuilding();
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
    // 新增与修改楼栋 的 弹窗
    showBuilding(row) {
      // console.log(row)
      if (row) {
        this.title = "编辑楼栋";
        this.BuildingData.id = row.id;
        this.BuildingData.buildingNum = row.buildingNum;
        this.BuildingData.buildingName = row.buildingName;
      } else {
        this.title = "新增楼栋";
        this.BuildingData.id = "";
        this.BuildingData.buildingNum = "";
        this.BuildingData.buildingName = "";
      }
      this.showBuildingModal = true;
    },
    // 关闭新增楼栋弹窗
    modalBuildingClose() {
      this.showBuildingModal = false;
    },
    // 确定新增与修改楼栋绑定的点击事件
    buildingSend() {
      let that = this;
      let flag = true;
      this.$refs["buildingRef"].validate((valid) => {
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
      // console.log(this.BuildingData)

      // 后端
      let data = {
        id: this.BuildingData.id,
        buildingNum: this.BuildingData.buildingNum, //楼栋编号
        buildingName: this.BuildingData.buildingName, //楼栋名称
      };

      // console.log(data)
      that.loading = true;
      that.axios
        .post(
          that.interfaceUrl + "teachingBuilding/dealTeachingBuilding",
          that.qs(data)
        )
        .then(function (res) {
          // console.log(res)
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("操作成功");
            that.showBuildingModal = false;
            that.getBuilding();
          } else {
            that.messageError(res.data.msg);
          }
        })
        .catch(function () {
          that.loading = false;
          that.messageError("服务器错误");
        });

      this.showBuildingModal = false;
    },

    //选择楼栋
    choseBuilding(index) {
      this.page.pageNum = 1;
      this.data.buildingId = this.curBuilding.id;

      this.teachingBuildId = this.buildings[index].id;
      if (index != this.index2) {
        this.index2 = index;
        this.getBuilding();
      }
    },

    // 获取楼栋信息
    getBuilding() {
      let that = this;
      // that.loading = true;
      that.axios
        .post(that.interfaceUrl + "teachingBuilding/selectAll")
        .then(function (res) {
          // console.log(res.data)
          if (res.data.state) {
            // that.page.totalNum = res.data.dataCount;
            // 楼栋数据
            that.buildings = res.data.buildings;
            if (res.data.buildings) {
              if (that.firstInto) {
                that.firstInto = false;
                that.curBuilding = res.data.buildings[0];
                that.data.buildingId = that.curBuilding.id;
                that.teachingBuildId = that.data.buildingId;
              }
              that.getFloor();
              that.getAllFloors();
            }

            that.$nextTick(function () {
              that.activeName = 0;
            });
            // that.loading = false
          } else {
            that.messageError(res.data.msg);
          }
        });
    },

    // 获取楼层信息
    getFloor() {
      let that = this;
      that.loading = true;

      let data = {
        pageNum: that.page.pageNum,
        pageSize: that.page.pageSize,
        teachingBuildId: that.teachingBuildId,
      };
      // console.log(data)
      that.axios
        .post(that.interfaceUrl + "/floor/selectAllByPage", that.qs(data))
        .then(function (res) {
          // console.log(res.data)
          that.loading = false;
          if (res.data.state) {
            that.page.totalNum = res.data.dataCount;
            // 楼层数据
            that.tableData = res.data.floors;

          } else {
            that.messageError(res.data.msg);
          }
        });
    },
    getAllFloors() {
      let params = {
        pageNum: 1,
        pageSize: 999999,
        teachingBuildId: this.teachingBuildId,
      };
      this.axios
        .post(this.interfaceUrl + '/floor/selectAllByPage', this.qs(params))
        .then((res) => {
          if (res.data.state) {
            if (res.data.floors) {
              this.allFloors = res.data.floors
            }else{
              this.allFloors = []
            }
          } else {
            this.$Message.error(`${res.data.msg}`);
          }
        })
        .catch((e) => {
          console.error(e);
          this.$Message.error(e.message);
        });
    },

    // 分页的改变
    changePage(i) {
      this.page.pageNum = i;
      this.getBuilding();
    },

    // 点击展示新增或修改楼层弹窗
    show(row) {
      // console.log(row)
      if (row.id) {
        this.title = "修改楼层";
        this.data.id = row.id;
        this.data.buildingNum = row.buildingNum;
        this.data.floorNum = row.floorNum;
        this.data.floorName = row.floorName;
        this.data.buildingId = this.teachingBuildId;
      } else {
        this.title = "新增楼层";
        this.data.id = "";
        this.data.buildingNum = "";
        this.data.floorNum = 1;
        this.data.floorName = "";
        this.data.buildingId = this.teachingBuildId;

        let floorNumList = this.allFloors.map(item => item.floorNum)
        if(floorNumList.length){
          let maxFloorNum = Math.max(...floorNumList)
          this.data.floorNum = maxFloorNum ? maxFloorNum + 1 : 1;
        }
      }
      this.showModal = true;
    },
    // 确定新增与修改楼层的点击事件
    ok() {
      // console.log(this.data)
      let that = this;
      let flag = true;
      this.$refs["teachingBuildingComp"].validate((valid) => {
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
      // console.log("新增或修改楼层操作")
      // 如果修改，有id
      if (that.data.id) {
        that.oTeachingBuildId = that.teachingBuildId;
        that.nTeachingBuildId = that.data.buildingId;
      } else {
        that.oTeachingBuildId = that.data.buildingId;
        that.nTeachingBuildId = that.data.buildingId;
      }

      let data = {
        id: that.data.id == null ? "" : that.data.id,
        floorNum: that.data.floorNum, //楼层编号
        floorName: that.data.floorName, //楼层名称

        teachingBuildId: that.oTeachingBuildId, //所属楼栋的id
        nTeachingBuildId: that.nTeachingBuildId,
      };

      // console.log(data)
      // 后端
      that.loading = true;
      that.axios
        .post(that.interfaceUrl + "floor/dealFloor", that.qs(data))
        .then(function (res) {
          that.loading = false;
          if (res.data.state) {
            that.$Message.success("保存成功");
            that.showModal = false;
            that.getFloor();
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
      this.$refs["teachingBuildingComp"].resetFields();
    },
    // 删除楼层的操作
    remove(row) {
      // console.log(row)
      let that = this;
      that.$Modal.confirm({
        closable: true,
        title: "提示",
        content:
          "确定删除 " + row.buildingName + " 的 " + row.floorName + " 吗？",
        onOk: function () {
          that.axios
            .post(
              that.interfaceUrl + "floor//delFloor",
              that.qs({
                id: row.id,
              })
            )
            .then(function (res) {
              if (res.data.state) {
                that.$Message.success("删除成功");
                that.page.pageNum = 1;
                that.getFloor();
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
.content .teachingBuilding {
  display: flex;
}

.building_left,
.building_right {
  height: 100%;
  background-color: #fff;
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.building_left {
  width: 333px;
  min-width: 300px;
  min-height: 600px;
  margin-right: 15px;
  overflow-x: hidden;
  border-left: 1px solid #dddee1;
  border-bottom: 1px solid #dddee1;
}
.building_right {
  width: 100%;
  min-width: 50%;
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
.building_left .ivu-menu-item-group-title {
  border-left: 0;
}
.building_left .tree_menu > ul {
  overflow-y: auto;
  overflow-x: hidden;
  height: 550px;
}
</style>