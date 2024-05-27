/********************* 框架定义 *********************/

// 全局唯一核心数据对象
window.data = {};

// 数据对象对应的方法集合
const __fn__ = {};

// 获取数据
function getData(key) {
  if (key in window.data) {
    return window.data[key];
  } else {
    return null;
  }
}

// 设置数据
function setData(key, value) {
  if (window.data[key] === value) { return; }
  window.data[key] = value;
  // 触发绑定事件
  if(__fn__[key]) {
    __fn__[key].forEach((fn) => {
      fn(value);
    });
  }
}

// 添加绑定事件
function bindEvent(key, fn) {
  // 初始化时间队列
  if (!__fn__[key]) {
    __fn__[key] = [];
  }
  // 绑定事件
  __fn__[key].push(fn);
}

/*********************** DOM ***********************/

const body = document.body;
const signWrap = document.querySelector('#sign');
const dateWrap = document.querySelector('#date');
const msgWrap = document.querySelector('#msg');
const canvas = document.querySelector('#bg-canvas');

/********************* 事件绑定 *********************/

// 更新时间时, 顺便更新 DOM
bindEvent('sign', function(val) {
  signWrap.innerHTML = val;
});
bindEvent('time', function(val) {
  dateWrap.innerHTML = val;
});

// 更新时间时, 顺便来个动画
bindEvent('time', function() {
  genItems(100);
});

// 更新鸡汤索引, 顺便更新鸡汤
bindEvent('msg', function(val) {
  toggleClass(msgWrap, 'rotate');
  setTimeout(function () {
    updateChickenSoup(val);
  }, 500);
});

/********************* 心灵鸡汤 *********************/

const chickenSoup = [
  '万事开头难，然后中间难，最后结尾难。',
  '世上99%的事情都能用钱解决，剩下的1%，需要更多钱解决。',
  '只要是石头，哪里都不会发光。',
  '上帝为你关上一道门的同时，还会顺带夹你的脑子',
  '对今天解决不了的事，不必着急，因为明天还是解决不了',
  '时候你不努力一下，你都不知道什么叫绝望。',
  '等忙完这一阵，就可以接着忙下一阵了。',
  '世上无难事，只要肯放弃。',
  '假如生活欺骗了你，不要悲伤，不要心急，反正明天也一样',
  '又一天过去了。今天过得怎么样，梦想是不是更远了？',
  '努力了这么久，但凡有点儿天赋，也该有些成功迹象了。',
  '好的容貌和很多钱，是进入上流社交活动的通行证。',
  '要是有个地方能出卖自己的灵魂换取物质享受就好了。',
  '有些人努力了一辈子，就是从社会的四流挤入了三流。',
  '一提到钱，大家就不是那么亲热了。',
  '在你这个年纪段，你怎么还睡得着啊？',
];

let whatEver = random(0, chickenSoup.length);
setData('msg', whatEver);

function updateChickenSoup(index) {
  msgWrap.innerHTML = chickenSoup[index];
}

/********************* 点击事件 *********************/

body.addEventListener('click', function (e) {
  whatEver = (whatEver + 1) % chickenSoup.length;
  setData('msg', whatEver);
}, false);

/******************** 倒计时 ********************/

const final = new Date('2024/05/20 12:00').getTime();

function getTime() {
  const diff = dateDiff(final - Date.now());
  const time = diff.day + '<span>天</span>' +
  diff.hour + '<span>小时</span>' +
  diff.minute + '<span>分</span>' +
  diff.second + '<span>秒</span>';
  return { time, sign: diff.sign };
}

function refresh() {
  const { sign, time } = getTime();
  setData('sign', sign < 0 ? '过去了' : '还有');
  setData('time', time);
}

/********************* 背景动画 *********************/

// 设定画布宽度
function resizeCanvas() {
  const size = getWindowSize();
  canvas.width = size.w;
  canvas.height = size.h;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);

// 彩纸片集合, 不知道这个怎么翻译, 就写个 item 吧
let items = [];

