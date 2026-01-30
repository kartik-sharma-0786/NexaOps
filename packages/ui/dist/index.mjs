// src/button.tsx
import { jsx } from "react/jsx-runtime";
function Button({ children, ...props }) {
  return /* @__PURE__ */ jsx("button", { ...props, children });
}
export {
  Button
};
