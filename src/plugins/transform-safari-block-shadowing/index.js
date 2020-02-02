/**
 * Fixes block-shadowed let/const bindings in Safari 10/11.
 * https://kangax.github.io/compat-table/es6/#test-let_scope_shadow_resolution
 */
export default function({ types: t }) {
  return {
    name: "transform-safari-block-shadowing",
    visitor: {
      VariableDeclarator(path) {
        const kind = path.parent.kind;
        if (kind !== "let" && kind !== "const") return;

        const bindings = t.getOuterBindingIdentifiers(path.node.id);
        for (const name of Object.keys(bindings)) {
          let scope = path.scope;

          // ignore parent bindings (note: impossible due to let/const?)
          if (!scope.hasOwnBinding(name)) continue;

          // this only affects block bindings
          if (t.isFunction(scope.block) || t.isProgram(scope.block)) continue;

          // check if shadowed within the nearest function/program boundary
          while ((scope = scope.parent)) {
            if (scope.hasOwnBinding(name)) {
              path.scope.rename(name);
              break;
            }
            if (t.isFunction(scope.block) || t.isProgram(scope.block)) {
              break;
            }
          }
        }
      },
    },
  };
}
