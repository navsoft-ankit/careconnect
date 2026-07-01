using HEALTHCARE.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HEALTHCARE.Services
{
    public class PrescriptionPdfService
    {
        // Brand tokens — kept in sync with the frontend design system
        private static readonly string Green = "#2D5016";
        private static readonly string GreenLight = "#EBF2E3";
        private static readonly string Terra = "#C4622D";
        private static readonly string Ink = "#16332B";
        private static readonly string Cream = "#F5F0E8";
        private static readonly string Border = "#E2DACE";
        private static readonly string MutedText = "#6B7280";

        public byte[] Generate(PrescriptionResponseDto rx)
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
                        // ── Header band ──
                        col.Item().Background(Green).Padding(28).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("CareConnect").FontSize(24).Bold().FontColor(Colors.White);
                                c.Item().PaddingTop(2).Text("Care You Can Trust, Anytime")
                                    .FontSize(9).FontColor(Colors.White).FontColor("#D7E4C9");
                            });

                            row.ConstantItem(150).Column(c =>
                            {
                                c.Item().AlignRight().Text("PRESCRIPTION").FontSize(11).Bold().FontColor(Colors.White);
                                c.Item().AlignRight().PaddingTop(2).Text(rx.AppointmentDate.ToString("dd MMM yyyy"))
                                    .FontSize(9).FontColor("#D7E4C9");
                            });
                        });

                        col.Item().Padding(28).Column(body =>
                        {
                            // ── Doctor / Patient info strip ──
                            body.Item().Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().PaddingTop(2).Text($"{rx.DoctorName}").FontSize(12).Bold();
                                    c.Item().Text(rx.DoctorSpecialization).FontSize(9).FontColor(MutedText);
                                    c.Item().Text(rx.HospitalName).FontSize(9).FontColor(MutedText);
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().AlignRight().Text("PATIENT").FontSize(8).FontColor(MutedText).LetterSpacing(0.1f);
                                    c.Item().AlignRight().PaddingTop(2).Text(rx.PatientName).FontSize(12).Bold();
                                    c.Item().AlignRight().Text($"Visit: {rx.AppointmentDate:dd MMM yyyy}, {rx.AppointmentTime}")
                                        .FontSize(9).FontColor(MutedText);
                                });
                            });

                            body.Item().PaddingVertical(16).LineHorizontal(1).LineColor(Border);

                            // ── Diagnosis ──
                            body.Item().Background(GreenLight).Padding(12).Column(c =>
                            {
                                c.Item().Text("DIAGNOSIS").FontSize(8).Bold().FontColor(Green).LetterSpacing(0.1f);
                                c.Item().PaddingTop(3).Text(rx.Diagnosis).FontSize(11);
                            });

                            // ── Rx symbol + medicines ──
                            body.Item().PaddingTop(20).Text("Rx").FontSize(20).Italic().Bold().FontColor(Terra);

                            body.Item().PaddingTop(8).Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.RelativeColumn(3);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(3);
                                });

                                table.Header(header =>
                                {
                                    void HeaderCell(string text) => header.Cell()
                                        .BorderBottom(1).BorderColor(Ink).PaddingBottom(6)
                                        .Text(text).FontSize(8).Bold().FontColor(MutedText);

                                    HeaderCell("MEDICINE");
                                    HeaderCell("DOSAGE");
                                    HeaderCell("FREQUENCY");
                                    HeaderCell("DURATION");
                                    HeaderCell("INSTRUCTIONS");
                                });

                                foreach (var med in rx.Medicines)
                                {
                                    void Cell(string text, bool bold = false)
                                    {
                                        var cell = table.Cell().BorderBottom(1).BorderColor(Border).PaddingVertical(8);
                                        if (bold) cell.Text(text).FontSize(10).Bold();
                                        else cell.Text(text ?? "-").FontSize(9.5f);
                                    }

                                    Cell(med.Name, bold: true);
                                    Cell(med.Dosage);
                                    Cell(med.Frequency);
                                    Cell(med.Duration);
                                    Cell(med.Instructions ?? "-");
                                }
                            });

                            // ── Notes / follow-up ──
                            if (!string.IsNullOrWhiteSpace(rx.Notes))
                            {
                                body.Item().PaddingTop(20).Column(c =>
                                {
                                    c.Item().Text("NOTES").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.1f);
                                    c.Item().PaddingTop(3).Text(rx.Notes).FontSize(10);
                                });
                            }

                            if (!string.IsNullOrWhiteSpace(rx.AdviceOnFollowUp))
                            {
                                body.Item().PaddingTop(12).Column(c =>
                                {
                                    c.Item().Text("FOLLOW-UP ADVICE").FontSize(8).Bold().FontColor(MutedText).LetterSpacing(0.1f);
                                    c.Item().PaddingTop(3).Text(rx.AdviceOnFollowUp).FontSize(10);
                                });
                            }

                            // ── Signature ──
                            body.Item().PaddingTop(50).Row(row =>
                            {
                                row.RelativeItem();
                                row.ConstantItem(180).Column(c =>
                                {
                                    c.Item().PaddingBottom(4).LineHorizontal(1).LineColor(Ink);
                                    c.Item().AlignCenter().Text($"{rx.DoctorName}").FontSize(9).Bold();
                                    c.Item().AlignCenter().Text("Signature").FontSize(8).FontColor(MutedText);
                                });
                            });
                                                });
                    });

                    // ── Footer ──
                    page.Footer()
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
                                .Text("This is a computer-generated prescription and does not require a signature or stamp.")
                                .FontSize(7.5f)
                                .FontColor(MutedText);
                        });

                });
            });

            return document.GeneratePdf();
        }
    }
}