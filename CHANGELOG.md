## [0.0.3] - 2025-03-26

### Added

- 新增 `options.include` glob 匹配模式
- 新增 `options.exclude` glob 匹配模式

### Changed
- `options.transform` 的默认值变更为: `(v) => v`，即原样转换。
- `options.shouldReplace` 的默认值变更为: `() => true`。

### Removed
- 移除 `crc` 依赖
- 移除 `options.extensions` 参数
- 移除 `options.onError` 参数

## [0.0.2] - 2025-03-17

### Added

- 增加了 `options.transform` 相同入参的缓存逻辑

## [0.0.1] - 2025-03-16

### Added

- 支持对 `src` 目录下的所有函数字面量参数执行替换逻辑