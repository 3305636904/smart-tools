import { ref, onMounted, onUnmounted } from "vue";

/**
 * @description 获取本地时间
 */
export function useTime() {
  let timer: number; // 定时器
  const year = ref(0); // 年份
  const month = ref(0); // 月份
  const week = ref(""); // 星期几
  const day = ref(0); // 天数
  const hour = ref<number | string>(0); // 小时
  const minute = ref<number | string>(0); // 分钟
  const second = ref(0); // 秒

  // 更新时间
  const updateTime = () => {
    const date = new Date();
    year.value = date.getFullYear();
    month.value = date.getMonth() + 1;
    week.value = "日一二三四五六".charAt(date.getDay());
    day.value = date.getDate();
    hour.value =
      (date.getHours() + "")?.padStart(2, "0") ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(
        date.getHours()
      );
    minute.value =
      (date.getMinutes() + "")?.padStart(2, "0") ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(
        date.getMinutes()
      );
    second.value = date.getSeconds();
  };

  updateTime();

  onMounted(() => {
    clearInterval(timer);
    timer = setInterval(() => updateTime(), 1000);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  return { month, day, hour, minute, second, week };
}

export function formatTimeTodayLast() {
  let timer: number; // 定时器
  const hour = ref<number>(0); // 小时
  const minute = ref<number>(0); // 分钟
  const second = ref(0); // 秒

  // 更新时间
  const updateTime = () => {
    const dateNow = new Date();
    // 获取明天0点的时间
    const dateOfTomorrow = new Date(
      dateNow.getFullYear(),
      dateNow.getMonth(),
      dateNow.getDate() + 1
    );

    const timeInfos = getTimeDuration(dateNow, dateOfTomorrow);
    hour.value = timeInfos.hours;
    minute.value = timeInfos.minutes;
    second.value = timeInfos.seconds;
  };

  updateTime();

  onMounted(() => {
    clearInterval(timer);
    timer = setInterval(() => updateTime(), 1000);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  return {
    hour,
    minute,
    second,
  };
}

type NumStr = number | string;

export function getTimeNowEachField(date: Date) {
  let year: NumStr = date.getFullYear();
  let month: NumStr = date.getMonth(); // getMonth() 返回的月份是从0开始的，所以需要+1
  let day: NumStr = date.getDate();
  let hour: NumStr = date.getHours();
  let minute: NumStr = date.getMinutes();
  let second: NumStr = date.getSeconds();
  let milliseconds: NumStr = date.getMilliseconds();

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    milliseconds,
  };
}

export function formatTime(date: Date) {
  let year: NumStr = date.getFullYear();
  let month: NumStr = date.getMonth() + 1; // getMonth() 返回的月份是从0开始的，所以需要+1
  let day: NumStr = date.getDate();
  let hour: NumStr = date.getHours();
  let minute: NumStr = date.getMinutes();
  let second: NumStr = date.getSeconds();

  // 为个位数的月、日、时、分、秒前面补0
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  second = second < 10 ? "0" + second : second;

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function getTimeDifference(date1: Date, date2: Date) {
  return Math.abs(date2.getTime() - date1.getTime());
}

export function formatTimeDifference(diffMilliseconds: number) {
  let seconds = Math.floor(diffMilliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  hours %= 24;
  minutes %= 60;
  seconds %= 60;

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

export function getTimeDuration(date1: Date, date2: Date) {
  return formatTimeDifference(getTimeDifference(date1, date2));
}

export function formatTimeNormal(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

// export function toRFC3339(date: Date) {
//   let y = date.getFullYear();
//   let m =
//     date.getMonth() + 1 < 10
//       ? "0" + (date.getMonth() + 1)
//       : date.getMonth() + 1;
//   let d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
//   let hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
//   let mm = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
//   let ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
//   var endDate = y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
//   endDate = endDate.replace(/\s+/g, "T") + "+08:00";
//   return endDate;
// }

// export const rFC3339ToTime = function (dateStr: string | number): string {
//   var date = new Date(dateStr).toJSON();
//   return new Date(+new Date(date) + 8 * 3600 * 1000)
//     .toISOString()
//     .replace(/T/g, " ")
//     .replace(/\.[\d]{3}Z/, "");
// };

// 使用示例
// const formattedDiff = formatTimeDifference(difference);
// console.log(`格式化的时间间隔：${formattedDiff.days}天 ${formattedDiff.hours}小时 ${formattedDiff.minutes}分钟 ${formattedDiff.seconds}秒`);
