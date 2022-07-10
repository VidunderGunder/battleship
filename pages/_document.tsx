import { createGetInitialProps } from "@mantine/next";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { globalCSS } from "../styles/styles";
import { Global } from "@emotion/react";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head />
        <Global styles={globalCSS} />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
