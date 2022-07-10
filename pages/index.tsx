import { Suspense } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

const Battleship = dynamic(() => import("../components/Battleship"), {
  suspense: true,
});

const Index: NextPage = () => {
  return (
    <>
      <Head>
        <title>React Battleship</title>
        <meta name="description" content="React Battleship" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Suspense fallback={`Loading...`}>
        <Battleship />
      </Suspense>
    </>
  );
};

export default Index;
