using HEALTHCARE.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HEALTHCARE.Services
{
    public class BillingPdfService
    {
        private static readonly string Green = "#2D5016";
        private static readonly string GreenLight = "#EBF2E3";
        private static readonly string Terra = "#C4622D";
        private static readonly string Ink = "#16332B";
        private static readonly string Cream = "#F5F0E8";
        private static readonly string Border = "#E2DACE";
        private static readonly string MutedText = "#6B7280";
        private static readonly string RowAlt = "#FAF8F3";

        public byte[] Generate(BillingResponseDto b)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(0);
                    page.MarginBottom(55);
                    page.DefaultTextStyle(x => x.FontFamily("Helvetica").FontSize(10).FontColor(Ink));

                    page.Content().Column(col =>
                    {
                        // ── Top brand bar ──
                        col.Item().Background(Green).Padding(20).Row(row =>
                        {
                            row.RelativeItem().Text("CareConnect")
                                .FontSize(20).Bold().FontColor(Colors.White);

                            row.ConstantItem(220).AlignRight().Text("BOOKING INVOICE")
                                .FontSize(13).Bold().FontColor(Colors.White).LetterSpacing(0.05f);
                        });

                        col.Item().Padding(28).Column(body =>
                        {
                            // ── Invoice No. / Date ──
                            body.Item().Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text("Invoice No.").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.08f);
                                    c.Item().PaddingTop(3).Text($"INV-{b.AppointmentId:D5}").FontSize(11).Bold();
                                });
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text("Booking Date").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.08f);
                                    c.Item().PaddingTop(3).Text($"{b.BookedAt:MMMM d, yyyy}").FontSize(11).Bold();
                                });
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text("Status").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.08f);
                                    c.Item().PaddingTop(3).Text(b.Status).FontSize(11).Bold().FontColor(
                                        b.Status == "Completed" ? Green : Terra);
                                });
                            });

                            body.Item().PaddingVertical(16).LineHorizontal(1).LineColor(Border);

                            // ── Patient / Doctor info ──
                            body.Item().Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text("BILLED TO").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.08f);
                                    c.Item().PaddingTop(3).Text(b.PatientName).FontSize(12).Bold();
                                });
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().AlignRight().Text("APPOINTMENT WITH").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.08f);
                                    c.Item().AlignRight().PaddingTop(3).Text(b.DoctorName).FontSize(12).Bold();
                                    c.Item().AlignRight().Text(b.DoctorSpecialization).FontSize(9).FontColor(MutedText);
                                    c.Item().AlignRight().Text(b.HospitalName).FontSize(9).FontColor(MutedText);
                                    c.Item().AlignRight().PaddingTop(3)
                                        .Text($"Visit: {b.AppointmentDate:dd MMM yyyy}, {b.AppointmentTime}")
                                        .FontSize(9).FontColor(MutedText);
                                });
                            });

                            body.Item().PaddingVertical(16).LineHorizontal(1).LineColor(Border);

                            // ── Charges table ──
                            body.Item().Text("Charges").FontSize(13).Bold().FontColor(Green);

                            body.Item().PaddingTop(10).Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.RelativeColumn(4);
                                    c.RelativeColumn(2);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background(Green).Padding(8).Text("DESCRIPTION").FontSize(8).Bold().FontColor(Colors.White);
                                    header.Cell().Background(Green).Padding(8).AlignRight().Text("AMOUNT (₹)").FontSize(8).Bold().FontColor(Colors.White);
                                });

                                int rowIdx = 0;
                                void Row(string label, decimal amount, bool bold = false, bool negative = false)
                                {
                                    var bg = rowIdx++ % 2 == 0 ? "#FFFFFF" : RowAlt;
                                    var cellLabel = table.Cell().Background(bg).BorderBottom(1).BorderColor(Border).Padding(8);
                                    var cellAmt = table.Cell().Background(bg).BorderBottom(1).BorderColor(Border).Padding(8).AlignRight();

                                    if (bold) cellLabel.Text(label).FontSize(10).Bold();
                                    else cellLabel.Text(label).FontSize(9.5f);

                                    var amtText = (negative ? "− " : "") + $"₹{Math.Abs(amount):0.00}";
                                    if (bold) cellAmt.Text(amtText).FontSize(10).Bold().FontColor(negative ? Terra : Ink);
                                    else cellAmt.Text(amtText).FontSize(9.5f).FontColor(negative ? Terra : Ink);
                                }

                                Row("Consultation Fee (Total)", b.TotalFee, bold: true);
                                Row("Advance Paid at Booking (50%)", b.AdvanceAmount);

                                if (b.CreditApplied > 0)
                                    Row("From your refund balance", b.CreditApplied, negative: true);

                                Row(
                                    b.BalancePaid ? "Balance Paid at Checkup (50%)" : "Balance Due at Checkup (50%)",
                                    b.BalanceDue
                                );
                            });

                            // ── Total summary ──
                            body.Item().PaddingTop(16).AlignRight().Width(260).Column(c =>
                            {
                                c.Item().Background(GreenLight).Padding(12).Row(row =>
                                {
                                    row.RelativeItem().Text("Total Consultation Fee").FontSize(10).Bold().FontColor(Green);
                                    row.ConstantItem(90).AlignRight().Text($"₹{b.TotalFee:0.00}").FontSize(12).Bold().FontColor(Green);
                                });

                                c.Item().PaddingTop(6).Row(row =>
                                {
                                    row.RelativeItem().Text(b.BalancePaid ? "Amount Paid" : "Amount Due Now")
                                        .FontSize(9).FontColor(MutedText);
                                    row.ConstantItem(90).AlignRight()
                                        .Text(b.BalancePaid ? $"₹{b.TotalFee:0.00}" : $"₹{b.BalanceDue:0.00}")
                                        .FontSize(10).Bold().FontColor(b.BalancePaid ? Green : Terra);
                                });
                            });

                            // ── Cancellation policy note ──
                            body.Item().PaddingTop(24).Background(Cream).Padding(12).Column(c =>
                            {
                                c.Item().Text("CANCELLATION POLICY").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.08f);
                                c.Item().PaddingTop(3).Text(
                                    "If cancelled at least 1 hour before the appointment, 50% of the advance paid is credited.")
                                    .FontSize(8.5f).FontColor(MutedText).LineHeight(1.4f);
                            });
                        });

                    });
                    // ── Footer ──
                    page.Footer()
                        .Column(column =>
                        {
                            column.Item()
                                .LineHorizontal(1)
                                .LineColor(Border);

                            column.Item()
                                .Background(Cream)
                                .PaddingVertical(12)
                                .PaddingHorizontal(28)
                                .Row(row =>
                                {
                                    row.RelativeItem()
                                        .Text($"Generated by CareConnect · {DateTime.Now:dd MMM yyyy}")
                                        .FontSize(7.5f)
                                        .FontColor(MutedText);

                                    row.RelativeItem()
                                        .AlignRight()
                                        .Text("This is a computer-generated invoice and does not require a signature or stamp.")
                                        .FontSize(7.5f)
                                        .FontColor(MutedText);
                                });
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}