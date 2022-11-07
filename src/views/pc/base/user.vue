<template>
	<div style="padding: 10px;">
		<div class="content">
				<div class="notice_search_area">
					<Form :model="searchData" :label-width="120" inline style="flex: 1">
						<FormItem label="关键词搜索：">
							<Input suffix="ios-search" @on-search="searchUser" :search="true" type="text" v-model="searchData.searchStr" class="wd200" placeholder="可输入姓名、账号名以及联系方式查询"></Input>
						</FormItem>

						<FormItem label="" style="float:right">
							<Button @click="show()" type="primary" style="margin: 5px 5px;" icon="md-add-circle">新增</Button>
							<Button @click="showUserImport" style="margin: 5px 5px;" type="primary" icon="md-cloud-upload">导入</Button>
							<Button @click="downloadUserTemplate" style="margin: 5px 5px;" type="primary" icon="md-cloud-download">下载导入模板</Button>
						</FormItem>
					</Form>
				</div>
				<div style="margin-top: 10px;">
					<Table size="small" :loading="loading" :columns="columns" :data="tableData" border stripe/>
					<Page @on-change="changePage" :total="page.totalNum" :current="page.pageNum" :page-size="page.pageSize" show-elevator show-total class="page" />
				</div>
		</div>
		<Modal v-model="showModal" :mask-closable=false :title="title" width="600px" :closable=true @on-cancel="modalClose">
			<div>
						<Form ref="ruleCustom" :rules="ruleCustom" :model="data" :label-width="160">
							<FormItem label="姓名：" prop="name">
								<Input type="text" v-model="data.name" placeholder="请输入姓名" class="formInput"></Input>
							</FormItem>
							<FormItem label="性别：" prop="sex">
								<RadioGroup v-model="data.sex">
									<Radio label="0">男</Radio>
									<Radio label="1">女</Radio>
								</RadioGroup>
							</FormItem>
							<FormItem label="联系电话：" prop="phone">
								<Input type="text" v-model="data.phone"  style="width: 300px"></Input>
							</FormItem>
							<FormItem label="账号：" prop="account">
								<Input type="text" v-model="data.account" placeholder="请输入账号" class="formInput" :maxlength="11"></Input>
							</FormItem>
							<FormItem label="密码：" prop="accountPwd" v-if="data.id==''">
							<Input type="password" v-model="data.accountPwd" :placeholder="data.placeholder" class="formInput"></Input>
					       	</FormItem>
					       	<FormItem label="密码：" v-else>
								<Input type="password" v-model="data.accountPwd" :placeholder="data.placeholder" class="formInput"></Input>
					       	</FormItem>
							<FormItem label="确认密码：" prop="pwdCheck" v-if="data.id==''">
								<Input type="password" v-model="data.pwdCheck" :placeholder="data.placeholder" class="formInput"></Input>
							</FormItem>
						</Form>
			</div>
			<div slot="footer" style="text-align: center;">
				<Button @click="modalClose">取消</Button>
				<Button type="primary" @click="ok">保存</Button>
			</div>
		</Modal>

			<Modal v-model="importUserModal"
				:mask-closable = false
				:title="'导入'"
				width="400px"
				:closable = false
				@on-cancel="modalClose">
				<div style="padding: 0 30px;">
					<Upload ref="stuUpload" :action="actionUrl" show-upload-list
	                    :on-success="handleSuccess" :format="['xls','xlsx']" :on-format-error="formatError" :on-remove="removeFile"
	                    style="padding-left: 20px;">
	                    <Button type="primary" icon="ios-cloud-upload-outline" style="margin-left: 80px;">上传文件</Button>
	                </Upload>
				</div>
				<div slot="footer" style="text-align: center;">
				    <Button @click="modalClose">取消</Button>
				    <Button type="primary" @click="importUser" :loading="loading">确认导入</Button>
				</div>
			</Modal>
	</div>
</template>
<style type="text/css">
	.parent_list{
		background: #F8F8F9;
	}
