import { useState } from "react";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import Button from "../ui/Button";
import ButtonGroup from "../ui/ButtonGroup";
import TP1Graphs from "../features/tp/TP1Graphs";
import TP1TreesBasics from "../features/tp/TP1TreesBasics";
import TP2SearchTrees from "../features/tp/TP2SearchTrees";

function Tp() {
  const [tab, setTab] = useState("graphs");

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">TP Dashboard — Graphs & Search Trees</Heading>
        <ButtonGroup>
          <Button
            $variation={tab === "graphs" ? "primary" : "secondary"}
            onClick={() => setTab("graphs")}
          >
            TP1 • Graphs
          </Button>
          <Button
            $variation={tab === "trees" ? "primary" : "secondary"}
            onClick={() => setTab("trees")}
          >
            TP1 • Trees (Basics)
          </Button>
          <Button
            $variation={tab === "search" ? "primary" : "secondary"}
            onClick={() => setTab("search")}
          >
            TP2 • Search Trees
          </Button>
        </ButtonGroup>
      </Row>

      {tab === "graphs" && <TP1Graphs />}
      {tab === "trees" && <TP1TreesBasics />}
      {tab === "search" && <TP2SearchTrees />}
    </>
  );
}

export default Tp;
