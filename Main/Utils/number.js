// https://github.com/tuya/tuya-panel-kit/blob/main/packages/tuya-panel-utils/src/number.ts

export default {
  /**
   * @example
   * // 17 = 10001(2)
   * getBitValue(17, 0)
   * // 1
   * @example
   * getBitValue(17, 1)
   * // 0
   * @example
   * getBitValue(17, 4)
   * // 1
   * @param {Number} idx, idx is reverse, and it begins 0
   * @returns {Number} a num
   */
  getBitValue: (num, idx) => (num & (1 << idx)) >> idx,

  /**
   * 限制数字范围，将 val 限制到 [min, max] 区间
   * @param val 入参
   * @param min 最小值
   * @param max 最大值
   * @param excepts 例外，不限制范围
   * @returns
   */
  formatNumberRange: (val, min, max, excepts = []) => {
    if (excepts.indexOf(val) !== -1) {
      return val;
    }
    val = Math.max(val, min);
    val = Math.min(val, max);
    return val || min;
  }
};