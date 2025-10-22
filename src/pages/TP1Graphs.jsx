import TP1Graphs from "../features/tp/TP1Graphs";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

export default function TP1GraphsPage() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">TP1 Graphs</Heading>
      </Row>
      <TP1Graphs />
    </>
  );
}
