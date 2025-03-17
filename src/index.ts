import path from 'path';
import type { Plugin } from 'rollup';
import MagicString from 'magic-string';
import { Node, walk } from 'estree-walker';
import { crc32 } from 'crc';

// 定义插件配置类型
export interface LiteralReplacerOptions {
  /** 需要处理的函数名（默认 ['t', '$t']） */
  functions?: string[];
  /** 需要处理的文件扩展名（默认 ['.vue', '.js', '.ts', '.jsx', '.tsx']） */
  extensions?: string[];
  /** 自定义前缀检测逻辑（默认检测 'N/' 和 'B/' 开头的字符串） */
  shouldReplace?: (value: string) => boolean;
  /** 自定义转换逻辑（默认添加 CRC32 哈希） */
  transform?: (value: string) => string;
  /** 错误处理回调 */
  onError?: (error: Error, id: string) => void;
}

export default function literalReplacer(
  options: LiteralReplacerOptions = {}
): Plugin {
  // 合并默认配置
  const {
    functions = ['t', '$t'],
    extensions = ['.vue', '.js', '.ts', '.jsx', '.tsx'],
    shouldReplace = (value) => ['N/', 'B/'].some(prefix => value.startsWith(prefix)),
    transform = (value) => {
      const index = value.indexOf('/');
      const prefix = value.slice(0, index);
      const message = value.slice(index + 1);
      return `${prefix}${crc32(message).toString(16)}`;
    },
    onError = (error, id) => console.error(`[literal-replacer] Error in ${id}: ${error.message}`)
  } = options;

  // 预处理 src 路径（跨平台兼容）
  const srcPath = path.resolve('src').replace(/\\/g, '/') + '/';

  const cache: Record<string, string> = {};

  return {
    name: 'literal-replacer',
    transform(code, id) {
      try {
        // 过滤非目标文件
        if (!id.startsWith(srcPath)) return null;
        if (!extensions.includes(path.extname(id))) return null;

        const s = new MagicString(code);
        const ast = this.parse(code);

        walk(ast, {
          enter(node: Node) {
            if (node.type === 'CallExpression') {
              let funcName: string | undefined;

              // 检测函数调用类型：直接调用【t('common.message')】或成员表达式调用 【i18n.t('common.message')】
              if (node.callee.type === 'Identifier') {
                funcName = node.callee.name;
              } else if (
                node.callee.type === 'MemberExpression' &&
                node.callee.property.type === 'Identifier'
              ) {
                funcName = node.callee.property.name;
              }

              // 处理目标函数
              if (funcName && functions.includes(funcName)) {
                node.arguments.forEach((argNode) => {
                  if (argNode.type === 'Literal' && typeof argNode.value === 'string') {
                    const originalValue = argNode.value;
                    if (shouldReplace(originalValue)) {
                      if (!cache[originalValue]) {
                        cache[originalValue] = transform(originalValue)
                      }

                      if ('start' in argNode && 'end' in argNode) {
                        s.overwrite(argNode.start as number, argNode.end as number, `'${cache[originalValue]}'`);
                      }
                    }
                  }
                });
              }
            }
          },
        });

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        };
      } catch (err) {
        onError(err as Error, id);
        return null; 
      }
    },
  };
}