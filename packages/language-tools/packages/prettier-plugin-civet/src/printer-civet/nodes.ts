import type {
  AttributeNode,
  BlockStatement,
  CommentNode,
  ComponentNode,
  CustomElementNode,
  DoctypeNode,
  ElementNode,
  ExpressionNode,
  FragmentNode,
  FrontmatterNode,
  Node,
  ParentLikeNode,
  RootNode,
  TagLikeNode,
  TextNode,
} from "@civetjs/compiler/types";

export type anyNode =
  | RootNode
  | AttributeNode
  | ElementNode
  | ComponentNode
  | CustomElementNode
  | ExpressionNode
  | TextNode
  | BlockStatement
  | DoctypeNode
  | CommentNode
  | FragmentNode
  | FrontmatterNode;

export type {
  AttributeNode,
  BlockStatement,
  CommentNode,
  ComponentNode,
  CustomElementNode,
  DoctypeNode,
  ElementNode,
  ExpressionNode,
  FragmentNode,
  FrontmatterNode,
  Node,
  ParentLikeNode,
  RootNode,
  TagLikeNode,
  TextNode,
};
