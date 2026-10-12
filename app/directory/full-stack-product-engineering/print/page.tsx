import Resume from "../../../Resume";
import PrintControls from "../../../print/PrintControls";
import { fullStackProductPdfUrl } from "../../../resumePdf";
export const metadata = { title: "Robert Kotcher | Full-Stack Product Engineering" };
export default function PrintFullStackProductResume() {
  return <><PrintControls backUrl="/directory/full-stack-product-engineering" pdfUrl={fullStackProductPdfUrl} /><Resume printable variant="full-stack-product-engineering" /></>;
}
