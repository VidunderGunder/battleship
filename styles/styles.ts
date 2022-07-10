import { css } from "@emotion/react";

export const globalCSS = css`
  html,
  body,
  #__next {
    height: 100%;
  }
  html,
  body,
  div,
  span {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  .not-selectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`