import type { Plugin } from 'rollup';
import { createFilter, FilterPattern } from '@rollup/pluginutils'
import MagicString from 'magic-string';
import { Node, walk } from 'estree-walker';

// 定义插件配置类型
export interface LiteralReplacerOptions {
  /** 打包时包含的文件 */
  include?: FilterPattern;
  /** 打包时排除的文件 */
  exclude?: FilterPattern;
  /** 检测的目标函数名 */
  functions?: string[];
  /** 在每个字面量参数被转换时调用, 传入的是参数名, 返回boolean决定是否继续进行转换 */
  shouldReplace?: (value: string) => boolean;
  /** 自定义转换逻辑, 默认原样返回 */
  transform?: (value: string) => string;
}

export default function literalReplacer(
  options: LiteralReplacerOptions = {}
): Plugin {
  // 合并默认配置
  const {
    include = "src/**/*.{js,ts,jsx,tsx,vue}",
    exclude = "node_modules/**",
    functions = ['t', '$t'],
    shouldReplace = () => true, 
    transform = (value) => value,
  } = options;

  const cache: Record<string, string> = {};
  const filter = createFilter(include, exclude);

  return {
    name: 'literal-replacer',
    transform(code, id) {
      try {
        // 过滤非目标文件
        if (!filter(id)) return null;

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
      } catch (err: any) {
        this.warn(err.message);
        return null; 
      }
    },
  };
}