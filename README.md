# rollup-plugin-literal-replacer

[![npm](https://img.shields.io/npm/v/rollup-plugin-literal-replacer)](https://www.npmjs.com/package/rollup-plugin-literal-replacer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> 一个Rollup插件, 用于替换函数调用中的字面量参数。
## 例如
```js
// 假设你有以下代码：
foo('hello', 'world')
// 使用插件的自定义转换逻辑
function transform(val) {
  return val.slice(0, 1)
}
// 最终的代码将被替换为：
foo('h', 'w')
```
## 特性

- 🔍 **精准定位** - 通过 AST 分析精准定位目标函数调用
- 🔧 **高度可配置** - 支持自定义匹配规则和转换逻辑
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
      extensions: ['.vue', '.js']
    })
  ]
};
```
## 配置选项

| 选项          | 类型                              | 默认值                                      | 说明                             |
|---------------|-----------------------------------|---------------------------------------------|----------------------------------|
| functions     | string[]                          | ['t', '$t']                                 | 需要处理的目标函数名             |
| extensions    | string[]                          | ['.vue', '.js', '.ts', '.jsx', '.tsx']      | 需要处理的文件扩展名             |
| shouldReplace | (value: string) => boolean        | 检测 N/ 和 B/ 前缀                          | 判断是否需要替换的过滤函数       |
| transform     | (value: string) => string         | CRC32 哈希转换                              | 自定义字符串转换逻辑             |
| onError       | (error: Error, id: string) => void| 控制台报错                                  | 自定义错误处理函数               |

# 示例
## 自定义转换函数
```js
literalReplacer({
  functions: ['i18n'],
  transform: (value) => {
    const [prefix, key] = value.split('/');
    return `${prefix}_${key.toUpperCase()}`;
  }
})
```
## 扩展文件类型
```js
literalReplacer({
  extensions: ['.svelte', '.astro']
})
```
# 工作原理
- AST 解析 - 使用 Rollup 内置的 AST 解析器分析代码结构
- 目标定位 - 通过 estree-walker 遍历定位目标函数调用
- 精准替换 - 结合AST信息通过使用 magic-string 进行代码修改
- 映射生成 - 自动生成高精度 Sourcemap 保持调试能力