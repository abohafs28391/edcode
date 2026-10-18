import { redirect } from "next/navigation";

// ED Code Assist — ICD-10-CM Clinical Coding Helper.
// The tool is a fully self-contained single-file HTML app (built offline from
// scripts/ed_code_assist_template.html + official CMS FY2026 data), served
// statically from /ed-code-assist.html. The root route simply forwards to it.
export default function Home() {
  redirect("/ed-code-assist.html");
}
