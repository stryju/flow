/* @flow */


import {suite, test} from '../../tsrc/test/Tester';

export default suite(({addFile, flowCmd}) => [
  test('named class exports', [
    addFile('named_class_exports.js'),
    flowCmd(['gen-flow-files', 'named_class_exports.js']).stdout(`
      // @flow

      declare class Class0 {
        map<U>(f: (x: T) => U): Class0<U>;
      }
      declare export class Base<A, B, C> {
        static baseStaticMethod(a: number, b: string): number;
        static overriddenStaticMethod(a: {b: number, c: number}): number;

        baseInst: Base<number, string, mixed>;
        childInst: Child<string, number>;
        baseMethod(a: number, b: string): number;
        overriddenMethod(a: {b: number, c: number}): number;
      }
      declare export class Child<A, B> extends Base<A, B, mixed> {
        static overriddenStaticMethod(a: {b: number}): number;

        notExported: Class0<number>;
        overriddenMethod(a: {b: number}): number;
      }
    `)
    .stderr('')
  ]),

  test('named variable exports', [
    addFile('named_variable_exports.js'),
    flowCmd(['gen-flow-files', 'named_variable_exports.js']).stderr('').stdout(`
      // @flow

      declare class Class0 {
      }
      declare export var constExport: number;
      declare export var letExport: number;
      export type typeExport = number;
      declare export var unexportedAlias: string;
      declare export var unexportedNominal: Class0;
      declare export var varExport: number;
    `)
  ]),

  test('named function exports', [
    addFile('named_function_exports.js'),
    flowCmd(['gen-flow-files', 'named_function_exports.js']).stderr('').stdout(`
      // @flow

      declare export function mono(a: number, b: {c: number}): number;
      declare export function poly<T: number, U: T, V: U>(a: V): number;
    `)
  ]),

  test('named type exports', [
    addFile('named_type_exports.js'),
    flowCmd(['gen-flow-files', 'named_type_exports.js']).stderr('').stdout(`
      // @flow

      export type T1 = number;
      export type T2<U, V> = Array<U>;
      declare module.exports: {};
    `),
  ]),

  test('default class exports', [
    addFile('default_class_export.js'),
    flowCmd(['gen-flow-files', 'default_class_export.js']).stderr('').stdout(`
      // @flow

      declare export class Base<A, B, C> {
      }
      declare export default class<A, B> extends Base<A, B, mixed> {
        p: number;
      }
    `),
  ]),

  test('default variable exports', [
    addFile('default_variable_exports.js'),
    flowCmd(['gen-flow-files', 'default_variable_exports.js']).stderr('').stdout(`
      // @flow

      declare export default number;
      declare export var str: string;
    `),
  ]),

  test('default function exports', [
    addFile('default_function_exports.js'),
    flowCmd(['gen-flow-files', 'default_function_exports.js']).stderr('').stdout(`
      // @flow

      declare export default function<T: number, U: T, V: U>(a: V): number;
      declare export function mono(a: number, b: {c: number}): number;
    `),
  ]),

  test('non-@flow files', [
    addFile('non_flow_file.js'),
    flowCmd(['gen-flow-files', '--strip-root', 'non_flow_file.js']).stderr('').stdout(`
      // This file does not have an @flow at the top!
    `),
  ]),

  test('type errors halt and print to stderr', [
    addFile('type_error.js'),
    flowCmd(['gen-flow-files', 'type_error.js']).stdout('').stderr(`
      type_error.js:3
        3: export var a: string = 42;
                                  ^^ number. This type is incompatible with
        3: export var a: string = 42;
                         ^^^^^^ string
      Found 1 error
      In order to generate a shadow file there must be no type errors!
    `)
  ]),

  test('imported class types arent redefined', [
    addFile('named_class_exports.js'),
    addFile('export_imported_type.js'),
    flowCmd(['gen-flow-files', 'export_imported_type.js']).stderr('').stdout(`
      // @flow

      import {Child} from "./named_class_exports";
      declare export var a: Child<number, string>;
    `)
  ]),

  test('builtin class types arent redefined', [
    addFile('exports_builtins.js'),
    flowCmd(['gen-flow-files', 'exports_builtins.js']).stderr('').stdout(`
      // @flow

      declare export function fn(a: Array<number>): void;
    `)
  ]),

  test('suppressed type errors get normalized', [
    addFile('suppressions.js'),
    flowCmd(['gen-flow-files', 'suppressions.js']).stderr('').stdout(`
      // @flow

      declare export function fn(): number;
    `)
  ]),

  test('literal types respect polarity', [
    addFile('literal_types.js'),
    flowCmd(['gen-flow-files', 'literal_types.js']).stderr('').stdout(`
      // @flow

      declare export function f1(p: number): string;
      declare export function f2(p: 42): "asdf";
      declare export var varBool: boolean;
      declare export var varBoolLiteral: true;
      declare export var varNum: number;
      declare export var varNumLiteral: 42;
      declare export var varStr: string;
      declare export var varStrLiteral: "asdf";
    `)
  ]),

  test('optional types', [
    addFile('optional_types.js'),
    flowCmd(['gen-flow-files', 'optional_types.js']).stderr('').stdout(`
      // @flow

      declare export var obj: {b?: number};
      declare export function optFunc(p?: number): void | number;
      declare export var optNum: void | number;
    `)
  ]),

  test('object types', [
    addFile('object_types.js'),
    flowCmd(['gen-flow-files', 'object_types.js']).stderr('').stdout(`
      // @flow

      declare export var dict: {[key: string]: string};
      declare export var dictWithProps: {p1: string, [key: string]: number};
      declare export var emptyObj: {};
      declare export var multiProp: {p1: number, p2: number};
      declare export var nestedObject: {p1: {p2: number}};
      declare export var singleProp: {p1: number};
    `)
  ]),
]);
