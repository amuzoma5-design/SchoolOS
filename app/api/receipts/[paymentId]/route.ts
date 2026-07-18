import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, amount, source, created_at, invoices(students(name), school_id)")
    .eq("id", paymentId)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", (payment.invoices as any)?.school_id)
    .single();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 300]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const draw = (text: string, y: number, size = 12, useBold = false) => {
    page.drawText(text, {
      x: 40,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.09, 0.13, 0.23),
    });
  };

  draw(school?.name ?? "School", 260, 16, true);
  draw("Payment Receipt", 235, 12);
  draw("-----------------------------------", 220);
  draw("Student: " + ((payment.invoices as any)?.students?.name ?? "Unknown"), 195);
  draw("Amount: NGN " + Number(payment.amount).toLocaleString(), 175);
  draw("Method: " + (payment.source === "paystack" ? "Online payment" : "Manual (cash/transfer)"), 155);
  draw("Date: " + new Date(payment.created_at).toLocaleDateString(), 135);
  draw("Receipt ID: " + payment.id, 100, 9);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=receipt-" + payment.id + ".pdf",
    },
  });
}
