import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";

interface DebitOrderItem {
  name: string;
  amount: number;
  day: number;
  cleared: boolean;
}

interface DebtItem {
  name: string;
  paidInstalments: number;
  totalInstalments: number;
  monthlyAmount: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      monthStr = "Current Month",
      salary = 25000,
      safeToSpendDaily = 280,
      safeToSpendTotal = 3920,
      fixedCommitments = 5800,
      daysRemaining = 14,
      daysUntilPayday = 9,
      paydayDay = 25,
      debitOrders = [] as DebitOrderItem[],
      debts = [] as DebtItem[],
    } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name && typeof name === "string" ? name.trim() : "Valued Member";
    const upcomingDebitOrders = debitOrders.filter((d: DebitOrderItem) => !d.cleared);
    const upcomingCount = upcomingDebitOrders.length;
    const upcomingTotal = upcomingDebitOrders.reduce(
      (sum: number, d: DebitOrderItem) => sum + (Number(d.amount) || 0),
      0
    );

    // Subject as requested: "Your [Month] Plan: 5 debit orders scheduled to run this week (R3,450), leaving you R280/day in Safe-to-Spend"
    const subject = `Your ${monthStr} Plan: ${upcomingCount} debit orders scheduled (R${upcomingTotal.toLocaleString()}), leaving you R${Math.round(
      safeToSpendDaily
    ).toLocaleString()}/day Safe-to-Spend`;

    // Render debit orders HTML rows
    const debitOrdersHtml = debitOrders.length
      ? debitOrders
          .map(
            (item: DebitOrderItem) => `
        <tr style="border-bottom: 1px solid rgba(13, 13, 12, 0.06);">
          <td style="padding: 12px 8px; font-size: 13px; color: #0D0D0C; font-weight: 500;">
            ${item.name}
          </td>
          <td style="padding: 12px 8px; font-size: 12px; color: rgba(13, 13, 12, 0.55); text-align: center;">
            ${item.day ? `${item.day}th` : "Monthly"}
          </td>
          <td style="padding: 12px 8px; font-size: 11px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; ${
              item.cleared
                ? "background-color: #DFE9D4; color: #0D0D0C;"
                : "background-color: #F8DCC7; color: #0D0D0C;"
            }">
              ${item.cleared ? "Cleared" : "Upcoming"}
            </span>
          </td>
          <td style="padding: 12px 8px; font-size: 13px; font-weight: 600; color: #0D0D0C; text-align: right; font-variant-numeric: tabular-nums;">
            R${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </td>
        </tr>
      `
          )
          .join("")
      : `
        <tr>
          <td colspan="4" style="padding: 16px; text-align: center; color: rgba(13,13,12,0.4); font-size: 12px;">
            No debit orders configured for this month.
          </td>
        </tr>
      `;

    // Render debts HTML rows
    const debtsHtml = debts.length
      ? debts
          .map(
            (d: DebtItem) => `
        <tr style="border-bottom: 1px solid rgba(13, 13, 12, 0.06);">
          <td style="padding: 10px 8px; font-size: 13px; color: #0D0D0C; font-weight: 500;">
            ${d.name}
          </td>
          <td style="padding: 10px 8px; font-size: 12px; color: rgba(13, 13, 12, 0.6); text-align: center;">
            ${d.paidInstalments} of ${d.totalInstalments} paid
          </td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #0D0D0C; text-align: right;">
            R${Number(d.monthlyAmount).toLocaleString()} /mo
          </td>
        </tr>
      `
          )
          .join("")
      : "";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF6EF; font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0D0D0C;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF6EF; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFDF8; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 28px; padding: 36px 32px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);">
          
          <!-- Top Header -->
          <tr>
            <td>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 12px; height: 12px; background-color: #0D0D0C; border-radius: 50%;"></td>
                        <td style="padding-left: 10px; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: #0D0D0C;">
                          mint month
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(13, 13, 12, 0.45); font-weight: 600;">
                      ${monthStr}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Headline -->
          <tr>
            <td style="padding-top: 28px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 500; letter-spacing: -0.02em; color: #0D0D0C; line-height: 1.25;">
                Your Financial Digest, ${displayName}
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(13, 13, 12, 0.58); line-height: 1.5;">
                Here is your cashflow overview: ${upcomingCount} debit orders scheduled before payday, and your exact guilt-free daily allowance.
              </p>
            </td>
          </tr>

          <!-- Hero Safe-to-Spend Box -->
          <tr>
            <td style="padding-top: 26px;">
              <div style="background-color: #FBF6EF; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 20px; padding: 24px; text-align: center;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(13, 13, 12, 0.5);">
                  Guilt-Free Daily Allowance
                </div>
                <div style="font-size: 46px; font-weight: 600; letter-spacing: -0.03em; color: #0D0D0C; line-height: 1.1; margin-top: 8px; font-variant-numeric: tabular-nums;">
                  R${Math.round(safeToSpendDaily).toLocaleString()}
                  <span style="font-size: 18px; font-weight: 400; color: rgba(13, 13, 12, 0.45);">/ day</span>
                </div>
                <div style="margin-top: 10px; font-size: 13px; color: rgba(13, 13, 12, 0.65); line-height: 1.4;">
                  You have <strong style="color: #0D0D0C;">R${Math.round(safeToSpendTotal).toLocaleString()}</strong> in safe discretionary cash across the remaining <strong style="color: #0D0D0C;">${daysRemaining} days</strong> of this cycle.
                </div>
              </div>
            </td>
          </tr>

          <!-- 3 Key Metric Cards -->
          <tr>
            <td style="padding-top: 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="31%" style="background-color: #FBF6EF; border: 1px solid rgba(13, 13, 12, 0.06); border-radius: 16px; padding: 16px 12px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(13, 13, 12, 0.45);">
                      Take-Home Pay
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0D0D0C; margin-top: 6px;">
                      R${Number(salary).toLocaleString()}
                    </div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color: #FBF6EF; border: 1px solid rgba(13, 13, 12, 0.06); border-radius: 16px; padding: 16px 12px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(13, 13, 12, 0.45);">
                      Fixed Commitments
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0D0D0C; margin-top: 6px;">
                      R${Number(fixedCommitments).toLocaleString()}
                    </div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color: #FBF6EF; border: 1px solid rgba(13, 13, 12, 0.06); border-radius: 16px; padding: 16px 12px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(13, 13, 12, 0.45);">
                      Payday Countdown
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0D0D0C; margin-top: 6px;">
                      ${daysUntilPayday > 0 ? `${daysUntilPayday} days` : "Today"}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Debit Orders Breakdown Table -->
          <tr>
            <td style="padding-top: 32px;">
              <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(13, 13, 12, 0.45); margin-bottom: 12px;">
                Recurring Debit Orders (${debitOrders.length})
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1.5px solid rgba(13, 13, 12, 0.1);">
                    <th align="left" style="padding: 8px; font-size: 11px; text-transform: uppercase; color: rgba(13, 13, 12, 0.4); font-weight: 600;">Bill / Contract</th>
                    <th align="center" style="padding: 8px; font-size: 11px; text-transform: uppercase; color: rgba(13, 13, 12, 0.4); font-weight: 600;">Date</th>
                    <th align="center" style="padding: 8px; font-size: 11px; text-transform: uppercase; color: rgba(13, 13, 12, 0.4); font-weight: 600;">Status</th>
                    <th align="right" style="padding: 8px; font-size: 11px; text-transform: uppercase; color: rgba(13, 13, 12, 0.4); font-weight: 600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${debitOrdersHtml}
                </tbody>
              </table>
            </td>
          </tr>

          ${
            debtsHtml
              ? `
          <!-- Debt Paydown Milestones -->
          <tr>
            <td style="padding-top: 28px;">
              <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(13, 13, 12, 0.45); margin-bottom: 12px;">
                Active Instalment Plans
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tbody>
                  ${debtsHtml}
                </tbody>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Call to Action -->
          <tr>
            <td align="center" style="padding-top: 36px; padding-bottom: 8px;">
              <a href="http://localhost:3000" style="display: inline-block; background-color: #0D0D0C; color: #FFFDF8; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-size: 13px; font-weight: 500; letter-spacing: 0.02em;">
                Open Your Mint Month Vault &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 28px; border-top: 1px solid rgba(13, 13, 12, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: rgba(13, 13, 12, 0.4); line-height: 1.5;">
                Mint Month · Minimal, editorial personal finance for South Africa.<br/>
                All calculations quarantine fixed debit orders before determining daily spend.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const resend = getResendClient();
      const sendResult = await resend.emails.send({
        from: "Mint Month <onboarding@resend.dev>",
        to: normalizedEmail,
        subject,
        html: htmlContent,
      });

      if (sendResult?.error) {
        const errorMsg = sendResult.error.message || "";
        const isSandbox =
          sendResult.error.statusCode === 403 ||
          errorMsg.toLowerCase().includes("testing emails to your own email address");

        return NextResponse.json({
          ok: true,
          sent: false,
          sandbox: isSandbox,
          allowedEmail: "emmanuelkgaphola@outlook.com",
          message: errorMsg,
          previewSubject: subject,
        });
      }

      return NextResponse.json({
        ok: true,
        sent: true,
        deliveredTo: normalizedEmail,
        previewSubject: subject,
      });
    } catch {
      return NextResponse.json({ ok: true, sent: false });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to generate financial digest." },
      { status: 500 }
    );
  }
}

