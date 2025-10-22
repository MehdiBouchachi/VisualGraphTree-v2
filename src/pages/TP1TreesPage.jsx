import TP1TreesBasics from "../features/tp/TP1TreesBasics";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

export default function TP1TreesPage() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">TP1 Trees </Heading>
      </Row>
      <TP1TreesBasics />
    </>
  );
}
