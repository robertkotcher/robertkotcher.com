import Resume from "../Resume";
import PrintControls from "./PrintControls";

export const metadata = { title: "Robert Kotcher | Résumé" };

export default function PrintResume() {
  return <><PrintControls /><Resume printable /></>;
}
