export const styles = {
  ".-_WORDSTAR_-main-frame": {
    "z-index": "70000;",
    display: "flex;",
    "box-sizing": "border-box",
    "backdrop-filter": "blur(5.5px);",
    position: "absolute;",
    top: "50%;",
    left: "50%;",
    border: "1px solid #000000;",
    "border-radius": "0px 5px 5px 5px;",
    width: "max-content;",
    height: "max-content;",
    background: "rgba(118, 247, 223, 0.8);",
  },
  [`.-_WORDSTAR_-main-frame > .types button,
    .-_WORDSTAR_-main-frame > .definitions button`]: {
    height: "70px;",
    width: "70px;",
    background: "none;",
    border: "none;",
    "box-shadow": "none;",
    cursor: "pointer;",
  },
  [`.-_WORDSTAR_-main-frame > .types button:hover,
    .-_WORDSTAR_-main-frame > .definitions button:hover,
    .-_WORDSTAR_-main-frame > .types button:focus,
    .-_WORDSTAR_-main-frame > .definitions button:focus`]: {
    background: "none;",
    border: "none;",
    outline: "none;",
  },
  ".-_WORDSTAR_-main-frame button:hover svg": {
    transform: "scale(1.1);",
  },
  ".-_WORDSTAR_-main-frame .types__up-arrow:active": {
    transform: "translateY(-2px);",
  },
  ".-_WORDSTAR_-main-frame .types__down-arrow:active": {
    transform: "translateY(2px);",
  },
  ".-_WORDSTAR_-main-frame .definitions__left-arrow:active": {
    transform: "translateX(-2px);",
  },
  ".-_WORDSTAR_-main-frame .definitions__right-arrow:active": {
    transform: "translateX(2px);",
  },
  ".-_WORDSTAR_-main-frame button svg": {
    outline: "none;",
    transition: "transform 0.15s linear;",
  },
};