</style>
<script>
	export default {
		data() {
			const pwdCheckValidate = (rule, value, callback) => {
				if (this.data.accountPwd != '' && value == '') {
					callback(new Error('确认密码不能为空'));
				} else if (this.data.accountPwd != value) {
					callback(new Error('两次密码输入不一致'));
				} else {
					callback();
				}
			};
			const checkPhone = (rule, value, callback) => {
			  if (value === '') {
				callback(new Error('请输入联系人电话'));
			  } else {
				let regPone = null;
				let mobile = /^1(3|4|5|6|7|8|9)\d{9}$/; //最新16手机正则
				let tel = /^(0[0-9]{2,3}\-)([2-9][0-9]{4,7})+(\-[0-9]{1,4})?$/; //座机
				if (value.charAt(0) == 0) {    // charAt查找第一个字符方法，用来判断输入的是座机还是手机号
				  regPone = tel;
				} else {
				  regPone = mobile;
				}
				if (!regPone.test(value)) {
				  return callback(
					new Error("请填写联系人电话(座机格式'区号-座机号码')")
				  );
				}
				callback();
			  }
			};
			return {
				checkPage:{
					totalNum: 0,
					pageNum: 1,
					pageSize: 10
				},
				jobTypeList:[],
				importUserModal:false,
				actionUrl:this.interfaceUrl + "user/filesUpload",
				fileNameList:[],
				ruleCustom: {
					account: [
						{ required: true, message: '请输入账号', trigger: 'blur' }
					],
					accountPwd: [
						{ required: true, message: '请输入密码', trigger: 'blur' },
						{ pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/, message: "密码需由6-20位字母、数字组成", trigger: "blur" }
					],
					pwdCheck: [
						{required: true, validator: pwdCheckValidate, trigger: 'blur'}
					],
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					],
					sex: [
						{ required: true, message: '请选择性别', trigger: 'blur' }
					],
					job: [
						{ required: true, message: '请选择职位', trigger: 'blur' }
					],
					objectType: [
						{ required: true, message: '请选择用户类型', trigger: 'blur' }
					],
					phone: [
						{ required: true, validator: checkPhone, trigger: 'blur' }
					]
				},
				loading: false,
				showModal: false,
				title: '',
				tableData: [],
				searchData: {
					searchStr:"",
					objectType:"",
					job:""
				},
				data: {
					id: '',
					account: '',
					name: '',
					job:'',
					objectType:'',
					accountPwd: '',
					pwdCheck: '',
					sex: '',
					phone: "",
					statusCd: '',
					placeholder:''
				},
				page: {
					totalNum: 0,
					pageNum: 1,
					pageSize: 15
				},
				columns: [
					{
						title: '姓名',
						key: 'objectName',
						align: 'center'
					},
					{
						title: '性别',
						key: 'sex',
						align: 'center',
						width: 65,
						render: (h, params) => {
							return h('span', params.row.sex == '0' ? "男" : params.row.sex == '1' ? "女" : "");
						}
					},
					{
						title: '用户类型',
						key: 'objectType',
						align: 'center',
						render: (h, params) => {
							return h('span', params.row.objectType == 'L01' ? "内部员工" : "客户");
						}
					},
					{
						title: '职位',
						key: 'jobDesc',
						align: 'center',

					},
					{
						title: '账号',
						key: 'account',
						align: 'center'
					},
					{
						title: '联系方式',
						key: 'phone',
						align: 'center'
					},
					{
						title: '操作',
						key: 'action',
						align: 'center',
						width: 200,
						render: (h, params) => {
							return h('div', [
								h('Button', {
									props: {
										icon:'md-create',
										type: 'primary',
										size: 'small',
									},
									style: {
										marginRight: '3px'
									},
									on: {
										click: () => {
											this.show(params.row)
										}
									}
								}, '修改'),
								h('Button', {
									props: {
										icon:'md-close',
										type: 'error',
										size: 'small'
									},
									on: {
										click: () => {
											this.remove(params.row)
										}
									}
								}, '删除')
							]);
						}
					}
				]
			}
		},
		mounted() {
			this.page.pageNum = 1;
			this.getSysloginsByPage();
		},
		methods: {
			changePageSize(i){
				this.checkPage.pageNum=1;
				this.checkPage.pageSize=i;
			},
			showUserImport() {
				this.$refs.stuUpload.clearFiles();
				this.importUserModal = true
			},
			downloadUserTemplate() {
				window.open(this.interfaceUrl + "user/downloadUserTemplate");
			},
			formatError() {
				this.$Modal.error({
                    title: '提示',
                    content: '只能上传xls、xlsx文件',
                    closable: true
                });
			},
			handleBeforeUpload(file) {
				let flag = file.size > 5048000;
				if(flag) {
					this.$Message.warning("上传文件大小不能超过5Mb");
					return false;
				}
			},
			handleSuccess(response, file, fileList) {
				if (response.state) {
					let tempList = [];
					fileList.forEach(function(o,i){
						tempList.push(o.response.newFileName)
					});
					this.fileNameList = tempList
				} else {
					that.messageError(response.message);
				}
			},
			removeFile(file, fileList) {
				let tempList = [];
				fileList.forEach(function(o,i){
					tempList.push(o.response.newFileName)
				});
				this.fileNameList = tempList
			},
			//导入用户信息
			importUser() {
				let that =this;
				if(that.fileNameList == null || that.fileNameList.length < 1){
           			that.$Modal.error({
                        title: '提示',
                        content: '请上传文件',
                        closable: true
                    });
					return;
           		}
				let data = {
					fileNameList: that.fileNameList
				}
				//console.log(data)
				that.loading = true;
				that.axios.post(that.interfaceUrl+'user/userImport',that.qs(data)).then(function(res){
					that.loading = false;
					if (res.data.state) {
						that.importUserModal = false
						that.getSysloginsByPage();
						if (res.data.Message != null && res.data.Message.length > 0) {
							let str = ''
							res.data.Message.forEach(function(o,i){
								str += o + "<br/>"
							});
							that.$Modal.info({
	                        	content: str
	                        });
						}
					} else {
						that.messageError(res.data.message);
					}
				}).catch(function(e){
					that.messageError('服务器错误'+e);
				});
			},
			searchUser() {
				this.page.pageNum = 1;
				this.getSysloginsByPage();
			},
			getSysloginsByPage() {
				let that = this;
				that.loading = true;
				that.axios.post(that.interfaceUrl + 'user/selectAllByPage', that.qs({
					pageNum: that.page.pageNum,
					pageSize: that.page.pageSize,
					searchStr:that.searchData.searchStr,
					objectType:that.searchData.objectType==undefined?'':that.searchData.objectType,
					job:that.searchData.job==undefined?'':that.searchData.job
				})).then(function(res) {
					that.page.totalNum = res.data.dataCount
					that.tableData = res.data.sysLoginList
					that.loading = false
				});
			},
			changePage(i) {
				this.page.pageNum = i
				this.getSysloginsByPage();
			},
			show(row) {
				if(row) {
					this.title = '修改用户信息';
					this.data.id = row.id;
					this.data.name = row.objectName==undefined?'':row.objectName;
					this.data.account = row.account==undefined?'':row.account;
					this.data.phone = row.phone==undefined?'':row.phone;
					this.data.accountPwd = '';
					this.data.sex = row.sex==undefined?'':row.sex;
					this.data.job = row.job==undefined?'':row.job;
					this.data.objectType = row.objectType==undefined?'':row.objectType;
					this.data.placeholder = '不输入密码则不修改密码';
				} else {
					this.title = '新增用户'
					this.data.id = '';
					this.data.name = '';
					this.data.account = '';
					this.data.accountPwd = '';
					this.data.phone = '';
					this.data.sex = '';
					this.data.job = '';
					this.data.objectType = '';
					this.data.placeholder = '请设置6位以上密码';
				}
				this.showModal = true
			},
			ok() {
           		let that =this;
           		let flag = true;
   				this.$refs["ruleCustom"].validate(valid => {
                  if (!valid) {
                  	this.$Modal.error({
						title: '提示',
						content: '表单填写有误',
						closable: true
					});
					flag = false;
                  }
             	 });
             	 if(!flag){
             	 	return;
             	 }
				if(
					this.data.name == '' ||
					this.data.account == '' ||
					this.data.phone == '' ||
					this.data.sex == '' ||
					this.data.job == '' ||
					this.data.objectType == ''
				){
					return
				}
				console.log(this.data.phone)
				console.log(this.data.sex)
				let data = {
					id:that.data.id,
					objectName: that.data.name,
					account: that.data.account,
					accountPwd: that.data.accountPwd,
					sex: that.data.sex,
					phone:that.data.phone,
					job:that.data.job,
					objectType:that.data.objectType,
				}
				that.axios.post(that.interfaceUrl + 'user/dealSysLogin', that.qs(data)).then(function(res) {
					if(res.data.state) {
						that.$Message.success("保存成功");
						that.showModal = false;
						that.getSysloginsByPage();
					} else {
						that.$Modal.error({
							title: '提示',
							content: res.data.msg,
							closable: true,

						});
					}
				}).catch(function(e) {
					that.messageError('服务器错误'+e);
				});
			},
			modalClose() {
				this.showModal = false
			},
			remove(row) {
				let that = this
				that.$Modal.confirm({
					closable: true,
					title: '提示',
					content: '确定删除 ' + row.name + ' 吗？',
					onOk: function() {
						that.axios.post(that.interfaceUrl + 'user/delUser', that.qs({
							id: row.id,
						})).then(function(res) {
							if(res.data.state) {
								that.$Message.success("删除成功");
								that.page.pageNum = 1;
								that.getSysloginsByPage();
							} else {
								that.$Message.error(res.data.message);
							}
						}).catch(function() {
							that.messageError('服务器错误');
						});
					}
				});
			}
		}
	}
</script>

<style scoped>

	.content {
		width: 100%;
		overflow: hidden;
	}

	.right {
		padding: 0px 10px;
	}

	.modal {
		padding-left: 100px;
	}

	.formInput {
		width: 240px;
	}

	.page {
		float: right;
		margin-right: 17px;
		margin-top: 3px;
	}
</style>
