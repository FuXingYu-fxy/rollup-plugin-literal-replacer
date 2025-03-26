# rollup-plugin-literal-replacer

[![npm](https://img.shields.io/npm/v/rollup-plugin-literal-replacer)](https://www.npmjs.com/package/rollup-plugin-literal-replacer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> 一个Rollup插件, 用于替换函数调用中的字面量参数。
## 例如
```js
// 假设你有以下代码：
foo('hello', 'world')
// 使用插件的自定义替换逻辑
function transform(val) {
  return val.slice(0, 1)
}
// 最终的代码将被替换为：
foo('h', 'w')
```
## 特性

- 🔍 **精准定位** - 通过 AST 分析精准定位目标函数调用
- 🔧 **高度可配置** - 支持自定义匹配规则和替换逻辑
- 🗺️ **完整的 Sourcemap** - 使用 Magic-string 生成精准源码映射

## 安装

```bash
npm install rollup-plugin-literal-replacer -D
# 或
yarn add rollup-plugin-literal-replacer -D
```

# 使用方式
## 基础配置
```js
// rollup.config.js
import literalReplacer from 'rollup-plugin-literal-replacer';

export default {
  plugins: [
    literalReplacer({
      functions: ['t', '$t'],
      include: "src/**/*.js",
      exclude: "node_modules/**"
    })
  ]
};
```
## 配置选项

| 选项          | 类型                              | 默认值                                      | 说明                             |
|---------------|-----------------------------------|---------------------------------------------|----------------------------------|
| include       | string \| RegExp \| (string \| RegExp)[] | "src/**/*.{js,ts,jsx,tsx,vue}"              | 需要处理的文件路径模式           |
| exclude       | string \| RegExp \| (string \| RegExp)[] | "node_modules/**"                           | 排除处理的文件路径模式           |
| functions     | string[]                          | ['t', '$t']                                 | 需要处理的目标函数名             |
| shouldReplace | (value: string) => boolean        | () => true                          | 会对函数参数的每个字面量进行判断是否需要替换的过滤函数       |
| transform     | (value: string) => string         | (value) => value                              | 自定义字符串替换逻辑             |

# 示例
## 自定义替换逻辑
```js
literalReplacer({
  functions: ['i18n'],
  transform = (value) => {
    const index = value.indexOf('/');
    const prefix = value.slice(0, index);
    const message = value.slice(index + 1);
    return `${prefix}${crc32(message).toString(16)}`;
  }
})
```
## 函数参数是否被替换
```js
// foo("ab", "ac", "b")
literalReplacer({
  shouldReplace(value) {
    return value.startsWith("a")
  }
})
```
# 工作原理
- AST 解析 - 使用 Rollup 内置的 AST 解析器分析代码结构
- 目标定位 - 通过 estree-walker 遍历定位目标函数调用
- 精准替换 - 结合AST信息通过使用 magic-string 进行代码修改
- 映射生成 - 自动生成高精度 Sourcemap 保持调试能力