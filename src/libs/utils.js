// 格式化树形数据形成树形结构  递归
export function formatRouterTree(data) {
  let parents = data.filter((p) => p.pid === 0),
    children = data.filter((c) => c.pid !== 0);
  /* 遍历 判断谁是谁的父亲，谁是谁的儿子 */
  dataToTree(parents, children);
  function dataToTree(parents, children) {
    parents.map((p) => {
      children.map((c, i) => {
        if (c.pid === p.id) {
          let _c = JSON.parse(JSON.stringify(children));
          /* 因为自身要成为父亲，所有需要把自身给排除出去 */
          _c.splice(i, 1);
          /* 递归 */
          dataToTree([c], _c);
          /*
            往 p.children 里面 push c,
            因为判断了c.pid === p.id, 说明c 是 p 的而在
          */
          if (p.children) {
            p.children.push(c);
          } else {
            p.children = [c];
          }
        }
      });
    });
  }
  return parents;
}
// 树型结构数组扁平化
export function flatten(arr) {
  if (!arr || !Array.isArray(arr)) return false;
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i].children)) {
      result.push(arr[i]);
      result = result.concat(this.flatten(arr[i].children));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}
// 遍历树结构
export function parseTreeJson(treeNodes, callback) {
  if (!treeNodes || !treeNodes.length) return;
  for (let i = 0; i < treeNodes.length; i++) {
    callback(treeNodes[i]);
    let _children = treeNodes[i].children;
    if (_children && _children.length > 0) {
      parseTreeJson(_children, callback);
    }
  }
}
// 判断页面位置，当删除表格的一个元素后，页面数据刚好等于分页尺寸的倍数时，页码才进行减一, 处理每次删除表格中的数据项，都需要跳回第一页的情况
export function setPageNum(page) {
  if (page.pageNum !== 1 && (page.totalNum - 1) % page.pageSize === 0) {
    page.pageNum -= 1;
  }
}
// 格式化日期
export function formatDate(date, fmt) {
  // fmt:"yyyy-MM-dd HH:mm:ss"
  let regex = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "H+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substring(4 - RegExp.$1.length)
    );
  }
  for (let k in regex) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? regex[k]
          : ("00" + regex[k]).substring(("" + regex[k]).length)
      );
    }
  }
  return fmt;
}
// 实现深拷贝
export function deepClone(origin, target) {
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
}
// 单位转换
export function unitChange(limit) {
  let size = "";
  if (limit < 0.1 * 1024) {
    //小于0.1KB，则转化成B
    size = limit.toFixed(2) + "B";
  } else if (limit < 0.1 * 1024 * 1024) {
    //小于0.1MB，则转化成KB
    size = (limit / 1024).toFixed(2) + "KB";
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    //小于0.1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    //其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }

  let sizeStr = size + ""; //转成字符串
  let index = sizeStr.indexOf("."); //获取小数点处的索引
  let dou = sizeStr.substr(index + 1, 2); //获取小数点后两位的值
  if (dou == "00") {
    //判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
}
// 是否为PC端
export function isPC() {
  let userAgentInfo = navigator.userAgent;
  let Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod",
  ];
  let flag = true;
  for (let i = 0; i < Agents.length; i++) {
    if (userAgentInfo.indexOf(Agents[i]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
