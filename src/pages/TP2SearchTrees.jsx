import TP2SearchTrees from "../features/tp/TP2SearchTrees";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

export default function TP2SearchPage() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">TP2 Search Trees</Heading>
      </Row>
      <TP2SearchTrees />
    </>
  );
}
