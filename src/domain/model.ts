// src/domain/model.ts — DiagramModel v2 (SPEC-parser §3). Solo tipos. Líneas 1-based inclusivas.

export type Visibility = '+' | '-' | '#' | '~';
export type DeclaredKind = 'class' | 'record' | 'interface' | 'enum' | 'abstract';
export type Category = DeclaredKind | 'sealed';
export type RelationshipType = 'ASSOCIATION' | 'DEPENDENCY' | 'EXTENDS' | 'IMPLEMENTS';
// La unión crece solo cuando un fixture traiga otra cabeza (*--, o--).
export type ArrowHead = 'none' | 'open' | 'triangle';
// Único valor observado; crece con el fixture de directivas de C1b.
export type Direction = 'TB';
export type ParseIssueCode =
  | 'ERR_UNCLOSED_BLOCK'
  | 'ERR_INVALID_MEMBER'
  | 'ERR_INVALID_REL'
  | 'ERR_UNKNOWN_SYNTAX';

export type LineRange = {
  readonly line: number;
  readonly endLine: number;
};

export type Parameter = {
  readonly name: string;
  readonly type: string;
};

export type Attribute = {
  readonly name: string;
  readonly type: string;
  readonly visibility: Visibility;
  readonly isStatic: boolean;
  readonly line: number;
};

export type Method = {
  readonly name: string;
  readonly returnType: string;
  readonly parameters: readonly Parameter[];
  readonly visibility: Visibility;
  readonly isStatic: boolean;
  readonly isAbstract: boolean;
  readonly line: number;
};

export type Constructor = {
  readonly name: string;
  readonly parameters: readonly Parameter[];
  readonly visibility: Visibility;
  readonly line: number;
};

export type EnumConstant = {
  readonly name: string;
  readonly line: number;
};

export type DiagramType = LineRange & {
  readonly id: string;
  readonly name: string;
  readonly packageName: string | null;
  readonly declaredKind: DeclaredKind;
  readonly category: Category;
  readonly isAbstract: boolean;
  readonly isSealed: boolean;
  readonly isExternal: boolean;
  readonly implicit: boolean;
  readonly stereotypes: readonly string[];
  readonly attributes: readonly Attribute[];
  readonly methods: readonly Method[];
  readonly constructors: readonly Constructor[];
  readonly enumConstants: readonly EnumConstant[];
};

export type Package = LineRange & {
  readonly name: string;
  readonly alias: string | null;
  // Ordenado por id (determinismo).
  readonly typeIds: readonly string[];
};

export type Relationship = LineRange & {
  readonly source: string;
  readonly target: string;
  readonly type: RelationshipType;
  readonly sourceHead: ArrowHead;
  readonly targetHead: ArrowHead;
};

export type Note = LineRange & {
  readonly text: string;
};

export type ParseIssue = LineRange & {
  readonly code: ParseIssueCode;
  readonly snippet: string;
};

export type DiagramModel = {
  readonly types: readonly DiagramType[];
  readonly relationships: readonly Relationship[];
  readonly packages: readonly Package[];
  readonly summaryMode: boolean;
  readonly issues: readonly ParseIssue[];
  readonly notes: readonly Note[];
  readonly hide: readonly string[];
  readonly direction: Direction;
  // Claves en minúsculas, orden lexicográfico, valor de la última aparición.
  readonly skinparams: Readonly<Record<string, string>>;
  // "none" es un string más; null = sin directiva `set separator`.
  readonly separator: string | null;
};