// 定义几个常量
const K = 120;
const X = -10;
const Y = 50;

// 生成指定数量的彩纸片
function genItems(count) {
  while(count--) {
    items.push(genOne());
  }
  // 生成一个
  function genOne() {
    const colorSet = [
      [255, 0, 0],
      [255, 255, 0],
      [255, 0, 255],
      [0, 255, 0],
      [0, 255, 255],
      [0, 0, 255],
      [255, 255, 0],
    ];
    // 颜色属性
    const color = colorSet[random(0, colorSet.length)];
    // 透明度
    const opacity = 1;
    // 水平位置
    const x = X;
    // 垂直位置
    const y = Y;
    // 水平速度(初始向右)
    const speedX = random(1, 20, 2);
    // 垂直速度(初始向上)
    const speedY = random(-1, -5, 2);
    // 尺寸
    const size = random(2,5);

    return { color, opacity, x, y, speedX, speedY, size };
  }
}

// 每一帧后的变化
function step(item) {
  if (item.y > window.innerHeight) {
    return null;
  }
  // 透明度线性递减
  if (item.opacity <= 0) {
    item.opacity = 0;
  } else {
    item.opacity -= 0.1 / K;
  }
  // 水平位置
  item.x += item.speedX;
  // 垂直位置
  item.y += item.speedY;
  // 水平速度加速递减
  item.speedX *= random(0.91, 0.99, 2);
  // 垂直速度先加后减
  item.speedY += random(0.01, 0.3, 2);

  return item;
}

// 渲染函数
function render() {
  const ctx = canvas.getContext('2d');
  const windowSize = getWindowSize();
  // 清理画布
  ctx.clearRect(0, 0, windowSize.w, windowSize.h);
  for(let index in items) {
    let item = items[index];
    if (item) {
      // 绘图
      const color = 'rgba(' + item.color[0] + ',' + item.color[1] + ',' + item.color[2] + ',' + item.opacity + ')';
      ctx.fillStyle = color;
      ctx.fillRect(item.x, item.y, item.size, item.size);
      // 变化
      items[index] = step(item);
    } else {
      items.splice(index, 1);
    }
  }
}

/*********************** 工具 **********************/

// 随机数, 记头不记尾
function random(min, max, float) {
  const randomNumber = Math.random() * (max - min) + min;
  if(float === undefined) {
    return Math.floor(randomNumber);
  } else {
    return parseFloat(randomNumber.toFixed(float));
  }
}

// 毫秒换算为天时分秒, 也就是在算时间差的时候游有用
function dateDiff(timeStamp) {
  const sign = timeStamp < 0 ? -1 : 1;

  let rest = Math.abs(timeStamp);
  // 天
  const day = parseInt(rest / (24 * 60 * 60 * 1000));
  rest = rest % (24 * 60 * 60 * 1000);
  // 时
  const hour = parseInt(rest / (60 * 60 * 1000));
  rest = rest % (60 * 60 * 1000);
  // 分
  const minute = parseInt(rest / (60 * 1000));
  rest = rest % (60 * 1000);
  // 秒
  const second = parseInt(rest / 1000);
  rest = rest % 1000;
  // 毫秒
  const millisecond = rest;

  return { sign, day, hour, minute, second, millisecond };
}

// 获取浏览器宽高
function getWindowSize() {
  return {
    w: window.innerWidth,
    h: window.innerHeight,
  };
}

// 切换类
function toggleClass(dom, className) {
  const classList = dom.classList;
  if (classList.contains(className)) {
    classList.remove(className);
  } else {
    classList.add(className);
  }
}

/****************** 所有动画都在这里 ******************/
animation();
function animation() {
  // 渲染纸片
  render();
  // 更新时间
  refresh();
  requestAnimationFrame(animation);
}

// 每隔 10 秒换一次鸡汤
// setInterval(function () {
//   setData('msg', whatEver);
//   console.log(1);
// }, 3000);